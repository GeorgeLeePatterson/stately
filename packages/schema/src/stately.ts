/**
 * Stately runtime
 *
 * Lightweight builder that wires OpenAPI-derived schema data into a runtime
 * instance, applies plugins, and exposes helper utilities. The runtime keeps a
 * snapshot of the user-generated OpenAPI document (`data`) plus a registry of
 * helper utilities contributed by plugins. Schema plugins can mutate `runtime.data`,
 * append helpers via `runtime.utils`, and register validation hooks.
 */

import type { OpenAPIV3_1 } from 'openapi-types';
import type { StatelyConfig } from './schema.js';
import type {
  SchemaPluginDescriptor,
  SchemaPluginFactory,
  SchemaValidateArgs,
  SchemaValidateHook,
  ValidationResult,
} from './plugin.js';

export type EmptyRecord = Record<never, never>;
export type AnyRecord = Record<string, unknown>;

export interface SchemaRegistry {
  utils: Map<string, (...args: any[]) => unknown>;
}

/**
 * Snapshot of the user-generated OpenAPI artifacts. This mirrors the "Generated"
 * view in StatelySchemas.
 */
export type SchemaData<Config extends StatelyConfig> = {
  document: OpenAPIV3_1.Document;
  components: Config['components'];
  paths: Config['paths'];
  nodes: Config['nodes'];
} & Record<string, unknown>;

export interface Stately<
  Config extends StatelyConfig,
  Utils extends AnyRecord = EmptyRecord,
  Exports extends AnyRecord = EmptyRecord,
> {
  data: SchemaData<Config>;
  registry: SchemaRegistry;
  utils: Utils;
  exports: Exports;
  plugins: {
    installed: SchemaPluginDescriptor<Config>[];
    all(): SchemaPluginDescriptor<Config>[];
  };
  validate: (args: SchemaValidateArgs<Config>) => ValidationResult;
}

export interface StatelyBuilder<
  Config extends StatelyConfig,
  Utils extends AnyRecord,
  Exports extends AnyRecord,
> extends Stately<Config, Utils, Exports> {
  withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
    plugin: SchemaPluginFactory<Config, Stately<Config, Utils, Exports>, PluginExt>,
  ): StatelyBuilder<Config, Utils, Exports & PluginExt>;
}

export function createStately<
  Config extends StatelyConfig,
  Utils extends AnyRecord = EmptyRecord,
>(
  openapi: OpenAPIV3_1.Document,
  generatedNodes: Config['nodes'],
  injectedUtils?: Utils,
): StatelyBuilder<Config, Utils, EmptyRecord> {
  const data: SchemaData<Config> = {
    document: openapi,
    components: (openapi.components || {}) as Config['components'],
    paths: (openapi.paths || {}) as Config['paths'],
    nodes: generatedNodes,
  };

  const registry = createSchemaRegistry();
  const baseUtils = (injectedUtils || ({} as Utils));
  registerUtils(registry, baseUtils);

  const installedPlugins: SchemaPluginDescriptor<Config, AnyRecord>[] = [];
  const listPlugins = () => [...installedPlugins];

  const baseState: Stately<Config, Utils, EmptyRecord> = {
    data,
    registry,
    utils: baseUtils,
    exports: {} as EmptyRecord,
    plugins: { installed: installedPlugins, all: listPlugins },
    validate: undefined as unknown as (args: SchemaValidateArgs<Config>) => ValidationResult,
  };

  return makeBuilder(baseState);

  function makeBuilder<Ext extends AnyRecord>(
    state: Stately<Config, Utils, Ext>,
  ): StatelyBuilder<Config, Utils, Ext> {
    const current: Stately<Config, Utils, Ext> = {
      ...state,
      validate: args => runValidationPipeline(state, args),
    };

    return {
      ...current,
      withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
        plugin: SchemaPluginFactory<Config, Stately<Config, Utils, Ext>, PluginExt>,
      ): StatelyBuilder<Config, Utils, Ext & PluginExt> {
        const descriptor = plugin(current);
        if (!descriptor || !descriptor.name) {
          throw new Error('Schema plugin must return a descriptor with a name');
        }

        installedPlugins.push(descriptor as SchemaPluginDescriptor<Config, AnyRecord>);

        const nextState: Stately<Config, Utils, Ext & PluginExt> = {
          ...current,
          exports: { ...current.exports, ...(descriptor.exports || ({} as PluginExt)) } as Ext &
            PluginExt,
        };

        return makeBuilder(nextState);
      },
    };
  }
}

function createSchemaRegistry(): SchemaRegistry {
  return { utils: new Map() };
}

function registerUtils(registry: SchemaRegistry, utils: AnyRecord) {
  Object.entries(utils).forEach(([key, value]) => {
    if (typeof value === 'function') {
      /**
       * Helpers live both on runtime.utils (direct access) and registry.utils
       * (string-based lookup). We intentionally keep both to support dynamic
       * resolver patterns elsewhere in the system.
       */
      registry.utils.set(key, value as (...args: any[]) => unknown);
    }
  });
}

function runValidationPipeline<
  Config extends StatelyConfig,
  Utils extends AnyRecord,
  Exports extends AnyRecord,
>(state: Stately<Config, Utils, Exports>, args: SchemaValidateArgs<Config>): ValidationResult {
  const hooks = state.plugins
    .all()
    .map(plugin => plugin.validate)
    .filter((hook): hook is SchemaValidateHook<Config> => Boolean(hook));

  if (hooks.length === 0) {
    throw new Error('No schema validators registered. Apply at least one plugin before using validate().');
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { valid: true, errors: [] };
}
