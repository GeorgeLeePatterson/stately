/**
 * @stately/ui - Core UI integration runtime
 */

import type { Stately, StatelyConfig } from "@stately/schema";
import type { Client } from "openapi-fetch";
import type { ComponentType } from "react";
import * as helpers from "@/core/lib/helpers";
import type { AnyRecord, EmptyRecord } from "@/core/types";
import type { CorePaths } from "@/core";
import type { StatelyApi, StatelyOperations } from "@/core/lib/operations";
import {
  buildOperationIndex,
  buildStatelyOperations,
  createStatelyApi,
  type OperationIndex,
} from "@/core/lib/operations";

export type ComponentRegistry = Map<string, ComponentType<any>>;
export type TransformerRegistry = Map<string, (value: any) => any>;
export type FunctionRegistry = Map<string, (...args: any[]) => any>;

export interface UiRegistry {
  components: ComponentRegistry;
  transformers: TransformerRegistry;
  functions: FunctionRegistry;
}

export interface HttpBundle<TConfig extends StatelyConfig> {
  operationIndex: OperationIndex<TConfig>;
  operations: StatelyOperations<TConfig>;
  api: StatelyApi<TConfig>;
  extensions: Record<string, unknown>;
}

export interface StatelyUiPluginDescriptor<
  TConfig extends StatelyConfig = StatelyConfig,
  Exports extends AnyRecord = EmptyRecord,
> {
  name: string;
  exports?: Exports;
  api?: HttpBundle<TConfig>;
}

export interface StatelyRuntime<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
> {
  schema: Stately<TConfig, IExt>;
  client: Client<CorePaths<TConfig> & {}>;
  http: HttpBundle<TConfig>;
  registry: UiRegistry;
  helpers: typeof helpers & {
    getNodeTypeIcon: (node: string) => ComponentType<any>;
  };
  exports: PExt;
  plugins: {
    installed: StatelyUiPluginDescriptor<TConfig>[];
    all(): StatelyUiPluginDescriptor<TConfig>[];
  };
}

export type StatelyCoreRuntime = StatelyRuntime<
  StatelyConfig,
  AnyRecord,
  AnyRecord
>;

export interface StatelyUi {
  Core: StatelyCoreRuntime;
}

export type StatelyCore = StatelyUi["Core"];

export type StatelyUiRuntime<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
> = StatelyRuntime<TConfig, IExt, PExt>;

export type StatelyUiPluginFactory<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
  PluginExt extends AnyRecord = EmptyRecord,
> = (
  runtime: StatelyRuntime<TConfig, IExt, PExt>,
) => StatelyRuntime<TConfig, IExt, PExt & PluginExt>;

type Builder<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
> = StatelyRuntime<TConfig, IExt, PExt> & {
  withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
    plugin: StatelyUiPluginFactory<TConfig, IExt, PExt, PluginExt>,
  ): Builder<TConfig, IExt, PExt & PluginExt>;
};

export function statelyUi<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
>(
  integration: Stately<TConfig, IExt>,
  client: Client<CorePaths<TConfig> & {}>,
) {
  const registry: UiRegistry = {
    components: new Map(),
    transformers: new Map(),
    functions: new Map(),
  };

  const operationIndex = buildOperationIndex<TConfig>(
    integration.data.paths as CorePaths<TConfig>,
  );
  const operations = buildStatelyOperations<TConfig>(operationIndex);
  const api = createStatelyApi<TConfig>(client, operations);
  const http: HttpBundle<TConfig> = {
    operationIndex,
    operations,
    api,
    extensions: {},
  };

  const installed: StatelyUiPluginDescriptor<TConfig>[] = [];
  const pluginList = () => [...installed];

  const baseState: StatelyRuntime<TConfig, IExt, EmptyRecord> = {
    schema: integration,
    client,
    http,
    registry,
    helpers: helpers as typeof helpers & {
      getNodeTypeIcon: (node: string) => ComponentType<any>;
    },
    exports: {} as EmptyRecord,
    plugins: { installed, all: pluginList },
  };

  function decorateHelpers<PExt extends AnyRecord>(
    state: StatelyRuntime<TConfig, IExt, PExt>,
  ): StatelyRuntime<TConfig, IExt, PExt> {
    return {
      ...state,
      helpers: {
        ...helpers,
        getNodeTypeIcon: (icon: string) => helpers.getNodeTypeIcon(icon, state),
      },
    };
  }

  function makeBuilder<PExt extends AnyRecord>(
    state: StatelyRuntime<TConfig, IExt, PExt>,
  ): Builder<TConfig, IExt, PExt> {
    const current = decorateHelpers(state);

    return {
      ...current,
      withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
        plugin: StatelyUiPluginFactory<TConfig, IExt, PExt, PluginExt>,
      ): Builder<TConfig, IExt, PExt & PluginExt> {
        const nextState = plugin(current);
        return makeBuilder(nextState);
      },
    };
  }

  return makeBuilder(baseState);
}

export type StatelyUiBuilder<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  PExt extends AnyRecord = EmptyRecord,
> = Builder<TConfig, IExt, PExt>;

export function registerUiPlugin<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
  PluginExt extends AnyRecord = EmptyRecord,
>(
  runtime: StatelyRuntime<TConfig, IExt, PExt>,
  descriptor: StatelyUiPluginDescriptor<TConfig, PluginExt>,
): StatelyRuntime<TConfig, IExt, PExt & PluginExt> {
  runtime.plugins.installed.push(
    descriptor as StatelyUiPluginDescriptor<TConfig>,
  );

  const exportsPatch = (descriptor.exports || ({} as PluginExt)) as PluginExt;
  runtime.exports = {
    ...(runtime.exports as AnyRecord),
    ...exportsPatch,
  } as PExt & PluginExt;

  return runtime as StatelyRuntime<TConfig, IExt, PExt & PluginExt>;
}
