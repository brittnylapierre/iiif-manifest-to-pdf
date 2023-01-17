import { InternationalString, ManifestNormalized, ExternalWebResource, ContentResource, ImageProfile, ImageService, CanvasNormalized, Reference, AnnotationNormalized } from '@iiif/presentation-3';
import { SupportedTarget, Paintables, ChoiceDescription } from '@iiif/vault-helpers';
import { Vault } from '@iiif/vault';
export declare const vault: Vault;
export declare function getI18nValue(val: string | InternationalString, languagePreference: readonly string[]): string[];
export declare function getI18nValue(val: string | InternationalString, languagePreference: readonly string[], separator: string): string;
export declare const getPaintables: (paintingAnnotationsOrCanvas: string | CanvasNormalized | AnnotationNormalized[], enabledChoices?: string[]) => Paintables, getAllPaintingAnnotations: (canvasOrId: string | CanvasNormalized | undefined | null) => AnnotationNormalized[], extractChoices: (paintingAnnotationsOrCanvas: string | CanvasNormalized | AnnotationNormalized[]) => ChoiceDescription | null;
export declare function getThumbnail(manifest: ManifestNormalized, maxDimension: number): Promise<string | undefined>;
export interface ExternalWebResourceWithProfile extends ExternalWebResource {
    profile: string;
}
export declare function isExternalWebResourceWithProfile(res: ContentResource): res is ExternalWebResourceWithProfile;
export interface PhysicalDimensionService {
    '@context': 'http://iiif.io/api/annex/services/physdim/1/context.json';
    profile: 'http://iiif.io/api/annex/services/physdim';
    '@id': string;
    physicalScale: number;
    physicalUnits: 'in' | 'cm' | 'mm';
}
export declare function isPhysicalDimensionService(service: any): service is PhysicalDimensionService;
export declare function supportsScaling(profile: ImageProfile): boolean;
export declare function fetchFullImageService(serviceRef: ImageService): Promise<ImageService>;
type CanvasInfoImage = {
    img: Reference<'ContentResource'>;
    choiceState?: {
        enabled?: true;
    };
    label?: InternationalString;
};
export type CanvasInfo = {
    canvas: Reference<'Canvas'>;
    ocr?: {
        id: string;
    };
    images: CanvasInfoImage[];
    numAnnotations: number;
};
export declare function getCanvasAnnotations(canvas: CanvasNormalized): Annotation[];
export declare function getCanvasInfo(canvas: CanvasNormalized): CanvasInfo;
export interface Annotation {
    id: string;
    target: SupportedTarget;
    markup: string;
    lastModified?: Date;
    author?: string;
}
export declare function parseAnnotation(anno: AnnotationNormalized, langPrefs: readonly string[]): Annotation | undefined;
export interface CompatibilityReport {
    compatibility: 'compatible' | 'incompatible' | 'degraded';
    incompatibleElements: {
        [canvasId: string]: Set<'no-jpeg' | 'no-image' | 'annotations' | 'unsupported-painting'>;
    };
}
export declare function checkCompatibility(manifest: ManifestNormalized): CompatibilityReport | undefined;
export {};
//# sourceMappingURL=iiif.d.ts.map