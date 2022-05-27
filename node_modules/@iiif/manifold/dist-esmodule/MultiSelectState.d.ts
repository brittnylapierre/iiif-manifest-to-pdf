import { MultiSelectableRange } from "./MultiSelectableRange";
import { MultiSelectableCanvas } from "./MultiSelectableCanvas";
import { IMultiSelectable } from "./IMultiSelectable";
export declare class MultiSelectState {
    isEnabled: boolean;
    ranges: MultiSelectableRange[];
    canvases: MultiSelectableCanvas[];
    allCanvasesSelected(): boolean;
    allRangesSelected(): boolean;
    allSelected(): boolean;
    getAll(): IMultiSelectable[];
    getAllSelectedCanvases(): MultiSelectableCanvas[];
    getAllSelectedRanges(): MultiSelectableRange[];
    getCanvasById(id: string): MultiSelectableCanvas;
    getCanvasesByIds(ids: string[]): MultiSelectableCanvas[];
    getRangeCanvases(range: MultiSelectableRange): MultiSelectableCanvas[];
    selectAll(selected: boolean): void;
    selectCanvas(canvas: MultiSelectableCanvas, selected: boolean): void;
    selectAllCanvases(selected: boolean): void;
    selectCanvases(canvases: MultiSelectableCanvas[], selected: boolean): void;
    selectRange(range: MultiSelectableRange, selected: boolean): void;
    selectAllRanges(selected: boolean): void;
    selectRanges(ranges: MultiSelectableRange[], selected: boolean): void;
    setEnabled(enabled: boolean): void;
}
