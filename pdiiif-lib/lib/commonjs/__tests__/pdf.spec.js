"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pdf_lib_1 = require("pdf-lib");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const common_1 = require("../pdf/common");
const generator_1 = tslib_1.__importDefault(require("../pdf/generator"));
const io_1 = require("../io");
describe('JavaScript->PDF value serialization', () => {
    it('should convert Unicode strings with braces to UTF16BE', () => {
        expect((0, common_1.serialize)('(Hellö Wörld)')).toBe('<FEFF00480065006C006C00F60020005700F60072006C0064>');
    });
    it('should not convert ASCII strings', () => {
        expect((0, common_1.serialize)('(Hello World)')).toBe('(Hello World)');
    });
    it('should not convert strings without braces', () => {
        expect((0, common_1.serialize)('HelloWorld')).toBe('HelloWorld');
    });
    it('should convert Uint8Arrays to a hex string', () => {
        expect((0, common_1.serialize)(new Uint8Array([0, 16, 32, 64, 128, 256]))).toBe('<001020408000>');
    });
    it('should convert Dates to a PDF date string', () => {
        expect((0, common_1.serialize)(new Date('01 Jan 1970 00:00:00 GMT'))).toBe('(D:19700101000000Z)');
    });
    it('should convert objects to dictionaries', () => {
        expect((0, common_1.serialize)({ Foo: 'bar' })).toBe('<<\n  /Foo bar\n>>');
    });
    it('should correctly encode PDF references', () => {
        expect((0, common_1.serialize)((0, common_1.makeRef)(15))).toBe('15 0 R');
        expect((0, common_1.serialize)((0, common_1.makeRef)({ num: 32 }))).toBe('32 0 R');
    });
});
describe('PDF generation', () => {
    it('should initialize a PDF with the correct metadata', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const pdfPath = tmp_1.default.tmpNameSync({
            prefix: 'pdiiif-test-',
            postfix: '.pdf',
        });
        const nodeStream = fs_1.default.createWriteStream(pdfPath);
        const writer = new io_1.NodeWriter(nodeStream);
        const metadata = {
            Title: 'Täst Tütle',
        };
        const pdfgen = new generator_1.default({
            writer,
            metadata,
            langPref: ['en'],
            canvasInfos: [
                {
                    canvas: { id: 'foo', type: 'Canvas' },
                    images: [
                        {
                            img: { id: 'foo', type: 'ContentResource' },
                            choiceState: { enabled: undefined },
                        },
                    ],
                    numAnnotations: 0,
                },
            ],
            outline: [],
            pageLabels: ['Tüst Läbel']
        });
        yield pdfgen.setup();
        const imgBuf = yield fs_1.default.promises.readFile(path_1.default.resolve(__dirname, './fixtures/wunder.jpg'));
        yield pdfgen.renderPage('http://some.fixture', { width: 290, height: 400 }, [
            {
                dimensions: { width: 290, height: 400 },
                location: { x: 0, y: 0 },
                data: imgBuf,
                numBytes: imgBuf.length,
                isOptional: false,
                visibleByDefault: true,
            },
        ], [], undefined, 72);
        yield pdfgen.end();
        const pdfData = yield fs_1.default.promises.readFile(pdfPath);
        const parsed = yield pdf_lib_1.PDFDocument.load(pdfData.buffer.slice(0), {
            throwOnInvalidObject: false,
        });
        expect(parsed.getPageCount()).toBe(1);
        expect(parsed.getPage(0).getSize()).toMatchObject({
            width: 290,
            height: 400,
        });
        expect(parsed.getTitle()).toEqual('Täst Tütle');
        fs_1.default.unlinkSync(pdfPath);
    }));
});
