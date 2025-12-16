// Api
import { createOperations } from './api';

export type { TypedOperations } from './api';
export { createOperations };

// Plugin
export type {
  AllUiPlugins,
  AnyUiAugments,
  AnyUiPlugin,
  DefineOptions,
  DefineRoutes,
  DefineUiPlugin,
  DefineUiUtils,
  PluginFunction,
  PluginFunctionMap,
  PluginRuntime,
  UiPluginFactory,
} from './plugin.js';

// Context
import { createStatelyUiProvider, createUseStatelyUi, StatelyUiProvider } from './context';

export type { StatelyProviderProps } from './context';
export { createStatelyUiProvider, createUseStatelyUi, StatelyUiProvider };

// Layout
import { Layout } from './layout';

export { Layout };

// Form
import { BaseForm } from './form';

export { BaseForm };

// Theme
import {
  defaultStorageKey,
  defaultThemeOption,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from './theme.js';

export type { Theme, ThemeProviderProps } from './theme.js';
export { defaultThemeOption, defaultStorageKey, ThemeProvider, ThemeToggle, useTheme };

// Registry
import * as registry from './registry.js';

export type {
  ComponentRegistry,
  FunctionRegistry,
  NodeTypeComponent,
  RegistryKey,
  RegistryMode,
  RegistryType,
  Transformer,
  TransformerEditProps,
  TransformerRegistry,
  TransformerViewProps,
  UiRegistry,
} from './registry.js';
export { registry };

// Runtime
import { createStatelyUi, defaultUiOptions } from './runtime.js';

export type {
  StatelyUiBuilder,
  StatelyUiConfiguration,
  StatelyUiRuntime,
  UiNavigationOptions,
  UiOptions,
  UiPluginRuntime,
} from './runtime.js';
export { defaultUiOptions, createStatelyUi };

// Utils
import { cn } from './lib/utils.js';
import {
  camelCaseToKebabCase,
  mergePathPrefixOptions,
  runtimeUtils,
  stripLeading,
  stripTrailing,
  toKebabCase,
  toSpaceCase,
  toTitleCase,
} from './utils.js';

export type { UiUtils } from './utils.js';
export {
  cn,
  stripLeading,
  stripTrailing,
  camelCaseToKebabCase,
  toKebabCase,
  toSpaceCase,
  toTitleCase,
  runtimeUtils,
  mergePathPrefixOptions,
};

// Logging
import { devLog, devLogger } from './lib/logging.js';
export { devLogger, devLog };
