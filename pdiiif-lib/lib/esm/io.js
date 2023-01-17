import log from './log.js';
export class WebReader {
    constructor(file) {
        this.file = file;
    }
    async read(dst, offset, position, length) {
        const blob = this.file.slice(position, position + length);
        const buf = await blob.arrayBuffer();
        dst.set(new Uint8Array(buf), offset);
        return buf.byteLength;
    }
    size() {
        return new Promise((resolve) => resolve(this.file.size));
    }
}
/** Wraps a writer and counts the bytes written to it. */
export class CountingWriter {
    constructor(writer) {
        this.bytesWritten = 0;
        this._writer = writer;
    }
    write(buffer) {
        this.bytesWritten += buffer.length;
        return this._writer.write(buffer);
    }
    close() {
        return this._writer.close();
    }
    waitForDrain() {
        return this._writer.waitForDrain();
    }
}
/** A Writer that can be used with e.g. a file system stream in the browser. */
export class WebWriter {
    constructor(stream) {
        this._writer = stream.getWriter();
    }
    write(buffer) {
        return this._writer.write(buffer);
    }
    waitForDrain() {
        return this._writer.ready;
    }
    close() {
        return this._writer.close();
    }
}
// TODO: A good reference seems to be the mega.nz implementation, which has always worked great for me on desktops at least:
// https://github.com/meganz/webclient/blob/f19289127b68ceaf19a5e884f2f48f15078304da/js/transfers/meths/memory.js
export class BlobWriter {
    constructor() {
        this._parts = [];
    }
    write(buffer) {
        if (this._blob) {
            return Promise.reject('Cannot write to closed BlobWriter.');
        }
        this._parts.push(buffer);
        return Promise.resolve();
    }
    waitForDrain() {
        if (this._blob) {
            return Promise.reject('Cannot wait on a closed BlobWriter.');
        }
        return Promise.resolve();
    }
    close() {
        if (this._blob) {
            return Promise.reject('BlobWriter is already closed');
        }
        this._blob = new Blob(this._parts);
        this._parts = [];
        return Promise.resolve();
    }
    get blob() {
        if (!this._blob) {
            throw 'BlobWriter must be closed first!';
        }
        return this._blob;
    }
}
export class NodeReader {
    constructor(handle) {
        this.fileHandle = handle;
    }
    async read(dst, offset, position, length) {
        const { bytesRead } = await this.fileHandle.read(dst, offset, length, position);
        return bytesRead;
    }
    async size() {
        const stat = await this.fileHandle.stat();
        return stat.size;
    }
}
/** Adapter for Node.js writable streams. */
export class NodeWriter {
    constructor(writable) {
        this._drainWaiters = [];
        this._writable = writable;
        this._writable.on('drain', () => {
            log.debug('Drained writer.');
            for (const waiter of this._drainWaiters) {
                waiter();
            }
            this._drainWaiters = [];
        });
        this._writable.on('close', () => {
            for (const waiter of this._drainWaiters) {
                waiter();
            }
            this._drainWaiters = [];
        });
    }
    async write(buffer) {
        let waitForDrain = false;
        const out = new Promise((resolve, reject) => {
            if (!this._writable.writable) {
                reject('Cannot write to closed NodeWriter.');
            }
            waitForDrain = !this._writable.write(buffer, (err) => err ? reject(err) : resolve());
        });
        if (waitForDrain) {
            log.debug('Waiting for writer to drain');
            return await this.waitForDrain();
        }
        else {
            return await out;
        }
    }
    waitForDrain() {
        return new Promise((resolve) => this._drainWaiters.push(resolve));
    }
    close() {
        return new Promise((resolve) => this._writable.end(() => resolve()));
    }
}
export class ArrayReader {
    constructor(buf) {
        this._buf = buf;
    }
    read(dst, offset, position, length) {
        const sub = this._buf.subarray(position, position + length);
        dst.set(sub, offset);
        return Promise.resolve(sub.length);
    }
    size() {
        return Promise.resolve(this._buf.length);
    }
}
//# sourceMappingURL=io.js.map