import { Reader } from '../io.js';
import { PdfObject, PdfValue, PdfDictionary, PdfRef } from './common.js';
export declare class ObjectParser {
    start: number;
    current: number;
    private readonly buf;
    constructor(buf: Uint8Array);
    private getChar;
    private matchValue;
    private matchInteger;
    read(): PdfValue;
    matchWhiteSpace(c: string): boolean;
    readInteger(): number;
    readIndirectObject(): PdfRef;
    matchIndirectObject(resetAfter?: boolean): string | undefined;
    matchRealNumber(resetAfter?: boolean): string | undefined;
    readRealNumber(): number;
    skipWhiteSpace(): boolean;
    atEnd(): boolean;
    readName(): PdfValue;
    matchDelimiter(c: string): boolean;
    readHexString(): PdfValue;
    readLiteralString(): PdfValue;
    readDict(): PdfValue;
    readArray(): Array<PdfValue>;
}
export declare class PdfParser {
    private reader;
    private objectOffsets;
    private sortedOffsets;
    pdfSize: any;
    objGenerations: number[];
    infoNum: number;
    catalogNum: number;
    static parse(reader: Reader): Promise<PdfParser>;
    private constructor();
    catalog(): Promise<PdfDictionary>;
    info(): Promise<PdfDictionary>;
    _pagesFromPagesObj(pagesObj: PdfDictionary): AsyncGenerator<PdfObject>;
    pages(): AsyncGenerator<PdfObject>;
    annotations(pageDict: PdfDictionary): AsyncGenerator<PdfDictionary>;
    resolveRef(ref: PdfRef): Promise<PdfObject | undefined>;
    getObject(num: number, withStream?: boolean): Promise<PdfObject | undefined>;
}
//# sourceMappingURL=parser.d.ts.map