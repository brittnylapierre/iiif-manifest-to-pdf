"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfParser = exports.ObjectParser = void 0;
const tslib_1 = require("tslib");
const lodash_es_1 = require("lodash-es");
const common_js_1 = require("./common.js");
const util_js_1 = require("./util.js");
function parseCrossRefSection(reader, offset, maxLength) {
    return tslib_1.__asyncGenerator(this, arguments, function* parseCrossRefSection_1() {
        const buf = new Uint8Array(maxLength);
        offset += yield tslib_1.__await(reader.read(buf, 0, offset, buf.length));
        if (!testForString(buf, 0, 'xref')) {
            throw 'Invalid crossreference section, did not start with `xref` line.';
        }
        const trailerIdx = (0, lodash_es_1.findIndex)(buf, (_x, idx) => testForString(buf, idx, 'trailer'));
        // Split into lines and skip first line (`xref`)
        const parts = util_js_1.textDecoder
            .decode(buf.subarray(0, trailerIdx))
            .split(/[\r ]?\n/)
            .slice(1);
        let currentSection;
        for (const part of parts) {
            // Entries have length 18 (we stripped the newline already)
            if (part.length === 18) {
                if (!currentSection) {
                    throw 'Invalid crossreference section, entry outside of subsection.';
                }
                const entryParts = part.trim().split(' ');
                currentSection.entries.push([
                    Number.parseInt(entryParts[0], 10),
                    Number.parseInt(entryParts[1], 10),
                    entryParts[2] === 'n',
                ]);
            }
            else {
                if (currentSection) {
                    if (currentSection.numObjs !== currentSection.entries.length) {
                        throw `Invalid subsection, expected ${currentSection.numObjs} objects, found ${currentSection.entries.length}!`;
                    }
                    yield yield tslib_1.__await(currentSection);
                    currentSection = undefined;
                }
                if (part.length === 0 || part.indexOf('trailer') >= 0) {
                    break;
                }
                const [startNum, numObjs] = part
                    .trimRight()
                    .split(' ')
                    .map((p) => Number.parseInt(p, 10));
                currentSection = {
                    startNum,
                    numObjs,
                    entries: [],
                };
            }
        }
        if (currentSection) {
            yield yield tslib_1.__await(currentSection);
        }
        const trailerBuf = buf.subarray(trailerIdx);
        const trailerStartIdx = (0, lodash_es_1.findIndex)(trailerBuf, (_x, idx) => testForString(trailerBuf, idx, '<<'));
        const trailerEndIdx = (0, lodash_es_1.findIndex)(trailerBuf, (_x, idx) => testForString(trailerBuf, idx, '>>'));
        /*
        const fileSize = await reader.size();
        while (trailerEndIdx < 0 && offset < fileSize) {
          const newBuf = new Uint8Array(trailerBuf.length + 1024);
          newBuf.set(trailerBuf, 0);
          offset += await reader.read(newBuf, buf.length, offset + buf.length, 1024);
          trailerBuf = newBuf;
          trailerEndIdx = findIndex(trailerBuf, (_x, idx) =>
            testForString(trailerBuf, idx, '>>')
          );
        }
        */
        const trailerDict = new ObjectParser(trailerBuf.subarray(trailerStartIdx, trailerEndIdx + 2)).read();
        if (trailerDict.Prev) {
            const previousXrefOffset = trailerDict.Prev;
            yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(parseCrossRefSection(reader, previousXrefOffset, offset - previousXrefOffset))));
        }
    });
}
function testForString(buf, offset, value, backwards = false) {
    if (backwards) {
        for (let idx = value.length - 1; idx >= 0; idx--) {
            if (buf[offset + idx] !== value.charCodeAt(idx)) {
                return false;
            }
        }
    }
    else {
        for (let idx = 0; idx < value.length; idx++) {
            if (buf[offset + idx] !== value.charCodeAt(idx)) {
                return false;
            }
        }
    }
    return true;
}
const escapeChars = {
    n: '\n',
    r: '\r',
    t: '\t',
    b: '\b',
    f: '\f',
    '(': '(',
    ')': ')',
    '\\': '\\',
};
function isDigit(c) {
    return !isNaN(parseInt(c, 10));
}
function isHex(c) {
    return (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x46);
}
class ObjectParser {
    constructor(buf) {
        this.start = 0;
        this.current = 0;
        this.buf = buf;
    }
    getChar() {
        return String.fromCharCode(this.buf[this.current]);
    }
    matchValue(value) {
        const valueRead = util_js_1.textDecoder.decode(this.buf.subarray(this.current, this.current + util_js_1.textEncoder.encode(value).length));
        return valueRead === value;
    }
    matchInteger(resetAfter = true) {
        this.start = this.current;
        let chr;
        let isInt = true;
        const chars = [];
        while (!this.matchWhiteSpace((chr = this.getChar())) &&
            !this.matchDelimiter(chr)) {
            if (chr === '+' || chr === '-') {
                if (this.current - this.start > 0) {
                    isInt = false;
                    break;
                }
            }
            else if (!isDigit(chr)) {
                isInt = false;
                break;
            }
            this.current++;
            chars.push(chr);
        }
        if (resetAfter) {
            this.current = this.start;
        }
        return isInt ? chars.join('') : undefined;
    }
    read() {
        let c = this.getChar();
        if (this.matchWhiteSpace(c)) {
            this.skipWhiteSpace();
            c = this.getChar();
        }
        switch (this.getChar()) {
            case '[':
                return this.readArray();
            case '<':
                return this.matchValue('<<') ? this.readDict() : this.readHexString();
            case '(':
                return this.readLiteralString();
            case '/':
                return this.readName();
            case 't':
                if (this.matchValue('true')) {
                    this.current += 'true'.length;
                    return true;
                }
                throw new Error('Unexpected character while parsing');
            case 'f':
                if (this.matchValue('false')) {
                    this.current += 'false'.length;
                    return false;
                }
                throw new Error('Unexpected character while parsing');
            case 'n':
                if (this.matchValue('null')) {
                    this.current += 'null'.length;
                    return null;
                }
                throw new Error('Unexpected character while parsing');
            case '.':
                return this.readRealNumber();
            default:
                if (this.matchIndirectObject()) {
                    return this.readIndirectObject();
                }
                if (this.matchRealNumber()) {
                    return this.readRealNumber();
                }
                if (this.matchInteger()) {
                    return this.readInteger();
                }
                throw new Error(`Encountered unexpected character during parsing: '${c}'`);
        }
    }
    matchWhiteSpace(c) {
        return (c === ' ' ||
            c === '\x00' ||
            c === '\n' ||
            c === '\r' ||
            c === '\r\n' ||
            c == '\x0C');
    }
    readInteger() {
        const intStr = this.matchInteger(false);
        if (intStr === undefined) {
            throw new Error('Failed to read integer.');
        }
        return Number.parseInt(intStr, 10);
    }
    readIndirectObject() {
        const match = this.matchIndirectObject(false);
        if (match === undefined) {
            throw new Error('Failed to read indirect object');
        }
        return new common_js_1.PdfRef(Number.parseInt(match.split(' ')[0]));
    }
    matchIndirectObject(resetAfter = true) {
        this.start = this.current;
        let c = this.getChar();
        const chars = [];
        const matchNumber = () => {
            if (!isDigit(c)) {
                return false;
            }
            chars.push(c);
            this.current++;
            while (isDigit((c = this.getChar()))) {
                chars.push(c);
                this.current++;
            }
            return true;
        };
        const matchWhitespace = () => this.skipWhiteSpace();
        // Using a closure makes resetting afterwards less verbose
        const match = () => {
            // Object number
            if (!matchNumber()) {
                return false;
            }
            if (!matchWhitespace()) {
                return false;
            }
            chars.push(' ');
            c = this.getChar();
            // Generation number
            if (!matchNumber()) {
                return false;
            }
            if (!matchWhitespace()) {
                return false;
            }
            chars.push(' ');
            if (this.getChar() !== 'R') {
                return false;
            }
            chars.push('R');
            this.current++;
            return true;
        };
        const doesMatch = match();
        if (resetAfter) {
            this.current = this.start;
        }
        if (doesMatch) {
            return chars.join('');
        }
    }
    matchRealNumber(resetAfter = true) {
        this.start = this.current;
        let isRealNumber = true;
        let digitSeen = false;
        let separatorSeen = false;
        const chars = [];
        let c;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            c = this.getChar();
            if (c === '.') {
                if (separatorSeen) {
                    isRealNumber = false;
                    break;
                }
                separatorSeen = true;
            }
            else if (isDigit(c)) {
                digitSeen = true;
            }
            else if (c === '-' || c === '+') {
                if (this.current - this.start > 0) {
                    break;
                }
            }
            else {
                break;
            }
            chars.push(c);
            this.current++;
        }
        if (resetAfter) {
            this.current = this.start;
        }
        if (!isRealNumber) {
            return undefined;
        }
        if (digitSeen && separatorSeen) {
            return chars.join('');
        }
        return undefined;
    }
    readRealNumber() {
        const str = this.matchRealNumber(false);
        if (!str) {
            throw new Error('Could not read real number.');
        }
        return Number.parseFloat(str);
    }
    skipWhiteSpace() {
        let skipped = false;
        while (!this.atEnd() && this.matchWhiteSpace(this.getChar())) {
            this.current++;
            skipped = true;
        }
        return skipped;
    }
    atEnd() {
        return this.current >= this.buf.length;
    }
    readName() {
        const chars = ['/'];
        this.current++;
        let c;
        while (!this.matchWhiteSpace((c = this.getChar())) &&
            !this.matchDelimiter(c)) {
            if (c === '#') {
                const a = this.buf[this.current++];
                const b = this.buf[this.current++];
                if (!isHex(a) || !isHex(b)) {
                    throw new Error('Illegal character escape in name.');
                }
                chars.push(String.fromCharCode(Number.parseInt(String.fromCharCode(a) + String.fromCharCode(b), 16)));
            }
            else {
                chars.push(c);
                this.current++;
            }
        }
        return chars.join('');
    }
    matchDelimiter(c) {
        return '[]{}()<>/%'.indexOf(c) >= 0;
    }
    readHexString() {
        this.current++;
        const vals = [];
        while (this.getChar() !== '>') {
            const a = this.buf[this.current++];
            const b = this.buf[this.current++];
            if (!isHex(a) || !isHex(b)) {
                throw new Error(`Invalid value in hex string: '${a}${b}`);
            }
            vals.push(Number.parseInt(String.fromCharCode(a) + String.fromCharCode(b), 16));
        }
        this.current++;
        return new Uint8Array(vals);
    }
    readLiteralString() {
        this.current++;
        const chars = [];
        let openParens = 0;
        let c;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            c = this.getChar();
            if (c === '\\') {
                this.current++;
                c = this.getChar();
                if (isDigit(c)) {
                    let cs = [c];
                    this.current++;
                    while (isDigit(this.getChar())) {
                        cs.push(this.getChar());
                        this.current++;
                    }
                    if (cs.length > 3) {
                        this.current -= cs.length - 3;
                        cs = cs.slice(0, 3);
                    }
                    this.current--;
                    c = String.fromCharCode(Number.parseInt(cs.join(''), 8));
                }
                else {
                    c = escapeChars[c];
                    if (c === undefined) {
                        throw new Error(`Illegal escape sequence in string literal: '\\${c}`);
                    }
                }
            }
            else if (c === '(') {
                openParens++;
            }
            else if (c === ')') {
                openParens--;
                if (openParens < 0) {
                    this.current++;
                    return chars.join('');
                }
            }
            chars.push(c);
            this.current++;
        }
    }
    readDict() {
        this.current += 2;
        const obj = {};
        this.skipWhiteSpace();
        while (this.getChar() !== '>') {
            const name = this.read();
            if (typeof name !== 'string' || !name.startsWith('/')) {
                throw new Error(`Dictionary keys must be name objects, got '${name}`);
            }
            this.skipWhiteSpace();
            const val = this.read();
            if (val !== null) {
                obj[name.substring(1)] = val;
            }
            this.skipWhiteSpace();
        }
        this.current += 2;
        return obj;
    }
    readArray() {
        this.current++;
        const arr = [];
        while (this.getChar() !== ']') {
            arr.push(this.read());
            this.skipWhiteSpace();
        }
        this.current++;
        return arr;
    }
}
exports.ObjectParser = ObjectParser;
class PdfParser {
    static parse(reader) {
        var _a, e_1, _b, _c;
        var _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const trailerBuf = new Uint8Array(1024);
            const pdfSize = yield reader.size();
            const bufStart = pdfSize - trailerBuf.length;
            yield reader.read(trailerBuf, 0, bufStart, trailerBuf.length);
            const eofIdx = trailerBuf.length - (trailerBuf[trailerBuf.length - 1] === 0x46 ? 5 : 6);
            if (!testForString(trailerBuf, eofIdx, '%%EOF')) {
                throw 'Invalid PDF, missing EOF comment at end of file';
            }
            const startXrefPos = (0, lodash_es_1.findLastIndex)(trailerBuf, (_x, idx) => testForString(trailerBuf, idx, 'startxref'));
            if (startXrefPos < 0) {
                throw 'Invalid PDF, missing startxref marker in file trailer.';
            }
            const objGenerations = [];
            const objsDeleted = [];
            const objOffsets = [];
            const xrefStartOffset = Number.parseInt(util_js_1.textDecoder.decode(trailerBuf.subarray(startXrefPos + 9, eofIdx)).trim(), 10);
            const dictEnd = (0, lodash_es_1.findLastIndex)(trailerBuf, (_x, idx) => testForString(trailerBuf, idx, '>>')) + 2;
            const dictStart = (0, lodash_es_1.findLastIndex)(trailerBuf, (_x, idx) => testForString(trailerBuf, idx, '<<'));
            const trailerDict = new ObjectParser(trailerBuf.subarray(dictStart, dictEnd)).read();
            try {
                for (var _e = true, _f = tslib_1.__asyncValues(parseCrossRefSection(reader, xrefStartOffset, bufStart + dictEnd - xrefStartOffset)), _g; _g = yield _f.next(), _a = _g.done, !_a;) {
                    _c = _g.value;
                    _e = false;
                    try {
                        const { startNum, entries } = _c;
                        for (const [idx, [offset, gen, inUse]] of entries.entries()) {
                            const objNum = idx + startNum;
                            if (((_d = objGenerations[objNum]) !== null && _d !== void 0 ? _d : -1) > gen) {
                                // Outdated entry, don't consider
                                continue;
                            }
                            objGenerations[objNum] = gen;
                            if (inUse) {
                                objOffsets[objNum] = offset;
                                objsDeleted[objNum] = false;
                            }
                            else {
                                objOffsets[objNum] = -1;
                                objsDeleted[objNum] = true;
                            }
                        }
                    }
                    finally {
                        _e = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_e && !_a && (_b = _f.return)) yield _b.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (objOffsets.length !== trailerDict.Size) {
                throw `Trailer dictionary has different number of objects than crossreference tables, ${objOffsets.length} vs. ${trailerDict.Size}`;
            }
            return new PdfParser(reader, objOffsets, objGenerations, trailerDict);
        });
    }
    constructor(reader, objOffsets, objGenerations, trailerDict) {
        this.reader = reader;
        this.objectOffsets = objOffsets;
        this.sortedOffsets = (0, lodash_es_1.sortBy)(objOffsets);
        this.objGenerations = objGenerations;
        this.catalogNum = trailerDict.Root.refObj;
        this.infoNum = trailerDict.Info.refObj;
    }
    catalog() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const obj = yield this.getObject(this.catalogNum);
            if (!obj) {
                throw `Document has no catalog object (num as per trailer: ${this.catalogNum}!`;
            }
            return obj.data;
        });
    }
    info() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const obj = yield this.getObject(this.infoNum);
            if (!obj) {
                throw `Document has no catalog object (num as per trailer: ${this.infoNum}!`;
            }
            return obj.data;
        });
    }
    _pagesFromPagesObj(pagesObj) {
        return tslib_1.__asyncGenerator(this, arguments, function* _pagesFromPagesObj_1() {
            for (const pageRef of pagesObj.Kids) {
                const page = yield tslib_1.__await(this.getObject(pageRef.refObj, true));
                if (!page) {
                    throw `Could not find Page object with number ${pageRef.refObj}`;
                }
                const pageDict = page.data;
                if (pageDict.Type === '/Pages') {
                    yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(this._pagesFromPagesObj(pageDict))));
                }
                else {
                    yield yield tslib_1.__await(page);
                }
            }
        });
    }
    pages() {
        return tslib_1.__asyncGenerator(this, arguments, function* pages_1() {
            const catalog = yield tslib_1.__await(this.catalog());
            const pagesRef = catalog.Pages;
            const pagesRoot = yield tslib_1.__await(this.getObject(pagesRef.refObj));
            if (!pagesRoot) {
                throw `Could not find Pages object with number ${pagesRef.refObj}`;
            }
            const pagesDict = pagesRoot.data;
            yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(this._pagesFromPagesObj(pagesDict))));
        });
    }
    annotations(pageDict) {
        return tslib_1.__asyncGenerator(this, arguments, function* annotations_1() {
            const annots = pageDict.Annots;
            if (!annots) {
                return yield tslib_1.__await(void 0);
            }
            for (const annoRef of annots) {
                const anno = yield tslib_1.__await(this.getObject(annoRef.refObj));
                if (!anno) {
                    throw `Could not find Annotation object with number ${annoRef.refObj}`;
                }
                yield yield tslib_1.__await(anno.data);
            }
        });
    }
    resolveRef(ref) {
        return this.getObject(ref.refObj, true);
    }
    getObject(num, withStream = false) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const offset = this.objectOffsets[num];
            if (!offset) {
                return;
            }
            if (!this.pdfSize) {
                this.pdfSize = yield this.reader.size();
            }
            const nextOffset = (_a = this.sortedOffsets[this.sortedOffsets.indexOf(offset) + 1]) !== null && _a !== void 0 ? _a : this.pdfSize;
            const buf = new Uint8Array(nextOffset - offset);
            yield this.reader.read(buf, 0, offset, buf.length);
            const objEndIdx = (0, lodash_es_1.findIndex)(buf, (_x, idx) => testForString(buf, idx, 'endobj'));
            let streamIdx = (0, lodash_es_1.findIndex)(buf, (_x, idx) => testForString(buf, idx, 'stream'));
            if (streamIdx >= 0) {
                streamIdx += 'stream'.length;
                if (buf[streamIdx] === '\r'.charCodeAt(0)) {
                    streamIdx += 2;
                }
                else {
                    streamIdx += 1;
                }
            }
            const objSig = `${num} ${this.objGenerations[num]} obj`;
            const objParser = new ObjectParser(buf.subarray(objSig.length, streamIdx < 0 ? objEndIdx : streamIdx));
            const data = objParser.read();
            if (typeof data !== 'object' || data === null) {
                throw new Error('Illegal PDF object, does not start with a dictionary.');
            }
            let stream;
            if (withStream && streamIdx > 0) {
                const streamLength = data.Length;
                if (streamLength === undefined) {
                    throw new Error('Illegal stream object, missing Length entry in object dictionary.');
                }
                stream = buf.subarray(streamIdx, streamIdx + streamLength);
            }
            return {
                num,
                data,
                stream,
            };
        });
    }
}
exports.PdfParser = PdfParser;
