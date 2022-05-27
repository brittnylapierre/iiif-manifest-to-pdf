"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This class formats URIs into HTML <a> links, applying labels when available
var UriLabeller = /** @class */ (function () {
    function UriLabeller(labels) {
        this.labels = labels;
    }
    UriLabeller.prototype.format = function (url) {
        // if already a link, do nothing.
        if (url.indexOf("<a") != -1)
            return url;
        var label = this.labels[url] ? this.labels[url] : url;
        return '<a href="' + url + '">' + label + "</a>";
    };
    return UriLabeller;
}());
exports.UriLabeller = UriLabeller;
//# sourceMappingURL=UriLabeller.js.map