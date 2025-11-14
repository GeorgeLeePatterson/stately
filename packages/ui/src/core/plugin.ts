import type { Schemas } from '@stately/schema';
import type { CoreSchemaAugment, CoreStatelyConfig } from '@stately/schema/core/augment';
import { CoreNodeType } from '@stately/schema/core/nodes';
import type { SchemaAugment } from '@stately/schema/plugin';
import type { ComponentType } from 'react';
import * as editFields from '@/core/components/fields/edit';
import * as viewFields from '@/core/components/fields/view';
import * as linkFields from '@/core/components/views/link';
import type { PluginRuntime } from '@/plugin';
import { makeRegistryKey, type UiAugment } from '@/plugin';
import type { ComponentRegistry, StatelyRuntime, StatelyUiPluginFactory } from '@/runtime';
import { buildCoreHttpBundle, type CoreOperationMap } from './operations';
import { generateFieldLabel, getDefaultValue, getNodeTypeIcon } from './utils';
import { CORE_PLUGIN_NAME } from '@stately/schema/core/plugin';

/**
 * =============================================================================
 * CORE PLUGIN TYPES
 * =============================================================================
 */

export type CoreSchemas<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
  Augments extends readonly SchemaAugment<any, any>[] = [],
> = Schemas<Config, Augments>;

type CoreNodeUnion<S extends CoreSchemas> = S['plugin']['AnyNode'];

export type CorePluginUtils<S extends CoreSchemas = CoreSchemas> = {
  getNodeTypeIcon: (nodeType: string) => ComponentType<any>;
  generateFieldLabel: (fieldName: string) => string;
  getDefaultValue: (node: CoreNodeUnion<S>) => any;
};

export type CorePluginRuntime<S extends CoreSchemas = CoreSchemas> = PluginRuntime<
  S,
  CoreOperationMap,
  CorePluginUtils<S>
>;

export type CorePluginName = CoreSchemaAugment<CoreStatelyConfig>['name'];


export type CoreUiAugment<S extends CoreSchemas = CoreSchemas> = UiAugment<
  typeof CORE_PLUGIN_NAME,
  S,
  CoreOperationMap,
  CorePluginUtils<S>
>;

/**
 * =============================================================================
 * CORE PLUGIN FACTORY
 * =============================================================================
 */

/**
 * Create the core UI plugin factory.
 * Populates the runtime with core plugin data (components, api, utils).
 * The runtime type already declares CoreUiAugment; this factory fulfills it.
 */
export function createCoreUiPlugin<
  Schema extends CoreSchemas = CoreSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [
    CoreUiAugment<Schema>,
  ],
>(): StatelyUiPluginFactory<Schema, Augments> {
  return (runtime: StatelyRuntime<Schema, Augments>) => {
    registerCoreComponents(runtime.registry.components);

    // Extract paths from OpenAPI document at runtime
    const paths = runtime.schema.schema.document.paths as Schema['config']['paths'];
    const api = buildCoreHttpBundle(runtime.client, paths);

    const descriptor: CorePluginRuntime<Schema> = {
      api,
      utils: {
        generateFieldLabel,
        getDefaultValue: node => getDefaultValue(node),
        getNodeTypeIcon: (nodeType: string) =>
          getNodeTypeIcon(nodeType, runtime.registry.components),
      },
    };

    return {
      client: runtime.client,
      plugins: { ...runtime.plugins, [CORE_PLUGIN_NAME]: descriptor },
      registry: runtime.registry,
      schema: runtime.schema,
      utils: runtime.utils,
    };
  };
}

function registerCoreComponents(registry: ComponentRegistry) {
  const NodeType = CoreNodeType;
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
