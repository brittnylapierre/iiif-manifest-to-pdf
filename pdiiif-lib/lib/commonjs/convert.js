"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertManifest = exports.estimatePdfSize = void 0;
const tslib_1 = require("tslib");
const presentation_2_1 = require("@iiif/parser/presentation-2");
const lodash_es_1 = require("lodash-es");
const p_queue_1 = tslib_1.__importDefault(require("p-queue"));
const generator_js_1 = tslib_1.__importDefault(require("./pdf/generator.js"));
const io_js_1 = require("./io.js");
const licenses_js_1 = require("./res/licenses.js");
const ocr_js_1 = require("./ocr.js");
const version_js_1 = tslib_1.__importDefault(require("./version.js"));
const download_js_1 = require("./download.js");
const metrics_js_1 = tslib_1.__importDefault(require("./metrics.js"));
const util_js_1 = require("./util.js");
const log_js_1 = tslib_1.__importDefault(require("./log.js"));
const iiif_js_1 = require("./iiif.js");
/** Estimate the final size of the PDF for a given manifest.
 *
 * This will randomly sample a few representative canvases from the manifest,
 * check their size in bytes and extrapolate from that to all canvases.
 */
function estimatePdfSize({ manifest: inputManifest, concurrency = 1, scaleFactor, filterCanvases = () => true, numSamples = 8, }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let manifestId;
        if (typeof inputManifest === 'string') {
            manifestId = inputManifest;
        }
        else {
            manifestId =
                (_a = inputManifest.id) !== null && _a !== void 0 ? _a : inputManifest['@id'];
        }
        const manifest = yield iiif_js_1.vault.loadManifest(manifestId);
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
        const canvases = iiif_js_1.vault.get(manifest.items.filter((c) => canvasPredicate(c.id)));
        // Select some representative canvases that are close to the mean in terms
        // of their pixel area to avoid small images distorting the estimate too much
        const totalCanvasPixels = canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);
        let samplePixels = totalCanvasPixels;
        let sampleCanvases = canvases;
        if (canvases.length > numSamples) {
            const meanPixels = (0, lodash_es_1.meanBy)(canvases, (c) => c.width * c.height);
            const candidateCanvases = canvases.filter((c) => Math.abs(meanPixels - c.width * c.height) <= 0.25 * meanPixels);
            sampleCanvases = (0, lodash_es_1.sampleSize)(candidateCanvases, numSamples);
            samplePixels = sampleCanvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0);
        }
        const queue = new p_queue_1.default({ concurrency });
        const canvasData = yield Promise.all(sampleCanvases.map((c) => queue.add(() => (0, download_js_1.fetchCanvasData)(c, { scaleFactor, sizeOnly: true }))));
        const sampleBytes = canvasData
            .filter((util_js_1.isDefined))
            .flatMap((c) => c.images)
            .reduce((size, data) => { var _a; return size + ((_a = data === null || data === void 0 ? void 0 : data.numBytes) !== null && _a !== void 0 ? _a : 0); }, 0);
        const bpp = sampleBytes / samplePixels;
        return bpp * totalCanvasPixels;
    });
}
exports.estimatePdfSize = estimatePdfSize;
function buildOutlineFromRanges(manifest, canvases, languagePreference) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        const handleTocRange = (range) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            if (seenRanges.has(range.id)) {
                return;
            }
            const firstCanvas = (0, lodash_es_1.orderBy)(range.items.filter(isCanvas), (c) => canvasIds.indexOf(c.id))[0];
            const rangeLabel = (0, iiif_js_1.getI18nValue)((_b = range.label) !== null && _b !== void 0 ? _b : '<untitled>', languagePreference, '; ');
            const childRanges = iiif_js_1.vault.get(range.items.filter(isRange));
            const children = (yield Promise.all(childRanges.map(handleTocRange))).filter((util_js_1.isDefined));
            let startCanvas;
            if (range.start) {
                startCanvas = yield (0, download_js_1.fetchStartCanvasInfo)(range);
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
        });
        return ((_a = (yield Promise.all(iiif_js_1.vault.get(manifest.structures).map(handleTocRange))).filter((util_js_1.isDefined))) !== null && _a !== void 0 ? _a : []);
    });
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
        var _a;
        if (!this.timeStart) {
            this.timeStart = (0, util_js_1.now)();
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
        const writeSpeed = bytesPushed / (((0, util_js_1.now)() - this.timeStart) / 1000);
        let remainingDuration = Number.POSITIVE_INFINITY;
        if (estimatedFileSize) {
            remainingDuration = (estimatedFileSize - bytesWritten) / writeSpeed;
        }
        (_a = this.onProgress) === null || _a === void 0 ? void 0 : _a.call(this, {
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
function getCoverPagePdf(manifest, languagePreference, endpoint, callback) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const params = {
            // NOTE: Manifest label is mandatory, i.e. safe to assert non-null
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            title: (0, iiif_js_1.getI18nValue)((_a = manifest.label) !== null && _a !== void 0 ? _a : '<untitled>', languagePreference, '; '),
            manifestUrl: manifest.id,
            pdiiifVersion: version_js_1.default,
        };
        const thumbUrl = yield (0, iiif_js_1.getThumbnail)(manifest, 512);
        if (thumbUrl) {
            params.thumbnail = { url: thumbUrl };
            const manifestThumb = iiif_js_1.vault.get(manifest.thumbnail)[0];
            if (manifestThumb && 'type' in manifestThumb) {
                params.thumbnail.iiifImageService = (_c = (_b = manifestThumb.service) === null || _b === void 0 ? void 0 : _b.find((s) => {
                    var _a, _b;
                    return (_b = (_a = s === null || s === void 0 ? void 0 : s.type) === null || _a === void 0 ? void 0 : _a.startsWith('ImageService')) !== null && _b !== void 0 ? _b : false;
                })) === null || _c === void 0 ? void 0 : _c.id;
            }
        }
        const provider = iiif_js_1.vault.get(manifest.provider)[0];
        const required = manifest.requiredStatement;
        if (provider) {
            params.provider = {
                label: (0, iiif_js_1.getI18nValue)(provider.label, languagePreference, '; '),
                homepage: (_d = provider.homepage) === null || _d === void 0 ? void 0 : _d[0].id,
                logo: (_f = (_e = provider.logo) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.id,
            };
            // FIXME: Currently this is assigned by @iiif/parser when converting from v2 to v3
            if (params.provider.label === 'Unknown') {
                params.provider.label = '';
            }
        }
        if (required != null && required.label) {
            params.requiredStatement = {
                label: (0, iiif_js_1.getI18nValue)(required.label, languagePreference, '; '),
                value: (0, iiif_js_1.getI18nValue)(required.value, languagePreference, '; '),
            };
        }
        const license = manifest.rights;
        if (license) {
            const licenseDef = (0, licenses_js_1.getLicenseInfo)(license);
            params.rights = {
                text: (_g = licenseDef === null || licenseDef === void 0 ? void 0 : licenseDef.text) !== null && _g !== void 0 ? _g : license,
                url: license,
                logo: licenseDef === null || licenseDef === void 0 ? void 0 : licenseDef.logo,
            };
        }
        params.metadata =
            (_j = (_h = manifest.metadata) === null || _h === void 0 ? void 0 : _h.map((itm) => {
                const label = (0, iiif_js_1.getI18nValue)(itm.label, languagePreference, '; ');
                const values = (0, iiif_js_1.getI18nValue)(itm.value, languagePreference, '|||').split('|||');
                if (!label || values.length === 0) {
                    return;
                }
                if (values.length === 1) {
                    return [label, values[0]];
                }
                else {
                    return [label, values];
                }
            }).filter((x) => x !== undefined)) !== null && _j !== void 0 ? _j : [];
        if (callback) {
            return yield callback(params);
        }
        else if (endpoint) {
            const resp = yield (0, download_js_1.fetchRespectfully)(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            const buf = yield resp.arrayBuffer();
            return new Uint8Array(buf);
        }
        else {
            throw 'Either `endpoint` or `callback` must be specified!';
        }
    });
}
/** Convert a IIIF manifest to a PDF,  */
function convertManifest(
/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
inputManifest, outputStream, { fetchCanvasAnnotations = () => Promise.resolve([]), filterCanvases = () => true, languagePreference = [Intl.DateTimeFormat().resolvedOptions().locale], scaleFactor, metadata = {}, onProgress, ppi, concurrency = 1, abortController = new AbortController(), coverPageCallback, coverPageEndpoint, polyglotZipPdf, polyglotZipBaseDir, }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let writer;
        if (!outputStream) {
            log_js_1.default.debug('Writing to Blob');
            writer = new io_js_1.BlobWriter();
            // Can't use `instanceof` since we don't have the Node class in the
            // browser and vice versa, so examine the shape of the object
        }
        else if (typeof outputStream.destroy === 'function') {
            log_js_1.default.debug('Writing to Node writable stream');
            writer = new io_js_1.NodeWriter(outputStream);
            // Cancel further processing once the underlying stream has been closed
            // This will only have an effect if the PDF has not finished generating
            // yet (i.e. when the client terminates the connection prematurely),
            // otherwise all processing will long have stopped
            outputStream.on('close', () => abortController.abort());
        }
        else {
            log_js_1.default.debug('Writing to file system');
            writer = new io_js_1.WebWriter(outputStream);
        }
        const countingWriter = new io_js_1.CountingWriter(writer);
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
            manifestJson = (yield (yield (0, download_js_1.fetchRespectfully)(manifestId)).json());
        }
        else {
            manifestId =
                (_a = inputManifest['@id']) !== null && _a !== void 0 ? _a : inputManifest.id;
            manifestJson = inputManifest;
        }
        const manifest = yield iiif_js_1.vault.loadManifest(manifestId, manifestJson);
        if (!manifest) {
            throw new Error(`Failed to load manifest from ${manifestId}`);
        }
        const pdfMetadata = Object.assign({}, metadata);
        if (!pdfMetadata.Title && manifest.label) {
            pdfMetadata.Title = (0, iiif_js_1.getI18nValue)(manifest.label, languagePreference, '; ');
        }
        const canvases = iiif_js_1.vault.get(manifest.items.filter((c) => canvasPredicate(c.id)));
        const hasText = !!canvases.find((c) => !!(0, ocr_js_1.getTextSeeAlso)(c));
        const labels = canvases.map((canvas) => canvas.label ? (0, iiif_js_1.getI18nValue)(canvas.label, languagePreference, '; ') : '');
        // Fetch images concurrently, within limits specified by user
        log_js_1.default.debug(`Setting up queue with ${concurrency} concurrent canvas fetches.`);
        const queue = new p_queue_1.default({ concurrency });
        abortController.signal.addEventListener('abort', () => queue.clear(), {
            once: true,
        });
        const canvasFuts = canvases.map((c) => {
            return queue.add(() => (0, download_js_1.fetchCanvasData)(c, {
                scaleFactor,
                ppiOverride: ppi,
                abortSignal: abortController.signal,
            }));
        });
        const outline = yield buildOutlineFromRanges(manifest, canvases, languagePreference);
        const pdfGen = new generator_js_1.default({
            writer: countingWriter,
            metadata: pdfMetadata,
            canvasInfos: canvases.map((c, idx) => (Object.assign({ canvasIdx: idx }, (0, iiif_js_1.getCanvasInfo)(c)))),
            langPref: languagePreference,
            pageLabels: labels,
            outline,
            hasText,
            initialCanvas: yield (0, download_js_1.fetchStartCanvasInfo)(manifest),
            readingDirection: manifest.viewingDirection === 'right-to-left'
                ? 'right-to-left'
                : 'left-to-right',
            manifestJson,
            zipPolyglot: polyglotZipPdf,
            zipBaseDir: polyglotZipBaseDir,
        });
        log_js_1.default.debug(`Initialising PDF generator.`);
        yield pdfGen.setup();
        const progress = new ProgressTracker(canvases, countingWriter, pdfGen, onProgress);
        progress.emitProgress(0);
        if (coverPageCallback || coverPageEndpoint) {
            log_js_1.default.debug(`Generating cover page`);
            progress.emitProgress(0, 'Generating cover page');
            try {
                const coverPageData = yield getCoverPagePdf(manifest, languagePreference, coverPageEndpoint, coverPageCallback);
                log_js_1.default.debug('Inserting cover page into PDF');
                yield pdfGen.insertCoverPages(coverPageData);
            }
            catch (err) {
                log_js_1.default.error('Error while generating cover page', err);
                abortController.abort();
                throw err;
            }
        }
        progress.emitProgress(0, 'Downloading images and generating PDF pages');
        for (let canvasIdx = 0; canvasIdx < canvases.length; canvasIdx++) {
            if (abortController.signal.aborted) {
                log_js_1.default.debug('Abort signalled, aborting while waiting for image data.');
                break;
            }
            try {
                log_js_1.default.debug(`Waiting for data for canvas #${canvasIdx}`);
                const canvasData = yield canvasFuts[canvasIdx];
                // This means the task was aborted, do nothing
                // FIXME: Doesn't this also happen in case of an error?
                if (!canvasData) {
                    throw 'Aborted';
                }
                const canvas = iiif_js_1.vault.get(canvasData.canvas);
                const { images, ppi, text, annotations } = canvasData;
                const externalAnnotations = yield fetchCanvasAnnotations(canvas.id);
                if (externalAnnotations != null) {
                    const normalized = yield Promise.all(externalAnnotations.map((a) => {
                        if (!('id' in a)) {
                            a = (0, presentation_2_1.convertPresentation2)(a);
                        }
                        return iiif_js_1.vault.load(a.id, a);
                    }));
                    if (normalized) {
                        normalized
                            .filter((a) => a !== undefined)
                            .map((a) => (0, iiif_js_1.parseAnnotation)(a, languagePreference))
                            .filter((a) => a !== undefined)
                            .forEach((a) => annotations.push(a));
                    }
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const stopMeasuring = metrics_js_1.default === null || metrics_js_1.default === void 0 ? void 0 : metrics_js_1.default.pageGenerationDuration.startTimer();
                log_js_1.default.debug(`Rendering canvas #${canvasIdx} into PDF`);
                yield pdfGen.renderPage(canvasData.canvas.id, { width: canvas.width, height: canvas.height }, images, annotations, text, ppi);
                stopMeasuring === null || stopMeasuring === void 0 ? void 0 : stopMeasuring();
                progress.updatePixels(images.reduce((acc, img) => acc + img.dimensions.width * img.dimensions.height, 0), canvas.width * canvas.height);
            }
            catch (err) {
                // Clear queue, cancel all ongoing image fetching
                if (err !== 'Aborted') {
                    log_js_1.default.error('Failed to render page', err);
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
        log_js_1.default.debug('Finalizing PDF');
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
        log_js_1.default.debug('Waiting for writer to close.');
        yield endPromise;
        if (writer instanceof io_js_1.BlobWriter) {
            return writer.blob;
        }
    });
}
exports.convertManifest = convertManifest;
