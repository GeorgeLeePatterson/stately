import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import type { ComponentType } from 'react';
import type { AnyBaseSchemas, BaseSchemas } from './base';
import type { AugmentPlugins, UiAugment } from './plugin';

export type ComponentRegistry = Map<string, ComponentType<any>>;
export type TransformerRegistry = Map<string, (value: any) => any>;
export type FunctionRegistry = Map<string, (...args: any[]) => any>;

export interface UiRegistry {
  components: ComponentRegistry;
  transformers: TransformerRegistry;
  functions: FunctionRegistry;
}

export interface RuntimeUtils {
  getNodeTypeIcon: (node: string) => ComponentType<any>;
}

/**
 * Core StatelyRuntime type with augment-based plugin distribution.
 *
 * The Augments array drives type-safe plugin access via AugmentPlugins.
 * Each augment's Name becomes a key in the plugins record with full intellisense.
 */
export interface StatelyRuntime<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
> {
  schema: Stately<Schema>;
  client: Client<Schema['config']['paths']>;
  registry: UiRegistry;
  utils: RuntimeUtils;
  plugins: AugmentPlugins<Schema, Augments>;
}

/**
 * Plugin factory function signature.
 * Takes runtime and returns runtime with SAME augments type.
 * Augments are declared upfront; factories populate runtime data to match.
 *
 * Pattern matches @stately/schema's PluginFactory.
 */
export type StatelyUiPluginFactory<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
> = (runtime: StatelyRuntime<Schema, Augments>) => StatelyRuntime<Schema, Augments>;

const DefaultIcon: ComponentType<any> = () => null;

function createRuntimeUtils<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[],
>(plugins: AugmentPlugins<Schema, Augments>): RuntimeUtils {
  return {
    getNodeTypeIcon(node: string): ComponentType<any> {
      for (const plugin of Object.values(plugins)) {
        const hook = plugin?.utils?.getNodeTypeIcon;
        if (!hook) continue;
        const icon = hook(node);
        if (icon) {
          return icon;
        }
      }
      return DefaultIcon;
    },
  };
}

/**
 * StatelyUiBuilder provides the withPlugin chaining API.
 * Augments are declared upfront; withPlugin() populates runtime data.
 */
export interface StatelyUiBuilder<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
> extends StatelyRuntime<Schema, Augments> {
  withPlugin(plugin: StatelyUiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments>;
}

/**
 * Initialize StatelyUi builder with declared augments.
 * Augments type parameter specifies expected plugins upfront.
 *
 * @example
 * ```typescript
 * statelyUi<MySchemas, readonly [CoreUiAugment<MySchemas>]>(schema, client)
 *   .withPlugin(createCoreUiPlugin());
 * ```
 */
export function createStatelyUi<
  Schema extends BaseSchemas<any, any>,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
>(
  schema: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
): StatelyUiBuilder<Schema, Augments> {
  const registry: UiRegistry = {
    components: new Map(),
    functions: new Map(),
    transformers: new Map(),
  };

  const basePlugins = {} as AugmentPlugins<Schema, Augments>;

  const baseState: StatelyRuntime<Schema, Augments> = {
    client,
    plugins: basePlugins,
    registry,
    schema,
    utils: createRuntimeUtils(basePlugins),
  };

  function makeBuilder(
    state: StatelyRuntime<Schema, Augments>,
  ): StatelyUiBuilder<Schema, Augments> {
    return {
      ...state,
      withPlugin(
        plugin: StatelyUiPluginFactory<Schema, Augments>,
      ): StatelyUiBuilder<Schema, Augments> {
        const nextState = plugin(state);
        return makeBuilder({ ...nextState, utils: createRuntimeUtils(nextState.plugins) });
      },
    };
  }

  return makeBuilder(baseState);
}
