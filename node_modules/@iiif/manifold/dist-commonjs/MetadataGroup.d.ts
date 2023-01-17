import { IMetadataItem } from "./IMetadataItem";
import { LabelValuePair, ManifestResource } from "manifesto.js";
export declare class MetadataGroup {
    resource: ManifestResource;
    label: string | undefined;
    items: IMetadataItem[];
    constructor(resource: ManifestResource, label?: string);
    addItem(item: IMetadataItem): void;
    addMetadata(metadata: LabelValuePair[], isRootLevel?: boolean): void;
}
