/**
 * @statelyjs/ui - UI Infrastructure
 *
 * Low-level UI infrastructure for Stately applications. This package provides
 * the foundational components, theming, plugin system, and runtime builder
 * that power Stately UIs.
 *
 * ## For Most Users
 *
 * **Use `@statelyjs/stately` instead.** It provides `statelyUi()` which
 * includes the core plugin automatically:
 *
 * ```typescript
 * import { statelyUi, StatelyProvider, useStatelyUi } from '@statelyjs/stately';
 * ```
 *
 * ## For Plugin Authors
 *
 * Use this package directly when building UI plugins:
 *
 * ```typescript
 * import {
 *   createOperations,
 *   type DefineUiPlugin,
 *   type UiPluginFactory,
 * } from '@statelyjs/ui';
 * ```
 *
 * ## Key Exports
 *
 * - **`createStatelyUi`** - Low-level runtime builder (without core plugin)
 * - **`createOperations`** - Create typed API operations from bindings
 * - **`DefineUiPlugin`** - Helper type for defining UI plugins
 * - **`registry`** - Component and transformer registry utilities
 * - **`ThemeProvider`** - Theme context provider
 *
 * @packageDocumentation
 */

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
  FieldEditProps,
  FieldViewProps,
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
  RouteOption,
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
  generateFieldFormId,
  generateFieldLabel,
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
  generateFieldFormId,
  generateFieldLabel,
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

// Assertions
import { devAssert } from './lib/assertions.js';
export { devAssert };

// Extensions
import { createExtensible, defineExtension } from './extension.js';

export type {
  ExtendInput,
  Extensible,
  ExtensibleConfig,
  ExtensibleHook,
  ExtensionPoint,
  ExtensionPointConfig,
  ExtensionState,
} from './extension.js';
export { createExtensible, defineExtension };

// Feature Plugins
import { createFeaturePlugin, FeatureComponent } from './feature-plugin.js';

export type {
  FeatureComponentProps,
  FeaturePlugin,
  FeaturePluginConfig,
  FeaturePluginContext,
} from './feature-plugin.js';
export { createFeaturePlugin, FeatureComponent };
