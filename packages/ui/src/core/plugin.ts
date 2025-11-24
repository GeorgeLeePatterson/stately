import type { Schemas } from '@stately/schema';
import { CORE_OPERATIONS, type CorePaths } from '@stately/schema/core/api';
import type { StateEntry } from '@stately/schema/core/helpers';
import { CoreNodeType } from '@stately/schema/core/nodes';
import { CORE_PLUGIN_NAME } from '@stately/schema/core/plugin';
import { Cog, Dot } from 'lucide-react';
import { createOperations, devLog } from '@/base';
import type { AnyUiPlugin, DefineOptions, DefineUiPlugin, UiPluginFactory } from '@/base/plugin';
import { type ComponentRegistry, makeRegistryKey, type TransformerRegistry } from '@/base/registry';
import type { StatelyUiRuntime, UiNavigationOptions } from '@/base/runtime';
import * as fields from '@/core/components/fields';
import * as editFields from '@/core/components/fields/edit';
import * as viewFields from '@/core/components/fields/view';
import * as linkFields from '@/core/components/views/link';
import type { CoreStateEntry } from '.';
import {
  type CoreUiUtils,
  generateEntityTypeDisplay,
  getDefaultValue,
  getNodeTypeIcon,
  resolveEntityType,
} from './utils';

const NodeType = CoreNodeType;

export interface CoreEntityOptions {
  // Accept any icon component type - consumers may use lucide-react (ForwardRefExoticComponent),
  // or other icon libraries. We only render them as <Icon />, so runtime safety is guaranteed.
  icons: Record<StateEntry, React.ComponentType<any>>;
}

// NOTE: Common headers not used yet
export type CoreUiOptions = DefineOptions<{
  api?: { pathPrefix?: string };
  entities: CoreEntityOptions;
}>;

export type CoreUiPlugin = DefineUiPlugin<
  typeof CORE_PLUGIN_NAME,
  CorePaths,
  typeof CORE_OPERATIONS,
  CoreUiUtils,
  CoreUiOptions
>;

/**
 * Core plugin factory
 *
 * Create the core UI plugin factory.
 * Populates the runtime with core plugin data (components, api, utils).
 * The runtime type already declares CoreUiPlugin; this factory fulfills it.
 */
export function coreUiPlugin<Schema extends Schemas, Augments extends readonly AnyUiPlugin[]>(
  options?: CoreUiOptions,
): UiPluginFactory<Schema, readonly [CoreUiPlugin, ...Augments]> {
  return (runtime: StatelyUiRuntime<Schema, readonly [CoreUiPlugin, ...Augments]>) => {
    // Register core components
    registerCoreComponents(runtime.registry.components);

    // Register core transformers
    registerCoreTransformers(runtime.registry.transformers);

    // Create api bundle
    const pathPrefix = options?.api?.pathPrefix ?? runtime.options?.api?.pathPrefix;
    const api = createOperations<CorePaths, typeof CORE_OPERATIONS>(
      runtime.client,
      CORE_OPERATIONS,
      pathPrefix,
    );
    devLog.debug('Core', 'registered core plugin', { options, pathPrefix, runtime });

    const entityIcons = options?.entities?.icons || {};
    const utils: CoreUiUtils = {
      generateEntityTypeDisplay,
      getDefaultValue,
      getEntityIcon<S extends Schema>(entity: CoreStateEntry<S>) {
        return entityIcons?.[entity] ?? Dot;
      },
      getNodeTypeIcon,
      resolveEntityType,
    };

    const entityRoutes = createEntityRoutes(runtime.schema.data, utils);
    devLog.debug('Core', 'created entity routes', { entityIcons, entityRoutes });

    const plugin = { api, options, routes: entityRoutes, utils };
    return { ...runtime, plugins: { ...runtime.plugins, [CORE_PLUGIN_NAME]: plugin } };
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

function createEntityRoutes<Schema extends Schemas = Schemas>(
  data: Schema['data'],
  utils: CoreUiUtils,
): UiNavigationOptions['routes'] {
  const sidebarItems = utils
    .generateEntityTypeDisplay(data)
    .map(({ entity, label, type }) => ({
      icon: utils.getEntityIcon(entity),
      label,
      to: `/entities/${type}`,
    }));

  return { icon: Cog, items: sidebarItems, label: 'Configuration', to: '/entities' };
}
