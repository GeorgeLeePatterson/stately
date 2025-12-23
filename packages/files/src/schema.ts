/**
 * Files plugin schema extensions.
 *
 * This module defines the `RelativePath` node type for handling file paths
 * in Stately schemas. The node type is automatically registered when you
 * add the files plugin to your schema.
 *
 * @module schema
 */

import type { BaseNode, DefineData, DefineTypes } from '@statelyjs/stately/schema';
import type { FileEntryType, FileInfo, FileSaveRequest, FileVersion } from './types/api';

/**
 * Type definitions provided by the files plugin.
 *
 * These types are available in your schema when the files plugin is installed.
 */
export type FilesTypes = DefineTypes<{
  /** Request body for saving file content */
  FileSaveRequest: FileSaveRequest;
  /** Type of file entry (file or directory) */
  FileEntryType: FileEntryType;
  /** File version metadata */
  FileVersion: FileVersion;
  /** Complete file information including versions */
  FileInfo: FileInfo;
}>;

/**
 * Runtime data for the files plugin.
 *
 * Currently empty - no runtime caches or registries are needed.
 */
export type FilesData = DefineData;

/**
 * Node type identifiers for the files plugin.
 */
export const FilesNodeType = {
  /** Represents a path relative to a storage directory */
  RelativePath: 'relativePath',
} as const;

/** Union type of all files plugin node types */
export type TFilesNodeType = (typeof FilesNodeType)[keyof typeof FilesNodeType];

/**
 * Schema node for relative file paths.
 *
 * Used in schemas to represent paths relative to a storage directory.
 * The path can be either a simple string or an object with dir/path properties.
 *
 * @example Schema definition (from OpenAPI)
 * ```yaml
 * ConfigPath:
 *   type: string
 *   x-stately-node: relativePath
 * ```
 *
 * @example Value formats
 * ```typescript
 * // Simple string path
 * const path1: RelativePath = "configs/pipeline.yaml";
 *
 * // Object with directory
 * const path2: RelativePath = { dir: "upload", path: "configs/pipeline.yaml" };
 * ```
 */
export interface RelativePathNode extends BaseNode {
  nodeType: typeof FilesNodeType.RelativePath;
}

/**
 * Node map for files plugin augmentation.
 *
 * Maps node type identifiers to their node definitions for the plugin system.
 */
export type FilesNodeMap = { [FilesNodeType.RelativePath]: RelativePathNode };
