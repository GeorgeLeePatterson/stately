import type { StatelySchemas } from '@stately/schema/schema';
import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import type { ComponentType } from 'react';
import type { AnyUiPlugin, AugmentPlugins } from './plugin';
import type { ComponentRegistry, FunctionRegistry, TransformerRegistry } from './registry';

export interface UiRegistry {
  components: ComponentRegistry;
  // TODO: Important! Allow specifying transformer `types`
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
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
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
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> = (runtime: StatelyRuntime<Schema, Augments>) => StatelyRuntime<Schema, Augments>;

const DefaultIcon: ComponentType<any> = () => null;

function createRuntimeUtils<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
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
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
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
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>(
  schema: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
): StatelyUiBuilder<Schema, Augments> {
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

  return makeBuilder({
    client,
    plugins: {} as AugmentPlugins<Schema, Augments>,
    registry: { components: new Map(), functions: new Map(), transformers: new Map() },
    schema,
    utils: createRuntimeUtils({}),
  });
}
