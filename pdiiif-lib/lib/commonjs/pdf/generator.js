"use strict";
/* eslint-disable no-new-wrappers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/// PDF generation code
// FIXME: This is currently one hell of a mess, learning about PDF and coming up
// with good abstractions at the same time was too much of a challenge for me 🙈
const lodash_es_1 = require("lodash-es");
const dedent_js_1 = tslib_1.__importDefault(require("dedent-js"));
const common_js_1 = require("./common.js");
const util_js_1 = require("./util.js");
const io_js_1 = require("../io.js");
const image_js_1 = tslib_1.__importDefault(require("./image.js"));
const parser_js_1 = require("./parser.js");
const version_js_1 = tslib_1.__importDefault(require("../version.js"));
const log_js_1 = tslib_1.__importDefault(require("../log.js"));
const iiif_js_1 = require("../iiif.js");
const pkzip_js_1 = require("./pkzip.js");
const util_js_2 = require("../util.js");
const annos_js_1 = require("./annos.js");
const PRODUCER = `pdiiif v${version_js_1.default}`;
/// If the font is 10 pts, nominal character width is 5 pts
const CHAR_WIDTH = 2;
/// Taken from tesseract@2d6f38eebf9a14d9fbe65d785f0d7bd898ff46cb, tessdata/pdf.ttf
/// Created by Ken Sharp
/// (C) Copyright 2011, Google Inc.
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
const FONTDATA = new Uint8Array([
    0, 1, 0, 0, 0, 10, 0, 128, 0, 3, 0, 32, 79, 83, 47, 50, 86, 222, 200, 148, 0,
    0, 1, 40, 0, 0, 0, 96, 99, 109, 97, 112, 0, 10, 0, 52, 0, 0, 1, 144, 0, 0, 0,
    30, 103, 108, 121, 102, 21, 34, 65, 36, 0, 0, 1, 184, 0, 0, 0, 24, 104, 101,
    97, 100, 11, 120, 241, 101, 0, 0, 0, 172, 0, 0, 0, 54, 104, 104, 101, 97, 12,
    2, 4, 2, 0, 0, 0, 228, 0, 0, 0, 36, 104, 109, 116, 120, 4, 0, 0, 0, 0, 0, 1,
    136, 0, 0, 0, 8, 108, 111, 99, 97, 0, 12, 0, 0, 0, 0, 1, 176, 0, 0, 0, 6, 109,
    97, 120, 112, 0, 4, 0, 5, 0, 0, 1, 8, 0, 0, 0, 32, 110, 97, 109, 101, 242,
    235, 22, 218, 0, 0, 1, 208, 0, 0, 0, 75, 112, 111, 115, 116, 0, 1, 0, 1, 0, 0,
    2, 28, 0, 0, 0, 32, 0, 1, 0, 0, 0, 1, 0, 0, 176, 148, 113, 16, 95, 15, 60,
    245, 4, 7, 8, 0, 0, 0, 0, 0, 207, 154, 252, 110, 0, 0, 0, 0, 212, 195, 167,
    242, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 16, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
    8, 0, 255, 255, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 2, 0, 4, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 144, 0, 5, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 79, 79, 71, 0,
    64, 0, 0, 0, 0, 0, 1, 255, 255, 0, 0, 0, 1, 0, 1, 128, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0,
    0, 0, 20, 0, 3, 0, 0, 0, 0, 0, 20, 0, 6, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 12, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 8, 0, 0, 3, 0, 0, 49, 33, 17, 33,
    4, 0, 252, 0, 8, 0, 0, 0, 0, 3, 0, 42, 0, 0, 0, 3, 0, 0, 0, 5, 0, 22, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 5, 0, 11, 0, 22, 0, 3, 0, 1, 4, 9, 0, 5, 0, 22, 0, 0, 0, 86,
    0, 101, 0, 114, 0, 115, 0, 105, 0, 111, 0, 110, 0, 32, 0, 49, 0, 46, 0, 48,
    86, 101, 114, 115, 105, 111, 110, 32, 49, 46, 48, 0, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);
class PDFGenerator {
    constructor({ writer, metadata, canvasInfos, langPref, pageLabels, outline = [], readingDirection = 'left-to-right', hasText = false, initialCanvas, manifestJson, zipPolyglot = false, zipBaseDir, }) {
        // Keep track of how many bytes have been written so far
        this._offset = 0;
        // PDF objects that are scheduled for writing, will be written on _flush()
        this._objects = [];
        // Number of the next PDF object
        this._nextObjNo = 1;
        // References to various central objects
        this._objRefs = {};
        // Tracks offset of every XObject
        this._offsets = [];
        // Have we already started writing the IIIF pages?
        this._pagesStarted = false;
        // Information about each canvas, needed for pre-allocating objects
        this._canvasInfos = [];
        // Number of cover pages inserted at the beginning of the PDF
        this._numCoverPages = 0;
        // PDF outline
        this._outline = [];
        // Is the PDF supposed to have a hidden text layer?
        this._hasText = false;
        // List of top-level entries in the PDF's logical structure tree
        this._strucTree = [];
        // Maps a page's object number to the marked content sequence IDs its content
        // stream has
        this._pageMCIds = new Map();
        // Identifier of the next structure parent entry
        this._nextStructParentId = 0;
        // For every page, its corresponding parent ID for the parent tree
        this._pageParentIds = new Map();
        this._writer = writer;
        this._canvasInfos = canvasInfos;
        this._pageLabels = pageLabels;
        this._outline = outline;
        this._hasText = hasText;
        this._readingDirection = readingDirection;
        this._langPref = langPref;
        this._initialCanvas = initialCanvas;
        this._polyglot = zipPolyglot;
        this._zipBaseDir = zipBaseDir;
        this._manifestJson = manifestJson;
        const pdfMetadata = Object.assign(Object.assign({}, Object.entries(metadata)
            .filter((k, v) => v !== undefined)
            .reduce((prev, [k, v]) => {
            prev[k] = `(${v})`;
            return prev;
        }, {})), { Producer: `(${PRODUCER})` });
        this._addObject(pdfMetadata, 'Info');
    }
    setup() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const catalog = {
                Type: '/Catalog',
            };
            this._addObject(catalog, 'Catalog');
            const pagesObj = this._addObject({
                Type: '/Pages',
                Count: this._canvasInfos.length,
            }, 'Pages');
            catalog.Pages = (0, common_js_1.makeRef)(pagesObj);
            if (this._hasText) {
                catalog.MarkInfo = {
                    Type: '/MarkInfo',
                    Marked: true,
                };
            }
            if (this._outline.length > 0) {
                catalog.PageMode = '/UseOutlines';
                const outlines = {
                    Type: '/Outlines',
                    Count: 0,
                };
                const outlinesObj = this._addObject(outlines);
                catalog.Outlines = (0, common_js_1.makeRef)(outlinesObj);
                let prev;
                for (const [idx, itm] of this._outline.entries()) {
                    const [childObj, numKids] = this._addOutline(itm, outlinesObj, prev);
                    outlines.Count += 1 + numKids;
                    if (idx === 0) {
                        outlines.First = (0, common_js_1.makeRef)(childObj);
                    }
                    else if (idx === this._outline.length - 1) {
                        outlines.Last = (0, common_js_1.makeRef)(childObj);
                    }
                    prev = childObj;
                }
            }
            else {
                catalog.PageMode = '/UseThumbs';
            }
            catalog.ViewerPreferences = {
                Direction: this._readingDirection === 'right-to-left' ? '/R2L' : '/L2R',
            };
            if (this._hasText) {
                yield this._setupHiddenTextFont();
            }
        });
    }
    _setupHiddenTextFont() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const typeZeroFont = this._addObject({
                Type: '/Font',
                Subtype: '/Type0',
                BaseFont: '/GlyphLessFont',
                Encoding: '/Identity-H',
            }, 'Type0Font');
            const typeTwoFont = this._addObject({
                type: '/Font',
                Subtype: '/CIDFontType2',
                BaseFont: '/GlyphLessFont',
                DW: 1000 / CHAR_WIDTH,
                CIDSystemInfo: {
                    Ordering: '(Identity)',
                    Registry: '(Adobe)',
                    Supplement: 0,
                },
            });
            typeZeroFont.data.DescendantFonts = [
                (0, common_js_1.makeRef)(typeTwoFont),
            ];
            const cidtoGidMapData = new Uint8Array(128 * 1024);
            for (let i = 0; i < cidtoGidMapData.length; i++) {
                cidtoGidMapData[i] = i % 2 ? 1 : 0;
            }
            const comp = yield (0, util_js_1.tryDeflateStream)(cidtoGidMapData);
            const cidToGidMap = this._addObject(comp.dict, undefined, comp.stream);
            typeTwoFont.data.CIDToGIDMap = (0, common_js_1.makeRef)(cidToGidMap);
            const cmapStream = (0, dedent_js_1.default) `
      /CIDInit /ProcSet findresource begin
        12 dict begin
        begincmap
            /CIDSystemInfo
            <<
              /Registry (Adobe)
              /Ordering (UCS)
              /Supplement 0
            >> def
            /CMapName /Adobe-Identify-UCS def
            /CMapType 2 def
            1 begincodespacerange
            <0000> <FFFF>
            endcodespacerange
            1 beginbfrange
            <0000> <FFFE> <0000>
            endbfrange
        endcmap
        CMapName currentdict /CMap defineresource pop
        end
    end`;
            const cmap = this._addObject({
                Length: cmapStream.length,
            }, undefined, cmapStream);
            typeZeroFont.data.ToUnicode = (0, common_js_1.makeRef)(cmap);
            const fontDesc = this._addObject({
                Type: '/FontDescriptor',
                FontName: '/GlyphLessFont',
                FontBBox: [0, 0, 1000 / CHAR_WIDTH, 1000],
                Ascent: 1000,
                CapHeight: 1000,
                Descent: -1,
                Flags: 5,
                ItalicAngle: 0,
                StemV: 80,
            });
            typeTwoFont.data.FontDescriptor = (0, common_js_1.makeRef)(fontDesc);
            const maybeCompressedFont = yield (0, util_js_1.tryDeflateStream)(FONTDATA);
            const fontDataObj = this._addObject(Object.assign({ Length1: FONTDATA.length }, maybeCompressedFont.dict), undefined, maybeCompressedFont.stream);
            fontDesc.data.FontFile2 = (0, common_js_1.makeRef)(fontDataObj);
        });
    }
    _registerEmbeddedFilesInCatalog() {
        const catalog = this._objects[this._objRefs.Catalog.refObj]
            .data;
        const embeddedFiles = [
            `(manifest.json)`,
            (0, common_js_1.makeRef)(this._firstPageObjectNum - (this._polyglot ? 3 : 2)),
        ];
        for (const [idx, canvas] of this._canvasInfos.entries()) {
            if (!canvas.ocr) {
                continue;
            }
            const pageObjNum = this.getCanvasObjectNumber(idx);
            // The file spec for embedded OCR file is the previous to last XObject for a given canvas
            let fileObjNum = pageObjNum + this.getObjectsPerCanvas(idx) - 2;
            if (this._polyglot) {
                // Except if the PDF is polyglot, then it's the second to last XObject
                fileObjNum -= 1;
            }
            embeddedFiles.push(`(${canvas.ocr.id})`);
            embeddedFiles.push((0, common_js_1.makeRef)(fileObjNum));
        }
        if (!catalog.Names) {
            catalog.Names = {
                EmbeddedFiles: { Names: embeddedFiles },
            };
        }
        else {
            const names = catalog.Names;
            const nameTree = names.EmbeddedFiles;
            nameTree.Names = nameTree.Names.concat(embeddedFiles);
        }
    }
    _addOutline(itm, parent, prev) {
        var _a, _b;
        let dest;
        if (typeof itm.startCanvas === 'string') {
            const destCanvasIdx = this._canvasInfos.findIndex((ci) => ci.canvas.id === itm.startCanvas);
            if (destCanvasIdx < 0) {
                throw Error(`Could not find canvas with id ${itm.startCanvas} in manifest!`);
            }
            dest = [destCanvasIdx, '/Fit'];
        }
        else {
            const canvasId = itm.startCanvas.id;
            const unitScale = 72 / itm.startCanvas.ppi;
            const rect = itm.startCanvas.position;
            const { width, height } = itm.startCanvas.dimensions;
            const destCanvasIdx = this._canvasInfos.findIndex((ci) => ci.canvas.id === canvasId);
            if (destCanvasIdx < 0) {
                throw Error(`Could not find canvas with id ${canvasId} in manifest!`);
            }
            dest = [
                destCanvasIdx,
                '/FitR',
                // TODO: Thoroughly test that this is actually working!
                unitScale * rect.x,
                unitScale * rect.y,
                unitScale * (width - (rect.x + rect.width)),
                unitScale * (height - (rect.y + rect.height)), // top,
            ];
        }
        const rec = {
            Title: `( ${itm.label} )`,
            Parent: (0, common_js_1.makeRef)(parent),
            // NOTE: The first entry is a number only during setup and will later be
            //       replaced with a reference to the actual page object, once we know
            //       how many objects are preceding the page objects.
            Dest: dest,
        };
        const obj = this._addObject(rec);
        if (prev) {
            rec.Prev = (0, common_js_1.makeRef)(prev);
            prev.data.Next = (0, common_js_1.makeRef)(obj);
        }
        if ((_a = itm.children) === null || _a === void 0 ? void 0 : _a.length) {
            let prev;
            rec.Count = 0;
            for (const [idx, child] of itm.children.entries()) {
                const [childObj, numChildren] = this._addOutline(child, obj, prev);
                if (idx === 0) {
                    rec.First = (0, common_js_1.makeRef)(childObj);
                }
                else if (idx === itm.children.length - 1) {
                    rec.Last = (0, common_js_1.makeRef)(childObj);
                }
                rec.Count = rec.Count + 1 + numChildren;
                prev = childObj;
            }
        }
        return [obj, (_b = rec.Count) !== null && _b !== void 0 ? _b : 0];
    }
    _addObject(val, refName, stream) {
        if (stream) {
            if (!(0, lodash_es_1.isObject)(val)) {
                throw new Error('PDF Objects with a stream must have a dictionary as its value');
            }
            if (!val.Length) {
                val.Length = stream.length;
            }
        }
        const obj = {
            num: this._nextObjNo,
            data: val,
            stream,
        };
        this._nextObjNo++;
        this._objects[obj.num] = obj;
        if (refName) {
            this._objRefs[refName] = (0, common_js_1.makeRef)(obj);
        }
        return obj;
    }
    /** Clone an object from a foreign PDF into the current PDF, adjusting
     *  the encountered indirect object references.
     */
    _transplantObject(parser, obj, seenObjects = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const handleValue = (value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (value instanceof common_js_1.PdfRef) {
                    const o = yield parser.resolveRef(value);
                    if (o === undefined) {
                        throw `Could not resolve reference to object '${value.refObj}'`;
                    }
                    // Check if we've already transplanted the object
                    if (seenObjects[o.num]) {
                        return seenObjects[o.num];
                    }
                    const objDict = o.data;
                    const newObj = this._addObject(objDict, undefined, o.stream);
                    const ref = new common_js_1.PdfRef(newObj.num);
                    seenObjects[o.num] = ref;
                    newObj.data = yield handleValue(objDict);
                    if (objDict.Type === '/Page') {
                        // Redirect to our own Pages object
                        newObj.data.Parent = this._objRefs.Pages;
                    }
                    return ref;
                }
                else if (typeof value === 'string' && value[0] != '/') {
                    return `(${value})`;
                }
                else if (Array.isArray(value)) {
                    const out = [];
                    for (const val of value) {
                        out.push(yield handleValue(val));
                    }
                    return out;
                }
                else if (typeof value === 'object' && value !== null) {
                    const out = {};
                    for (const [key, val] of Object.entries(value)) {
                        // Ignore structure keys for now
                        if (key === 'StructParent' || key === 'StructParents') {
                            continue;
                        }
                        out[key] = yield handleValue(val);
                    }
                    return out;
                }
                return value;
            });
            const ref = new common_js_1.PdfRef(obj.num);
            // TODO: Special case: if the object is a page, we need to check for
            //       a /StructParents key, check for the /StructTreeRoot key in
            //       the catalog, and then transplant that to our _strucTree
            //       and _pageMCIDs structures. Quite the handful!!
            //
            return (yield handleValue(ref));
        });
    }
    insertCoverPages(pdfData) {
        var _a, e_1, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._pagesStarted) {
                throw 'Cover pages must be inserted before writing the first regular page';
            }
            const reader = new io_js_1.ArrayReader(new Uint8Array(pdfData));
            const parser = yield parser_js_1.PdfParser.parse(reader);
            const pagesDict = this._objects[this._objRefs.Pages.refObj]
                .data;
            pagesDict.Kids = [];
            try {
                // TODO: Parse and transplant the section and parent trees from
                //       the catalog into our own structures.
                for (var _d = true, _e = tslib_1.__asyncValues(parser.pages()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const page = _c;
                        const dict = page.data;
                        // Ignore associated structured content for now
                        delete dict.StructParents;
                        delete dict.Parent;
                        const newPageRef = yield this._transplantObject(parser, page);
                        pagesDict.Kids.push(newPageRef);
                        pagesDict.Count += 1;
                        this._numCoverPages += 1;
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return;
        });
    }
    _embedResource(id, filename, description, mimeType, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: Add check that the file is actually pre-registered in
            //       the catalog!
            const fileSpec = {
                Type: '/Filespec',
                F: `(${filename})`,
                UF: (0, common_js_1.toUTF16BE)(filename),
                Desc: `(${description})`,
                EF: {
                    F: (0, common_js_1.makeRef)(this._nextObjNo + (this._polyglot ? 2 : 1)),
                },
            };
            const maybeCompressed = yield (0, util_js_1.tryDeflateStream)(data);
            const embeddedFile = Object.assign({ Type: '/EmbeddedFile', Subtype: `(${mimeType})` }, maybeCompressed.dict);
            this._addObject(fileSpec);
            if (this._polyglot) {
                let zipData;
                if (typeof data === 'string') {
                    zipData = util_js_1.textEncoder.encode(data);
                }
                else {
                    zipData = data;
                }
                const extraDataLength = this._getSerializedSize({
                    num: this._nextObjNo + 2,
                    data: Object.assign(Object.assign({}, embeddedFile), maybeCompressed.dict),
                    stream: maybeCompressed.stream,
                }, true);
                this._insertZipHeaderDummyObject({
                    filename,
                    data: zipData,
                    deflatedData: maybeCompressed.dict.Filter
                        ? maybeCompressed.stream
                        : undefined,
                    // 2 bytes zlib header of deflated data
                    bytesUntilActualData: extraDataLength + 2,
                });
            }
            this._addObject(embeddedFile, undefined, maybeCompressed.stream);
        });
    }
    _embedManifest(manifestJson) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let manifestMime = 'application/ld+json';
            if (Array.isArray(manifestJson['@context'])) {
                const manifestProfile = manifestJson['@context'].find((p) => p.startsWith('http://iiif.io/api/presentation'));
                if (manifestProfile) {
                    manifestMime += `;profile="${manifestProfile}"`;
                }
            }
            else if (manifestJson['@context']) {
                manifestMime += `;profile="${manifestJson['@context']}"`;
            }
            yield this._embedResource('@id' in manifestJson ? manifestJson['@id'] : manifestJson.id, 'manifest.json', 'IIIF Manifest this PDF is based on', manifestMime, JSON.stringify(manifestJson));
        });
    }
    finalizePdfHeader() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const catalog = this._objects[this._objRefs.Catalog.refObj]
                .data;
            // Create page tree with page labels
            if (this._pageLabels) {
                catalog.PageLabels = (0, common_js_1.makeRef)(this._addObject({
                    Nums: (0, lodash_es_1.flatten)(this._pageLabels
                        .map((label, idx) => label
                        ? [idx + this._numCoverPages, { P: `( ${label} )` }]
                        : undefined)
                        .filter((x) => x !== undefined)),
                }));
            }
            const pagesObj = this._objects[this._objRefs.Pages.refObj];
            // Now that we know from which object number the pages start, we can set the
            // /Kids entry in the Pages object and update the outline destinations.
            const pageDict = pagesObj.data;
            if (!pageDict.Kids) {
                pageDict.Kids = [];
            }
            this._firstPageObjectNum = this._nextObjNo;
            if (this._manifestJson) {
                this._firstPageObjectNum += 2;
                if (this._polyglot) {
                    this._firstPageObjectNum++;
                }
            }
            for (const [idx] of this._canvasInfos.entries()) {
                pageDict.Kids.push((0, common_js_1.makeRef)(this.getCanvasObjectNumber(idx)));
            }
            this._objects
                // Get ToC entry object, the first destination will be the canvas index
                .filter((obj) => { var _a; return ((_a = obj.data) === null || _a === void 0 ? void 0 : _a.Dest) !== undefined; })
                .forEach((obj) => {
                const dest = obj.data.Dest;
                if (typeof dest[0] !== 'number') {
                    return;
                }
                dest[0] = (0, common_js_1.makeRef)(this.getCanvasObjectNumber(dest[0]));
            });
            // Register the structural content tree root
            if (this._hasText) {
                catalog.StructTreeRoot = (0, common_js_1.makeRef)(this._nextObjNo + this.totalCanvasObjects);
            }
            if (this._canvasInfos.some((ci) => ci.images.some((i) => i.choiceState))) {
                // We're *very* explicit with the visibility of the various OCGs to
                // ensure as broad a viewer support as possible (especially pdf.js
                // needed it...)
                const initiallyEnabledOCGs = [];
                const initiallyDisabledOCGs = [];
                const allOCGs = [];
                const rbGroups = [];
                for (const [canvasIdx, { images }] of this._canvasInfos.entries()) {
                    const pageObjNum = this.getCanvasObjectNumber(canvasIdx);
                    let ocgStart = pageObjNum + 2 + images.length;
                    if (this._polyglot) {
                        // Take 'dummy' objects for ZIP polyglot into account
                        ocgStart += images.length;
                    }
                    let ocgIdx = 0;
                    const rbGroup = [];
                    for (const img of images) {
                        if (!img.choiceState) {
                            continue;
                        }
                        const ref = (0, common_js_1.makeRef)(ocgStart + ocgIdx);
                        if (img.choiceState.enabled) {
                            initiallyEnabledOCGs.push(ref);
                        }
                        else {
                            initiallyDisabledOCGs.push(ref);
                        }
                        allOCGs.push(ref);
                        rbGroup.push(ref);
                        ocgIdx++;
                    }
                    rbGroups.push(rbGroup);
                }
                catalog.OCProperties = {
                    OCGs: allOCGs,
                    D: {
                        BaseState: '/OFF',
                        ON: initiallyEnabledOCGs,
                        OFF: initiallyDisabledOCGs,
                        RBGroups: rbGroups,
                    },
                };
            }
            if (typeof this._initialCanvas === 'string') {
                catalog.OpenAction = [
                    (0, common_js_1.makeRef)(this.getCanvasObjectNumber(this._canvasInfos.findIndex((ci) => ci.canvas.id === this._initialCanvas))),
                ];
            }
            else if (this._initialCanvas) {
                const unitScale = 72 / this._initialCanvas.ppi;
                const rect = this._initialCanvas.position;
                const { width, height } = this._initialCanvas.dimensions;
                catalog.OpenAction = [
                    (0, common_js_1.makeRef)(this.getCanvasObjectNumber(this._canvasInfos.findIndex((ci) => ci.canvas.id === this._initialCanvas))),
                    '/FitR',
                    // TODO: Thoroughly test that this is actually working!
                    unitScale * rect.x,
                    unitScale * rect.y,
                    unitScale * (width - (rect.x + rect.width)),
                    unitScale * (height - (rect.y + rect.height)), // top,
                ];
            }
            this._registerEmbeddedFilesInCatalog();
            yield this._flush();
            if (this._manifestJson) {
                yield this._embedManifest(this._manifestJson);
                yield this._flush();
            }
        });
    }
    renderPage(canvasId, { width: canvasWidth, height: canvasHeight, }, images, annotations, ocrText, ppi = 300) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pagesStarted) {
                log_js_1.default.debug('Initial page, finalizing PDF header structures.');
                yield this.finalizePdfHeader();
                this._pagesStarted = true;
            }
            // Factor to multiply pixels by to get equivalent PDF units (72 pdf units === 1 inch)
            const unitScale = 72 / ppi;
            const pageDict = {
                Type: '/Page',
                Parent: this._objRefs.Pages,
                MediaBox: [0, 0, unitScale * canvasWidth, unitScale * canvasHeight],
                Resources: {
                    ProcSet: ['/PDF', '/Text', '/ImageB', '/ImageI', '/ImageC'],
                },
            };
            if (this._hasText) {
                pageDict.StructParents = this._nextStructParentId;
                this._pageParentIds.set(this._nextObjNo, this._nextStructParentId);
                this._nextStructParentId++;
            }
            if (ocrText && this._objRefs.Type0Font) {
                pageDict.Resources.Font = {
                    'f-0-0': this._objRefs.Type0Font,
                };
            }
            const page = this._addObject(pageDict);
            const contentOps = [];
            const optionalGroupIds = {};
            for (const [idx, { dimensions, location, isOptional },] of images.entries()) {
                const drawWidth = unitScale * dimensions.width;
                const drawHeight = unitScale * dimensions.height;
                const drawX = unitScale * location.x;
                const drawY = unitScale * (canvasHeight - dimensions.height - location.y);
                const imageId = `/Im${idx + 1}`;
                if (isOptional) {
                    const ocId = `/oc${Object.keys(optionalGroupIds).length + 1}`;
                    optionalGroupIds[imageId] = ocId;
                    contentOps.push(`/OC ${ocId} BDC`);
                }
                contentOps.push(`q ${drawWidth} 0 0 ${drawHeight} ${drawX} ${drawY} cm`);
                contentOps.push(`${imageId} Do`);
                contentOps.push('Q');
                if (isOptional) {
                    contentOps.push('EMC');
                }
            }
            if (ocrText) {
                contentOps.push(this._renderOcrText(ocrText, unitScale));
            }
            log_js_1.default.debug('Trying to compress content stream.');
            const contentStreamComp = yield (0, util_js_1.tryDeflateStream)(contentOps.join('\n'));
            const contentsObj = this._addObject(contentStreamComp.dict, undefined, contentStreamComp.stream);
            page.data.Contents = (0, common_js_1.makeRef)(contentsObj);
            // Since we need the finalized page dictionary in order to determine
            // the offset for the the local zip header, we pre-generate all the
            // relevant information
            const imageObjectNums = [...images.keys()].map((idx) => {
                if (this._polyglot) {
                    return this._nextObjNo + idx * 2 + 1;
                }
                else {
                    return this._nextObjNo + idx;
                }
            });
            const optionalGroupObjectNums = {};
            if (images.some((i) => i.isOptional)) {
                for (const [idx, { isOptional }] of images.entries()) {
                    const imageId = `/Im${idx + 1}`;
                    if (!isOptional) {
                        continue;
                    }
                    // FIXME: This is broken for the layers example!
                    optionalGroupObjectNums[imageId] = imageObjectNums.slice(-1)[0] + idx + 1;
                }
            }
            const pageResources = page.data
                .Resources;
            const xObjects = {};
            const properties = {};
            for (const [idx, num] of imageObjectNums.entries()) {
                const imageId = `/Im${idx + 1}`;
                xObjects[imageId.substring(1)] = (0, common_js_1.makeRef)(num);
                const ocgNum = optionalGroupObjectNums[imageId];
                if (ocgNum !== undefined) {
                    const ocgId = optionalGroupIds[imageId];
                    properties[ocgId.substring(1)] = (0, common_js_1.makeRef)(ocgNum);
                }
            }
            pageResources.XObject = xObjects;
            if (Object.keys(properties).length > 0) {
                pageResources.Properties = properties;
            }
            log_js_1.default.debug('Creating image objects.');
            const canvasIdx = this._canvasInfos.findIndex((ci) => ci.canvas.id === canvasId);
            for (const [imgIdx, { data }] of images.entries()) {
                const imageData = new Uint8Array(data);
                const image = image_js_1.default.open(imageData);
                // TODO: Currently we only support JPEG, if we expand to other
                //       file types we need to consider multiple objects pe rimage
                const imageObj = image.toObjects(this._nextObjNo)[0];
                if (this._polyglot) {
                    const imgPreambleSize = this._getSerializedSize(imageObj, true);
                    const filename = `img/canvas-${canvasIdx}-${imgIdx}.jpg`;
                    this._insertZipHeaderDummyObject({
                        filename,
                        data: imageData,
                        bytesUntilActualData: imgPreambleSize,
                    });
                    imageObj.num = this._nextObjNo;
                }
                this._nextObjNo += 1;
                this._objects.push(imageObj);
            }
            if (images.some((i) => i.isOptional)) {
                log_js_1.default.debug('Creating optional content groups for page');
                for (const [idx, { isOptional, label, visibleByDefault },] of images.entries()) {
                    const imageId = `/Im${idx + 1}`;
                    if (!isOptional) {
                        continue;
                    }
                    optionalGroupObjectNums[imageId] = this._nextObjNo;
                    this._addObject({
                        Type: '/OCG',
                        Name: label
                            ? `(${(0, iiif_js_1.getI18nValue)(label, this._langPref, '/')})`
                            : undefined,
                        Intent: '/View',
                        Usage: visibleByDefault ? '/ON' : '/OFF',
                    });
                }
            }
            if (ocrText === null || ocrText === void 0 ? void 0 : ocrText.markup) {
                const canvasIdx = this._canvasInfos.findIndex((ci) => ci.canvas.id === canvasId);
                let filename = `ocr/canvas-${canvasIdx}`;
                if (ocrText.mimeType.indexOf('html') >= 0) {
                    filename += '.html';
                }
                else {
                    filename += '.xml';
                }
                yield this._embedResource(ocrText.id, filename, `OCR for canvas #${canvasIdx}`, ocrText.mimeType, ocrText.markup);
            }
            // Add annotations, if present
            if (annotations && annotations.length > 0) {
                log_js_1.default.debug('Creating annotations for page');
                pageDict.Annots = annotations
                    .flatMap((anno) => (0, annos_js_1.exportPdfAnnotation)(anno, unitScale, canvasHeight))
                    .map((pdfAnno) => (0, common_js_1.makeRef)(this._addObject(pdfAnno)));
            }
            // Write out all of the objects
            log_js_1.default.debug('Flushing data for page');
            yield this._flush();
            log_js_1.default.debug('Finished rendering page');
        });
    }
    /** Get PDF instructions to render a hidden text layer with the page's OCR.
     *
     * This owes *a lot* to Tesseract's PDF renderer[1] and the IA's `pdf-tools`[2]
     * that ported it to Python. Accordingly, the license of this method is Apache 2.0.
     *
     * [1] https://github.com/tesseract-ocr/tesseract/blob/5.0.0-beta-20210916/src/api/pdfrenderer.cpp
     * [2] https://github.com/internetarchive/archive-pdf-tools/blob/master/internetarchivepdf/pdfrenderer.py
     *
     *                            Apache License
     *                     Version 2.0, January 2004
     *                  http://www.apache.org/licenses/
     */
    _renderOcrText(ocr, unitScale) {
        // TODO: Handle changes in writing direction!
        // TODO: Handle baselines, at least the simple ``cx+d` skewed-line-type, proper polyline support
        //       requires a per-character transformation matrix, which is a bit much for the current
        //       MVP-ish state
        const pageHeight = ocr.height;
        const ops = [];
        ops.push('BT'); // Begin text rendering
        ops.push('3 Tr'); // Use "invisible ink" (no fill, no stroke)
        const pageObjNum = this._nextObjNo - 1;
        let lineIdx = 0;
        if (ocr.blocks) {
            for (const block of ocr.blocks) {
                const blockEntry = {
                    type: 'Sect',
                    children: [],
                    pageObjNum,
                    mcs: [],
                };
                for (const paragraph of block.paragraphs) {
                    const paragraphEntry = {
                        type: 'P',
                        children: [],
                        pageObjNum,
                        mcs: [],
                    };
                    for (const line of paragraph.lines) {
                        ops.push(...this.renderOcrLine(line, lineIdx, unitScale, pageHeight, pageObjNum));
                        paragraphEntry.children.push({
                            type: 'Span',
                            children: [],
                            pageObjNum,
                            mcs: [lineIdx],
                        });
                        lineIdx++;
                    }
                    blockEntry.children.push(paragraphEntry);
                }
                this._strucTree.push(blockEntry);
            }
        }
        else if (ocr.paragraphs) {
            for (const paragraph of ocr.paragraphs) {
                const paragraphEntry = {
                    type: 'P',
                    children: [],
                    pageObjNum,
                    mcs: [],
                };
                for (const line of paragraph.lines) {
                    ops.push(...this.renderOcrLine(line, lineIdx, unitScale, pageHeight, pageObjNum));
                    paragraphEntry.children.push({
                        type: 'Span',
                        children: [],
                        pageObjNum,
                        mcs: [lineIdx],
                    });
                    lineIdx++;
                }
                this._strucTree.push(paragraphEntry);
            }
        }
        else if (ocr.lines) {
            for (const line of ocr.lines) {
                ops.push(...this.renderOcrLine(line, lineIdx, unitScale, pageHeight, pageObjNum));
                this._strucTree.push({
                    type: 'Span',
                    children: [],
                    pageObjNum,
                    mcs: [lineIdx],
                });
                lineIdx++;
            }
        }
        ops.push('ET');
        return ops.join('\n');
    }
    renderOcrLine(line, lineIdx, unitScale, pageHeight, pageObjNum) {
        const fontRef = '/f-0-0';
        const scaleX = 1;
        const scaleY = 1;
        const shearX = 0;
        const shearY = 0;
        const ops = [];
        // Begin of marked content sequence that wraps the line in a Span
        ops.push(`/Span << /MCID ${lineIdx} >> BDC`);
        // Approximated font size for western scripts, PDF font size is specified in multiples of
        // 'user units', which default to 1/72inch. The `userScale` gives us the units per pixel.
        const fontSize = line.height * unitScale * 0.75;
        //const fontSize = 8; // TODO: This is what Tesseract uses, why does this work?
        ops.push(`${fontRef} ${fontSize} Tf`);
        // We use a text matrix for every line. Tesseract uses a per-paragraph matrix, but we don't
        // neccesarily have block/paragraph information available, so we'll use the next-closest
        // thing. This means that every word on the line is positioned relative to the line, not
        // relative to the page as in the markup.
        const xPos = line.x * unitScale;
        const lineY = pageHeight - line.y - line.height * 0.75;
        const yPos = lineY * unitScale;
        ops.push(`${scaleX} ${shearX} ${shearY} ${scaleY} ${xPos} ${yPos} Tm`);
        let xOld = 0;
        let yOld = 0;
        for (const word of line.spans) {
            if (!word.text) {
                continue;
            }
            if (word.isExtra || !word.width) {
                // TODO: What to do if word.isExtra?
                continue;
            }
            // Position drawing with relative moveto
            const wordX = (word.x - line.x) * unitScale;
            // Convert beween different y-origins in OCR and PDF
            const wordYAbsolute = pageHeight - word.y - word.height * 0.75;
            const wordY = (wordYAbsolute - lineY) * unitScale;
            const wordWidth = word.width * unitScale;
            const wordHeight = word.height * unitScale;
            const dx = wordX - xOld;
            const dy = wordY - yOld;
            ops.push(`${dx * scaleX + dy * shearX} ${dx * shearY + dy * scaleY} Td`);
            xOld = wordX;
            yOld = wordY;
            // Calculate horizontal stretch
            // TODO: This is ripped straight from Tesseract, I have no clue what it does
            // FIXME: The end of the line seems to be too far to the left sometimes,
            // while the start seems to match
            const wordLength = Math.pow(Math.pow(wordWidth, 2) + Math.pow(wordHeight, 2), 0.5);
            const pdfWordLen = word.text.length;
            ops.push(`${CHAR_WIDTH * ((100 * wordLength) / (fontSize * pdfWordLen))} Tz`);
            // TODO: Account for trailing space in width calculation to prevent readers
            //       from inserting a line break
            const textBytes = (0, common_js_1.serialize)((0, common_js_1.toUTF16BE)(word.text + ' ', false));
            ops.push(`[ ${textBytes} ] TJ`);
        }
        ops.push('EMC');
        // Add a newline to visually group together all statements belonging to a line
        ops.push('');
        if (!this._pageMCIds.has(pageObjNum)) {
            this._pageMCIds.set(pageObjNum, []);
        }
        this._pageMCIds.get(pageObjNum).push(lineIdx);
        return ops;
    }
    get bytesWritten() {
        return this._offset;
    }
    /** Number of objects needed to render all canvases */
    get totalCanvasObjects() {
        // Every canvas needs 1 object per image, 1 for the content stream and 1 for the page definition.
        return this._canvasInfos.reduce((sum, _, idx) => sum + this.getCanvasObjectNumber(idx), 0);
    }
    getObjectsPerCanvas(canvasIdx) {
        const { images, ocr, numAnnotations } = this._canvasInfos[canvasIdx];
        let numObjects = 
        // 1 XObject per image
        images.length +
            // Page dictionary and content
            2 +
            // 1 Optional Content Group per optional image
            images.filter((i) => i.choiceState !== undefined).length +
            // 1 XObject per annotation
            numAnnotations;
        if (this._polyglot) {
            // For a polyglot PDF, we need to precede every XObject that we'd like
            // to expose as a file in the ZIP with a separate XObject that contains
            // the local ZIP header for that file. Currently this concerns the
            // images and the OCR data
            numObjects = numObjects + images.length + (ocr ? 1 : 0);
        }
        if (ocr) {
            numObjects += 2;
        }
        return numObjects;
    }
    getCanvasObjectNumber(canvasIdx) {
        let num = this._firstPageObjectNum;
        for (const [idx] of this._canvasInfos.entries()) {
            if (idx === canvasIdx) {
                return num;
            }
            num += this.getObjectsPerCanvas(idx);
        }
        throw new Error(`Canvas #${canvasIdx} not found.`);
    }
    _flush() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._offsets.length === 0) {
                log_js_1.default.debug('Writing PDF header');
                yield this._write(`%PDF-1.5\n%\xde\xad\xbe\xef\n`);
            }
            for (const obj of this._objects) {
                if (!obj) {
                    continue;
                }
                log_js_1.default.debug(`Serializing object #${obj.num}`);
                yield this._serializeObject(obj);
            }
            this._objects = [];
        });
    }
    _getSerializedSize({ num, data, stream }, untilStreamStart = false) {
        let size = 0;
        size += `${num} 0 obj\n`.length;
        if (data) {
            size += (0, common_js_1.serialize)(data).length;
        }
        if (stream) {
            size += '\nstream\n'.length;
            if (untilStreamStart) {
                return size;
            }
            if (typeof stream === 'string') {
                size += util_js_1.textEncoder.encode(stream).byteLength;
            }
            else {
                size += stream.byteLength;
            }
            size += '\nendstream'.length;
        }
        size += '\nendobj\n'.length;
        return size;
    }
    _serializeObject(obj) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._offsets.push(this._offset);
            const { num, data, stream } = obj;
            yield this._write(`${num} 0 obj\n`);
            if (data) {
                yield this._write((0, common_js_1.serialize)(data));
            }
            if (stream) {
                yield this._write('\nstream\n');
                yield this._write(stream);
                yield this._write('\nendstream');
            }
            yield this._write('\nendobj\n');
        });
    }
    _write(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._writer === undefined) {
                throw new Error('Cannot perform mutating operations on an already closed PDFGenerator.');
            }
            if (typeof data === 'string') {
                data = util_js_1.textEncoder.encode(data);
            }
            this._offset += data.byteLength;
            yield this._writer.write(data);
        });
    }
    _writeStructureTree() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const parentRoot = {
                Nums: [],
            };
            const parentRootRef = (0, common_js_1.makeRef)(this._addObject(parentRoot));
            const root = {
                Type: '/StructTreeRoot',
                K: [],
                ParentTree: parentRootRef,
                ParentTreeNextKey: this._nextStructParentId,
            };
            const pageParents = new Map();
            const rootRef = (0, common_js_1.makeRef)(this._addObject(root));
            const visitEntry = (entry, parent, parentRef) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const obj = {
                    Type: '/StructElem',
                    S: `/${entry.type}`,
                    P: parentRef,
                    Pg: (0, common_js_1.makeRef)(entry.pageObjNum),
                    K: [],
                };
                if (!pageParents.has(entry.pageObjNum)) {
                    pageParents.set(entry.pageObjNum, []);
                }
                const objRef = (0, common_js_1.makeRef)(this._addObject(obj));
                parent.K.push(objRef);
                if (entry.children.length > 0) {
                    for (const i of entry.children) {
                        yield visitEntry(i, obj, objRef);
                    }
                }
                else if (entry.mcs.length == 1) {
                    obj.K = entry.mcs[0];
                }
                else if (entry.mcs.length > 0) {
                    obj.K = entry.mcs;
                }
                if (entry.mcs.length > 0) {
                    const parents = pageParents.get(entry.pageObjNum);
                    for (const mcId of entry.mcs) {
                        parents[mcId] = objRef;
                    }
                }
                if (this._objects.length > 1000) {
                    yield this._flush();
                }
            });
            for (const i of this._strucTree) {
                yield visitEntry(i, root, rootRef);
            }
            for (const [pageObjNum, parents] of pageParents) {
                const pidx = this._pageParentIds.get(pageObjNum);
                parentRoot.Nums.push(pidx, (0, common_js_1.makeRef)(this._addObject(parents)));
            }
            yield this._flush();
        });
    }
    end() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._writer) {
                return;
            }
            /* FIXME: Disabled due to poor performance on large volumes and a strange
             *        interaction with streamsaver, where the PDF would be prematurely
             *        closed in the middle of writing out the structure tree.
            console.debug("Writing structure tree");
            if (this._strucTree.length > 0) {
              await this._writeStructureTree();
            }
            */
            log_js_1.default.debug('Writing xref table');
            const xrefEntries = [
                [0, 65535, 'f'],
                ...this._offsets.map((offset) => [offset, 0, 'n']),
            ];
            const xRefTable = xrefEntries
                .map(([off, gen, free]) => [
                (0, lodash_es_1.padStart)(off.toString(10), 10, '0'),
                (0, lodash_es_1.padStart)(gen.toString(10), 5, '0'),
                free,
                '',
            ].join(' '))
                .join('\n');
            const xrefOffset = this._offset;
            yield this._write(`xref\n0 ${xrefEntries.length}\n${xRefTable}`);
            const trailerDict = {
                Size: xrefEntries.length,
                Root: this._objRefs.Catalog,
                Info: this._objRefs.Info,
                ID: [(0, util_js_1.randomData)(32), (0, util_js_1.randomData)(32)],
            };
            const trailer = [
                `\ntrailer\n${(0, common_js_1.serialize)(trailerDict)}`,
                `\nstartxref\n${xrefOffset}\n%%EOF`,
            ].join('');
            if (this._polyglot && this._zipCatalog) {
                log_js_1.default.debug('Writing zip end of central directory');
                yield this._write((0, pkzip_js_1.buildCentralFileDirectory)({
                    files: this._zipCatalog,
                    trailingLength: trailer.length,
                    offset: this._offset,
                }));
            }
            yield this._flush();
            log_js_1.default.debug('Writing trailer');
            yield this._write(trailer);
            log_js_1.default.debug('Flushing');
            yield this._flush();
            // FIXME: Never resolves on Node.js, is it really
            // needed in browsers?
            //log.debug('Waiting for drainage');
            //await this._writer.waitForDrain();
            log_js_1.default.debug('PDF finished, closing writer');
            yield this._writer.close();
            log_js_1.default.debug('Writer closed');
            this._writer = undefined;
        });
    }
    _insertZipHeaderDummyObject({ filename, data, deflatedData, bytesUntilActualData, }) {
        if (this._zipBaseDir) {
            filename = `${this._zipBaseDir}/${filename}`;
        }
        const zipObjOffset = this._offset +
            this._objects.reduce((acc, obj) => acc + this._getSerializedSize(obj), 0);
        const creationDate = new Date();
        bytesUntilActualData += '\nendstream\nendobj\n'.length;
        const zipObj = this._addObject({}, undefined, (0, pkzip_js_1.buildLocalZipHeader)({
            filename,
            data,
            compressedData: deflatedData,
            extraDataLength: bytesUntilActualData,
            creationDate,
        }));
        const localHeaderOffset = zipObjOffset + this._getSerializedSize(zipObj, true);
        if (!this._zipCatalog) {
            this._zipCatalog = [];
        }
        this._zipCatalog.push({
            localHeaderOffset,
            deflated: (deflatedData === null || deflatedData === void 0 ? void 0 : deflatedData.length) !== data.length,
            creationDate: new Date(),
            crc32: (0, util_js_2.crc32)(data),
            dataLength: data.length,
            // skip 2 bytes for zlib header
            compressedDataLength: deflatedData
                ? deflatedData.length - 2
                : data.length,
            filename,
        });
    }
}
exports.default = PDFGenerator;
