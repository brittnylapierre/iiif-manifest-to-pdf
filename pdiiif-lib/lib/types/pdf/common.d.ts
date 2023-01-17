export interface Metadata {
    Producer?: string;
    Creator?: string;
    CreationDate?: Date;
    Title?: string;
    Author?: string;
    Keywords?: string;
    ModDate?: Date;
}
export interface PdfObject {
    num: number;
    data?: PdfValue;
    stream?: Uint8Array | string;
}
export declare class PdfRef {
    refObj: number;
    constructor(num: number);
}
export type PdfPrimitive = string | number | boolean | Uint8Array | null | Date | PdfRef;
export interface PdfDictionary {
    [member: string]: PdfPrimitive | PdfArray | PdfDictionary;
}
export type PdfArray = Array<PdfPrimitive | PdfArray | PdfDictionary>;
export type PdfValue = PdfPrimitive | PdfDictionary | PdfArray | null;
export interface PdfAnnotation {
    Type: 'Annot';
    Subtype: string;
    Rect: [number, number, number, number];
    Contents: string | undefined;
    P?: PdfRef;
    NM?: string;
    M?: Date;
    F?: number;
    AP?: PdfDictionary;
    AS?: string;
    Border?: [number, number, number] | [number, number, number, number];
    C?: [] | [number] | [number, number, number] | [number, number, number, number];
}
export interface StructTreeEntry {
    type: 'Sect' | 'P' | 'Span';
    children: Array<StructTreeEntry>;
    pageObjNum: number;
    mcs: Array<number>;
}
export declare function makeRef(target: number | PdfObject): PdfRef;
/** Convert a JS UTF8 string to a UTF16 Big Endian string */
export declare function toUTF16BE(str: string, includeBom?: boolean): Uint8Array;
export declare function serialize(value: PdfValue, dictIndent?: number): string;
//# sourceMappingURL=common.d.ts.map