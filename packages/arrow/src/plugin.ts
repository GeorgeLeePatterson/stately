/**
 * @statelyjs/arrow - Plugin Implementation
 *
 * @packageDocumentation
 *
 * This module provides the Arrow plugin for Stately, enabling integration with
 * Apache Arrow-based data sources. The package includes both a schema plugin
 * for runtime configuration and a UI plugin for component registration.
 *
 * ## Overview
 *
 * The Arrow plugin enables:
 * - Connection management for various data sources (databases, object stores)
 * - Catalog browsing and schema exploration
 * - Streaming SQL query execution with Apache Arrow
 * - Real-time data visualization
 *
 * ## Usage
 *
 * ### Schema Plugin
 *
 * Add the schema plugin to your Stately configuration:
 *
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { arrowPlugin } from '@statelyjs/arrow';
 *
 * const stately = createStately()
 *   .plugin(arrowPlugin())
 *   .build();
 * ```
 *
 * ### UI Plugin
 *
 * Add the UI plugin to register Arrow components and operations:
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { arrowUiPlugin } from '@statelyjs/arrow';
 *
 * const ui = statelyUi({
 *   plugins: [
 *     arrowUiPlugin({
 *       api: { pathPrefix: '/api/arrow' },
 *       navigation: { routes: { label: 'Data Explorer' } },
 *     }),
 *   ],
 * });
 * ```
 *
 * @module
 */

import type { DefinePlugin, PluginFactory, Schemas } from '@statelyjs/stately/schema';
import {
  type AnyUiPlugin,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type DefineUiUtils,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui';
import type { RouteOption } from '@statelyjs/ui/layout';
import { Database } from 'lucide-react';
import { ARROW_OPERATIONS, type ArrowPaths } from './api';
import { log } from './lib/utils';
import type { ArrowData, ArrowNodeMap, ArrowTypes } from './schema';

// =============================================================================
// SCHEMA PLUGIN
// =============================================================================

export const ARROW_PLUGIN_NAME = 'arrow' as const;

/**
 * Configuration options for the Arrow plugin.
 *
 * @example
 * ```typescript
 * const options: ArrowOptions = {
 *   api: { pathPrefix: '/api/v1/arrow' },
 *   navigation: { routes: { label: 'Data', icon: Database } },
 * };
 * ```
 */
export type ArrowOptions = DefineOptions<{
  /** API configuration for Arrow endpoints */
  api?: { pathPrefix?: string };
  /** Navigation configuration for Arrow routes */
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

/**
 * Arrow plugin utilities.
 *
 * Currently empty but reserved for future utility functions that may be
 * added to the Arrow plugin runtime.
 */
export type ArrowUtils = Record<string, never>;

/**
 * Arrow schema plugin type definition.
 *
 * This type augments the Stately schema runtime with Arrow-specific
 * node types, data structures, and utilities.
 *
 * @see {@link arrowPlugin} - Factory function to create this plugin
 */
export type ArrowPlugin = DefinePlugin<
  typeof ARROW_PLUGIN_NAME,
  ArrowNodeMap,
  ArrowTypes,
  ArrowData,
  ArrowUtils
>;

/** Default navigation route configuration for the Arrow plugin. */
export const arrowRoutes: RouteOption = { icon: Database, label: 'Data', to: '/data' };

/**
 * Creates the Arrow schema plugin factory.
 *
 * This plugin registers Arrow-specific types and utilities into the Stately
 * schema runtime. It should be used with `createStately().plugin()`.
 *
 * @typeParam S - The schemas type, defaults to base Schemas
 * @returns A plugin factory function that augments the runtime
 *
 * @example
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { arrowPlugin } from '@statelyjs/arrow';
 *
 * const stately = createStately()
 *   .plugin(arrowPlugin())
 *   .build();
 * ```
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

/** Arrow UI plugin utilities type. */
export type ArrowUiUtils = DefineUiUtils;

/**
 * Arrow UI plugin type definition.
 *
 * This type defines the shape of the Arrow UI plugin, including its
 * API operations, configuration options, and utilities.
 *
 * @see {@link arrowUiPlugin} - Factory function to create this plugin
 */
export type ArrowUiPlugin = DefineUiPlugin<
  typeof ARROW_PLUGIN_NAME,
  ArrowPaths,
  typeof ARROW_OPERATIONS,
  ArrowUiUtils,
  ArrowOptions
>;

/**
 * Creates the Arrow UI plugin factory.
 *
 * This plugin registers Arrow-specific components, API operations, and
 * navigation routes into the Stately UI runtime. It provides typed access
 * to Arrow API endpoints through React Query hooks.
 *
 * @typeParam Schema - The schemas type, defaults to base Schemas
 * @typeParam Augments - Additional UI plugins already registered
 * @param options - Optional configuration for API paths and navigation
 * @returns A UI plugin factory function that augments the runtime
 *
 * @example
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { arrowUiPlugin } from '@statelyjs/arrow';
 *
 * const ui = statelyUi({
 *   plugins: [
 *     arrowUiPlugin({
 *       api: { pathPrefix: '/api/arrow' },
 *     }),
 *   ],
 * });
 *
 * // Access Arrow API in components
 * const { plugins } = useStatelyUi();
 * const result = await plugins.arrow.api.list_catalogs();
 * ```
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
