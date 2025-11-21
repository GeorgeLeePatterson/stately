import { createOperations } from './api';
import { createStatelyUiProvider, createUseStatelyUi, StatelyUiProvider } from './context';
import * as registry from './registry.js';

export type { TypedOperations } from './api';
export type {
  AnyUiAugments,
  AnyUiPlugin,
  DefineOptions,
  DefineUiPlugin,
  DefineUiUtils,
  PluginFunction,
  PluginFunctionMap,
  PluginRuntime,
  UiPluginFactory,
} from './plugin.js';
export type {
  ComponentRegistry,
  RegistryKey,
  RegistryMode,
  RegistryType,
  Transformer,
  TransformerRegistry,
  UiRegistry,
} from './registry.js';
export type {
  defaultUiOptions,
  StatelyRuntime,
  StatelyUiBuilder,
  UiOptions,
} from './runtime.js';
export type { UiUtils } from './utils.js';

export {
  createOperations,
  createStatelyUiProvider,
  createUseStatelyUi,
  StatelyUiProvider,
  registry,
};
