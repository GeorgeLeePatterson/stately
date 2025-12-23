/**
 * Files plugin API operations.
 *
 * Defines the typed API operations for the files plugin. These operations
 * are available via `runtime.plugins.files.api` when the plugin is installed.
 *
 * ## Available Operations
 *
 * - `list_files` - List files in a directory
 * - `upload` - Upload a new file
 * - `save_file` - Save file content
 * - `download_data` - Download from data directory
 * - `download_cache` - Download from cache directory
 * - `download_upload` - Download from upload directory
 *
 * @example
 * ```typescript
 * const { plugins } = useStatelyUi();
 *
 * // List files
 * const { data } = await plugins.files.api.list_files({
 *   params: { query: { dir: '/configs' } }
 * });
 *
 * // Upload a file
 * await plugins.files.api.upload({ body: formData });
 * ```
 *
 * @module api
 */

import {
  createOperationBindingsFactory,
  type DefineOperations,
  type DefinePaths,
} from '@statelyjs/stately/schema';
import type { TypedOperations } from '@statelyjs/ui';
import type { operations, paths } from './generated/types';

/** OpenAPI paths type for the files plugin */
export type FilesPaths = DefinePaths<paths>;

/** OpenAPI operations type for the files plugin */
export type FilesOperations = DefineOperations<operations>;

/**
 * Files plugin operation bindings.
 *
 * Maps friendly operation names to their HTTP method and path.
 * Paths do NOT include any prefix - that's provided via plugin options.
 */
export const FILES_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  /** Download a file from the cache directory */
  download_cache: { method: 'get', path: '/file/cache/{path}' },
  /** Download a file from the data directory */
  download_data: { method: 'get', path: '/file/data/{path}' },
  /** Download a file from the upload directory */
  download_upload: { method: 'get', path: '/file/upload/{path}' },
  /** List files in a directory */
  list_files: { method: 'get', path: '/list' },
  /** Save content to a file */
  save_file: { method: 'post', path: '/save' },
  /** Upload a file via multipart form */
  upload: { method: 'post', path: '/upload' },
} as const);

/**
 * Typed API client for files operations.
 *
 * Access via `runtime.plugins.files.api`.
 */
export type FilesApi = TypedOperations<FilesPaths, typeof FILES_OPERATIONS>;
