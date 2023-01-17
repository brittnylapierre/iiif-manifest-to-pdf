import { sum } from 'lodash-es';
import util from 'util';
import zlib from 'zlib';
import { zlibSync } from 'fflate';
import log from '../log.js';
// Browsers have native encoders/decoders in the global namespace, use these
export let textEncoder;
export let textDecoder;
if (typeof window !== 'undefined' && window.TextEncoder && window.TextDecoder) {
    textEncoder = new window.TextEncoder();
    textDecoder = new window.TextDecoder();
}
else {
    textEncoder = new util.TextEncoder();
    textDecoder = new util.TextDecoder();
}
export const IS_BIG_ENDIAN = (() => {
    const array = new Uint8Array(4);
    const view = new Uint32Array(array.buffer);
    return !((view[0] = 1) & array[0]);
})();
export function getNumChildren(itm) {
    const children = itm.children ?? [];
    return children.length + sum(children.map(getNumChildren));
}
export function randomData(length) {
    if (length > 2 ** 16) {
        length = 2 ** 16;
    }
    const buf = new Uint8Array(length);
    if (typeof window !== 'undefined' && window?.crypto) {
        crypto.getRandomValues(buf);
    }
    else if (typeof global?.crypto !== 'undefined') {
        return new Uint8Array(global.crypto(length));
    }
    else {
        const u32View = new Uint32Array(buf.buffer);
        for (let i = 0; i < u32View.length; i++) {
            u32View[i] = Math.floor(Math.random() * 2 ** 32);
        }
    }
    return buf;
}
export function findLastIndex(array, predicate) {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}
export async function tryDeflateStream(pdfStream) {
    const data = pdfStream instanceof Uint8Array ? pdfStream : textEncoder.encode(pdfStream);
    let compressed;
    if (typeof window !== 'undefined') {
        if (typeof window.CompressionStream === 'undefined') {
            // Browser doesn't support CompressionStream API, try to use the JS implementation
            try {
                let bytes;
                if (pdfStream instanceof Uint8Array) {
                    bytes = pdfStream;
                }
                else {
                    bytes = textEncoder.encode(pdfStream);
                }
                compressed = zlibSync(bytes);
                return Promise.resolve({
                    stream: compressed,
                    dict: { Length: compressed.length, Filter: '/FlateDecode' }
                });
            }
            catch (err) {
                log.warn(`Failed to use JS deflate implementation, data will be written uncompressed: ${err}`);
                return Promise.resolve({
                    stream: pdfStream,
                    dict: { Length: pdfStream.length },
                });
            }
        }
        const compStream = new window.CompressionStream('deflate');
        const c = new Blob([data]).stream().pipeThrough(compStream);
        compressed = new Uint8Array(await new Response(c).arrayBuffer());
    }
    else {
        compressed = await new Promise((resolve, reject) => zlib.deflate(data, (err, buf) => (err ? reject(err) : resolve(buf))));
    }
    return {
        dict: {
            Length: compressed.length,
            Filter: '/FlateDecode',
        },
        stream: compressed,
    };
}
//# sourceMappingURL=util.js.map