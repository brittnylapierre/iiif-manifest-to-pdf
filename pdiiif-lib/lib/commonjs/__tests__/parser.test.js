"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../pdf/parser");
const util_1 = require("../pdf/util");
const common_1 = require("../pdf/common");
const FIXTURES = {
    dict: `
    <<
      /TrueBool true
      /FalseBool false
      /NullValue null
      /Integer -20
      /Real -13.137
      /String (Hello World)
      /HexString <1337DEADBEEF>
      /Ref 13 0 R
      /Array [1 (Foo) <C0FFEF>]
      /Nested << /Hello (World) >>
    >>`,
    specialString: '(One (\\0433)\\)\\n\\r)',
};
describe('The PDF object value parser', () => {
    it('should correctly parse a string literal with nested parentheses and escaped characters', () => {
        const parser = new parser_1.ObjectParser(util_1.textEncoder.encode(FIXTURES.specialString));
        expect(parser.read()).toEqual('One (#3))\n\r');
    });
    it('should correctly parse a dictionary with all types', () => {
        const parser = new parser_1.ObjectParser(util_1.textEncoder.encode(FIXTURES.dict));
        const value = parser.read();
        expect(value).toMatchObject({
            TrueBool: true,
            FalseBool: false,
            Integer: -20,
            Real: -13.137,
            String: 'Hello World',
            HexString: new Uint8Array([0x13, 0x37, 0xde, 0xad, 0xbe, 0xef]),
            Ref: new common_1.PdfRef(13),
            Array: [1, 'Foo', new Uint8Array([0xc0, 0xff, 0xef])],
            Nested: { Hello: 'World' },
        });
    });
});
