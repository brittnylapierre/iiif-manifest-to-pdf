import { Mutex } from 'async-mutex';
import { CanvasNormalized, ImageService, InternationalString, ManifestNormalized, RangeNormalized, Reference, Service } from '@iiif/presentation-3';
import { OcrPage } from './ocr.js';
import { Annotation } from './iiif.js';
/** Maps rate-limited hosts to a mutex that limits the concurrent fetching. */
declare class RateLimitingRegistry {
    private hostMutexes;
    private callbacks;
    getMutex(host: string): Mutex | undefined;
    limitHost(host: string): Mutex;
    unlimitHost(host: string): void;
    subscribe(cb: (host: string, limited: boolean) => void): number;
    unsubscribe(ticket: number): void;
    isLimited(url: string): boolean;
}
export declare const rateLimitRegistry: RateLimitingRegistry;
/** A 'respectful' wrapper around `fetch` that tries to respect rate-limiting headers.
 *
 * Will also retry with exponential backoff in case of server errors.
 */
export declare function fetchRespectfully(url: string, init?: RequestInit, maxRetries?: number): Promise<Response>;
/** Container for image size along with its corresponding IIIF Image API string. */
export type SizeInfo = {
    iiifSize: string;
    width: number;
    height: number;
};
/** Calculate the image size to fetch, based on user constraints and available sizes
 *  in the Image API info.json response.
 */
export declare function getImageSize(imgService: ImageService, scaleFactor?: number): SizeInfo;
/** Use a IIIF Physical Dimensions service to obtain the PPI for a canvas. */
export declare function getPointsPerInch(services: Service[]): number | null;
/** All the data relevant for the canvas: images and text
 *
 * TODO: Should annotations also be a part of this?
 */
export type CanvasData = {
    canvas: Reference<'Canvas'>;
    text?: OcrPage;
    images: CanvasImage[];
    annotations: Annotation[];
    ppi?: number;
};
/** An image on a canvas, optionally with its image data */
export type CanvasImage = {
    data?: ArrayBuffer;
    location: {
        x: number;
        y: number;
    };
    dimensions: {
        width: number;
        height: number;
    };
    ppi?: number;
    numBytes: number;
    isOptional: boolean;
    visibleByDefault: boolean;
    label?: InternationalString;
};
/** Options for fetching image */
export type FetchImageOptions = {
    scaleFactor?: number;
    ppiOverride?: number;
    abortSignal?: AbortSignal;
    sizeOnly?: boolean;
};
export type StartCanvasInfo = string | {
    id: string;
    ppi: number;
    dimensions: {
        width: number;
        height: number;
    };
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};
export declare function fetchStartCanvasInfo(resource: ManifestNormalized | RangeNormalized): Promise<StartCanvasInfo | undefined>;
export declare function fetchCanvasData(canvas: CanvasNormalized, { scaleFactor, ppiOverride, abortSignal, sizeOnly }: FetchImageOptions): Promise<CanvasData | undefined>;
export {};
//# sourceMappingURL=download.d.ts.map