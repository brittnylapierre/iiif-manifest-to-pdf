import { Manifest } from '@iiif/presentation-3';
import { Manifest as ManifestV2 } from '@iiif/presentation-2';
import { Metadata, PdfObject, PdfRef, PdfValue, StructTreeEntry } from './common.js';
import { TocItem } from './util.js';
import { Writer } from '../io.js';
import { OcrPage, OcrSpan } from '../ocr.js';
import { CanvasImage, StartCanvasInfo } from '../download.js';
import { Annotation, CanvasInfo } from '../iiif.js';
export type GeneratorParams = {
    writer: Writer;
    metadata: Metadata;
    canvasInfos: CanvasInfo[];
    langPref: readonly string[];
    pageLabels?: string[];
    outline: TocItem[];
    hasText?: boolean;
    readingDirection?: 'right-to-left' | 'left-to-right';
    initialCanvas?: StartCanvasInfo;
    manifestJson?: Manifest | ManifestV2;
    zipPolyglot?: boolean;
    zipBaseDir?: string;
};
export default class PDFGenerator {
    _offset: number;
    _objects: Array<PdfObject>;
    _nextObjNo: number;
    _objRefs: Record<string, PdfRef>;
    _offsets: number[];
    _writer: Writer | undefined;
    _pagesStarted: boolean;
    _canvasInfos: Array<CanvasInfo>;
    _firstPageObjectNum: number | undefined;
    _pageLabels?: string[];
    _numCoverPages: number;
    _outline: TocItem[];
    _hasText: boolean;
    _strucTree: StructTreeEntry[];
    _pageMCIds: Map<number, Array<number>>;
    _nextStructParentId: number;
    _pageParentIds: Map<number, number>;
    _langPref: readonly string[];
    _initialCanvas?: StartCanvasInfo;
    private _polyglot;
    private _manifestJson?;
    private _zipCatalog?;
    private _zipBaseDir?;
    private _readingDirection;
    constructor({ writer, metadata, canvasInfos, langPref, pageLabels, outline, readingDirection, hasText, initialCanvas, manifestJson, zipPolyglot, zipBaseDir, }: GeneratorParams);
    setup(): Promise<void>;
    _setupHiddenTextFont(): Promise<void>;
    _registerEmbeddedFilesInCatalog(): void;
    _addOutline(itm: TocItem, parent: PdfObject, prev?: PdfObject): [PdfObject, number];
    _addObject(val: PdfValue, refName?: string, stream?: Uint8Array | string): PdfObject;
    /** Clone an object from a foreign PDF into the current PDF, adjusting
     *  the encountered indirect object references.
     */
    private _transplantObject;
    insertCoverPages(pdfData: ArrayBuffer): Promise<void>;
    private _embedResource;
    private _embedManifest;
    finalizePdfHeader(): Promise<void>;
    renderPage(canvasId: string, { width: canvasWidth, height: canvasHeight, }: {
        width: number;
        height: number;
    }, images: CanvasImage[], annotations: Annotation[], ocrText?: OcrPage, ppi?: number): Promise<void>;
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
    _renderOcrText(ocr: OcrPage, unitScale: number): string;
    renderOcrLine(line: OcrSpan, lineIdx: number, unitScale: number, pageHeight: number, pageObjNum: number): string[];
    get bytesWritten(): number;
    /** Number of objects needed to render all canvases */
    get totalCanvasObjects(): number;
    getObjectsPerCanvas(canvasIdx: number): number;
    getCanvasObjectNumber(canvasIdx: number): number;
    _flush(): Promise<void>;
    _getSerializedSize({ num, data, stream }: PdfObject, untilStreamStart?: boolean): number;
    _serializeObject(obj: PdfObject): Promise<void>;
    _write(data: Uint8Array | string): Promise<void>;
    _writeStructureTree(): Promise<void>;
    end(): Promise<void>;
    private _insertZipHeaderDummyObject;
}
//# sourceMappingURL=generator.d.ts.map