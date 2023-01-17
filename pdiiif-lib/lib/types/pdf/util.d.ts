/// <reference types="node" />
import util from 'util';
import { StartCanvasInfo } from '../download.js';
import { PdfDictionary } from './common.js';
export declare let textEncoder: TextEncoder | util.TextEncoder;
export declare let textDecoder: TextDecoder | util.TextDecoder;
export declare const IS_BIG_ENDIAN: boolean;
export interface TocItem {
    label: string;
    children?: Array<TocItem>;
    startCanvas: StartCanvasInfo;
}
export declare function getNumChildren(itm: TocItem): number;
export declare function randomData(length: number): Uint8Array;
export declare function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: Array<T>) => boolean): number;
export declare function tryDeflateStream(pdfStream: Uint8Array | string): Promise<{
    stream: Uint8Array | string;
    dict: PdfDictionary;
}>;
//# sourceMappingURL=util.d.ts.map