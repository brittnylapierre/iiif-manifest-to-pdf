"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataGroup = /** @class */ (function () {
    function MetadataGroup(resource, label) {
        this.items = [];
        this.resource = resource;
        this.label = label;
    }
    MetadataGroup.prototype.addItem = function (item) {
        this.items.push(item);
    };
    MetadataGroup.prototype.addMetadata = function (metadata, isRootLevel) {
        if (isRootLevel === void 0) { isRootLevel = false; }
        for (var i = 0; i < metadata.length; i++) {
            var item = metadata[i];
            item.isRootLevel = isRootLevel;
            this.addItem(item);
        }
    };
    return MetadataGroup;
}());
exports.MetadataGroup = MetadataGroup;
//# sourceMappingURL=MetadataGroup.js.map