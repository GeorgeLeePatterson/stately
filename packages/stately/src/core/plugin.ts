/**
 * Core UI plugin for Stately.
 *
 * The core plugin provides all the essential functionality for working with
 * Stately entities in the UI:
 *
 * - **API Operations**: CRUD operations for entities (`list_entities`, `get_entity`, etc.)
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
  createUiPlugin,
  type DefineOptions,
  type DefineUiPlugin,
  type UiNavigationOptions,
  type UiPluginContext,
} from '@statelyjs/ui';
import { Cog } from 'lucide-react';
import { EditFields, ViewFields } from '@/core/fields';
import type { Schemas } from '@/core/schema';
import * as linkFields from '@/core/views/link';
import { log } from '@/utils';
import { CORE_OPERATIONS, type CorePaths } from './schema/api';
import type { StateEntry } from './schema/helpers';
import { CoreNodeType as NodeType } from './schema/nodes';
import { CORE_PLUGIN_NAME } from './schema/plugin';
import { type CoreUiUtils, createCoreUtils } from './utils';

/**
 * Configuration for entity display in the UI.
 */
export interface CoreEntityOptions {
  /** Map of entity type names to icon components for sidebar and headers */
  icons?: Record<StateEntry, React.ComponentType<any>>;
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
  entities?: CoreEntityOptions;
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
export const coreUiPlugin = createUiPlugin<CoreUiPlugin>({
  name: CORE_PLUGIN_NAME,
  operations: CORE_OPERATIONS,

  setup: (ctx, options) => {
    // Get current runtime
    const runtime = ctx.getRuntime<Schemas, readonly [CoreUiPlugin]>();
    log.debug('Files', 'registering', { options, runtime });

    // Register components
    registerCoreComponents(ctx);

    const utils: CoreUiUtils = createCoreUtils(runtime, options);
    const routes = createEntityRoutes(utils);

    log.debug('Files', 'registered plugin', { pathPrefix: ctx.pathPrefix });

    return { routes, utils };
  },
});

function registerCoreComponents(ctx: UiPluginContext<any, any>) {
  ctx.registerComponent(NodeType.Array, 'edit', EditFields.ArrayEdit);
  ctx.registerComponent(NodeType.Array, 'view', ViewFields.ArrayView);

  ctx.registerComponent(NodeType.Enum, 'edit', EditFields.EnumEdit);
  ctx.registerComponent(NodeType.Enum, 'view', ViewFields.PrimitiveView);

  ctx.registerComponent(NodeType.Map, 'edit', EditFields.MapEdit);
  ctx.registerComponent(NodeType.Map, 'view', ViewFields.MapView);

  ctx.registerComponent(NodeType.Nullable, 'edit', EditFields.NullableEdit);
  ctx.registerComponent(NodeType.Nullable, 'view', ViewFields.NullableView);

  ctx.registerComponent(NodeType.Object, 'edit', EditFields.ObjectEdit);
  ctx.registerComponent(NodeType.Object, 'view', ViewFields.ObjectView);

  ctx.registerComponent(NodeType.Primitive, 'edit', EditFields.PrimitiveEdit);
  ctx.registerComponent(NodeType.Primitive, 'view', ViewFields.PrimitiveView);

  ctx.registerComponent(NodeType.RecursiveRef, 'edit', EditFields.RecursiveRefEdit);
  ctx.registerComponent(NodeType.RecursiveRef, 'view', ViewFields.RecursiveRefView);

  ctx.registerComponent(NodeType.Tuple, 'edit', EditFields.TupleEdit);
  ctx.registerComponent(NodeType.Tuple, 'view', ViewFields.TupleView);

  ctx.registerComponent(NodeType.TaggedUnion, 'edit', EditFields.TaggedUnionEdit);
  ctx.registerComponent(NodeType.TaggedUnion, 'view', ViewFields.TaggedUnionView);

  ctx.registerComponent(NodeType.UntaggedEnum, 'edit', EditFields.UntaggedEnumEdit);
  ctx.registerComponent(NodeType.UntaggedEnum, 'view', ViewFields.UntaggedEnumView);

  ctx.registerComponent(NodeType.Union, 'edit', EditFields.UnionEdit);
  ctx.registerComponent(NodeType.Union, 'view', ViewFields.UnionView);

  ctx.registerComponent(NodeType.Link, 'edit', linkFields.LinkEditView);
  ctx.registerComponent(NodeType.Link, 'view', linkFields.LinkDetailView);
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
