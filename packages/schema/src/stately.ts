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
} from './plugin.js';
import {
  runValidationPipeline,
  SchemaValidateArgs,
  ValidationResult,
} from './validation.js';

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
    installed: SchemaPluginDescriptor<Config, Exports>[];
    all(): SchemaPluginDescriptor<Config, Exports>[];
  };
  validate: (args: SchemaValidateArgs<Config>) => ValidationResult;
}

export interface StatelyBuilder<
  Config extends StatelyConfig,
  Utils extends AnyRecord,
  Exports extends AnyRecord,
> extends Stately<Config, Utils, Exports> {
  withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
    plugin: SchemaPluginFactory<Config, Utils, Exports, PluginExt>,
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

  function makeBuilder<Ext extends AnyRecord>(
    state: Stately<Config, Utils, Ext>,
  ): StatelyBuilder<Config, Utils, Ext> {
    return {
      ...state,
      validate: args => runValidationPipeline({ ...state }, args),
      withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
        plugin: SchemaPluginFactory<Config, Utils, Ext, PluginExt>,
      ): StatelyBuilder<Config, Utils, Ext & PluginExt> {
        return makeBuilder(plugin({ ...state }));
      },
    };
  }

  const data: SchemaData<Config> = {
    document: openapi,
    components: (openapi.components || {}) as Config['components'],
    paths: (openapi.paths || {}) as Config['paths'],
    nodes: generatedNodes,
  };

  const registry = { utils: new Map() };
  const utils = (injectedUtils || ({} as Utils));

  Object.entries(utils).forEach(([key, value]) => {
    if (typeof value === 'function') {
      /**
       * Helpers live both on runtime.utils (direct access) and registry.utils
       * (string-based lookup). Intentionally keep both to support dynamic
       * resolver patterns elsewhere in the system.
       */
      registry.utils.set(key, value as (...args: any[]) => unknown);
    }
  });

  const installedPlugins: SchemaPluginDescriptor<Config, AnyRecord>[] = [];

  const baseState: Stately<Config, Utils, EmptyRecord> = {
    data,
    registry,
    utils,
    exports: {} as EmptyRecord,
    plugins: { installed: installedPlugins, all: () => [...installedPlugins] },
    validate: args => runValidationPipeline(baseState, args),
  };

  return makeBuilder(baseState);
}
