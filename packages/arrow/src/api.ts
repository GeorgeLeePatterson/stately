/**
 * Files Plugin API Operations
 *
 * Defines the canonical API operations for the files plugin.
 */

import { createOperationBindingsFactory, type DefineOperations } from '@stately/schema/api';
import type { DefinePaths } from '@stately/schema/generated';
import type { TypedOperations } from '@stately/ui/base';
import type { operations, paths } from './generated-types';

export type ArrowPaths = DefinePaths<paths>;
export type ArrowOperations = DefineOperations<operations>;

/**
 * Arrow plugin operations definition
 *
 * Maps friendly operation names to their canonical path and method.
 * These paths do NOT include any prefix - that's provided by the user.
 */
export const ARROW_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  execute_query: { method: 'post', path: '/query' },
  list: { method: 'get', path: '/connectors/{connector_id}' },
  list_catalogs: { method: 'get', path: '/catalogs' },
  list_connectors: { method: 'get', path: '/connectors' },
  register: { method: 'get', path: '/register/{connector_id}' },
} as const);

export type ArrowApi = TypedOperations<ArrowPaths, typeof ARROW_OPERATIONS>;
