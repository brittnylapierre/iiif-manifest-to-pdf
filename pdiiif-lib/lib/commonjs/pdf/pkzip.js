"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCentralFileDirectory = exports.buildLocalZipHeader = void 0;
const util_js_1 = require("../util.js");
const util_js_2 = require("./util.js");
function buildLocalZipHeader({ creationDate = new Date(), filename, data, compressedData, extraDataLength, }) {
    const creationTimeZip = (creationDate.getHours() << 11) |
        (creationDate.getDay() << 5) |
        Math.round(creationDate.getSeconds() / 2);
    const creationDateZip = ((creationDate.getFullYear() - 1980) << 9) |
        ((creationDate.getMonth() + 1) << 5) |
        creationDate.getDate();
    const dataCrc = (0, util_js_1.crc32)(data);
    const filenameEncoded = util_js_2.textEncoder.encode(filename);
    // 2 bytes for zlib header
    const compressedLength = compressedData ? (compressedData.length - 2) : data.length;
    return new Uint8Array([
        // PKZIP magic number
        0x50,
        0x4b,
        // Local File Header magic
        0x03,
        0x04,
        // Required PKZip version
        0x14,
        0x00,
        // General purpose bit flag, 2 bytes
        0b00000000,
        0b00000000,
        // Compression method, 2 bytes little endian
        compressedData ? 0x08 : 0x00,
        0x00,
        // Creation time, 2 bytes little endian
        creationTimeZip & 0xff,
        creationTimeZip >> 8,
        // Creation date, 2 bytes little endian
        creationDateZip & 0xff,
        creationDateZip >> 8,
        // CRC32 of data, 4 bytes little endian
        dataCrc & 0xff,
        (dataCrc >> 8) & 0xff,
        (dataCrc >> 16) & 0xff,
        (dataCrc >> 24) & 0xff,
        // Compressed size, 4 bytes little endian
        compressedLength & 0xff,
        (compressedLength >> 8) & 0xff,
        (compressedLength >> 16) & 0xff,
        (compressedLength >> 24) & 0xff,
        // Uncompressed size, 4 bytes little endian
        data.length & 0xff,
        (data.length >> 8) & 0xff,
        (data.length >> 16) & 0xff,
        (data.length >> 24) & 0xff,
        // Filename length, 2 bytes little endian
        filenameEncoded.length & 0xff,
        filenameEncoded.length >> 8,
        // Extra field length, 2 bytes little endian
        (extraDataLength + 4) & 0xff,
        (extraDataLength + 4) >> 8,
        // Encoded file name
        ...filenameEncoded,
        // Beginning of extra field: identifier, 2 bytes
        0xff,
        0xff,
        // Beginning of extra field: length, 2 bytes little endian
        extraDataLength & 0xff,
        extraDataLength >> 8,
    ]);
}
exports.buildLocalZipHeader = buildLocalZipHeader;
function buildCentralFileDirectory({ files, trailingLength, offset }) {
    const chunks = files.map(buildCentralDirectoryFileHeader);
    const cdSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    chunks.push(new Uint8Array([
        // PKZIP magic number
        0x50,
        0x4b,
        // End of central directory magic
        0x05,
        0x06,
        // Disk number
        0x00,
        0x00,
        // Disk with central directory
        0x00,
        0x00,
        // Disk entries
        files.length & 0xff,
        files.length >> 8,
        // Total entries
        files.length & 0xff,
        files.length >> 8,
        // Central directory size,
        cdSize & 0xff,
        (cdSize >> 8) & 0xff,
        (cdSize >> 16) & 0xff,
        (cdSize >> 24) & 0xff,
        // Offset of central directory in file
        offset & 0xff,
        (offset >> 8) & 0xff,
        (offset >> 16) & 0xff,
        (offset >> 24) & 0xff,
        // Length of trailing comment
        trailingLength & 0xff,
        trailingLength >> 8,
    ]));
    return new Uint8Array(chunks.reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
    }, []));
}
exports.buildCentralFileDirectory = buildCentralFileDirectory;
function buildCentralDirectoryFileHeader(spec) {
    const creationTimeZip = (spec.creationDate.getHours() << 11) |
        (spec.creationDate.getMinutes() << 5) |
        Math.round(spec.creationDate.getSeconds() / 2);
    const creationDateZip = ((spec.creationDate.getFullYear() - 1980) << 9) |
        ((spec.creationDate.getMonth() + 1) << 5) |
        spec.creationDate.getDate();
    const filenameEncoded = util_js_2.textEncoder.encode(spec.filename);
    return new Uint8Array([
        // PKZIP magic number
        0x50,
        0x4b,
        // Central directory file header magic
        0x01,
        0x02,
        // Version
        0x17,
        0x03,
        //  Version needed
        0x14,
        0x00,
        // Flags, none set
        0x00,
        0x00,
        // Compression method, 2 bytes little endian
        spec.deflated ? 0x08 : 0x00,
        0x00,
        // Creation time, 2 bytes little endian
        creationTimeZip & 0xff,
        creationTimeZip >> 8,
        // Creation date, 2 bytes little endian
        creationDateZip & 0xff,
        creationDateZip >> 8,
        // CRC32 of data, 4 bytes little endian
        spec.crc32 & 0xff,
        (spec.crc32 >> 8) & 0xff,
        (spec.crc32 >> 16) & 0xff,
        (spec.crc32 >> 24) & 0xff,
        // Compressed size, 4 bytes little endian
        spec.compressedDataLength & 0xff,
        (spec.compressedDataLength >> 8) & 0xff,
        (spec.compressedDataLength >> 16) & 0xff,
        (spec.compressedDataLength >> 24) & 0xff,
        // Uncompressed size, 4 bytes little endian
        spec.dataLength & 0xff,
        (spec.dataLength >> 8) & 0xff,
        (spec.dataLength >> 16) & 0xff,
        (spec.dataLength >> 24) & 0xff,
        // Filename length, 2 bytes little endian
        filenameEncoded.length & 0xff,
        filenameEncoded.length >> 8,
        // Extra field length, 2 bytes little endian
        0x00,
        0x00,
        // File comment length, 2 bytes little endian
        0x00,
        0x00,
        // Disk # start, 2 bytes little endian
        0x00,
        0x00,
        // Internal Attribute, 2 bytes little endian
        0x00,
        0x00,
        // External Attribute, 4 bytes little endian
        0x00,
        0x00,
        0xa4,
        0x81,
        // Offset of local header, 4 bytes little endian
        spec.localHeaderOffset & 0xff,
        (spec.localHeaderOffset >> 8) & 0xff,
        (spec.localHeaderOffset >> 16) & 0xff,
        (spec.localHeaderOffset >> 24) & 0xff,
        ...filenameEncoded,
    ]);
}
