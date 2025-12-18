/**
 * @statelyjs/ui - Main exports
 *
 * TODO: Docs:
 * 1. Base
 * 2. Core
 * 3. Users
 * 4. Plugin authors
 */

import {
  type AnyUiPlugin,
  createStatelyUi,
  createUseStatelyUi,
  type StatelyUiBuilder,
  type StatelyUiConfiguration,
  type StatelyUiRuntime,
} from '@statelyjs/ui';
import { statelyUiProvider as coreStatelyUiProvider } from './core/context.js';
import { type CoreUiOptions, type CoreUiPlugin, coreUiPlugin } from './core/index.js';
import type { Schemas } from './schema.js';

// ------------------------
// Stately UI: Root level definitions, components, and utilities
// ------------------------

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
