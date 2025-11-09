/**
 * @stately/ui - Main exports
 */

export type { NodeTypeComponents, StatelyUiPlugin } from './plugin.js';
export type { ComponentRegistry } from './runtime.js';

import { statelyUi } from './runtime.js';
export { statelyUi as createStatelyUi };
