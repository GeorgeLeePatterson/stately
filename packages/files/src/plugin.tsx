/**
 * @statelyjs/files - Plugin Implementation
 *
 * This file contains both the schema plugin and UI plugin for the files package.
 * Following the canonical pattern from @statelyjs/schema/core/plugin.ts and @statelyjs/ui/core/plugin.ts
 */

import { CoreNodeType } from '@statelyjs/stately/core';
import type { DefinePlugin, PluginFactory, Schemas } from '@statelyjs/stately/schema';
import {
  type AnyUiPlugin,
  registry as baseRegistry,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui';
import type { RouteOption } from '@statelyjs/ui/layout';
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

export const FILES_PLUGIN_NAME = 'files' as const;

export type FilesOptions = DefineOptions<{
  api?: { pathPrefix?: string };
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

/**
 * Files schema plugin augment type
 */
export type FilesPlugin = DefinePlugin<
  typeof FILES_PLUGIN_NAME,
  FilesNodeMap,
  FilesTypes,
  FilesData,
  FilesUtils
>;

export const filesRoutes: RouteOption = { icon: Files, label: 'Files', to: '/files' };

/**
 * Create files schema plugin
 *
 * Registers file-related utilities for use in components.
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
 * Files UI plugin augment type
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
 * Create files UI plugin
 *
 * Registers file-related components and operations.
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
