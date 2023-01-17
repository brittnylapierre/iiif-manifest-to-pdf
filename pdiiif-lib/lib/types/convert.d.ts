/// <reference types="node" />
import type { Writable } from 'stream';
import { Manifest, Annotation as IIIF3Annotation } from '@iiif/presentation-3';
import Presentation2 from '@iiif/presentation-2';
/** Progress information for rendering a progress bar or similar UI elements. */
export interface ProgressStatus {
    /** Human-readable message about what is currently going on */
    message?: string;
    /** Expected total number of pages in the PDF */
    totalPages: number;
    /** Number of pages that were submitted for writing */
    pagesWritten: number;
    /** Number of bytes that were submitted for writing to the output stream */
    bytesPushed: number;
    /** Number of bytes that were written to the output stream so far */
    bytesWritten: number;
    /** Predicted size of the final file in bytes */
    estimatedFileSize?: number;
    /** Write speed in bytes per second */
    writeSpeed: number;
    /** Estimated time in seconds until PDF has finished generating */
    remainingDuration: number;
}
/** Parameters for rendering a cover page, parsed from IIIF manifest. */
export interface CoverPageParams {
    title: string;
    manifestUrl: string;
    thumbnail?: {
        url: string;
        iiifImageService?: string;
    };
    provider?: {
        label: string;
        homepage?: string;
        logo?: string;
    };
    requiredStatement?: {
        label: string;
        value: string;
    };
    rights?: {
        text: string;
        url?: string;
        logo?: string;
    };
    metadata?: Array<[string, string | Array<string>]>;
    pdiiifVersion: string;
}
/** Options for converting a IIIF Manifest to a PDF. */
export interface ConvertOptions {
    /** Callback to provide annotations for a given canvas identifier.
     * Should return either a `sc:AnnotationList` (IIIF2) or an `AnnotationPage` (IIIF3).
     */
    fetchCanvasAnnotations?: (canvasId: string) => Promise<Array<IIIF3Annotation> | Array<Presentation2.Annotation>>;
    /** Pixels per inch to assume for the full resolution version of each canvas.
        If not set, the conversion will use an available IIIF Physical Dimensions
        service to calculate the page dimensions instead. */
    ppi?: number;
    /** Set of canvas ids to include in PDF, or a predicate to filter canvas identifiers
        by. By default, all canvases are included in the PDF. */
    filterCanvases?: readonly string[] | ((canvasId: string) => boolean);
    /** List of languages to use for metadata, page labels and table of contents, in
        descending order of preference. Will use the environment's locale settings by
        default. */
    languagePreference?: readonly string[];
    /** Restrict the image size to include in the PDF by downscaling by a fixed factor.
     * The value must be a number between 0.1 and 1.
     * Only works with Level 2 Image API services that allow arbitrary downscaling, the
     * conversion will not perform downscaling itself.
     * For Level 1 endpoints, the closest available lower width will be selected. */
    scaleFactor?: number;
    /** Number of maximum concurrent IIIF Image API requests to be performed, defaults to 1 */
    concurrency?: number;
    /** Callback that gets called whenever a page has finished, useful to render a
        progress bar. */
    onProgress?: (status: ProgressStatus) => void;
    /** Controller that allows aborting the PDF generation. All pending
        downloads will be terminated. The caller is responsible for
        removing underlying partial files and/or other user signaling. */
    abortController?: AbortController;
    /** Set PDF metadata, by default `Title` will be the manifest's label. */
    metadata?: {
        CreationDate?: Date;
        Title?: string;
        Author?: string;
        Keywords?: string;
    };
    /** Endpoint to contact for retrieving PDF data with one or more cover pages
        to insert before the canvas pages */
    coverPageEndpoint?: string;
    /** Callback to call for retrieving PDF data with one or more cover pages
        to insert before the canvas pages */
    coverPageCallback?: (params: CoverPageParams) => Promise<Uint8Array>;
    /** Generate the PDF in a way that the resulting file is also a valid
     *  ZIP file that contains the manifest, all of the images and, if present,
     *  the OCR files referenced in the manifest. */
    polyglotZipPdf?: boolean;
    /** Base directory in the polyglot ZIP archive. If not set, all resource
     * directories will be to-level in the archive. */
    polyglotZipBaseDir?: string;
}
/** Parameters for size estimation */
export interface EstimationParams {
    /** The manifest to determine the PDF size for */
    manifest: string | Manifest | Presentation2.Manifest;
    /** Restrict the image size to include in the PDF by downscaling by a fixed factor.
     * The value must be a number between 0.1 and 1.
     * Only works with Level 2 Image API services that allow arbitrary downscaling, the
     * conversion will not perform downscaling itself.
     * For Level 1 endpoints, the closest available lower width will be selected. */
    scaleFactor?: number;
    /** Set of canvas ids to include in PDF, or a predicate to filter canvas identifiers
        by. By default, all canvases are included in the PDF. */
    filterCanvases?: readonly string[] | ((canvasId: string) => boolean);
    /** Number of canvses to sample for estimation, defaults to 8 */
    numSamples?: number;
    /** Number of maximum concurrent IIIF Image API requests to be performed, defaults to 1 */
    concurrency?: number;
}
/** Estimate the final size of the PDF for a given manifest.
 *
 * This will randomly sample a few representative canvases from the manifest,
 * check their size in bytes and extrapolate from that to all canvases.
 */
export declare function estimatePdfSize({ manifest: inputManifest, concurrency, scaleFactor, filterCanvases, numSamples, }: EstimationParams): Promise<number>;
export declare function convertManifest(inputManifest: string | Manifest | Presentation2.Manifest, outputStream: Writable | WritableStream, options: ConvertOptions): Promise<void>;
export declare function convertManifest(inputManifest: string | Manifest | Presentation2.Manifest, outputStream: undefined, options: ConvertOptions): Promise<Blob>;
//# sourceMappingURL=convert.d.ts.map