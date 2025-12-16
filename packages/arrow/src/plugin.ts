/**
 * @statelyjs/arrow - Plugin Implementation
 *
 * This file contains both the schema plugin and UI plugin for the arrow package.
 * Following the canonical pattern from @statelyjs/schema/core/plugin.ts and @statelyjs/ui/core/plugin.ts
 */

import {
  type AnyUiPlugin,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type DefineUiUtils,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui/base';
import type { RouteOption } from '@statelyjs/ui/base/layout';
import type { DefinePlugin, PluginFactory, Schemas } from '@statelyjs/ui/schema';
import { Database } from 'lucide-react';
import { ARROW_OPERATIONS, type ArrowPaths } from './api';
import { log } from './lib/utils';
import type { ArrowData, ArrowNodeMap, ArrowTypes } from './schema';

// =============================================================================
// SCHEMA PLUGIN
// =============================================================================

export const ARROW_PLUGIN_NAME = 'arrow' as const;

export type ArrowOptions = DefineOptions<{
  api?: { pathPrefix?: string };
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

/**
 * Arrow plugin utilities
 */
export type ArrowUtils = Record<string, never>;

/**
 * Arrow schema plugin augment type
 */
export type ArrowPlugin = DefinePlugin<
  typeof ARROW_PLUGIN_NAME,
  ArrowNodeMap,
  ArrowTypes,
  ArrowData,
  ArrowUtils
>;

export const arrowRoutes: RouteOption = { icon: Database, label: 'Data', to: '/data' };

/**
 * Create arrow schema plugin
 *
 * Registers file-related utilities for use in components.
 */
export function arrowPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    return {
      ...runtime,
      data: { ...runtime.data },
      plugins: { ...runtime.plugins, [ARROW_PLUGIN_NAME]: {} },
    };
  };
}

// =============================================================================
// UI PLUGIN
// =============================================================================

export type ArrowUiUtils = DefineUiUtils;

/**
 * Arrow UI plugin augment type
 */
export type ArrowUiPlugin = DefineUiPlugin<
  typeof ARROW_PLUGIN_NAME,
  ArrowPaths,
  typeof ARROW_OPERATIONS,
  ArrowUiUtils,
  ArrowOptions
>;

/**
 * Create arrow UI plugin
 *
 * Registers file-related components and operations.
 */
export function arrowUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends readonly AnyUiPlugin[] = [],
>(options?: ArrowOptions): UiPluginFactory<Schema, Augments> {
  return runtime => {
    log.debug('Arrow', 'registering', { options, runtime });

    const { client } = runtime;

    // // Register components
    // registry.components.set(
    //   baseRegistry.makeRegistryKey(ArrowNodeType.RelativePath, 'edit'),
    //   props => <RelativePathEdit {...props} standalone />,
    // );

    // Register transformers
    // TODO: Implement string view type
    // registry.transformers.set(
    //   baseRegistry.makeRegistryKey(CoreNodeType.Primitive, 'edit', 'transformer', 'string'),
    //   primitiveStringTransformer,
    // );

    // Create typed operations with user's prefix
    const basePathPrefix = runtime.options?.api?.pathPrefix;
    const corePathPrefix = options?.api?.pathPrefix;
    const pathPrefix = runtime.utils.mergePathPrefixOptions(basePathPrefix, corePathPrefix);
    const api = createOperations<ArrowPaths, typeof ARROW_OPERATIONS>(
      client,
      ARROW_OPERATIONS,
      pathPrefix,
    );
    log.debug('Arrow', 'registered plugin', { options, pathPrefix, runtime });

    const routes = { ...arrowRoutes, ...(options?.navigation?.routes || {}) };
    log.debug('Arrow', 'registered routes', { routes });

    const plugin = { [ARROW_PLUGIN_NAME]: { api, options, routes } };
    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
  };
}
