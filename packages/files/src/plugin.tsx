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

import { stringModes } from '@statelyjs/stately/core/extensions/add-string-modes';
import { createSchemaPlugin, type DefinePlugin } from '@statelyjs/stately/schema';
import {
  createUiPlugin,
  type DefineOptions,
  type DefineUiPlugin,
  type RouteOption,
  type UiNavigationOptions,
} from '@statelyjs/ui';
import { Files } from 'lucide-react';

import { FILES_OPERATIONS, type FilesPaths } from './api';
import { filesStringExtension } from './fields/edit/primitive-string';
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
 * schema runtime. It should be used with `stately().withPlugin()`.
 *
 * @returns A plugin factory function that augments the runtime
 *
 * @example
 * ```typescript
 * import { stately } from '@statelyjs/stately/schema';
 * import { filesPlugin } from '@statelyjs/files';
 *
 * const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
 *   .withPlugin(filesPlugin());
 * ```
 */
export const filesPlugin = createSchemaPlugin<FilesPlugin>({ name: FILES_PLUGIN_NAME });

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
export const filesUiPlugin = createUiPlugin<FilesUiPlugin>({
  name: FILES_PLUGIN_NAME,
  operations: FILES_OPERATIONS,
  routes: filesRoutes,

  setup: (ctx, options) => {
    log.debug('Files', 'registering', { options });

    // Register components
    ctx.registerComponent(FilesNodeType.RelativePath, 'edit', props => (
      <RelativePathEdit {...props} standalone />
    ));
    ctx.registerComponent(FilesNodeType.RelativePath, 'view', RelativePathView);

    // Extend string field with file upload mode
    stringModes.extend(filesStringExtension);

    log.debug('Files', 'registered plugin', { pathPrefix: ctx.pathPrefix });

    return {};
  },
  utils: filesUiUtils,
});
