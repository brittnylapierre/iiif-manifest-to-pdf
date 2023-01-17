import { convertPresentation2 } from '@iiif/parser/presentation-2';
import { meanBy, sampleSize, orderBy } from 'lodash-es';
import PQueue from 'p-queue';
import PDFGenerator from './pdf/generator.js';
import { CountingWriter, WebWriter, NodeWriter, BlobWriter, } from './io.js';
import { getLicenseInfo } from './res/licenses.js';
import { getTextSeeAlso } from './ocr.js';
import pdiiifVersion from './version.js';
import { fetchCanvasData, fetchRespectfully, fetchStartCanvasInfo, } from './download.js';
import metrics from './metrics.js';
import { isDefined, now } from './util.js';
import log from './log.js';
import { getI18nValue, getThumbnail, getCanvasInfo, vault, parseAnnotation, } from './iiif.js';
/** Estimate the final size of the PDF for a given manifest.
 *
 * This will randomly sample a few representative canvases from the manifest,
 * check their size in bytes and extrapolate from that to all canvases.
 */
export async function estimatePdfSize({ manifest: inputManifest, concurrency = 1, scaleFactor, filterCanvases = () => true, numSamples = 8, }) {
    let manifestId;
    if (typeof inputManifest === 'string') {
        manifestId = inputManifest;
    }
    else {
        manifestId =
            inputManifest.id ??
                inputManifest['@id'];
    }
    const manifest = await vault.loadManifest(manifestId);
    if (!manifest) {
        throw new Error(`Failed to load manifest from ${manifestId}`);
    }
    let canvasPredicate;
    if (Array.isArray(filterCanvases)) {
        canvasPredicate = (canvasId) => filterCanvases.indexOf(canvasId) >= 0;
    }
    else {
        canvasPredicate = filterCanvases;
    }
    const canvases = vault.get(manifest.items.filter((c) => canvasPredicate(c.id)));
    // Select some representative canvases that are close to the mean in terms
    // of their pixel area to avoid small images distorting the estimate too much
    const totalCanvasPixels = canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);
    let samplePixels = totalCanvasPixels;
    let sampleCanvases = canvases;
    if (canvases.length > numSamples) {
        const meanPixels = meanBy(canvases, (c) => c.width * c.height);
        const candidateCanvases = canvases.filter((c) => Math.abs(meanPixels - c.width * c.height) <= 0.25 * meanPixels);
        sampleCanvases = sampleSize(candidateCanvases, numSamples);
        samplePixels = sampleCanvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);
    }
    const queue = new PQueue({ concurrency });
    const canvasData = await Promise.all(sampleCanvases.map((c) => queue.add(() => fetchCanvasData(c, { scaleFactor, sizeOnly: true }))));
    const sampleBytes = canvasData
        .filter((isDefined))
        .flatMap((c) => c.images)
        .reduce((size, data) => size + (data?.numBytes ?? 0), 0);
    const bpp = sampleBytes / samplePixels;
    return bpp * totalCanvasPixels;
}
async function buildOutlineFromRanges(manifest, canvases, languagePreference) {
    // ToC generation: IIIF's `Range` construct is so open, doing anything useful with it is a pain :-/
    // In our case, the pain comes from multiple directions:
    // - PDFs can only connect an outline node to a *single* page (IIIF connects ranges of pages)
    // - IIIF doesn't prescribe an order for the ranges or the canvases contained in them
    // Our approach is to pre-generate the range associated with each canvas and a hierarchy
    // of parent-child relationships for ranges.
    // All canvas identifiers in the order they appear as in the sequence
    const canvasIds = canvases.map((canvas) => canvas.id);
    // We have to recurse, this small closure handles each node in the tree
    const isCanvas = (ri) => typeof ri !== 'string' && ri.type === 'Canvas';
    const isRange = (ri) => typeof ri !== 'string' && ri.type == 'Range';
    const seenRanges = new Set();
    const handleTocRange = async (range) => {
        if (seenRanges.has(range.id)) {
            return;
        }
        const firstCanvas = orderBy(range.items.filter(isCanvas), (c) => canvasIds.indexOf(c.id))[0];
        const rangeLabel = getI18nValue(range.label ?? '<untitled>', languagePreference, '; ');
        const childRanges = vault.get(range.items.filter(isRange));
        const children = (await Promise.all(childRanges.map(handleTocRange))).filter((isDefined));
        let startCanvas;
        if (range.start) {
            startCanvas = await fetchStartCanvasInfo(range);
        }
        if (!startCanvas && firstCanvas) {
            startCanvas = firstCanvas.id;
        }
        else {
            startCanvas = children[0].startCanvas;
        }
        seenRanges.add(range.id);
        return {
            label: rangeLabel,
            startCanvas,
            children,
        };
    };
    return ((await Promise.all(vault.get(manifest.structures).map(handleTocRange))).filter((isDefined)) ?? []);
}
/** Tracks PDF generation progress and various statistics related to that. */
class ProgressTracker {
    constructor(canvases, countingStream, pdfGen, onProgress) {
        this.canvasPixels = 0;
        this.pixelsWritten = 0;
        this.pixelBytesFactor = 0;
        this.pixelScaleFactor = 0;
        this.totalCanvasPixels = 0;
        this.totalCanvasPixels = canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);
        this.totalPages = canvases.length;
        this.pdfGen = pdfGen;
        this.countingStream = countingStream;
        this.onProgress = onProgress;
    }
    /** Check if there is still data that needs to be written out. */
    get writeOutstanding() {
        return this.pdfGen.bytesWritten > this.countingStream.bytesWritten;
    }
    /** Emit a progress update, with an optional message. */
    emitProgress(pagesWritten, message) {
        if (!this.timeStart) {
            this.timeStart = now();
        }
        const bytesPushed = this.pdfGen.bytesWritten;
        let estimatedFileSize;
        if (pagesWritten === this.totalPages) {
            estimatedFileSize = bytesPushed;
        }
        else if (pagesWritten > 0) {
            estimatedFileSize = Math.floor(this.pixelBytesFactor * this.pixelScaleFactor * this.totalCanvasPixels);
        }
        const bytesWritten = this.countingStream.bytesWritten;
        const writeSpeed = bytesPushed / ((now() - this.timeStart) / 1000);
        let remainingDuration = Number.POSITIVE_INFINITY;
        if (estimatedFileSize) {
            remainingDuration = (estimatedFileSize - bytesWritten) / writeSpeed;
        }
        this.onProgress?.({
            message,
            pagesWritten,
            totalPages: this.totalPages,
            bytesWritten,
            bytesPushed,
            estimatedFileSize,
            writeSpeed,
            remainingDuration,
        });
    }
    /** Update how many actual pixels and 'canvas pixels' have been written. */
    updatePixels(pixelsWritten, canvasPixels) {
        this.pixelsWritten += pixelsWritten;
        this.canvasPixels += canvasPixels;
        this.pixelScaleFactor = this.pixelsWritten / this.canvasPixels;
        this.pixelBytesFactor = this.pdfGen.bytesWritten / this.pixelsWritten;
    }
}
/** Generate a cover page PDF, either via user-provided callback, or by fetching
 * it from a remote endpoint. */
async function getCoverPagePdf(manifest, languagePreference, endpoint, callback) {
    const params = {
        // NOTE: Manifest label is mandatory, i.e. safe to assert non-null
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        title: getI18nValue(manifest.label ?? '<untitled>', languagePreference, '; '),
        manifestUrl: manifest.id,
        pdiiifVersion,
    };
    const thumbUrl = await getThumbnail(manifest, 512);
    if (thumbUrl) {
        params.thumbnail = { url: thumbUrl };
        const manifestThumb = vault.get(manifest.thumbnail)[0];
        if (manifestThumb && 'type' in manifestThumb) {
            params.thumbnail.iiifImageService = manifestThumb.service?.find((s) => s?.type?.startsWith('ImageService') ??
                false)?.id;
        }
    }
    const provider = vault.get(manifest.provider)[0];
    const required = manifest.requiredStatement;
    if (provider) {
        params.provider = {
            label: getI18nValue(provider.label, languagePreference, '; '),
            homepage: provider.homepage?.[0].id,
            logo: provider.logo?.[0]?.id,
        };
        // FIXME: Currently this is assigned by @iiif/parser when converting from v2 to v3
        if (params.provider.label === 'Unknown') {
            params.provider.label = '';
        }
    }
    if (required != null && required.label) {
        params.requiredStatement = {
            label: getI18nValue(required.label, languagePreference, '; '),
            value: getI18nValue(required.value, languagePreference, '; '),
        };
    }
    const license = manifest.rights;
    if (license) {
        const licenseDef = getLicenseInfo(license);
        params.rights = {
            text: licenseDef?.text ?? license,
            url: license,
            logo: licenseDef?.logo,
        };
    }
    params.metadata =
        manifest.metadata
            ?.map((itm) => {
            const label = getI18nValue(itm.label, languagePreference, '; ');
            const values = getI18nValue(itm.value, languagePreference, '|||').split('|||');
            if (!label || values.length === 0) {
                return;
            }
            if (values.length === 1) {
                return [label, values[0]];
            }
            else {
                return [label, values];
            }
        })
            .filter((x) => x !== undefined) ?? [];
    if (callback) {
        return await callback(params);
    }
    else if (endpoint) {
        const resp = await fetchRespectfully(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        const buf = await resp.arrayBuffer();
        return new Uint8Array(buf);
    }
    else {
        throw 'Either `endpoint` or `callback` must be specified!';
    }
}
/** Convert a IIIF manifest to a PDF,  */
export async function convertManifest(
/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
inputManifest, outputStream, { fetchCanvasAnnotations = () => Promise.resolve([]), filterCanvases = () => true, languagePreference = [Intl.DateTimeFormat().resolvedOptions().locale], scaleFactor, metadata = {}, onProgress, ppi, concurrency = 1, abortController = new AbortController(), coverPageCallback, coverPageEndpoint, polyglotZipPdf, polyglotZipBaseDir, }) {
    let writer;
    if (!outputStream) {
        log.debug('Writing to Blob');
        writer = new BlobWriter();
        // Can't use `instanceof` since we don't have the Node class in the
        // browser and vice versa, so examine the shape of the object
    }
    else if (typeof outputStream.destroy === 'function') {
        log.debug('Writing to Node writable stream');
        writer = new NodeWriter(outputStream);
        // Cancel further processing once the underlying stream has been closed
        // This will only have an effect if the PDF has not finished generating
        // yet (i.e. when the client terminates the connection prematurely),
        // otherwise all processing will long have stopped
        outputStream.on('close', () => abortController.abort());
    }
    else {
        log.debug('Writing to file system');
        writer = new WebWriter(outputStream);
    }
    const countingWriter = new CountingWriter(writer);
    // Build a canvas predicate function from a list of identifiers, if needed
    let canvasPredicate;
    if (Array.isArray(filterCanvases)) {
        canvasPredicate = (canvasId) => filterCanvases.indexOf(canvasId) >= 0;
    }
    else {
        canvasPredicate = filterCanvases;
    }
    let manifestId;
    let manifestJson;
    if (typeof inputManifest === 'string') {
        manifestId = inputManifest;
        manifestJson = (await (await fetchRespectfully(manifestId)).json());
    }
    else {
        manifestId =
            inputManifest['@id'] ??
                inputManifest.id;
        manifestJson = inputManifest;
    }
    const manifest = await vault.loadManifest(manifestId, manifestJson);
    if (!manifest) {
        throw new Error(`Failed to load manifest from ${manifestId}`);
    }
    const pdfMetadata = { ...metadata };
    if (!pdfMetadata.Title && manifest.label) {
        pdfMetadata.Title = getI18nValue(manifest.label, languagePreference, '; ');
    }
    const canvases = vault.get(manifest.items.filter((c) => canvasPredicate(c.id)));
    const hasText = !!canvases.find((c) => !!getTextSeeAlso(c));
    const labels = canvases.map((canvas) => canvas.label ? getI18nValue(canvas.label, languagePreference, '; ') : '');
    // Fetch images concurrently, within limits specified by user
    log.debug(`Setting up queue with ${concurrency} concurrent canvas fetches.`);
    const queue = new PQueue({ concurrency });
    abortController.signal.addEventListener('abort', () => queue.clear(), {
        once: true,
    });
    const canvasFuts = canvases.map((c) => {
        return queue.add(() => fetchCanvasData(c, {
            scaleFactor,
            ppiOverride: ppi,
            abortSignal: abortController.signal,
        }));
    });
    const outline = await buildOutlineFromRanges(manifest, canvases, languagePreference);
    const pdfGen = new PDFGenerator({
        writer: countingWriter,
        metadata: pdfMetadata,
        canvasInfos: canvases.map((c, idx) => ({
            canvasIdx: idx,
            ...getCanvasInfo(c),
        })),
        langPref: languagePreference,
        pageLabels: labels,
        outline,
        hasText,
        initialCanvas: await fetchStartCanvasInfo(manifest),
        readingDirection: manifest.viewingDirection === 'right-to-left'
            ? 'right-to-left'
            : 'left-to-right',
        manifestJson,
        zipPolyglot: polyglotZipPdf,
        zipBaseDir: polyglotZipBaseDir,
    });
    log.debug(`Initialising PDF generator.`);
    await pdfGen.setup();
    const progress = new ProgressTracker(canvases, countingWriter, pdfGen, onProgress);
    progress.emitProgress(0);
    if (coverPageCallback || coverPageEndpoint) {
        log.debug(`Generating cover page`);
        progress.emitProgress(0, 'Generating cover page');
        try {
            const coverPageData = await getCoverPagePdf(manifest, languagePreference, coverPageEndpoint, coverPageCallback);
            log.debug('Inserting cover page into PDF');
            await pdfGen.insertCoverPages(coverPageData);
        }
        catch (err) {
            log.error('Error while generating cover page', err);
            abortController.abort();
            throw err;
        }
    }
    progress.emitProgress(0, 'Downloading images and generating PDF pages');
    for (let canvasIdx = 0; canvasIdx < canvases.length; canvasIdx++) {
        if (abortController.signal.aborted) {
            log.debug('Abort signalled, aborting while waiting for image data.');
            break;
        }
        try {
            log.debug(`Waiting for data for canvas #${canvasIdx}`);
            const canvasData = await canvasFuts[canvasIdx];
            // This means the task was aborted, do nothing
            // FIXME: Doesn't this also happen in case of an error?
            if (!canvasData) {
                throw 'Aborted';
            }
            const canvas = vault.get(canvasData.canvas);
            const { images, ppi, text, annotations } = canvasData;
            const externalAnnotations = await fetchCanvasAnnotations(canvas.id);
            if (externalAnnotations != null) {
                const normalized = await Promise.all(externalAnnotations.map((a) => {
                    if (!('id' in a)) {
                        a = convertPresentation2(a);
                    }
                    return vault.load(a.id, a);
                }));
                if (normalized) {
                    normalized
                        .filter((a) => a !== undefined)
                        .map((a) => parseAnnotation(a, languagePreference))
                        .filter((a) => a !== undefined)
                        .forEach((a) => annotations.push(a));
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stopMeasuring = metrics?.pageGenerationDuration.startTimer();
            log.debug(`Rendering canvas #${canvasIdx} into PDF`);
            await pdfGen.renderPage(canvasData.canvas.id, { width: canvas.width, height: canvas.height }, images, annotations, text, ppi);
            stopMeasuring?.();
            progress.updatePixels(images.reduce((acc, img) => acc + img.dimensions.width * img.dimensions.height, 0), canvas.width * canvas.height);
        }
        catch (err) {
            // Clear queue, cancel all ongoing image fetching
            if (err !== 'Aborted') {
                log.error('Failed to render page', err);
            }
            queue.clear();
            if (!abortController.signal.aborted) {
                abortController.abort();
            }
            throw err;
        }
        finally {
            delete canvasFuts[canvasIdx];
        }
        progress.emitProgress(canvasIdx + 1);
    }
    // Finish writing PDF, resulting Promise is resolved once the writer is closed
    log.debug('Finalizing PDF');
    const endPromise = pdfGen.end();
    // At this point the PDF data might still be incomplete, so we wait for
    // drain events on the writer and continue updating our progress tracker
    // until the writer is actually closed
    if (!abortController.signal.aborted) {
        let closed = false;
        endPromise.then(() => (closed = true));
        const progressOnDrain = () => {
            if (closed) {
                return;
            }
            progress.emitProgress(canvases.length, 'Finishing PDF generation');
            if (!closed && progress.writeOutstanding) {
                writer.waitForDrain().then(progressOnDrain);
            }
        };
        // Wait for initial drainage event in case the writer isn't already closed
        if (!closed) {
            writer.waitForDrain().then(progressOnDrain);
        }
    }
    // Wait for the writer to be closed
    log.debug('Waiting for writer to close.');
    await endPromise;
    if (writer instanceof BlobWriter) {
        return writer.blob;
    }
}
//# sourceMappingURL=convert.js.map