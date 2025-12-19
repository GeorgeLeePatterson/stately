/**
 * Core Plugin API Operations
 *
 * Defines the canonical API operations for the core plugin.
 * These operations are typically generated via proc macros in the Rust crate,
 * but are defined here for the schema level.
 */

import {
  createOperationBindingsFactory,
  type DefineOperations,
  type DefinePaths,
} from '@statelyjs/schema';
import type { operations, paths } from '@/core/generated/types';

export type CorePaths = DefinePaths<paths>;
export type CoreOperations = DefineOperations<operations>;

export const CORE_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  create_entity: { method: 'put', path: '' },
  get_entity_by_id: { method: 'get', path: '/{id}' },
  list_entities: { method: 'get', path: '/list/{type}' },
  patch_entity_by_id: { method: 'patch', path: '/{id}' },
  remove_entity: { method: 'delete', path: '/{entry}/{id}' },
  update_entity: { method: 'post', path: '/{id}' },
});
