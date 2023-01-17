"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crc32 = exports.isDefined = exports.now = void 0;
/** Get a timestamp in milliseconds, prefereably high-resolution */
function now() {
    if (typeof window !== 'undefined' && window.performance) {
        return window.performance.now();
    }
    else {
        return Date.now();
    }
}
exports.now = now;
function isDefined(val) {
    return val != undefined && val !== null;
}
exports.isDefined = isDefined;
const CRC_TABLE = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; ++i) {
        let c = i, k = 9;
        while (--k)
            c = ((c & 1) && -306674912) ^ (c >>> 1);
        t[i] = c;
    }
    return t;
})();
function crc32(data) {
    let c = -1;
    for (let i = 0; i < data.length; ++i) {
        c = CRC_TABLE[(c & 255) ^ data[i]] ^ (c >>> 8);
    }
    return ~c;
}
exports.crc32 = crc32;
