/**
 * @stately/ui - Main exports
 */

import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import { StatelyUiProvider, useStatelyUi } from './context.js';
import type { CorePaths, CoreSchemas, CoreStatelyRuntime } from './core';
import { CORE_PLUGIN_NAME, type CoreUiAugment, createCoreUiPlugin } from './core/index.js';
import { callOperation } from './operations.js';
import { makeRegistryKey } from './plugin.js';
import { statelyUi } from './runtime.js';

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
export { CORE_PLUGIN_NAME };

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
export function createStatelyUi<Schema extends CoreSchemas>(
  integration: Stately<Schema>,
  client: Client<CorePaths<Schema> & {}>,
): CoreStatelyRuntime<Schema> {
  return statelyUi<Schema, readonly [CoreUiAugment<Schema>]>(integration, client).withPlugin(
    createCoreUiPlugin<Schema>(),
  );
}

export { StatelyUiProvider, useStatelyUi };
