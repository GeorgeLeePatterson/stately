/**
 * @stately/ui - Main exports
 */

export type { NodeTypeComponents, StatelyUiPlugin } from './plugin.js';
export type { ComponentRegistry } from './runtime.js';
export type { OperationMeta, OperationIndex } from './lib/operations.js';

import { statelyUi } from './runtime.js';
export { statelyUi as createStatelyUi };
export { StatelyUiProvider, useStatelyUi } from './context.js';
export { callOperation } from './lib/operations.js';
export { Editor } from './components/views/editor.js';
