/**
 * @stately/ui - Main exports
 */

import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import type { CorePaths } from './core';
import { type CoreUiAugment, createCoreUiPlugin } from './core/index.js';
import { callOperation } from './operations.js';
import { makeRegistryKey, UiAugment } from './plugin.js';
import { createStatelyUi, StatelyRuntime } from './runtime.js';
import { Schemas } from '@stately/schema';

/**
 * Runtime with core plugin installed.
 * The augments array includes CoreUiAugment plus any additional plugins.
 */
export type StatelyUi<
  S extends Schemas<any, any> = Schemas,
  ExtraAugments extends readonly UiAugment<string, S, any, any>[] = readonly [],
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

export { StatelyUiProvider, useStatelyUi, createUseStatelyUi } from './context.js';

// Re-exports
export type { RegistryKey, RegistryMode, UiAugment } from './plugin.js';
export type {
  ComponentRegistry,
  StatelyRuntime,
  StatelyUiBuilder,
  StatelyUiPluginFactory,
  UiRegistry,
} from './runtime.js';
export { makeRegistryKey };
export { callOperation };
export type { OperationMeta } from './operations.js';
