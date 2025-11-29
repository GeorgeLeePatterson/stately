/**
 * Files Plugin API Operations
 *
 * Defines the canonical API operations for the files plugin.
 */

import { createOperationBindingsFactory, type DefineOperations } from '@stately/schema/api';
import type { DefinePaths } from '@stately/schema/generated';
import type { TypedOperations } from '@stately/ui/base';
import type { operations, paths } from './generated-types';

export type FilesPaths = DefinePaths<paths>;
export type FilesOperations = DefineOperations<operations>;

/**
 * Files plugin operations definition
 *
 * Maps friendly operation names to their canonical path and method.
 * These paths do NOT include any prefix - that's provided by the user.
 */
export const FILES_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  list: { method: 'get', path: '/list' },
  save: { method: 'post', path: '/save' },
  upload: { method: 'post', path: '/upload' },
} as const);

export type FilesApi = TypedOperations<FilesPaths, typeof FILES_OPERATIONS>;
