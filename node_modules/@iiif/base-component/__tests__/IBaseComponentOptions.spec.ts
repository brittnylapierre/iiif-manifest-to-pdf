import { IBaseComponentOptions } from '../src';

describe('IBaseComponentOptions', () => {

  class MyBaseComponentOptions implements IBaseComponentOptions {
    
    target: HTMLElement;
    data?: any;
    
    constructor(target: HTMLElement, data?: any) {
      this.target = target;
      this.data = data;
    }
  }

  describe('MyBaseComponentOptions', () => {

    const mockHTMLElement = jest.fn<HTMLElement>();
    const data = {};
    const options = new MyBaseComponentOptions(mockHTMLElement as any, data);

    describe('#target', () => {
      it('has an accessor method for the target', () => {
        expect(options.target).toBeDefined();
        expect(options.target).toEqual(mockHTMLElement);
      });
    });

    describe('#data', () => {
      it('has an accessor method for the data', () => {
        expect(options.data).toBeDefined();
        expect(options.data).toEqual(data);
      });
    });
  });
});
