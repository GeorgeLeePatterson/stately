/**
 * @statelyjs/files - Schema Extensions
 *
 * Defines the RelativePath node type for file path handling
 */

import type { BaseNode, DefineData, DefineTypes } from '@statelyjs/ui/schema';
import type { FileEntryType, FileInfo, FileSaveRequest, FileVersion } from './types/api';

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
 * Node type for relative paths
 */
export const FilesNodeType = { RelativePath: 'relativePath' } as const;

export type TFilesNodeType = (typeof FilesNodeType)[keyof typeof FilesNodeType];

/**
 * RelativePath: Path relative to app directory
 *
 * This can be:
 * - A string path: "path/to/file.txt"
 * - An object with dir/path: { dir: "upload", path: "file.txt" }
 */
export interface RelativePathNode extends BaseNode {
  nodeType: typeof FilesNodeType.RelativePath;
}

/**
 * Files node map for plugin augment
 */
export type FilesNodeMap = { [FilesNodeType.RelativePath]: RelativePathNode };
