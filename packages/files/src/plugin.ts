/**
 * @stately/files - Plugin Implementation
 *
 * This file contains both the schema plugin and UI plugin for the files package.
 * Following the canonical pattern from @stately/schema/core/plugin.ts and @stately/ui/core/plugin.ts
 */

import type { DefinePlugin, Schemas } from '@stately/schema';
import type { DefineData, DefineTypes, DefineUtils } from '@stately/schema/plugin';
import type { PluginFactory } from '@stately/schema/stately';
import type {
  DefineUiPlugin,
  PluginRuntime,
  StatelyRuntime,
  StatelyUiPluginFactory,
} from '@stately/ui';
import { createHttpBundle, makeRegistryKey } from '@stately/ui';
import { FileText, Folder, FolderOpen, History } from 'lucide-react';
import type { ComponentType } from 'react';
import { RelativePathField } from './fields/edit/relative-path-field';
import { RelativePathFieldView } from './fields/view/relative-path-field';
import { FILES_OPERATION_IDS, type FilesOperationMap } from './operations';
import type { FilesNodeMap } from './schema';
import { FilesNodeType } from './schema';
import type { FileEntryType, FileInfo, FileSaveRequest, FileVersion } from './types/api';

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
 * Files plugin utilities
 */
export type FilesUtils = DefineUtils<{
  /**
   * Get icon component for a file entry type
   */
  getFileEntryIcon: (entryType: FileEntryType, isSelected?: boolean) => ComponentType<any>;
  /**
   * Format file size in bytes to human-readable string
   */
  formatFileSize: (bytes: number) => string;
  /**
   * Format Unix timestamp to date string
   */
  formatTimestamp: (timestamp?: number, withTime?: boolean) => string | null;
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

/**
 * Files plugin utilities implementation
 */
const filesUtils: FilesUtils = {
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)}MB`;
  },

  formatTimestamp(timestamp?: number, withTime = false): string | null {
    if (timestamp === undefined) return null;
    const date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getTime())) return null;
    return withTime ? date.toLocaleString() : date.toLocaleDateString();
  },

  getFileEntryIcon(entryType: FileEntryType, isSelected = false) {
    switch (entryType) {
      case 'directory':
        return isSelected ? FolderOpen : Folder;
      case 'versioned_file':
        return History;
      default:
        return FileText;
    }
  },
};

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
 * Files UI plugin utilities
 */
export type FilesUiPluginUtils = {
  /**
   * Get the configured operation IDs for the files plugin
   */
  getFilesOperationIds: () => FilesOperationMap;
};

const filesUiUtils: FilesUiPluginUtils = { getFilesOperationIds: () => FILES_OPERATION_IDS };

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
export function createFilesUiPlugin<
  Schema extends Schemas = Schemas,
  Augments extends readonly FilesUiPlugin<Schema>[] = readonly [FilesUiPlugin<Schema>],
>(): StatelyUiPluginFactory<Schema, Augments> {
  return (runtime: StatelyRuntime<Schema, Augments>) => {
    const { registry, client, schema } = runtime;

    // Build HTTP operations bundle
    const paths = schema.schema.document.paths as Schema['config']['paths'];
    const api = createHttpBundle(client, paths, FILES_OPERATION_IDS);

    // Register components
    registry.components.set(makeRegistryKey(FilesNodeType.RelativePath, 'edit'), RelativePathField);
    registry.components.set(
      makeRegistryKey(FilesNodeType.RelativePath, 'view'),
      RelativePathFieldView,
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

/**
 * Default files UI plugin instance
 */
export const filesUiPlugin = createFilesUiPlugin();
