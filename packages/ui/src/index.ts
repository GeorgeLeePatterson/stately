/**
 * @stately/ui - Main exports
 */

import type { Schemas } from '@stately/schema';
import type { AnyPaths, OperationBindings } from '@stately/schema/api';
import type { RequireLiteral } from '@stately/schema/helpers';
import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import { createStatelyUiProvider, createUseStatelyUi } from './base/context.js';
import type { AnyUiPlugin, PluginFunctionMap, UiPlugin } from './base/plugin.js';
import { createStatelyUi, type StatelyRuntime, type StatelyUiBuilder } from './base/runtime.js';
import { type CoreUiAugment, coreUiPlugin } from './core/index.js';
import type { CoreUiPlugin } from './core/plugin.js';

/**
 * Public helper for declaring a ui plugin augment.
 *
 * Enforces string-literal names so downstream utilities preserve keyed plugins.
 * Plugin authors should export their augments defined with this type
 */
export type DefineUiPlugin<
  Name extends string,
  Paths extends AnyPaths,
  Ops extends OperationBindings<any, any>,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = UiPlugin<RequireLiteral<Name, 'Plugin names must be string literals'>, Paths, Ops, Utils>;

export interface StatelyUiOptions {
  pathPrefix?: string;
}

/**
 * Runtime with core plugin installed.
 * The augments array includes CoreUiAugment plus any additional plugins.
 */
export type StatelyUi<
  S extends Schemas<any, any> = Schemas,
  ExtraAugments extends readonly AnyUiPlugin[] = readonly [],
> = StatelyRuntime<S, readonly [CoreUiAugment, ...ExtraAugments]>;

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
>(
  state: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
  options?: StatelyUiOptions,
): StatelyUiBuilder<Schema, readonly [CoreUiAugment, ...Augments]> {
  return createStatelyUi<Schema, readonly [CoreUiAugment, ...Augments]>(state, client).withPlugin(
    coreUiPlugin<Schema, Augments>(options ?? {}),
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
  ExtraAugments extends readonly AnyUiPlugin[],
>() {
  return createUseStatelyUi<Schema, readonly [CoreUiPlugin, ...ExtraAugments]>()();
}

/**
 * Create a typed StatelyUi provider.
 *
 * @example
 * ```typescript
 * const MyProvider = createStatelyUiProvider<MySchemas, [CoreUiAugment<MySchemas>]>();
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 */
export function statelyUiProvider<
  Schema extends Schemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>() {
  return createStatelyUiProvider<Schema, readonly [CoreUiAugment, ...Augments]>();
}
