/// <reference types="node" />
/// <reference types="node" />
/** Types for writing to an output stream, with support for Node and Browsers. */
import type { Writable as NodeWritable } from 'stream';
import type nodeFs from 'fs';
export interface Reader {
    read(dst: Uint8Array, offset: number, position: number, length: number): Promise<number>;
    size(): Promise<number>;
}
export interface Writer {
    /** Write a chunk to the writer */
    write(buffer: Uint8Array | string): Promise<void>;
    /** Close the writer */
    close(): Promise<void>;
    /** Wait for the next drainage/flush event */
    waitForDrain(): Promise<void>;
}
export declare class WebReader implements Reader {
    private file;
    constructor(file: File);
    read(dst: Uint8Array, offset: number, position: number, length: number): Promise<number>;
    size(): Promise<number>;
}
/** Wraps a writer and counts the bytes written to it. */
export declare class CountingWriter implements Writer {
    private _writer;
    bytesWritten: number;
    constructor(writer: Writer);
    write(buffer: string | Uint8Array): Promise<void>;
    close(): Promise<void>;
    waitForDrain(): Promise<void>;
}
/** A Writer that can be used with e.g. a file system stream in the browser. */
export declare class WebWriter implements Writer {
    private _writer;
    constructor(stream: WritableStream);
    write(buffer: string | Uint8Array): Promise<void>;
    waitForDrain(): Promise<void>;
    close(): Promise<void>;
}
export declare class BlobWriter implements Writer {
    private _parts;
    private _blob?;
    constructor();
    write(buffer: string | Uint8Array): Promise<void>;
    waitForDrain(): Promise<void>;
    close(): Promise<void>;
    get blob(): Blob;
}
export declare class NodeReader implements Reader {
    private fileHandle;
    constructor(handle: nodeFs.promises.FileHandle);
    read(dst: Uint8Array, offset: number, position: number, length: number): Promise<number>;
    size(): Promise<number>;
}
/** Adapter for Node.js writable streams. */
export declare class NodeWriter implements Writer {
    _writable: NodeWritable;
    _drainWaiters: Array<() => void>;
    constructor(writable: NodeWritable);
    write(buffer: string | Uint8Array): Promise<void>;
    waitForDrain(): Promise<void>;
    close(): Promise<void>;
}
export declare class ArrayReader implements Reader {
    _buf: Uint8Array;
    constructor(buf: Uint8Array);
    read(dst: Uint8Array, offset: number, position: number, length: number): Promise<number>;
    size(): Promise<number>;
}
//# sourceMappingURL=io.d.ts.map