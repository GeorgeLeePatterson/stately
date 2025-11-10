/**
 * @stately/ui - Core UI integration runtime
 */

import type { Stately, StatelyConfig } from '@stately/schema';
import { NodeType } from '@stately/schema';
import type { Client } from 'openapi-fetch';
import type { ComponentType } from 'react';
import * as editFields from '@/core/components/fields/edit';
import * as viewFields from '@/core/components/fields/view';
import * as linkFields from '@/core/components/views/link';
import * as helpers from '@/core/lib/helpers';
import type { AnyRecord, EmptyRecord } from '@/core/types';
import type { CorePaths } from '@/core';
import type { StatelyApi, StatelyOperations } from '@/core/lib/operations';
import {
  buildOperationIndex,
  buildStatelyOperations,
  createStatelyApi,
  type OperationIndex,
} from '@/core/lib/operations';
import { makeRegistryKey } from './plugin.js';

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
  helpers: typeof helpers & { getNodeTypeIcon: (node: NodeType) => ComponentType<any> };
  exports: PExt;
  plugins: {
    core: StatelyUiPluginDescriptor<TConfig>;
    installed: StatelyUiPluginDescriptor<TConfig>[];
    all(): StatelyUiPluginDescriptor<TConfig>[];
  };
}

export type StatelyCoreRuntime = StatelyRuntime<StatelyConfig, AnyRecord, AnyRecord>;

export interface StatelyUi {
  Core: StatelyCoreRuntime;
}

export type StatelyCore = StatelyUi['Core'];

export type StatelyUiRuntime<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
> = StatelyRuntime<TConfig, IExt, PExt>;

export type StatelyUiPluginFactory<
  TConfig extends StatelyConfig,
  Runtime extends StatelyRuntime<TConfig, AnyRecord, AnyRecord>,
  Exports extends AnyRecord = EmptyRecord,
> = (runtime: Runtime) => StatelyUiPluginDescriptor<TConfig, Exports>;

type Builder<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  PExt extends AnyRecord,
> = StatelyRuntime<TConfig, IExt, PExt> & {
  withPlugin<PluginExt extends AnyRecord = EmptyRecord>(
    plugin: StatelyUiPluginFactory<TConfig, StatelyRuntime<TConfig, IExt, PExt>, PluginExt>,
  ): Builder<TConfig, IExt, PExt & PluginExt>;
};

export function statelyUi<TConfig extends StatelyConfig, IExt extends AnyRecord = EmptyRecord>(
  integration: Stately<TConfig, IExt>,
  client: Client<CorePaths<TConfig> & {}>,
) {
  const registry: UiRegistry = {
    components: new Map(),
    transformers: new Map(),
    functions: new Map(),
  };

  registerCoreComponents(registry.components);

  const operationIndex = buildOperationIndex<TConfig>(integration.data.paths as CorePaths<TConfig>);
  const operations = buildStatelyOperations<TConfig>(operationIndex);
  const api = createStatelyApi<TConfig>(client, operations);
  const http: HttpBundle<TConfig> = { operationIndex, operations, api, extensions: {} };

  const corePlugin: StatelyUiPluginDescriptor<TConfig> = { name: 'stately:ui-core', api: http };

  const installed: StatelyUiPluginDescriptor<TConfig>[] = [];
  const pluginList = () => [...installed, corePlugin];

  const baseState: StatelyRuntime<TConfig, IExt, EmptyRecord> = {
    schema: integration,
    client,
    http,
    registry,
    helpers: helpers as typeof helpers & {
      getNodeTypeIcon: (node: NodeType) => ComponentType<any>;
    },
    exports: {} as EmptyRecord,
    plugins: { core: corePlugin, installed, all: pluginList },
  };

  function decorateHelpers<PExt extends AnyRecord>(
    state: StatelyRuntime<TConfig, IExt, PExt>,
  ): StatelyRuntime<TConfig, IExt, PExt> {
    return {
      ...state,
      helpers: {
        ...helpers,
        getNodeTypeIcon: (icon: NodeType) => helpers.getNodeTypeIcon(icon, state),
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
        plugin: StatelyUiPluginFactory<TConfig, StatelyRuntime<TConfig, IExt, PExt>, PluginExt>,
      ): Builder<TConfig, IExt, PExt & PluginExt> {
        const descriptor = plugin(current);
        if (!descriptor || !descriptor.name) {
          throw new Error('UI plugin is invalid or is missing a name');
        }

        installed.push(descriptor as StatelyUiPluginDescriptor<TConfig>);

        const nextState: StatelyRuntime<TConfig, IExt, PExt & PluginExt> = {
          ...current,
          exports: { ...current.exports, ...(descriptor.exports || ({} as PluginExt)) } as PExt &
            PluginExt,
        };

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

function registerCoreComponents(registry: ComponentRegistry) {
  registry.set(makeRegistryKey(NodeType.Array, 'edit'), editFields.ArrayEdit);
  registry.set(makeRegistryKey(NodeType.Array, 'view'), viewFields.ArrayView);

  registry.set(makeRegistryKey(NodeType.Enum, 'edit'), editFields.EnumEdit);
  registry.set(makeRegistryKey(NodeType.Enum, 'view'), viewFields.PrimitiveView);

  registry.set(makeRegistryKey(NodeType.Map, 'edit'), editFields.MapEdit);
  registry.set(makeRegistryKey(NodeType.Map, 'view'), viewFields.MapView);

  registry.set(makeRegistryKey(NodeType.Nullable, 'edit'), editFields.NullableEdit);
  registry.set(makeRegistryKey(NodeType.Nullable, 'view'), viewFields.NullableView);

  registry.set(makeRegistryKey(NodeType.Object, 'edit'), editFields.ObjectEdit);
  registry.set(makeRegistryKey(NodeType.Object, 'view'), viewFields.ObjectView);

  registry.set(makeRegistryKey(NodeType.Primitive, 'edit'), editFields.PrimitiveEdit);
  registry.set(makeRegistryKey(NodeType.Primitive, 'view'), viewFields.PrimitiveView);

  registry.set(makeRegistryKey(NodeType.RecursiveRef, 'edit'), editFields.RecursiveRefEdit);
  registry.set(makeRegistryKey(NodeType.RecursiveRef, 'view'), viewFields.RecursiveRefView);

  registry.set(makeRegistryKey(NodeType.Tuple, 'edit'), editFields.TupleEdit);
  registry.set(makeRegistryKey(NodeType.Tuple, 'view'), viewFields.TupleView);

  registry.set(makeRegistryKey(NodeType.TaggedUnion, 'edit'), editFields.TaggedUnionEdit);
  registry.set(makeRegistryKey(NodeType.TaggedUnion, 'view'), viewFields.TaggedUnionView);

  registry.set(makeRegistryKey(NodeType.UntaggedEnum, 'edit'), editFields.UntaggedEnumEdit);
  registry.set(makeRegistryKey(NodeType.UntaggedEnum, 'view'), viewFields.UntaggedEnumView);

  registry.set(makeRegistryKey(NodeType.Link, 'edit'), linkFields.LinkEdit);
  registry.set(makeRegistryKey(NodeType.Link, 'view'), linkFields.LinkView);
}
