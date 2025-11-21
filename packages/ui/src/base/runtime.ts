import type { StatelySchemas } from '@stately/schema/schema';
import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import type { AllPlugins, AnyUiPlugin, UiPluginFactory } from './plugin';
import type { UiRegistry } from './registry';
import { runtimeUtils, type UiUtils } from './utils';

/**
 * App-wide configuration, available via context
 */
export interface UiOptions {
  api: { pathPrefix?: string };
}

/**
 * Default app-wide configuration
 */
export const defaultUiOptions: UiOptions = { api: {} };

/**
 * Core StatelyRuntime type with augment-based plugin distribution.
 *
 * The Augments array drives type-safe plugin access via AugmentPlugins.
 * Each augment's Name becomes a key in the plugins record with full intellisense.
 */
export interface StatelyRuntime<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> {
  schema: Stately<Schema>;
  client: Client<Schema['config']['paths']>;
  registry: UiRegistry;
  utils: UiUtils;
  plugins: AllPlugins<Schema, Augments>;
  options: UiOptions;
}

/**
 * StatelyUiBuilder provides the withPlugin chaining API.
 * Augments are declared upfront; withPlugin() populates runtime data.
 */
export interface StatelyUiBuilder<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> extends StatelyRuntime<Schema, Augments> {
  withPlugin(plugin: UiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments>;
}

/**
 * Initialize StatelyUi builder with declared augments.
 * Augments type parameter specifies expected plugins upfront.
 *
 * @example
 * ```typescript
 * statelyUi<MySchemas, readonly [CoreUiAugment<MySchemas>]>(schema, client, options)
 *   .withPlugin(coreUiPlugin());
 * ```
 */
export function createStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>(
  schema: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
  options: UiOptions,
): StatelyUiBuilder<Schema, Augments> {
  console.debug('[stately/ui] initializing w/ options: ', { defaultUiOptions, options });

  function makeBuilder(
    state: StatelyRuntime<Schema, Augments>,
  ): StatelyUiBuilder<Schema, Augments> {
    return {
      ...state,
      withPlugin(plugin: UiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments> {
        const nextState = plugin(state);
        console.debug('[stately/ui] merged w/ state: ', { state: nextState });
        return makeBuilder({ ...nextState, utils: runtimeUtils(nextState.plugins) });
      },
    };
  }

  return makeBuilder({
    client,
    options: { ...defaultUiOptions, ...options },
    plugins: {} as AllPlugins<Schema, Augments>,
    registry: { components: new Map(), functions: new Map(), transformers: new Map() },
    schema,
    utils: runtimeUtils({}),
  });
}
