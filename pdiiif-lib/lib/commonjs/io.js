"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayReader = exports.NodeWriter = exports.NodeReader = exports.BlobWriter = exports.WebWriter = exports.CountingWriter = exports.WebReader = void 0;
const tslib_1 = require("tslib");
const log_js_1 = tslib_1.__importDefault(require("./log.js"));
class WebReader {
    constructor(file) {
        this.file = file;
    }
    read(dst, offset, position, length) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blob = this.file.slice(position, position + length);
            const buf = yield blob.arrayBuffer();
            dst.set(new Uint8Array(buf), offset);
            return buf.byteLength;
        });
    }
    size() {
        return new Promise((resolve) => resolve(this.file.size));
    }
}
exports.WebReader = WebReader;
/** Wraps a writer and counts the bytes written to it. */
class CountingWriter {
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
exports.CountingWriter = CountingWriter;
/** A Writer that can be used with e.g. a file system stream in the browser. */
class WebWriter {
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
exports.WebWriter = WebWriter;
// TODO: A good reference seems to be the mega.nz implementation, which has always worked great for me on desktops at least:
// https://github.com/meganz/webclient/blob/f19289127b68ceaf19a5e884f2f48f15078304da/js/transfers/meths/memory.js
class BlobWriter {
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
exports.BlobWriter = BlobWriter;
class NodeReader {
    constructor(handle) {
        this.fileHandle = handle;
    }
    read(dst, offset, position, length) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { bytesRead } = yield this.fileHandle.read(dst, offset, length, position);
            return bytesRead;
        });
    }
    size() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const stat = yield this.fileHandle.stat();
            return stat.size;
        });
    }
}
exports.NodeReader = NodeReader;
/** Adapter for Node.js writable streams. */
class NodeWriter {
    constructor(writable) {
        this._drainWaiters = [];
        this._writable = writable;
        this._writable.on('drain', () => {
            log_js_1.default.debug('Drained writer.');
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
    write(buffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let waitForDrain = false;
            const out = new Promise((resolve, reject) => {
                if (!this._writable.writable) {
                    reject('Cannot write to closed NodeWriter.');
                }
                waitForDrain = !this._writable.write(buffer, (err) => err ? reject(err) : resolve());
            });
            if (waitForDrain) {
                log_js_1.default.debug('Waiting for writer to drain');
                return yield this.waitForDrain();
            }
            else {
                return yield out;
            }
        });
    }
    waitForDrain() {
        return new Promise((resolve) => this._drainWaiters.push(resolve));
    }
    close() {
        return new Promise((resolve) => this._writable.end(() => resolve()));
    }
}
exports.NodeWriter = NodeWriter;
class ArrayReader {
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
exports.ArrayReader = ArrayReader;
