// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file

import {
  type DefineConfig,
  type DefineOperations,
  type DefinePlugin,
  type Schemas,
  stately,
} from '../src';
import type { BaseNode } from '../src/nodes';
import type { DefineData, DefineTypes, DefineUtils } from '../src/plugin';
import type { StatelySchemaConfig } from '../src/schema';
import { createStately, type PluginFactory } from '../src/stately';
import openapiDoc from './mock-openapi.json';
import { PARSED_SCHEMAS } from './mock-schemas';
import type { components, operations, paths } from './mock-types';

/**
 * =============================================================================
 * MOCK PLUGIN: Files Plugin
 * =============================================================================
 * Simulates a plugin that adds file-related node types
 */

const FILES_PLUGIN_NAME = 'files';

type FilesUtils = DefineUtils<{
  formatFileSize: (bytes: number) => string;
  formatTimestamp: (timestamp?: number, withTime?: boolean) => string | null;
}>;

type FilesData = DefineData;

type FilesTypes = DefineTypes<{
  FileSaveRequest: FileSaveRequest;
  FileEntryType: FileEntryType;
  FileVersion: FileVersion;
  FileInfo: FileInfo;
}>;

/**
 * Files schema plugin augment type
 */
type FilesPlugin = DefinePlugin<
  typeof FILES_PLUGIN_NAME,
  FilesNodeMap,
  FilesTypes,
  FilesData,
  FilesUtils
>;

export const filesUtils: FilesUtils = {
  formatFileSize(bytes: number): string {
    return `${bytes}MB`;
  },
  formatTimestamp(_timestamp?: number, _withTime = false): string | null {
    return null;
  },
};

function filesSchemaPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    return {
      ...runtime,
      data: { ...runtime.data },
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: filesUtils },
    };
  };
}

/**
 * =============================================================================
 * SCHEMA TYPES
 * =============================================================================
 */
type Xeo4Operations = DefineOperations<operations>;
type Xeo4Config = DefineConfig<components, paths, Xeo4Operations, typeof PARSED_SCHEMAS>;

export type Xeo4Schemas = Schemas<Xeo4Config, readonly [FilesPlugin]>;
// type Xeo4Schemas = Schemas<Xeo4Config>;

type X = StatelySchemaConfig<Xeo4Schemas>;
type XX = X['nodes'];
type XXX = XX['Pipeline'];

type Y = Xeo4Schemas['plugin'];
type YY = Y['AnyNode'];
type YYY = Y['Nodes'];
type YYYY = Y['NodeNames'];
type YYYYY = Y['NodeTypes'];
type YYYYYY = YYY['array'];

/**
 * SCHEMA RUNTIME
 */

// NOTE: Error in Augments originally
export const xeo4Schema = stately<Xeo4Schemas>(openapiDoc, PARSED_SCHEMAS).withPlugin(
  filesSchemaPlugin(),
);

// NOTE: Error in generated node arg originally
export const xeo4Schema2 = createStately<Xeo4Schemas>(openapiDoc, PARSED_SCHEMAS).withPlugin(
  filesSchemaPlugin(),
);

// export const xeo4Schema = createStately<Xeo4Schemas>(openapiDoc, PARSED_SCHEMAS);
// export const xeo4Schema = stately<Xeo4Schemas>(openapiDoc, PARSED_SCHEMAS);

const relativePathNode: Xeo4Schemas['plugin']['Nodes']['relativePath'] = {
  nodeType: 'relativePath' as const,
};
const relativePathNode2: Xeo4Schemas['plugin']['AnyNode'] = { nodeType: 'relativePath' as const };
const objectNode: Xeo4Schemas['plugin']['Nodes']['object'] = {
  nodeType: 'object',
  properties: { path: relativePathNode },
  required: ['path'],
};

const x = xeo4Schema.data.entityDisplayNames;
const xx = xeo4Schema.data.urlToStateEntry;
const xxx = xeo4Schema.plugins.core.extractNodeType(objectNode);
const xxxx = xeo4Schema.plugins.core.isEntityValid({}, objectNode);
const y = xeo4Schema.plugins.files.formatFileSize(4);
const isValid = xeo4Schema.validate({ data: {}, path: 'relative-path-object', schema: objectNode });

export interface FileSaveRequest {
  /** File content as string */
  content: string;
  /** Optional filename */
  name?: string;
}

/**
 * ------- FILE PLUGIN TYPES --------
 */
export const FilesNodeType = { RelativePath: 'relativePath' } as const;

export type FilesNodeType = (typeof FilesNodeType)[keyof typeof FilesNodeType];

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

export interface FileListQuery {
  /** Optional path to list files from (relative to data directory) */
  path?: string;
}

export interface FileUploadResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Relative path from data directory (e.g., "uploads/config.json") */
  path: string;
  /** The UUID version identifier */
  uuid: string;
  /** Full absolute path on the server */
  full_path: string;
}

export interface FileListResponse {
  /** List of files and directories */
  files: FileInfo[];
}

export type FileEntryType = 'file' | 'directory' | 'versioned_file';

export interface FileVersion {
  /** UUID identifier for this version */
  uuid: string;
  /** Size of this specific version in bytes */
  size: number;
  /** Creation timestamp (Unix epoch seconds) */
  created?: number;
}

export interface FileInfo {
  /** File name (relative path from target directory) */
  name: string;
  /** File size in bytes (latest version for versioned files) */
  size: number;
  /** Entry type: file, directory, or versioned_file */
  type: FileEntryType;
  /** Creation timestamp (Unix epoch seconds) - oldest version for versioned files */
  created?: number;
  /** Last modified timestamp (Unix epoch seconds) - newest version for versioned files */
  modified?: number;
  /** List of all versions (only populated for versioned files) */
  versions?: FileVersion[];
}
