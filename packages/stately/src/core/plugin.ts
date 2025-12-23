/**
 * Core UI plugin for Stately.
 *
 * The core plugin provides all the essential functionality for working with
 * Stately entities in the UI:
 *
 * - **API Operations**: CRUD operations for entities (`listEntities`, `getEntity`, etc.)
 * - **Field Components**: Edit and view components for all schema node types
 * - **Navigation Routes**: Sidebar routes for entity management
 * - **Utility Functions**: Entity icons, URL generation, display formatting
 *
 * This plugin is automatically installed when using `statelyUi()` from
 * `@statelyjs/stately`. You don't need to install it manually.
 *
 * @module plugin
 */

import {
  type AnyUiPlugin,
  type ComponentRegistry,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  devLog,
  registry,
  type StatelyUiRuntime,
  type TransformerRegistry,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui';
import { Cog } from 'lucide-react';
import { defaultPrimitiveStringTransformer, EditFields, ViewFields } from '@/core/fields';
import type { Schemas } from '@/core/schema';
import * as linkFields from '@/core/views/link';
import { CORE_OPERATIONS, type CorePaths } from './schema/api';
import type { StateEntry } from './schema/helpers';
import { CoreNodeType as NodeType } from './schema/nodes';
import { CORE_PLUGIN_NAME } from './schema/plugin';
import { type CoreUiUtils, createCoreUtils } from './utils';

const { makeRegistryKey } = registry;

/**
 * Configuration for entity display in the UI.
 */
export interface CoreEntityOptions {
  /** Map of entity type names to icon components for sidebar and headers */
  icons: Record<StateEntry, React.ComponentType<any>>;
}

/**
 * Configuration options for the core plugin.
 *
 * @example
 * ```typescript
 * const runtime = statelyUi<MySchemas>({
 *   // ... other options
 *   core: {
 *     api: { pathPrefix: '/entity' },
 *     entities: {
 *       icons: {
 *         Pipeline: PipelineIcon,
 *         SourceConfig: DatabaseIcon,
 *       }
 *     }
 *   }
 * });
 * ```
 */
export type CoreUiOptions = DefineOptions<{
  /** API configuration for entity endpoints */
  api?: {
    /** Path prefix for entity CRUD endpoints (e.g., '/entity') */
    pathPrefix?: string;
  };
  /** Entity display configuration */
  entities: CoreEntityOptions;
}>;

/**
 * Type definition for the core UI plugin.
 *
 * This type is used internally to provide type-safe access to
 * `runtime.plugins.core`.
 */
export type CoreUiPlugin = DefineUiPlugin<
  typeof CORE_PLUGIN_NAME,
  CorePaths,
  typeof CORE_OPERATIONS,
  CoreUiUtils,
  CoreUiOptions
>;

/** Base path for entity routes in navigation */
export const CoreRouteBasePath = '/entities';

/**
 * Create the core UI plugin.
 *
 * This factory is called internally by `statelyUi()`. You typically don't
 * need to call this directly.
 *
 * The plugin:
 * - Registers field components for all core node types
 * - Creates typed API operations for entity CRUD
 * - Generates navigation routes for each entity type
 * - Provides utility functions for entity display
 *
 * @typeParam Schema - Your application's schema type
 * @typeParam Augments - Additional plugins (used for type composition)
 *
 * @param options - Core plugin configuration
 * @returns A plugin factory function
 *
 * @internal
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
    const basePathPrefix = runtime.options?.api?.pathPrefix;
    const corePathPrefix = options?.api?.pathPrefix;
    const pathPrefix = runtime.utils.mergePathPrefixOptions(basePathPrefix, corePathPrefix);
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

  registry.set(makeRegistryKey(NodeType.Union, 'edit'), EditFields.UnionEdit);
  registry.set(makeRegistryKey(NodeType.Union, 'view'), ViewFields.UnionView);

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
