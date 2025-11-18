/**
 * @stately/files - Plugin Implementation
 *
 * This file contains both the schema plugin and UI plugin for the files package.
 * Following the canonical pattern from @stately/schema/core/plugin.ts and @stately/ui/core/plugin.ts
 */

import type { DefinePlugin, Schemas } from '@stately/schema';
import { CoreNodeType } from '@stately/schema/core/nodes';
import type { DefineData, DefineTypes } from '@stately/schema/plugin';
import type { PluginFactory } from '@stately/schema/stately';
import type {
  DefineUiPlugin,
  PluginRuntime,
  StatelyRuntime,
  StatelyUiPluginFactory,
  UiPluginAugment,
} from '@stately/ui';
import { createHttpBundle, makeRegistryKey } from '@stately/ui';
import { primitiveStringTransformer } from './fields/edit/primitive-string';
import { RelativePathEdit } from './fields/edit/relative-path-field';
import { RelativePathFieldView } from './fields/view/relative-path-field';
import { FILES_OPERATION_IDS, type FilesOperationMap } from './operations';
import type { FilesNodeMap } from './schema';
import { FilesNodeType } from './schema';
import type { FileEntryType, FileInfo, FileSaveRequest, FileVersion } from './types/api';
import { type FilesUiPluginUtils, type FilesUtils, filesUiUtils, filesUtils } from './utils';

// =============================================================================
// SCHEMA PLUGIN
// =============================================================================

export const FILES_PLUGIN_NAME = 'files' as const;

/**
 * Files plugin types
 *
 * Currently no additional types needed beyond the node types.
 */
export type FilesTypes = DefineTypes<{
  FileSaveRequest: FileSaveRequest;
  FileEntryType: FileEntryType;
  FileVersion: FileVersion;
  FileInfo: FileInfo;
}>;

/**
 * Files plugin data
 *
 * Currently no runtime data needed (no caches or registries).
 */
export type FilesData = DefineData;

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
export function filesSchemaPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    return {
      ...runtime,
      data: { ...runtime.data },
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: filesUtils },
    };
  };
}

// =============================================================================
// UI PLUGIN
// =============================================================================

/**
 * Files UI plugin runtime type
 */
export type FilesPluginRuntime<S extends Schemas<any, any> = Schemas<any, any>> = PluginRuntime<
  S,
  FilesOperationMap,
  FilesUiPluginUtils
>;

/**
 * Files UI plugin augment type
 */
export type FilesUiPlugin<S extends Schemas<any, any> = Schemas<any, any>> = DefineUiPlugin<
  typeof FILES_PLUGIN_NAME,
  S,
  FilesOperationMap,
  FilesUiPluginUtils
>;

/**
 * Create files UI plugin
 *
 * Registers file-related components and operations.
 */
export function filesUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[] = [],
>(): StatelyUiPluginFactory<Schema, Augments> {
  return (runtime: StatelyRuntime<Schema, Augments>) => {
    const { registry, client, schema } = runtime;

    // Build HTTP operations bundle
    const paths = schema.schema.document.paths as Schema['config']['paths'];
    const api = createHttpBundle(client, paths, FILES_OPERATION_IDS);

    // Register components
    registry.components.set(makeRegistryKey(FilesNodeType.RelativePath, 'edit'), RelativePathEdit);
    registry.components.set(
      makeRegistryKey(FilesNodeType.RelativePath, 'view'),
      RelativePathFieldView,
    );

    // Register transformers
    registry.transformers.set(
      makeRegistryKey(CoreNodeType.Primitive, 'edit', 'transformer', 'string'),
      primitiveStringTransformer,
    );

    const descriptor: FilesPluginRuntime<Schema> = { api, utils: filesUiUtils };

    return {
      client: runtime.client,
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: descriptor },
      registry: runtime.registry,
      schema: runtime.schema,
      utils: runtime.utils,
    };
  };
}
