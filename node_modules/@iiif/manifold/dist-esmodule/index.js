export * from "./AnnotationGroup";
export * from "./AnnotationRect";
export * from "./Bootstrapper";
export * from "./ExternalResource";
export * from "./Helper";
export * from "./ILabelValuePair";
export * from "./MetadataGroup";
export * from "./MetadataOptions";
export * from "./MultiSelectState";
export * from "./Translation";
export * from "./TreeSortType";
export * from "./UriLabeller";
import { Bootstrapper } from "./Bootstrapper";
export var loadManifest = function (options) {
    return new Bootstrapper(options).bootstrap();
};
//# sourceMappingURL=index.js.map