/**
 * Files Plugin API Operations
 *
 * Defines the canonical API operations for the files plugin.
 */

import type { DefinePaths } from '@statelyjs/stately/schema';
import { createOperationBindingsFactory, type DefineOperations } from '@statelyjs/stately/schema';
import type { TypedOperations } from '@statelyjs/ui';
import type { operations, paths } from './generated/types';

export type ArrowPaths = DefinePaths<paths>;
export type ArrowOperations = DefineOperations<operations>;

/**
 * Arrow plugin operations definition
 *
 * Maps friendly operation names to their canonical path and method.
 * These paths do NOT include any prefix - that's provided by the user.
 */
export const ARROW_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  connector_list: { method: 'get', path: '/connectors/{connector_id}' },
  connector_list_many: { method: 'post', path: '/connectors' },
  execute_query: { method: 'post', path: '/query' },
  list_catalogs: { method: 'get', path: '/catalogs' },
  list_connectors: { method: 'get', path: '/connectors' },
  list_registered: { method: 'get', path: '/register' },
  register: { method: 'get', path: '/register/{connector_id}' },
} as const);

export type ArrowApi = TypedOperations<ArrowPaths, typeof ARROW_OPERATIONS>;
