/**
 * @stately/ui - Main exports
 */

import type { Stately, StatelyConfig } from '@stately/schema';
import type { Client } from 'openapi-fetch';
import { StatelyUiProvider, useStatelyUi } from './context.js';
import { createCoreUiPlugin } from './core/index.js';
import type { CorePaths } from './core';
import { callOperation } from './core/lib/operations.js';
import { makeRegistryKey } from './plugin.js';
import { statelyUi } from './runtime.js';
import type { AnyRecord } from '@/core/types';

export type { RegistryKey, RegistryMode } from './plugin.js';
export type {
  ComponentRegistry,
  StatelyCore,
  StatelyCoreRuntime,
  StatelyUiBuilder,
  StatelyUiPluginDescriptor,
  StatelyUiPluginFactory,
  UiRegistry,
} from './runtime.js';
export { registerUiPlugin } from './runtime.js';
export { makeRegistryKey };
export { callOperation };
export type { OperationMeta } from './core/lib/operations.js';

export function createStatelyUi<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord = AnyRecord,
>(integration: Stately<TConfig, IExt>, client: Client<CorePaths<TConfig> & {}>) {
  return statelyUi<TConfig, IExt>(integration, client).withPlugin(
    createCoreUiPlugin<TConfig, IExt>(),
  );
}

export { StatelyUiProvider, useStatelyUi };
