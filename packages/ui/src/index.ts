/**
 * @stately/ui - Main exports
 */

import type { Schemas } from '@stately/schema';
import type { RequireLiteral } from '@stately/schema/helpers';
import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import { StatelyUiProvider } from './base/context.js';
import { callOperation, createHttpBundle, type DefineOperationMap } from './base/operations.js';
import { makeRegistryKey, type PluginFunctionMap, type UiPluginAugment } from './base/plugin.js';
import { createStatelyUi, type StatelyRuntime } from './base/runtime.js';
import { createUseStatelyUi } from './context.js';
import { type CoreUiAugment, createCoreUiPlugin } from './core/index.js';

export type { DefineOperationMap, HttpBundle, OperationMeta } from './base/operations.js';
export { createHttpBundle };
export type { PluginRuntime, RegistryKey, RegistryMode, UiPluginAugment } from './base/plugin.js';
export type {
  ComponentRegistry,
  StatelyRuntime,
  StatelyUiBuilder,
  StatelyUiPluginFactory,
  UiRegistry,
} from './base/runtime.js';
export { StatelyUiProvider, createUseStatelyUi, makeRegistryKey, callOperation };

/**
 * Public helper for declaring a ui plugin augment.
 *
 * Enforces string-literal names so downstream utilities preserve keyed plugins.
 * Plugin authors should export their augments defined with this type
 */
export type DefineUiPlugin<
  Name extends string,
  Schema extends Schemas<any, any> = Schemas,
  Ops extends DefineOperationMap = DefineOperationMap,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = UiPluginAugment<
  RequireLiteral<Name, 'Plugin names must be string literals'>,
  Schema,
  Ops,
  Utils
>;

/**
 * Runtime with core plugin installed.
 * The augments array includes CoreUiAugment plus any additional plugins.
 */
export type StatelyUi<
  S extends Schemas<any, any> = Schemas,
  ExtraAugments extends readonly UiPluginAugment<string, S, any, any>[] = readonly [],
> = StatelyRuntime<S, readonly [CoreUiAugment<S>, ...ExtraAugments]>;

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
export function statelyUi<Schema extends Schemas<any, any>>(
  state: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
): StatelyUi<Schema> {
  return createStatelyUi<Schema, readonly [CoreUiAugment<Schema>]>(state, client).withPlugin(
    createCoreUiPlugin<Schema>(),
  );
}
