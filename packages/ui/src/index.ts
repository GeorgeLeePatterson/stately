/**
 * @stately/ui - Main exports
 */

import { StatelyUiProvider, useStatelyUi } from './context.js';
import { callOperation } from './core/lib/operations.js';
import { makeRegistryKey } from './plugin.js';
import { statelyUi } from './runtime.js';

export type { RegistryKey, RegistryMode } from './plugin.js';
export type {
  ComponentRegistry,
  StatelyCore,
  StatelyCoreRuntime,
  StatelyUiBuilder,
  StatelyUiPluginDescriptor,
  StatelyUiPluginFactory,
  UiRegistry,
} from './runtime.js';
export { makeRegistryKey };
export { callOperation };
export type { OperationMeta } from './core/lib/operations.js';
export { statelyUi as createStatelyUi };
export { StatelyUiProvider, useStatelyUi };
