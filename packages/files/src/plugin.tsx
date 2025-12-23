/**
 * @statelyjs/files - Plugin Implementation
 *
 * @packageDocumentation
 *
 * This module provides the Files plugin for Stately, enabling file system
 * integration including file browsing, uploads, downloads, and versioning.
 * The package includes both a schema plugin for runtime configuration and
 * a UI plugin for component registration.
 *
 * ## Overview
 *
 * The Files plugin enables:
 * - File browsing with directory navigation
 * - File uploads with automatic versioning
 * - File downloads from cache, data, or upload directories
 * - Relative path field components for forms
 * - File version management
 *
 * ## Usage
 *
 * ### Schema Plugin
 *
 * Add the schema plugin to your Stately configuration:
 *
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { filesPlugin } from '@statelyjs/files';
 *
 * const stately = createStately()
 *   .plugin(filesPlugin())
 *   .build();
 * ```
 *
 * ### UI Plugin
 *
 * Add the UI plugin to register file-related components and operations:
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { filesUiPlugin } from '@statelyjs/files';
 *
 * const ui = statelyUi({
 *   plugins: [
 *     filesUiPlugin({
 *       api: { pathPrefix: '/api/files' },
 *       navigation: { routes: { label: 'File Manager' } },
 *     }),
 *   ],
 * });
 * ```
 *
 * @module
 */

import { CoreNodeType } from '@statelyjs/stately/core';
import type { DefinePlugin, PluginFactory, Schemas } from '@statelyjs/stately/schema';
import type { RouteOption } from '@statelyjs/ui';
import {
  type AnyUiPlugin,
  registry as baseRegistry,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui';
import { Files } from 'lucide-react';

import { FILES_OPERATIONS, type FilesPaths } from './api';
import { primitiveStringTransformer } from './fields/edit/primitive-string';
import { RelativePathEdit } from './fields/edit/relative-path-field';
import { RelativePathView } from './fields/view/relative-path-field';
import type { FilesData, FilesNodeMap, FilesTypes } from './schema';
import { FilesNodeType } from './schema';
import { type FilesUiUtils, type FilesUtils, filesUiUtils, log } from './utils';

// =============================================================================
// SCHEMA PLUGIN
// =============================================================================

/** Plugin identifier for the Files plugin. */
export const FILES_PLUGIN_NAME = 'files' as const;

/**
 * Configuration options for the Files plugin.
 *
 * @example
 * ```typescript
 * const options: FilesOptions = {
 *   api: { pathPrefix: '/api/v1/files' },
 *   navigation: { routes: { label: 'Documents', icon: FileIcon } },
 * };
 * ```
 */
export type FilesOptions = DefineOptions<{
  /** API configuration for Files endpoints */
  api?: { pathPrefix?: string };
  /** Navigation configuration for Files routes */
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

/**
 * Files schema plugin type definition.
 *
 * This type augments the Stately schema runtime with file-related
 * node types, data structures, and utilities.
 *
 * @see {@link filesPlugin} - Factory function to create this plugin
 */
export type FilesPlugin = DefinePlugin<
  typeof FILES_PLUGIN_NAME,
  FilesNodeMap,
  FilesTypes,
  FilesData,
  FilesUtils
>;

/** Default navigation route configuration for the Files plugin. */
export const filesRoutes: RouteOption = { icon: Files, label: 'Files', to: '/files' };

/**
 * Creates the Files schema plugin factory.
 *
 * This plugin registers file-related types and utilities into the Stately
 * schema runtime. It should be used with `createStately().plugin()`.
 *
 * @typeParam S - The schemas type, defaults to base Schemas
 * @returns A plugin factory function that augments the runtime
 *
 * @example
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { filesPlugin } from '@statelyjs/files';
 *
 * const stately = createStately()
 *   .plugin(filesPlugin())
 *   .build();
 * ```
 */
export function filesPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    return {
      ...runtime,
      data: { ...runtime.data },
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: {} },
    };
  };
}

// =============================================================================
// UI PLUGIN
// =============================================================================

/**
 * Files UI plugin type definition.
 *
 * This type defines the shape of the Files UI plugin, including its
 * API operations, configuration options, and utilities.
 *
 * @see {@link filesUiPlugin} - Factory function to create this plugin
 */
export type FilesUiPlugin = DefineUiPlugin<
  typeof FILES_PLUGIN_NAME,
  FilesPaths,
  typeof FILES_OPERATIONS,
  FilesUiUtils,
  FilesOptions,
  typeof filesRoutes
>;

/**
 * Creates the Files UI plugin factory.
 *
 * This plugin registers file-related components, API operations, and
 * navigation routes into the Stately UI runtime. It provides:
 * - RelativePath field components for edit and view modes
 * - String primitive transformers
 * - Typed API operations for file management
 *
 * @typeParam Schema - The schemas type, defaults to base Schemas
 * @typeParam Augments - Additional UI plugins already registered
 * @param options - Optional configuration for API paths and navigation
 * @returns A UI plugin factory function that augments the runtime
 *
 * @example
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { filesUiPlugin } from '@statelyjs/files';
 *
 * const ui = statelyUi({
 *   plugins: [
 *     filesUiPlugin({
 *       api: { pathPrefix: '/api/files' },
 *     }),
 *   ],
 * });
 *
 * // Access Files API in components
 * const { plugins } = useStatelyUi();
 * const result = await plugins.files.api.list_files();
 * ```
 */
export function filesUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends readonly AnyUiPlugin[] = [],
>(options?: FilesOptions): UiPluginFactory<Schema, Augments> {
  return runtime => {
    log.debug('Files', 'registering', { options, runtime });

    const { registry, client } = runtime;

    // Register components
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'edit'),
      props => <RelativePathEdit {...props} standalone />,
    );
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'view'),
      RelativePathView,
    );

    // Register transformers
    registry.transformers.set(
      baseRegistry.makeRegistryKey(CoreNodeType.Primitive, 'edit', 'transformer', 'string'),
      primitiveStringTransformer,
    );

    // Create typed operations with user's prefix
    const basePathPrefix = runtime.options?.api?.pathPrefix;
    const corePathPrefix = options?.api?.pathPrefix;
    const pathPrefix = runtime.utils.mergePathPrefixOptions(basePathPrefix, corePathPrefix);
    const api = createOperations<FilesPaths, typeof FILES_OPERATIONS>(
      client,
      FILES_OPERATIONS,
      pathPrefix,
    );
    log.debug('Files', 'registered plugin', { options, pathPrefix, runtime });

    // Files only supports a top level route, only provides a single page.
    const routes = { ...filesRoutes, ...(options?.navigation?.routes || {}) };
    log.debug('Files', 'registered routes', { routes });

    const plugin = { [FILES_PLUGIN_NAME]: { api, options, routes, utils: filesUiUtils } };
    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
  };
}
