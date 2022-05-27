import { IBaseComponentOptions, BaseComponent } from '../src';

describe('ExtendedBaseComponent', () => {
  class ExtendedBaseComponent extends BaseComponent {

    constructor(options: IBaseComponentOptions) {
      super(options);
      this.options = options;
    }

    public init(): boolean {
      return this._init();
    }

    public resize(): void {
      return this._resize();
    }
  }

  describe('#_init', async () => {

    const options =  {
      target: undefined,
      data: {}
    };

    const component = new ExtendedBaseComponent(options as any);

    it('returns false if the element does not exist', () => {
      const output = component.init();
      expect(output).toEqual(false);
    });

  });

});

describe('BaseComponent', () => {

  const MockOptions = jest.fn<IBaseComponentOptions>();
  const options = new MockOptions();
  const component = new BaseComponent(options);

  describe('constructor', () => {
    it('constructs an object using options', () => {
      expect(component.options).not.toBeNull();
      expect(component.options.target).not.toBeNull();
    });
  });

  describe('#data', () => {
    it('constructs an object using options', () => {
      expect(component.data()).toEqual({});
    });
  });

  describe('#on', () => {
    it('binds a callback to an event', () => {
      const handler = jest.fn();
      component.on('myEvent', handler, this);
      expect(component._e).toHaveProperty('myEvent', [ { fn: handler, ctx: this } ]);
    });
  });

  describe('#fire', () => {
    it('invokes the callback bound to an event', () => {
      const handler = jest.fn();
      component.on('myEvent', handler, this);
      component.fire('myEvent', 'foo', 'bar');
      expect(handler).toHaveBeenCalledWith('foo', 'bar');
    });
  });

  describe('#set', () => {
    it('performs a noop', () => {
      expect(component.set({})).toBeUndefined();
    });
  });
});
