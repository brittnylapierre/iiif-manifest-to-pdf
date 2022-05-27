const expect = require('chai').expect;
const should = require('chai').should();
const utils = require('../dist-commonjs/');

// strings

describe("string", () => {

    it("formats", () => {
        let str = "{0} My name is {1}";
        str = utils.Strings.format(str, "Hi!", "Slim Shady");
        expect(str === "Hi! My name is Slim Shady");
    });

    it("is alphanumeric", () => {
        expect(utils.Strings.isAlphanumeric("313"));
        expect(!utils.Strings.isAlphanumeric("everybody in the 313"));
    });

    it("is css class", () => {
        expect(utils.Strings.toCssClass("My name is Slim Shady") === "myNameIsSlimShady");
    });

    it("is file name", () => {
        expect(utils.Strings.toFileName("My name is Slim Shady") === "myNameIsSlimShady");
    });

});

// maths

describe("math", () => {

    it("normalises", () => {

        var normalised = utils.Maths.normalise(2, 0, 10);
        expect(normalised === 0.2);

    });

    it("finds median", () => {

        var median = utils.Maths.median([9, 13, 9, 11, 9, 13, 11, 9, 10, 8, 11]);
        expect(median === 10);

        median = utils.Maths.median([4, 5, 8, 11, 12, 21]);
        expect(median === 9.5);

    });

    it("clamps", () => {

        expect(utils.Maths.clamp(11, 0, 10) === 10);
        expect(utils.Maths.clamp(4, 5, 10) === 5);

    });

});

// objects

describe("object", () => {

    it("converts to a plain object", () => {

        function Foo() {
            this.b = 2;
        }
        
        Foo.prototype.c = 3;
        
        var newFoo = new Foo;
    
        var data = { a: 1 };
    
        var test1 = Object.assign(data, newFoo);
        test1.should.deep.equal({ a: 1, b: 2 });
    
        data = { a: 1 };
    
        var test2 = Object.assign(data, utils.Objects.toPlainObject(newFoo));
        expect(test2.should.deep.equal({ a: 1, b: 2, c: 3 }));
    });

});

// urls

// describe("urls", () => {

//     it("gets hash parameter from string", () => {

//         var url = "http://localhost:8002/examples/#rid=https://api.bl.uk/metadata/iiif/ark:/81055/vdc_100052359795.0x000007";

//         var rid = utils.Urls.getHashParameterFromString('rid', url);

//         expect(rid === "https://api.bl.uk/metadata/iiif/ark:/81055/vdc_100052359795.0x000007");
//     });

// });