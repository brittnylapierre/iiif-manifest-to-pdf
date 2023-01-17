export type LocalHeaderParams = {
    creationDate?: Date;
    filename: string;
    data: Uint8Array;
    compressedData?: Uint8Array;
    extraDataLength: number;
};
export type CentralDirectoryFileSpec = {
    localHeaderOffset: number;
    deflated: boolean;
    creationDate: Date;
    crc32: number;
    dataLength: number;
    compressedDataLength: number;
    filename: string;
};
export type CentralFileDirectorySpec = {
    files: CentralDirectoryFileSpec[];
    trailingLength: number;
    offset: number;
};
export declare function buildLocalZipHeader({ creationDate, filename, data, compressedData, extraDataLength, }: LocalHeaderParams): Uint8Array;
export declare function buildCentralFileDirectory({ files, trailingLength, offset }: CentralFileDirectorySpec): Uint8Array;
//# sourceMappingURL=pkzip.d.ts.map