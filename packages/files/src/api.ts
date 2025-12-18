/**
 * Files Plugin API Operations
 *
 * Defines the canonical API operations for the files plugin.
 */

import {
  createOperationBindingsFactory,
  type DefineOperations,
  type DefinePaths,
} from '@statelyjs/stately/schema';
import type { TypedOperations } from '@statelyjs/ui';
import type { operations, paths } from './generated/types';

export type FilesPaths = DefinePaths<paths>;
export type FilesOperations = DefineOperations<operations>;

/**
 * Files plugin operations definition
 *
 * Maps friendly operation names to their canonical path and method.
 * These paths do NOT include any prefix - that's provided by the user.
 */
export const FILES_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  download_cache: { method: 'get', path: '/file/cache/{path}' },
  download_data: { method: 'get', path: '/file/data/{path}' },
  download_upload: { method: 'get', path: '/file/upload/{path}' },
  list_files: { method: 'get', path: '/list' },
  save_file: { method: 'post', path: '/save' },
  upload: { method: 'post', path: '/upload' },
} as const);

export type FilesApi = TypedOperations<FilesPaths, typeof FILES_OPERATIONS>;
