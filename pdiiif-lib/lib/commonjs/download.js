"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCanvasData = exports.fetchStartCanvasInfo = exports.getPointsPerInch = exports.getImageSize = exports.fetchRespectfully = exports.rateLimitRegistry = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
const lodash_es_1 = require("lodash-es");
const async_mutex_1 = require("async-mutex");
const ocr_js_1 = require("./ocr.js");
const metrics_js_1 = tslib_1.__importDefault(require("./metrics.js"));
const log_js_1 = tslib_1.__importDefault(require("./log.js"));
const iiif_js_1 = require("./iiif.js");
const util_js_1 = require("./util.js");
/// In absence of more detailed information (from physical dimensions service), use this resolution
const FALLBACK_PPI = 300;
/** Maps rate-limited hosts to a mutex that limits the concurrent fetching. */
class RateLimitingRegistry {
    constructor() {
        this.hostMutexes = new Map();
        this.callbacks = [];
    }
    getMutex(host) {
        return this.hostMutexes.get(host);
    }
    limitHost(host) {
        const mutex = new async_mutex_1.Mutex();
        this.hostMutexes.set(host, mutex);
        this.callbacks.forEach((cb) => cb(host, true));
        return mutex;
    }
    unlimitHost(host) {
        this.hostMutexes.delete(host);
        this.callbacks.forEach((cb) => cb(host, false));
    }
    subscribe(cb) {
        this.callbacks.push(cb);
        return this.callbacks.length - 1;
    }
    unsubscribe(ticket) {
        this.callbacks.splice(ticket, 1);
    }
    isLimited(url) {
        return this.hostMutexes.has(new URL(url).host);
    }
}
exports.rateLimitRegistry = new RateLimitingRegistry();
/** A 'respectful' wrapper around `fetch` that tries to respect rate-limiting headers.
 *
 * Will also retry with exponential backoff in case of server errors.
 */
function fetchRespectfully(url, init, maxRetries = 3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { host } = new URL(url);
        // If the host associated with the URL is rate-limited, limit concurrency to a single
        // fetch at a time by acquiring the mutex for the host.
        let rateLimitMutex = exports.rateLimitRegistry.getMutex(host);
        let numRetries = -1;
        let resp;
        let waitMs = 1000;
        let lastError;
        // If we're fetching from a rate-limited host, wait until there's no other fetch for it
        // going on
        const release = yield (rateLimitMutex === null || rateLimitMutex === void 0 ? void 0 : rateLimitMutex.acquire());
        try {
            do {
                try {
                    resp = yield (0, cross_fetch_1.default)(url, init);
                    if (resp.ok) {
                        break;
                    }
                }
                catch (e) {
                    log_js_1.default.error(`Error fetching ${url}: ${e}`);
                    lastError = e;
                    resp = undefined;
                }
                numRetries++;
                const retryAfter = resp === null || resp === void 0 ? void 0 : resp.headers.get('retry-after');
                if ((0, util_js_1.isDefined)(retryAfter)) {
                    if (Number.isInteger(retryAfter)) {
                        waitMs = Number.parseInt(retryAfter, 10) * 1000;
                    }
                    else {
                        const waitUntil = Date.parse(retryAfter);
                        waitMs = waitUntil - Date.now();
                    }
                }
                else {
                    // Exponential backoff with a random multiplier on the base wait time
                    waitMs = Math.pow(Math.random() * 2 * waitMs, numRetries);
                }
                // Check if the server response has headers corresponding to the IETF `RateLimit Header Fiels for HTTP` spec draft[1]
                // [1] https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-05.html
                const getHeaderValue = (ietfHeader) => {
                    const headerVariants = [
                        ietfHeader,
                        `x-${ietfHeader}`,
                        `x-${ietfHeader.replace('ratelimit', 'rate-limit')}`,
                    ];
                    return headerVariants
                        .map((header) => resp === null || resp === void 0 ? void 0 : resp.headers.get(header))
                        .filter((util_js_1.isDefined))
                        .map((limit) => Number.parseInt(limit, 10))
                        .find((limit) => limit != null);
                };
                const limit = getHeaderValue('ratelimit-limit');
                const remaining = getHeaderValue('ratelimit-remaining');
                const reset = getHeaderValue('ratelimit-reset');
                if (limit !== undefined &&
                    remaining !== undefined &&
                    reset !== undefined) {
                    // At this point we're pretty sure that we're being rate-limited, so let's
                    // limit concurrency from here on out.
                    rateLimitMutex = exports.rateLimitRegistry.limitHost(host);
                    // We assume a sliding window implemention here
                    const secsPerQuotaUnit = reset / (limit - remaining);
                    if (remaining > 0) {
                        // If we have remaining quota units but were blocked, we wait until we have enough
                        // quota to fetch remaining*2 quota units (i.e. we assume that the units in `remaining`
                        // were not enough to fully fetch the resource)
                        waitMs = 2 * remaining * secsPerQuotaUnit * 1000;
                    }
                    else {
                        waitMs = secsPerQuotaUnit * 1000;
                    }
                }
                // Add a 100ms buffer just to be safe and wait until the next attempt
                yield new Promise((resolve) => setTimeout(resolve, waitMs + 100));
            } while (numRetries < maxRetries);
        }
        finally {
            if (rateLimitMutex) {
                // We're being rate-limited, so wait some more so the next request doesn't
                // encounter a server error on fetching
                yield new Promise((resolve) => setTimeout(resolve, waitMs + 100));
            }
            release === null || release === void 0 ? void 0 : release();
        }
        if (!resp) {
            throw lastError;
        }
        return resp;
    });
}
exports.fetchRespectfully = fetchRespectfully;
/** Calculate the image size to fetch, based on user constraints and available sizes
 *  in the Image API info.json response.
 */
function getImageSize(imgService, scaleFactor = 1) {
    var _a;
    let sizeStr;
    const isIIIFv3 = imgService.id !== undefined;
    const maxWidth = (_a = imgService.maxWidth) !== null && _a !== void 0 ? _a : imgService.width;
    let requestedWidth = Math.floor(scaleFactor * maxWidth);
    const aspectRatio = imgService.width / imgService.height;
    const supportsScaleByWh = Array.isArray(imgService.profile)
        ? imgService.profile.find(iiif_js_1.supportsScaling) !== undefined
        : (0, iiif_js_1.supportsScaling)(imgService.profile);
    if (scaleFactor < 1 && !supportsScaleByWh) {
        if (imgService.sizes) {
            // AR-compliant downscaling is not supported, find the closest available size
            requestedWidth = (0, lodash_es_1.minBy)(imgService.sizes.map((dims) => Math.abs(requestedWidth - dims.width)));
            sizeStr = `${requestedWidth},`;
        }
        else {
            // No sizes available, so we can't downscale.
            sizeStr = `${maxWidth},`;
        }
    }
    else if (scaleFactor == 1) {
        sizeStr =
            isIIIFv3 || imgService.maxWidth || imgService.maxArea ? 'max' : 'full';
        if (imgService.maxWidth) {
            requestedWidth = imgService.maxWidth;
        }
        else if (imgService.maxHeight) {
            requestedWidth = Math.round(aspectRatio * imgService.maxHeight);
        }
        else if (imgService.maxArea) {
            const fullArea = imgService.width * imgService.height;
            const scaleFactor = imgService.maxArea / fullArea;
            requestedWidth = Math.round(scaleFactor * imgService.width);
        }
        else {
            requestedWidth = imgService.width;
        }
    }
    else {
        sizeStr = `${requestedWidth},`;
    }
    return {
        iiifSize: sizeStr,
        width: requestedWidth,
        height: requestedWidth / aspectRatio,
    };
}
exports.getImageSize = getImageSize;
/** Use a IIIF Physical Dimensions service to obtain the PPI for a canvas. */
function getPointsPerInch(services) {
    const physDimService = services.find(iiif_js_1.isPhysicalDimensionService);
    if (!physDimService) {
        return null;
    }
    const { physicalScale, physicalUnits } = physDimService;
    let ppi;
    if (physicalUnits === 'in') {
        ppi = 1 / physicalScale;
    }
    else if (physicalUnits === 'mm') {
        ppi = 25.4 / physicalScale;
    }
    else if (physicalUnits === 'cm') {
        ppi = 2.54 / physicalScale;
    }
    else {
        ppi = FALLBACK_PPI;
    }
    return ppi;
}
exports.getPointsPerInch = getPointsPerInch;
function fetchCanvasImage(imgAnno, { scaleFactor, abortSignal, sizeOnly = false }) {
    var _a, _b, _c, _d, _e, _f;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
            log_js_1.default.debug('Abort signalled, aborting before initiating image data fetching.');
            return null;
        }
        if (typeof imgAnno.target !== 'string') {
            log_js_1.default.error(`Target for image annotation ${imgAnno.id} is not a string, currently unsupported!`);
        }
        const target = imgAnno.target;
        let location;
        let dimensions;
        const [canvasId, fragment] = target.split('#xywh=');
        const canvas = iiif_js_1.vault.get(canvasId);
        if (fragment) {
            const [x, y, width, height] = fragment
                .split(',')
                .map((x) => parseInt(x, 10));
            location = { x, y };
            dimensions = { width, height };
        }
        else {
            location = { x: 0, y: 0 };
            dimensions = { width: canvas.width, height: canvas.height };
        }
        const image = iiif_js_1.vault
            .get(imgAnno.body)
            .find((r) => r.type === 'Image');
        if (!image) {
            log_js_1.default.error(`No image for annotation ${imgAnno.id} found!`);
            return null;
        }
        let imgService = (_a = image.service) === null || _a === void 0 ? void 0 : _a.find((s) => {
            var _a, _b, _c, _d;
            return ((_b = (_a = s === null || s === void 0 ? void 0 : s.type) === null || _a === void 0 ? void 0 : _a.startsWith('ImageService')) !== null && _b !== void 0 ? _b : false) ||
                ((_d = (_c = s === null || s === void 0 ? void 0 : s['@type']) === null || _c === void 0 ? void 0 : _c.startsWith('ImageService')) !== null && _d !== void 0 ? _d : false);
        });
        let ppi;
        let imageUrl;
        if (imgService) {
            if (!imgService.width) {
                imgService = yield (0, iiif_js_1.fetchFullImageService)(imgService);
            }
            const sizeInfo = getImageSize(imgService, scaleFactor);
            imageUrl = `${(_b = imgService.id) !== null && _b !== void 0 ? _b : imgService['@id']}/full/${sizeInfo.iiifSize}/0/default.jpg`;
            ppi = (_d = getPointsPerInch((_c = imgService.service) !== null && _c !== void 0 ? _c : [])) !== null && _d !== void 0 ? _d : undefined;
            if (ppi) {
                ppi = ppi * (sizeInfo.width / imgService.width);
            }
        }
        else if (image.id && image.format === 'image/jpeg') {
            imageUrl = image.id;
        }
        else {
            log_js_1.default.error(`No JPEG image identifier for annotation ${imgAnno.id} could be found!`);
            return null;
        }
        let data;
        let numBytes;
        const stopMeasuring = metrics_js_1.default === null || metrics_js_1.default === void 0 ? void 0 : metrics_js_1.default.imageFetchDuration.startTimer({
            iiif_host: new URL(imageUrl).host,
        });
        try {
            const imgResp = yield fetchRespectfully(imageUrl, {
                method: 'GET',
                signal: abortSignal,
            });
            if (imgResp.status >= 400) {
                throw new Error(`Failed to fetch page image from ${imageUrl}, server returned status ${imgResp.status}`);
            }
            if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                log_js_1.default.debug('Abort signalled, aborting before fetching image data.');
                return null;
            }
            numBytes = Number.parseInt((_e = imgResp.headers.get('Content-Length')) !== null && _e !== void 0 ? _e : '-1');
            data = sizeOnly && numBytes >= 0 ? undefined : yield imgResp.arrayBuffer();
            if (numBytes < 0) {
                numBytes = (_f = data === null || data === void 0 ? void 0 : data.byteLength) !== null && _f !== void 0 ? _f : -1;
            }
            stopMeasuring === null || stopMeasuring === void 0 ? void 0 : stopMeasuring({
                status: 'success',
                limited: exports.rateLimitRegistry.isLimited(imageUrl).toString(),
            });
        }
        catch (err) {
            stopMeasuring === null || stopMeasuring === void 0 ? void 0 : stopMeasuring({
                status: 'error',
                limited: exports.rateLimitRegistry.isLimited(imageUrl).toString(),
            });
            if (err.name !== 'AbortError') {
                log_js_1.default.error(`Failed to fetch image data from ${imageUrl}: ${err}`);
            }
            return null;
        }
        return {
            data,
            location,
            dimensions,
            ppi,
            numBytes,
            isOptional: false,
            visibleByDefault: true,
        };
    });
}
function fetchStartCanvasInfo(resource) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const startRef = resource.start;
        if (!startRef) {
            return;
        }
        let canvasId;
        let fragment;
        if (typeof startRef === 'string') {
            const [ident, selectorStr] = startRef.split('#xywh=');
            if (!selectorStr) {
                return ident;
            }
            canvasId = ident;
            fragment = `xywh=${selectorStr}`;
        }
        else if (startRef.type === 'Canvas') {
            return startRef.id;
        }
        else {
            const selector = iiif_js_1.vault.get(startRef);
            if (typeof selector === 'string' || selector.type !== 'FragmentSelector') {
                console.warn(`Unsupported selector type, cannot determine start canvas for ${resource.id}`);
                return;
            }
            const fragSel = selector;
            if (fragSel.conformsTo !== 'http://www.w3.org/TR/media-frags/') {
                console.warn(`Unsupported selector type, cannot determine start canvas for ${resource.id} (fragment selector type was ${fragSel.conformsTo})`);
                return;
            }
            canvasId = fragSel.value;
        }
        if (!fragment || !canvasId) {
            console.error(`Couldn't parse either canvas identifier or selector for ${resource.id} start canvas.`);
            return;
        }
        const [selX, selY, selWidth, selHeight] = fragment
            .substring(5)
            .split(',')
            .map((v) => Number.parseInt(v, 10));
        const canvas = iiif_js_1.vault.get(canvasId);
        const ppi = (_a = getPointsPerInch(canvas.service)) !== null && _a !== void 0 ? _a : FALLBACK_PPI;
        return {
            id: canvasId,
            ppi,
            dimensions: { width: canvas.width, height: canvas.height },
            position: {
                x: selX,
                y: selY,
                width: selWidth,
                height: selHeight,
            },
        };
    });
}
exports.fetchStartCanvasInfo = fetchStartCanvasInfo;
function fetchCanvasData(canvas, { scaleFactor, ppiOverride, abortSignal, sizeOnly = false }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const paintingAnnos = (0, iiif_js_1.getAllPaintingAnnotations)(canvas);
        // FIXME: Refactor this shameful abomination
        const images = (yield Promise.all(paintingAnnos.flatMap((anno) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = iiif_js_1.vault.get(anno.body);
            const out = [];
            // Fetch image from top-level image resource
            if (body.some((r) => r.type === 'Image')) {
                const img = yield fetchCanvasImage(anno, {
                    scaleFactor,
                    abortSignal,
                    sizeOnly,
                });
                if (img) {
                    out.push(img);
                }
            }
            // Fetch images from choices in parallel
            const choice = (0, iiif_js_1.extractChoices)(paintingAnnos);
            if ((choice === null || choice === void 0 ? void 0 : choice.type) === 'single-choice') {
                (yield Promise.all(choice.items
                    .map((i) => ({
                    res: iiif_js_1.vault.get(i.id),
                    selected: i.selected,
                }))
                    .filter((res) => res.res.type === 'Image')
                    .map((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    var _b;
                    // fetchCanvasImage expects an image annotation, so let's just quickly fake one
                    const img = res.res;
                    const fakeAnno = Object.assign(Object.assign({}, anno), { body: [{ id: img.id, type: 'ContentResource' }] });
                    const canvasImg = yield fetchCanvasImage(fakeAnno, {
                        scaleFactor,
                        abortSignal,
                        sizeOnly,
                    });
                    if (canvasImg) {
                        canvasImg.isOptional = true;
                        canvasImg.label = img.label;
                        canvasImg.visibleByDefault = (_b = res.selected) !== null && _b !== void 0 ? _b : false;
                    }
                    return canvasImg;
                }))))
                    .filter((util_js_1.isDefined))
                    .forEach((i) => out.push(i));
            }
            return out;
        })))).flat();
        const ppi = ppiOverride;
        if (!ppiOverride) {
            let ppi = (_a = getPointsPerInch(canvas.service)) !== null && _a !== void 0 ? _a : undefined;
            if (ppi && scaleFactor) {
                ppi = ppi * scaleFactor;
            }
        }
        const text = yield (0, ocr_js_1.fetchAndParseText)(canvas, undefined);
        return {
            canvas,
            // FIXME: Shouldn't we signal to the user somehow if some images failed to download?
            images,
            ppi,
            text,
            annotations: (0, iiif_js_1.getCanvasAnnotations)(canvas),
        };
    });
}
exports.fetchCanvasData = fetchCanvasData;
