"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryDeflateStream = exports.findLastIndex = exports.randomData = exports.getNumChildren = exports.IS_BIG_ENDIAN = exports.textDecoder = exports.textEncoder = void 0;
const tslib_1 = require("tslib");
const lodash_es_1 = require("lodash-es");
const util_1 = tslib_1.__importDefault(require("util"));
const zlib_1 = tslib_1.__importDefault(require("zlib"));
const fflate_1 = require("fflate");
const log_js_1 = tslib_1.__importDefault(require("../log.js"));
if (typeof window !== 'undefined' && window.TextEncoder && window.TextDecoder) {
    exports.textEncoder = new window.TextEncoder();
    exports.textDecoder = new window.TextDecoder();
}
else {
    exports.textEncoder = new util_1.default.TextEncoder();
    exports.textDecoder = new util_1.default.TextDecoder();
}
exports.IS_BIG_ENDIAN = (() => {
    const array = new Uint8Array(4);
    const view = new Uint32Array(array.buffer);
    return !((view[0] = 1) & array[0]);
})();
function getNumChildren(itm) {
    var _a;
    const children = (_a = itm.children) !== null && _a !== void 0 ? _a : [];
    return children.length + (0, lodash_es_1.sum)(children.map(getNumChildren));
}
exports.getNumChildren = getNumChildren;
function randomData(length) {
    if (length > Math.pow(2, 16)) {
        length = Math.pow(2, 16);
    }
    const buf = new Uint8Array(length);
    if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.crypto)) {
        crypto.getRandomValues(buf);
    }
    else if (typeof (global === null || global === void 0 ? void 0 : global.crypto) !== 'undefined') {
        return new Uint8Array(global.crypto(length));
    }
    else {
        const u32View = new Uint32Array(buf.buffer);
        for (let i = 0; i < u32View.length; i++) {
            u32View[i] = Math.floor(Math.random() * Math.pow(2, 32));
        }
    }
    return buf;
}
exports.randomData = randomData;
function findLastIndex(array, predicate) {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}
exports.findLastIndex = findLastIndex;
function tryDeflateStream(pdfStream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = pdfStream instanceof Uint8Array ? pdfStream : exports.textEncoder.encode(pdfStream);
        let compressed;
        if (typeof window !== 'undefined') {
            if (typeof window.CompressionStream === 'undefined') {
                // Browser doesn't support CompressionStream API, try to use the JS implementation
                try {
                    let bytes;
                    if (pdfStream instanceof Uint8Array) {
                        bytes = pdfStream;
                    }
                    else {
                        bytes = exports.textEncoder.encode(pdfStream);
                    }
                    compressed = (0, fflate_1.zlibSync)(bytes);
                    return Promise.resolve({
                        stream: compressed,
                        dict: { Length: compressed.length, Filter: '/FlateDecode' }
                    });
                }
                catch (err) {
                    log_js_1.default.warn(`Failed to use JS deflate implementation, data will be written uncompressed: ${err}`);
                    return Promise.resolve({
                        stream: pdfStream,
                        dict: { Length: pdfStream.length },
                    });
                }
            }
            const compStream = new window.CompressionStream('deflate');
            const c = new Blob([data]).stream().pipeThrough(compStream);
            compressed = new Uint8Array(yield new Response(c).arrayBuffer());
        }
        else {
            compressed = yield new Promise((resolve, reject) => zlib_1.default.deflate(data, (err, buf) => (err ? reject(err) : resolve(buf))));
        }
        return {
            dict: {
                Length: compressed.length,
                Filter: '/FlateDecode',
            },
            stream: compressed,
        };
    });
}
exports.tryDeflateStream = tryDeflateStream;
