/**
 * @stately/ui - Main exports
 */

import type { Schemas } from '@stately/schema';
import { createUseStatelyUi } from './base/context.js';
import { ThemeProvider, ThemeToggle, useTheme } from './base/index.js';
import type { AnyUiPlugin } from './base/plugin.js';
import {
  createStatelyUi,
  defaultUiOptions,
  type StatelyUiBuilder,
  type StatelyUiConfiguration,
  type StatelyUiRuntime,
} from './base/runtime.js';
import { statelyUiProvider as coreStatelyUiProvider } from './core/context.js';
import { type CoreUiOptions, type CoreUiPlugin, coreUiPlugin } from './core/index.js';

// Re-exports
export type { Theme, ThemeProviderProps } from './base/index.js';
export type { UiOptions } from './base/runtime.js';
export { ThemeProvider, ThemeToggle, useTheme, defaultUiOptions };

export type StatelyConfiguration<Schema extends Schemas<any, any> = Schemas> = Readonly<
  StatelyUiConfiguration<Schema>
> & { core?: CoreUiOptions };

/**
 * Core Ui options.
 *
 * TODO: Remove - Explain shape
 */
export type StatelyOptions = CoreUiOptions;

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
 * Augments are declared upfront as a type parameter, matching schema pattern.
 *
 * @example
 * ```typescript
 * const runtime = createStatelyUi(schema, client);
 * runtime.plugins.core // ✓ Fully typed CorePluginRuntime
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
 * const MyProvider = createStatelyUiProvider<MySchemas, [CoreUiPlugin<MySchemas>]>();
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 */
export const statelyUiProvider = coreStatelyUiProvider;
