
// stencilredux: Custom Elements Define Library, ES Module/es5 Target

import { defineCustomElement } from './stencilredux.core.js';
import { COMPONENTS } from './stencilredux.components.js';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, COMPONENTS, opts);
}
