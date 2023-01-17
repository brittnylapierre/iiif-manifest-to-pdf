import { PdfObject } from './common.js';
declare abstract class PdfImage {
    static open(data: Uint8Array): PdfImage;
    abstract toObjects(startNum: number, isOptional?: boolean, optionalTitle?: string, optionalDefaultState?: boolean): Array<PdfObject>;
}
export default PdfImage;
//# sourceMappingURL=image.d.ts.map