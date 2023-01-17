"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./AnnotationGroup"));
__export(require("./AnnotationRect"));
__export(require("./Bootstrapper"));
__export(require("./ExternalResource"));
__export(require("./Helper"));
__export(require("./ILabelValuePair"));
__export(require("./MetadataGroup"));
__export(require("./MetadataOptions"));
__export(require("./MultiSelectState"));
__export(require("./Translation"));
__export(require("./TreeSortType"));
__export(require("./UriLabeller"));
var Bootstrapper_1 = require("./Bootstrapper");
exports.loadManifest = function (options) {
    return new Bootstrapper_1.Bootstrapper(options).bootstrap();
};
//# sourceMappingURL=index.js.map