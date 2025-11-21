/**
 * @stately/files - Plugin Implementation
 *
 * This file contains both the schema plugin and UI plugin for the files package.
 * Following the canonical pattern from @stately/schema/core/plugin.ts and @stately/ui/core/plugin.ts
 */

import type { DefinePlugin, Schemas } from '@stately/schema';
import { CoreNodeType } from '@stately/schema/core/nodes';
import type { PluginFactory } from '@stately/schema/stately';
import {
  type AnyUiAugments,
  registry as baseRegistry,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type StatelyRuntime,
  type UiPluginFactory,
} from '@stately/ui/base';
import { FILES_OPERATIONS, type FilesPaths } from './api';
import { primitiveStringTransformer } from './fields/edit/primitive-string';
import { RelativePathEdit } from './fields/edit/relative-path-field';
import { RelativePathFieldView } from './fields/view/relative-path-field';
import type { FilesData, FilesNodeMap, FilesTypes } from './schema';
import { FilesNodeType } from './schema';
import { type FilesUiUtils, type FilesUtils, filesUiUtils } from './utils';

// =============================================================================
// SCHEMA PLUGIN
// =============================================================================

export const FILES_PLUGIN_NAME = 'files' as const;

export type FilesOptions = DefineOptions<{ api: { pathPrefix?: string } }>;

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
  FilesOptions
>;

/**
 * Create files UI plugin
 *
 * Registers file-related components and operations.
 */
export function filesUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends AnyUiAugments = [],
>(options?: FilesOptions): UiPluginFactory<Schema, Augments> {
  return (runtime: StatelyRuntime<Schema, Augments>) => {
    const { registry, client } = runtime;

    // Register components
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'edit'),
      RelativePathEdit,
    );
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'view'),
      RelativePathFieldView,
    );

    // Register transformers
    registry.transformers.set(
      baseRegistry.makeRegistryKey(CoreNodeType.Primitive, 'edit', 'transformer', 'string'),
      primitiveStringTransformer,
    );

    // Create typed operations with user's prefix
    const api = createOperations<FilesPaths, typeof FILES_OPERATIONS>(
      client,
      FILES_OPERATIONS,
      options?.api?.pathPrefix ?? runtime.options.api.pathPrefix,
    );
    const plugin = { [FILES_PLUGIN_NAME]: { api, options, utils: filesUiUtils } };
    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
  };
}
