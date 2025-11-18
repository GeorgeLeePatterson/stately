import type { Schemas } from '@stately/schema';
import { CORE_OPERATIONS, type CorePaths } from '@stately/schema/core/api';
import { CoreNodeType } from '@stately/schema/core/nodes';
import { CORE_PLUGIN_NAME } from '@stately/schema/core/plugin';
import type { BaseNode } from '@stately/schema/nodes';
import type { ComponentType } from 'react';
import { createOperations } from '@/base';
import type { AnyUiPlugin } from '@/base/plugin';
import { type ComponentRegistry, makeRegistryKey, type TransformerRegistry } from '@/base/registry';
import type { StatelyRuntime, StatelyUiPluginFactory } from '@/base/runtime';
import * as fields from '@/core/components/fields';
import * as editFields from '@/core/components/fields/edit';
import * as viewFields from '@/core/components/fields/view';
import * as linkFields from '@/core/components/views/link';
import type { DefineUiPlugin } from '..';
import { generateFieldLabel, getDefaultValue, getNodeTypeIcon } from './utils';

const NodeType = CoreNodeType;

export type CorePluginUtils = {
  getNodeTypeIcon: (nodeType: string) => ComponentType<any>;
  generateFieldLabel: (fieldName: string) => string;
  getDefaultValue: (node: BaseNode) => any;
};

export type CoreUiPlugin = DefineUiPlugin<
  typeof CORE_PLUGIN_NAME,
  CorePaths,
  typeof CORE_OPERATIONS,
  CorePluginUtils
>;

/**
 * Core plugin factory
 *
 * Create the core UI plugin factory.
 * Populates the runtime with core plugin data (components, api, utils).
 * The runtime type already declares CoreUiAugment; this factory fulfills it.
 */
export function coreUiPlugin<Schema extends Schemas, Augments extends readonly AnyUiPlugin[]>({
  pathPrefix = '',
}: {
  pathPrefix?: string;
}): StatelyUiPluginFactory<Schema, readonly [CoreUiPlugin, ...Augments]> {
  return (runtime: StatelyRuntime<Schema, readonly [CoreUiPlugin, ...Augments]>) => {
    // Register core components
    registerCoreComponents(runtime.registry.components);

    // Register core transformers
    registerCoreTransformers(runtime.registry.transformers);

    // Create api bundle
    const api = createOperations<CorePaths, typeof CORE_OPERATIONS>(
      runtime.client,
      CORE_OPERATIONS,
      pathPrefix,
    );

    return {
      client: runtime.client,
      plugins: {
        ...runtime.plugins,
        [CORE_PLUGIN_NAME]: {
          api,
          utils: { generateFieldLabel, getDefaultValue, getNodeTypeIcon },
        },
      },
      registry: runtime.registry,
      schema: runtime.schema,
      utils: runtime.utils,
    };
  };
}

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

function registerCoreTransformers(registry: TransformerRegistry) {
  /** Add any plugin enhancements here */
  registry.set(
    makeRegistryKey(NodeType.Primitive, 'edit', 'transformer', 'string'),
    fields.defaultPrimitiveStringTransformer,
  );
}
