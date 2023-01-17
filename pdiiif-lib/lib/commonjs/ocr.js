"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndParseText = exports.getTextSeeAlso = exports.fetchAnnotationResource = exports.parseIiifAnnotations = exports.parseOcr = exports.parseAlto = exports.parseHocr = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable complexity */
/// Utilities for parsing OCR text from hOCR, ALTO and IIIF Annotations
const lodash_es_1 = require("lodash-es");
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
const jsdom_1 = tslib_1.__importDefault(require("jsdom"));
const metrics_js_1 = tslib_1.__importDefault(require("./metrics.js"));
const download_js_1 = require("./download.js");
const log_js_1 = tslib_1.__importDefault(require("./log.js"));
const iiif_js_1 = require("./iiif.js");
let parser;
let TextType;
if (typeof window === 'undefined') {
    const nodeDom = new jsdom_1.default.JSDOM();
    parser = new nodeDom.window.DOMParser();
    TextType = nodeDom.window.Text;
}
else {
    parser = new DOMParser();
    TextType = Text;
}
/** Parse hOCR attributes from a node's title attribute
 *
 * @param {string} titleAttrib The content of an hOCR node's `@title` attribute
 * @returns {object} the parsed hOCR attributes
 */
function parseHocrAttribs(titleAttrib) {
    const vals = titleAttrib.split(';').map((x) => x.trim());
    return vals.reduce((acc, val) => {
        const key = val.split(' ')[0];
        // Special handling for bounding boxes, convert them to a number[4]
        if (key === 'bbox') {
            acc[key] = val
                .split(' ')
                .slice(1, 5)
                .map((x) => Number.parseInt(x, 10));
        }
        else {
            acc[key] = val.split(' ').slice(1, 5).join(' ');
        }
        return acc;
    }, {});
}
/** Parse an hOCR node
 *
 * @param {HTMLElement} node DOM node from hOCR parse, either a ocrx_word or ocr_line
 * @param {boolean} endOfLine whether the node is the end of a line
 * @param {number} scaleFactor how much to scale the coordinates by
 * @return {array} the parsed OCR spans (length == 2 only when line ends on text content without coordinates)
 */
function parseHocrNode(node, endOfLine = false, scaleFactor = 1) {
    var _a, _b;
    const [ulx, uly, lrx, lry] = parseHocrAttribs(node.title).bbox.map((dim) => dim * scaleFactor);
    let style = node.getAttribute('style');
    if (style) {
        style = style.replace(/font-size:.+;/, '');
    }
    const spans = [
        {
            height: lry - uly,
            style: style !== null && style !== void 0 ? style : undefined,
            text: (_a = node.textContent) !== null && _a !== void 0 ? _a : undefined,
            width: lrx - ulx,
            x: ulx,
            y: uly,
            isExtra: false,
            spans: [],
        },
    ];
    // Add an extra space span if the following text node contains something
    if (node.nextSibling instanceof TextType) {
        let extraText = node.nextSibling.wholeText.replace(/\s+/, ' ');
        if (endOfLine) {
            // We don't need trailing whitespace
            extraText = extraText.trimEnd();
        }
        if (extraText.length > 0) {
            spans.push({
                height: lry - uly,
                text: extraText,
                x: lrx,
                y: uly,
                // NOTE: This span has no width initially, will be set when we encounter
                //       the next word. (extra spans always fill the area between two words)
                isExtra: true,
                spans: [],
            });
        }
    }
    const lastSpan = spans.slice(-1)[0];
    if (endOfLine && ((_b = lastSpan.text) === null || _b === void 0 ? void 0 : _b.slice(-1)) !== '\u00AD') {
        // Add newline if the line does not end on a hyphenation (a soft hyphen)
        lastSpan.text += '\n';
    }
    return spans;
}
function parseHocrLineNode(lineNode, scaleFactor) {
    var _a, _b, _c;
    const wordNodes = lineNode.querySelectorAll('span.ocrx_word');
    if (wordNodes.length === 0) {
        return parseHocrNode(lineNode, true, scaleFactor)[0];
    }
    else {
        const line = parseHocrNode(lineNode, true, scaleFactor)[0];
        const spans = [];
        // eslint-disable-next-line no-unused-vars
        for (const [i, wordNode] of wordNodes.entries()) {
            const textSpans = parseHocrNode(wordNode, i === wordNodes.length - 1, scaleFactor);
            // Calculate width of previous extra span
            const previousExtraSpan = (_a = spans.slice(-1).filter((s) => s.isExtra)) === null || _a === void 0 ? void 0 : _a[0];
            if (previousExtraSpan) {
                previousExtraSpan.width = textSpans[0].x - previousExtraSpan.x;
            }
            spans.push(...textSpans);
        }
        // Update with of extra span at end of line
        const endExtraSpan = (_b = spans.slice(-1).filter((s) => s.isExtra)) === null || _b === void 0 ? void 0 : _b[0];
        if (endExtraSpan) {
            endExtraSpan.width = line.x + ((_c = line.width) !== null && _c !== void 0 ? _c : 0) - endExtraSpan.x;
        }
        line.spans = spans;
        line.text = spans
            .map((w) => w.text)
            .join('')
            .trim();
        return line;
    }
}
/** Parse an hOCR document
 *
 * @param {string} hocrText the raw hOCR markup
 * @param {object} referenceSize the size of the corresponding page image
 * @returns {object} the parsed OCR page
 */
function parseHocr(id, hocrText, referenceSize) {
    const doc = parser.parseFromString(hocrText, 'text/html');
    const pageNode = doc.querySelector('div.ocr_page');
    if (pageNode === null) {
        return null;
    }
    const pageSize = parseHocrAttribs(pageNode.title)
        .bbox;
    let scaleFactor = 1;
    if (pageSize[2] !== referenceSize.width ||
        pageSize[3] !== referenceSize.height) {
        const scaleFactorX = referenceSize.width / pageSize[2];
        const scaleFactorY = referenceSize.height / pageSize[3];
        const scaledWidth = Math.round(scaleFactorY * pageSize[2]);
        const scaledHeight = Math.round(scaleFactorX * pageSize[3]);
        if (scaledWidth !== referenceSize.width ||
            scaledHeight !== referenceSize.height) {
            log_js_1.default.debug(`Differing scale factors for x and y axis: x=${scaleFactorX}, y=${scaleFactorY}`);
        }
        scaleFactor = scaleFactorX;
    }
    let blocks = [];
    for (const blockNode of pageNode.querySelectorAll('div.ocr_carea, div.ocrx_block')) {
        const block = {
            paragraphs: [],
        };
        for (const paragraphNode of blockNode.querySelectorAll('p.ocr_par')) {
            const paragraph = { lines: [] };
            for (const lineNode of paragraphNode.querySelectorAll('span.ocr_line, span.ocrx_line')) {
                paragraph.lines.push(parseHocrLineNode(lineNode, scaleFactor));
            }
            block.paragraphs.push(paragraph);
        }
        blocks.push(block);
    }
    if (blocks.length === 0) {
        blocks = undefined;
    }
    let paragraphs = [];
    if (!blocks) {
        for (const paragraphNode of pageNode.querySelectorAll('p.ocr_par')) {
            const paragraph = { lines: [] };
            for (const lineNode of paragraphNode.querySelectorAll('span.ocr_line, span.ocrx_line')) {
                paragraph.lines.push(parseHocrLineNode(lineNode, scaleFactor));
            }
            paragraphs.push(paragraph);
        }
    }
    if (paragraphs.length === 0) {
        paragraphs = undefined;
    }
    let lines = [];
    if (!blocks && !paragraphs) {
        for (const lineNode of pageNode.querySelectorAll('span.ocr_line, span.ocrx_line')) {
            lines.push(parseHocrLineNode(lineNode, scaleFactor));
        }
    }
    if (lines.length === 0) {
        lines = undefined;
    }
    return {
        id,
        height: Math.round(scaleFactor * pageSize[3]),
        blocks,
        paragraphs,
        lines,
        width: Math.round(scaleFactor * pageSize[2]),
        markup: hocrText,
        mimeType: 'text/vnd.hocr+html',
    };
}
exports.parseHocr = parseHocr;
/** Create CSS directives from an ALTO TextStyle node
 *
 * @param {Element} styleNode The ALTO node with style information
 * @returns {string} the corresponding CSS style string
 */
function altoStyleNodeToCSS(styleNode) {
    // NOTE: We don't map super/subscript, since it would change the font size
    const fontStyleMap = {
        bold: 'font-weight: bold',
        italics: 'font-style: italic',
        smallcaps: 'font-variant: small-caps',
        underline: 'text-decoration: underline',
    };
    const styles = [];
    if (styleNode.hasAttribute('FONTFAMILY')) {
        styles.push(`font-family: ${styleNode.getAttribute('FONTFAMILY')}`);
    }
    if (styleNode.hasAttribute('FONTTYPE')) {
        styles.push(`font-type: ${styleNode.getAttribute('FONTTYPE')}`);
    }
    if (styleNode.hasAttribute('FONTCOLOR')) {
        styles.push(`color: #${styleNode.getAttribute('FONTCOLOR')}`);
    }
    if (styleNode.hasAttribute('FONTSTYLE')) {
        const altoStyle = styleNode.getAttribute('FONTSTYLE');
        if (altoStyle !== null && altoStyle in fontStyleMap) {
            styles.push(fontStyleMap[altoStyle]);
        }
    }
    return styles.join(';');
}
/**
 * Parse an ALTO document.
 *
 * Needs access to the (unscaled) target image size since it ALTO uses 10ths of
 * millimeters for units by default and we need pixels.
 *
 * @param {string} altoText Raw text with ALTO markup
 * @param {object} imgSize Size of the target image
 * @returns {object} the parsed OCR page
 */
function parseAlto(id, altoText, imgSize) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const doc = parser.parseFromString(altoText, 'text/xml');
    // We assume ALTO is set as the default namespace
    /** Namespace resolver that forrces the ALTO namespace */
    const measurementUnit = (_a = doc.querySelector('alto > Description > MeasurementUnit')) === null || _a === void 0 ? void 0 : _a.textContent;
    const pageElem = doc.querySelector('alto > Layout > Page, alto > Layout > Page > PrintSpace');
    let pageWidth = Number.parseInt((_b = pageElem.getAttribute('WIDTH')) !== null && _b !== void 0 ? _b : '0', 10);
    let pageHeight = Number.parseInt((_c = pageElem.getAttribute('HEIGHT')) !== null && _c !== void 0 ? _c : '0', 10);
    let scaleFactorX = 1.0;
    let scaleFactorY = 1.0;
    if (measurementUnit !== 'pixel' || pageWidth !== imgSize.width) {
        scaleFactorX = imgSize.width / pageWidth;
        scaleFactorY = imgSize.height / pageHeight;
        pageWidth *= scaleFactorX;
        pageHeight *= scaleFactorY;
    }
    const styles = {};
    const styleElems = doc.querySelectorAll('alto > Styles > TextStyle');
    for (const styleNode of styleElems) {
        const styleId = styleNode.getAttribute('ID');
        if (styleId !== null) {
            styles[styleId] = altoStyleNodeToCSS(styleNode);
        }
    }
    const hasSpaces = doc.querySelector('SP') !== null;
    const paragraphs = [];
    let lineEndsHyphenated = false;
    for (const blockNode of doc.querySelectorAll('TextBlock')) {
        const block = { lines: [] };
        for (const lineNode of blockNode.querySelectorAll('TextLine')) {
            const line = {
                height: Number.parseInt((_d = lineNode.getAttribute('HEIGHT')) !== null && _d !== void 0 ? _d : '0', 10) *
                    scaleFactorY,
                text: '',
                width: Number.parseInt((_e = lineNode.getAttribute('WIDTH')) !== null && _e !== void 0 ? _e : '0', 10) *
                    scaleFactorX,
                spans: [],
                x: Number.parseInt((_f = lineNode.getAttribute('HPOS')) !== null && _f !== void 0 ? _f : '0', 10) *
                    scaleFactorX,
                y: Number.parseInt((_g = lineNode.getAttribute('VPOS')) !== null && _g !== void 0 ? _g : '0', 10) *
                    scaleFactorY,
            };
            const textNodes = lineNode.querySelectorAll('String, SP, HYP');
            for (const [textIdx, textNode] of textNodes.entries()) {
                const endOfLine = textIdx === textNodes.length - 1;
                const styleRefs = textNode.getAttribute('STYLEREFS');
                let style = null;
                if (styleRefs !== null) {
                    style = styleRefs
                        .split(' ')
                        .map((refId) => styles[refId])
                        .filter((s) => s !== undefined)
                        .join('');
                }
                const width = Number.parseInt((_h = textNode.getAttribute('WIDTH')) !== null && _h !== void 0 ? _h : '0', 10) *
                    scaleFactorX;
                let height = Number.parseInt((_j = textNode.getAttribute('HEIGHT')) !== null && _j !== void 0 ? _j : '0', 10) *
                    scaleFactorY;
                if (Number.isNaN(height)) {
                    height = line.height;
                }
                const x = Number.parseInt((_k = textNode.getAttribute('HPOS')) !== null && _k !== void 0 ? _k : '0', 10) *
                    scaleFactorX;
                let y = Number.parseInt((_l = textNode.getAttribute('VPOS')) !== null && _l !== void 0 ? _l : '0', 10) *
                    scaleFactorY;
                if (Number.isNaN(y)) {
                    y = line.y;
                }
                if (textNode.tagName === 'String' || textNode.tagName === 'HYP') {
                    const text = textNode.getAttribute('CONTENT');
                    // Update the width of a preceding extra space span to fill the area
                    // between the previous word and this one.
                    const previousExtraSpan = (_m = line.spans
                        .slice(-1)
                        .filter((s) => s.isExtra)) === null || _m === void 0 ? void 0 : _m[0];
                    if (previousExtraSpan) {
                        previousExtraSpan.width = x - previousExtraSpan.x;
                    }
                    line.spans.push({
                        isExtra: false,
                        x,
                        y,
                        width,
                        height,
                        text: text !== null && text !== void 0 ? text : undefined,
                        style: style !== null && style !== void 0 ? style : undefined,
                        spans: [],
                    });
                    // Add extra space span if ALTO does not encode spaces itself
                    if (!hasSpaces && !endOfLine) {
                        line.spans.push({
                            isExtra: true,
                            x: x + width,
                            y,
                            height,
                            text: ' ',
                            spans: [],
                            // NOTE: Does not have width initially, will be set when we encounter
                            //       the next proper word span
                        });
                    }
                    lineEndsHyphenated = textNode.tagName === 'HYP';
                }
                else if (textNode.tagName === 'SP') {
                    line.spans.push({
                        isExtra: false,
                        x,
                        y,
                        width,
                        height,
                        text: ' ',
                        spans: [],
                    });
                }
            }
            if (line.spans.length === 0) {
                continue;
            }
            if (!lineEndsHyphenated) {
                line.spans.slice(-1)[0].text += '\n';
            }
            lineEndsHyphenated = false;
            line.text = line.spans.map(({ text }) => text).join('');
            block.lines.push(line);
        }
        paragraphs.push(block);
    }
    return {
        id,
        height: pageHeight,
        paragraphs,
        width: pageWidth,
        markup: altoText,
        mimeType: 'application/xml+alto',
    };
}
exports.parseAlto = parseAlto;
/** Helper to calculate a rough fallback image size from the line coordinates
 *
 * @param {array} lines the parsed OCR lines
 * @returns {object} the page size estimated from the line coordinates
 */
function getFallbackImageSize(lines) {
    var _a, _b;
    return {
        width: (_a = (0, lodash_es_1.max)(lines.map(({ x, width }) => x + (width !== null && width !== void 0 ? width : 0)))) !== null && _a !== void 0 ? _a : 0,
        height: (_b = (0, lodash_es_1.max)(lines.map(({ y, height }) => y + height))) !== null && _b !== void 0 ? _b : 0,
    };
}
/**
 * Parse an OCR document (currently hOCR or ALTO)
 *
 * @param {string} ocrText  ALTO or hOCR markup
 * @param {object} referenceSize Reference size to scale coordinates to
 * @returns {OcrPage} the parsed OCR page
 */
function parseOcr(id, ocrText, referenceSize) {
    var _a, _b, _c;
    let parse;
    if (ocrText.indexOf('<alto') >= 0) {
        parse = parseAlto(id, ocrText, referenceSize);
    }
    else {
        parse = parseHocr(id, ocrText, referenceSize);
    }
    if (parse === null) {
        return null;
    }
    if (!parse.width || !parse.height) {
        let lines = parse.lines;
        if (!lines) {
            lines = (_a = parse.paragraphs) === null || _a === void 0 ? void 0 : _a.flatMap((p) => p.lines);
        }
        if (!lines) {
            lines = (_c = (_b = parse.blocks) === null || _b === void 0 ? void 0 : _b.flatMap((b) => b.paragraphs)) === null || _c === void 0 ? void 0 : _c.flatMap((p) => p.lines);
        }
        parse = Object.assign(Object.assign({}, parse), getFallbackImageSize(lines || []));
    }
    return parse;
}
exports.parseOcr = parseOcr;
/** Parse OCR data from IIIF annotations.
 *
 * Annotations should be pre-filtered so that they all refer to a single canvas/page.
 * Annotations should only contain a single text granularity, that is either line or word.
 *
 * @param {object} annos IIIF annotations with a plaintext body and line or word granularity
 * @param {Dimensions} imgSize Reference width and height of the rendered target image
 * @returns {OcrPage} parsed OCR boxes
 */
function parseIiifAnnotations(annos, imgSize) {
    throw 'Currently not supported';
    /*
    const fragmentPat = /.+#xywh=(\d+),(\d+),(\d+),(\d+)/g;
  
    // TODO: Handle Europeana-style v2 annotations, they are currently not
    //       being converted by @iiif/parser
    // TODO: Handle word-level annotations
    // See if we can tell from the annotations themselves if it targets a line
    const lineAnnos = annos.filter(
      (anno: any) =>
        anno.textGranularity === 'line' || // IIIF Text Granularity
        anno.dcType === 'Line' // Europeana
    );
    const targetAnnos = lineAnnos.length > 0 ? lineAnnos : annos;
    const boxes = targetAnnos.map((anno: any) => {
      let text;
      if (anno.resource) {
        text = anno.resource.chars ?? anno.resource.value;
      } else {
        text = anno.body.value;
      }
      let target = anno.target || anno.on;
      target = Array.isArray(target) ? target[0] : target;
      const [x, y, width, height] = target
        .matchAll(fragmentPat)
        .next()
        .value.slice(1, 5);
      return {
        height: parseInt(height, 10),
        text,
        width: parseInt(width, 10),
        x: parseInt(x, 10),
        y: parseInt(y, 10),
      };
    });
  
    return {
      ...(imgSize ?? getFallbackImageSize(boxes)),
      lines: boxes,
    };
    */
}
exports.parseIiifAnnotations = parseIiifAnnotations;
/** Check if an annotation has external resources that need to be loaded */
/*
function hasExternalResource(anno: Annotation): boolean {
  return (
    anno.getResource()?.getProperty('chars') === undefined &&
    anno.getBody()?.[0]?.getProperty('value') === undefined &&
    Object.keys(anno.getResource() ?? {}).length === 1 &&
    anno.getResource()?.id !== undefined
  );
}
*/
/** Checks if a given resource points to an ALTO OCR document */
const isAlto = (resource) => {
    var _a;
    return resource.format === 'application/xml+alto' ||
        ((_a = resource.profile) === null || _a === void 0 ? void 0 : _a.startsWith('http://www.loc.gov/standards/alto/'));
};
/** Checks if a given resource points to an hOCR document */
const isHocr = (resource) => {
    var _a, _b;
    return resource.format === 'text/vnd.hocr+html' ||
        resource.profile ===
            'https://github.com/kba/hocr-spec/blob/master/hocr-spec.md' ||
        ((_a = resource.profile) === null || _a === void 0 ? void 0 : _a.startsWith('http://kba.cloud/hocr-spec/')) ||
        ((_b = resource.profile) === null || _b === void 0 ? void 0 : _b.startsWith('http://kba.github.io/hocr-spec/'));
};
/** Wrapper around fetch() that returns the content as text */
function fetchOcrMarkup(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const resp = yield (0, cross_fetch_1.default)(url);
        if (resp.status === 404) {
            return undefined;
        }
        if (resp.status != 200) {
            throw new Error(`Could not fetch OCR markup from ${url}, got status code ${resp.status}`);
        }
        return resp.text();
    });
}
/** Fetch external annotation resource JSON */
function fetchAnnotationResource(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const resp = yield (0, download_js_1.fetchRespectfully)(url);
        return resp.json();
    });
}
exports.fetchAnnotationResource = fetchAnnotationResource;
function getTextSeeAlso(canvas) {
    const seeAlsos = iiif_js_1.vault.get(canvas.seeAlso);
    return seeAlsos
        .filter(iiif_js_1.isExternalWebResourceWithProfile)
        .find((r) => isAlto(r) || isHocr(r));
}
exports.getTextSeeAlso = getTextSeeAlso;
function fetchAndParseText(canvas, annotations) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // TODO: Annotations are a major PITA due to all the indirection and multiple
        //       levels of fetching of external resources that might be neccessary,
        //       save for later once text rendering is properly done.
        const seeAlso = getTextSeeAlso(canvas);
        if (seeAlso) {
            const stopMeasuring = metrics_js_1.default === null || metrics_js_1.default === void 0 ? void 0 : metrics_js_1.default.ocrFetchDuration.startTimer({
                ocr_host: new URL(seeAlso.id).host,
            });
            let markup;
            try {
                markup = yield fetchOcrMarkup(seeAlso.id);
                stopMeasuring === null || stopMeasuring === void 0 ? void 0 : stopMeasuring({
                    status: 'success',
                    limited: download_js_1.rateLimitRegistry.isLimited(seeAlso.id).toString(),
                });
                if (!markup) {
                    return undefined;
                }
            }
            catch (err) {
                stopMeasuring === null || stopMeasuring === void 0 ? void 0 : stopMeasuring({
                    status: 'error',
                    limited: download_js_1.rateLimitRegistry.isLimited(seeAlso.id).toString(),
                });
                throw err;
            }
            return ((_a = parseOcr(seeAlso.id, markup, {
                width: canvas.width,
                height: canvas.height,
            })) !== null && _a !== void 0 ? _a : undefined);
        }
    });
}
exports.fetchAndParseText = fetchAndParseText;
