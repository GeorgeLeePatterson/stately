import type { Schemas } from '@stately/schema';
import { CORE_OPERATIONS, type CorePaths } from '@stately/schema/core/api';
import type { StateEntry } from '@stately/schema/core/helpers';
import { CoreNodeType as NodeType } from '@stately/schema/core/nodes';
import { CORE_PLUGIN_NAME } from '@stately/schema/core/plugin';
import { Cog } from 'lucide-react';
import { createOperations, devLog } from '@/base';
import type { AnyUiPlugin, DefineOptions, DefineUiPlugin, UiPluginFactory } from '@/base/plugin';
import { type ComponentRegistry, makeRegistryKey, type TransformerRegistry } from '@/base/registry';
import type { StatelyUiRuntime, UiNavigationOptions } from '@/base/runtime';
import { defaultPrimitiveStringTransformer, EditFields, ViewFields } from '@/core/fields';
import * as linkFields from '@/core/views/link';
import { type CoreUiUtils, createCoreUtils } from './utils';

export interface CoreEntityOptions {
  icons: Record<StateEntry, React.ComponentType<any>>;
}

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

export const CoreRouteBasePath = '/entities';

/**
 * Core plugin factory
 *
 * Create the core UI plugin factory.
 * Populates the runtime with core plugin data (components, api, utils, routes).
 * The runtime type exported from the root already declares CoreUiPlugin; this factory fulfills it.
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

    // Gather utils
    const entityIcons = options?.entities?.icons || {};
    const utils: CoreUiUtils = createCoreUtils(runtime, options);

    // Create entity routes
    const entityRoutes = createEntityRoutes(utils);
    devLog.debug('Core', 'created entity routes', { entityIcons, entityRoutes });

    // Create plugin
    const plugin = { [CORE_PLUGIN_NAME]: { api, options, routes: entityRoutes, utils } };

    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
  };
}

function registerCoreComponents(registry: ComponentRegistry) {
  registry.set(makeRegistryKey(NodeType.Array, 'edit'), EditFields.ArrayEdit);
  registry.set(makeRegistryKey(NodeType.Array, 'view'), ViewFields.ArrayView);

  registry.set(makeRegistryKey(NodeType.Enum, 'edit'), EditFields.EnumEdit);
  registry.set(makeRegistryKey(NodeType.Enum, 'view'), ViewFields.PrimitiveView);

  registry.set(makeRegistryKey(NodeType.Map, 'edit'), EditFields.MapEdit);
  registry.set(makeRegistryKey(NodeType.Map, 'view'), ViewFields.MapView);

  registry.set(makeRegistryKey(NodeType.Nullable, 'edit'), EditFields.NullableEdit);
  registry.set(makeRegistryKey(NodeType.Nullable, 'view'), ViewFields.NullableView);

  registry.set(makeRegistryKey(NodeType.Object, 'edit'), EditFields.ObjectEdit);
  registry.set(makeRegistryKey(NodeType.Object, 'view'), ViewFields.ObjectView);

  registry.set(makeRegistryKey(NodeType.Primitive, 'edit'), EditFields.PrimitiveEdit);
  registry.set(makeRegistryKey(NodeType.Primitive, 'view'), ViewFields.PrimitiveView);

  registry.set(makeRegistryKey(NodeType.RecursiveRef, 'edit'), EditFields.RecursiveRefEdit);
  registry.set(makeRegistryKey(NodeType.RecursiveRef, 'view'), ViewFields.RecursiveRefView);

  registry.set(makeRegistryKey(NodeType.Tuple, 'edit'), EditFields.TupleEdit);
  registry.set(makeRegistryKey(NodeType.Tuple, 'view'), ViewFields.TupleView);

  registry.set(makeRegistryKey(NodeType.TaggedUnion, 'edit'), EditFields.TaggedUnionEdit);
  registry.set(makeRegistryKey(NodeType.TaggedUnion, 'view'), ViewFields.TaggedUnionView);

  registry.set(makeRegistryKey(NodeType.UntaggedEnum, 'edit'), EditFields.UntaggedEnumEdit);
  registry.set(makeRegistryKey(NodeType.UntaggedEnum, 'view'), ViewFields.UntaggedEnumView);

  registry.set(makeRegistryKey(NodeType.Link, 'edit'), linkFields.LinkEditView);
  registry.set(makeRegistryKey(NodeType.Link, 'view'), linkFields.LinkDetailView);
}

function registerCoreTransformers(registry: TransformerRegistry) {
  /** Add any plugin enhancements here */
  registry.set(
    makeRegistryKey(NodeType.Primitive, 'edit', 'transformer', 'string'),
    defaultPrimitiveStringTransformer,
  );
}

function createEntityRoutes(utils: CoreUiUtils): UiNavigationOptions['routes'] {
  const sidebarItems = utils.generateEntityTypeDisplay().map(({ entity, label, urlPath }) => ({
    icon: utils.getEntityIcon(entity),
    label,
    // Skip the base path since the sidebar uses it
    to: utils.resolveEntityUrl({ type: urlPath }, undefined, true),
  }));

  return { icon: Cog, items: sidebarItems, label: 'Configuration', to: utils.resolveEntityUrl({}) };
}
