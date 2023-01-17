"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manifesto_js_1 = require("manifesto.js");
var MultiSelectState = /** @class */ (function () {
    function MultiSelectState() {
        this.isEnabled = false;
        this.ranges = [];
        this.canvases = [];
    }
    MultiSelectState.prototype.allCanvasesSelected = function () {
        return (this.canvases.length > 0 &&
            this.getAllSelectedCanvases().length === this.canvases.length);
    };
    MultiSelectState.prototype.allRangesSelected = function () {
        return (this.ranges.length > 0 &&
            this.getAllSelectedRanges().length === this.ranges.length);
    };
    MultiSelectState.prototype.allSelected = function () {
        return this.allRangesSelected() && this.allCanvasesSelected();
    };
    MultiSelectState.prototype.getAll = function () {
        return this.canvases.concat(this.ranges);
    };
    MultiSelectState.prototype.getAllSelectedCanvases = function () {
        return this.canvases.filter(function (c) { return c.multiSelected; });
    };
    MultiSelectState.prototype.getAllSelectedRanges = function () {
        return this.ranges.filter(function (r) { return r.multiSelected; });
    };
    MultiSelectState.prototype.getCanvasById = function (id) {
        return this.canvases.filter(function (c) { return manifesto_js_1.Utils.normaliseUrl(c.id) === manifesto_js_1.Utils.normaliseUrl(id); })[0];
    };
    MultiSelectState.prototype.getCanvasesByIds = function (ids) {
        var canvases = [];
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            canvases.push(this.getCanvasById(id));
        }
        return canvases;
    };
    MultiSelectState.prototype.getRangeCanvases = function (range) {
        var ids = range.getCanvasIds();
        return this.getCanvasesByIds(ids);
    };
    MultiSelectState.prototype.selectAll = function (selected) {
        this.selectRanges(this.ranges, selected);
        this.selectCanvases(this.canvases, selected);
    };
    MultiSelectState.prototype.selectCanvas = function (canvas, selected) {
        var c = this.canvases.filter(function (c) { return c.id === canvas.id; })[0];
        c.multiSelected = selected;
    };
    MultiSelectState.prototype.selectAllCanvases = function (selected) {
        this.selectCanvases(this.canvases, selected);
    };
    MultiSelectState.prototype.selectCanvases = function (canvases, selected) {
        for (var j = 0; j < canvases.length; j++) {
            var canvas = canvases[j];
            canvas.multiSelected = selected;
        }
    };
    MultiSelectState.prototype.selectRange = function (range, selected) {
        var r = this.ranges.filter(function (r) { return r.id === range.id; })[0];
        r.multiSelected = selected;
        var canvases = (this.getRangeCanvases(r));
        this.selectCanvases(canvases, selected);
    };
    MultiSelectState.prototype.selectAllRanges = function (selected) {
        this.selectRanges(this.ranges, selected);
    };
    MultiSelectState.prototype.selectRanges = function (ranges, selected) {
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            range.multiSelected = selected;
            var canvases = this.getCanvasesByIds(range.getCanvasIds());
            this.selectCanvases(canvases, selected);
        }
    };
    MultiSelectState.prototype.setEnabled = function (enabled) {
        this.isEnabled = enabled;
        var items = this.getAll();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.multiSelectEnabled = this.isEnabled;
            if (!enabled) {
                item.multiSelected = false;
            }
        }
    };
    return MultiSelectState;
}());
exports.MultiSelectState = MultiSelectState;
//# sourceMappingURL=MultiSelectState.js.map