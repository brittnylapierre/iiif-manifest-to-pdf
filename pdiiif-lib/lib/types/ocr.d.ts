import { Annotation, AnnotationNormalized, CanvasNormalized } from '@iiif/presentation-3';
import { ExternalWebResourceWithProfile } from './iiif.js';
export interface OcrSpan {
    x: number;
    y: number;
    height: number;
    width?: number;
    text?: string;
    style?: string;
    isExtra?: boolean;
    spans: OcrSpan[];
}
export interface OcrPage {
    id: string;
    width: number;
    height: number;
    blocks?: Array<{
        paragraphs: Array<{
            lines: Array<OcrSpan>;
        }>;
    }>;
    paragraphs?: Array<{
        lines: Array<OcrSpan>;
    }>;
    lines?: Array<OcrSpan>;
    markup?: string;
    mimeType: string;
}
export interface Dimensions {
    width: number;
    height: number;
}
/** Parse an hOCR document
 *
 * @param {string} hocrText the raw hOCR markup
 * @param {object} referenceSize the size of the corresponding page image
 * @returns {object} the parsed OCR page
 */
export declare function parseHocr(id: string, hocrText: string, referenceSize: Dimensions): OcrPage | null;
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
export declare function parseAlto(id: string, altoText: string, imgSize: Dimensions): OcrPage;
/**
 * Parse an OCR document (currently hOCR or ALTO)
 *
 * @param {string} ocrText  ALTO or hOCR markup
 * @param {object} referenceSize Reference size to scale coordinates to
 * @returns {OcrPage} the parsed OCR page
 */
export declare function parseOcr(id: string, ocrText: string, referenceSize: Dimensions): OcrPage | null;
/** Parse OCR data from IIIF annotations.
 *
 * Annotations should be pre-filtered so that they all refer to a single canvas/page.
 * Annotations should only contain a single text granularity, that is either line or word.
 *
 * @param {object} annos IIIF annotations with a plaintext body and line or word granularity
 * @param {Dimensions} imgSize Reference width and height of the rendered target image
 * @returns {OcrPage} parsed OCR boxes
 */
export declare function parseIiifAnnotations(annos: Array<Annotation>, imgSize: Dimensions): OcrPage;
/** Fetch external annotation resource JSON */
export declare function fetchAnnotationResource(url: string): Promise<any>;
export declare function getTextSeeAlso(canvas: CanvasNormalized): ExternalWebResourceWithProfile | undefined;
export declare function fetchAndParseText(canvas: CanvasNormalized, annotations?: AnnotationNormalized[]): Promise<OcrPage | undefined>;
//# sourceMappingURL=ocr.d.ts.map