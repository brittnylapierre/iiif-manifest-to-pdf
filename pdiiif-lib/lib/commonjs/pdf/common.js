"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = exports.toUTF16BE = exports.makeRef = exports.PdfRef = void 0;
const lodash_es_1 = require("lodash-es");
const util_js_1 = require("./util.js");
const PDF_INDENTATION = 2;
class PdfRef {
    constructor(num) {
        this.refObj = num;
    }
}
exports.PdfRef = PdfRef;
function makeRef(target) {
    const num = typeof target === 'number' ? target : target.num;
    return new PdfRef(num);
}
exports.makeRef = makeRef;
function isUnicode(str) {
    for (let i = 0, end = str.length; i < end; i++) {
        if (str.charCodeAt(i) > 0x7f) {
            return true;
        }
    }
    return false;
}
/** Convert a JS UTF8 string to a UTF16 Big Endian string */
function toUTF16BE(str, includeBom = true) {
    const buf = new Uint16Array(str.length + (includeBom ? 1 : 0));
    for (let i = includeBom ? 1 : 0; i < buf.length; i++) {
        buf[i] = str.charCodeAt(i - (includeBom ? 1 : 0));
    }
    const outBuf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    if (!util_js_1.IS_BIG_ENDIAN) {
        // PDF needs UTF16-BE, so in little endian systems we need to swap each
        // codepoint's byte pair
        for (let i = includeBom ? 2 : 0, end = outBuf.length - 1; i < end; i += 2) {
            const a = outBuf[i];
            outBuf[i] = outBuf[i + 1];
            outBuf[i + 1] = a;
        }
    }
    // UTF16BE BOM
    if (includeBom) {
        outBuf[0] = 254;
        outBuf[1] = 255;
    }
    return outBuf;
}
exports.toUTF16BE = toUTF16BE;
function safeNumber(num) {
    if (num > -1e21 && num < 1e21) {
        return Math.round(num * 1e6) / 1e6;
    }
    throw new Error(`unsupported number: ${num}`);
}
function serialize(value, dictIndent = 0) {
    if (typeof value === 'string') {
        if (value[0] === '(' &&
            value[value.length - 1] === ')' &&
            isUnicode(value)) {
            return serialize(toUTF16BE(value.substring(1, value.length - 1)));
        }
        return value;
    }
    else if (value instanceof Uint8Array) {
        return `<${Array.from(value)
            .map((x) => x.toString(16).padStart(2, '0').toUpperCase())
            .join('')}>`;
    }
    else if (value instanceof Date) {
        const dateString = `D:${(0, lodash_es_1.padStart)(value.getUTCFullYear().toString(10), 4, '0')}` +
            (0, lodash_es_1.padStart)(value.getUTCMonth().toString(10) + 1, 2, '0') +
            (0, lodash_es_1.padStart)(value.getUTCDate().toString(10), 2, '0') +
            (0, lodash_es_1.padStart)(value.getUTCHours().toString(10), 2, '0') +
            (0, lodash_es_1.padStart)(value.getUTCMinutes().toString(10), 2, '0') +
            (0, lodash_es_1.padStart)(value.getUTCSeconds().toString(10), 2, '0') +
            'Z';
        return `(${dateString})`;
    }
    else if (Array.isArray(value)) {
        return `[${value.map((v) => serialize(v, dictIndent + 1)).join(' ')}]`;
    }
    else if (value instanceof PdfRef) {
        return `${value.refObj} 0 R`;
    }
    else if ({}.toString.call(value) === '[object Object]') {
        const outsideIndent = ' '.repeat(PDF_INDENTATION * dictIndent);
        const insideIndent = outsideIndent + ' '.repeat(PDF_INDENTATION);
        return `<<\n${Object.entries(value)
            .map(([k, v]) => `${insideIndent}/${k} ${serialize(v, dictIndent + 1)}`)
            .join('\n')}\n${outsideIndent}>>`;
    }
    else if (typeof value === 'number') {
        return safeNumber(value).toString(10);
    }
    else {
        return `${value}`;
    }
}
exports.serialize = serialize;
