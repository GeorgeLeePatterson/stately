/**
 * @statelyjs/ui - Main exports
 *
 * TODO: Docs:
 * 1. Base
 * 2. Core
 * 3. Users
 * 4. Plugin authors
 */

import { createUseStatelyUi } from './base/context.js';
import type { AnyUiPlugin } from './base/plugin.js';
import {
  createStatelyUi,
  type StatelyUiBuilder,
  type StatelyUiConfiguration,
  type StatelyUiRuntime,
} from './base/runtime.js';
import { statelyUiProvider as coreStatelyUiProvider } from './core/context.js';
import { type CoreUiOptions, type CoreUiPlugin, coreUiPlugin } from './core/index.js';
import type { Schemas } from './schema.js';

// ------------------------
// Stately UI: Root level definitions, components, and utilities
// ------------------------

// Plugin re-exports
export type {
  AnyUiAugments,
  DefineOptions,
  DefineRoutes,
  DefineUiPlugin,
  DefineUiUtils,
  UiPluginFactory,
} from './base/plugin.js';
export type { RegistryKey, RegistryMode, UiRegistry } from './base/registry.js';
export type { AnyUiPlugin };

// Options re-exports
import { defaultUiOptions } from './base/runtime.js';

export type { UiNavigationOptions, UiOptions } from './base/runtime.js';
export { defaultUiOptions };

// Theme re-exports
import { ThemeProvider, ThemeToggle, useTheme } from './base/index.js';

export type { Theme, ThemeProviderProps } from './base/index.js';
export { ThemeProvider, ThemeToggle, useTheme };

// Layout re-exports
import { Layout } from './base/layout';
export { Layout };

/**
 * Runtime configuration with core configuration included.
 */
export type StatelyConfiguration<Schema extends Schemas<any, any> = Schemas> = Readonly<
  StatelyUiConfiguration<Schema>
> & { core?: CoreUiOptions };

/**
 * Runtime with core plugin installed.
 * The augments array includes CoreUiPlugin plus any additional plugins.
 */
export type StatelyUi<
  S extends Schemas<any, any> = Schemas,
  ExtraAugments extends readonly AnyUiPlugin[] = readonly [],
> = StatelyUiRuntime<S, readonly [CoreUiPlugin, ...ExtraAugments]>;

/**
 * Create StatelyUi runtime with core plugin pre-installed.
 * Returns a fully-typed runtime with "core" plugin accessible.
 *
 * Plugin augments are declared upfront. This allows all plugins visibility into what is available.
 *
 * @example
 * ```typescript
 * const runtime = statelyUi({ schema, client, options, core: coreOptions });
 * runtime.plugins.core // ✓ Fully typed Core PluginRuntime
 * runtime.plugins.core.api.operations // ✓ Intellisense works
 * ```
 */
export function statelyUi<
  Schema extends Schemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>({
  core,
  ...stately
}: StatelyConfiguration<Schema>): StatelyUiBuilder<Schema, readonly [CoreUiPlugin, ...Augments]> {
  return createStatelyUi<Schema, readonly [CoreUiPlugin, ...Augments]>(stately).withPlugin(
    coreUiPlugin<Schema, Augments>(core),
  );
}

/**
 * Stately UI Context Provider with core included
 *
 * This hook is both used in core's plugin code but also serves as an example for how to customize
 * the application's Stately context with any plugin augmentations.
 */
export function useStatelyUi<
  Schema extends Schemas<any, any>,
  ExtraAugments extends readonly AnyUiPlugin[] = [],
>() {
  return createUseStatelyUi<Schema, readonly [CoreUiPlugin, ...ExtraAugments]>()();
}

/**
 * Create a typed StatelyUi provider.
 *
 * @example
 * ```typescript
 * const MyProvider = statelyUiProvider<MySchemas, [CoreUiPlugin<MySchemas>]>();
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 */
export const statelyUiProvider = coreStatelyUiProvider;
