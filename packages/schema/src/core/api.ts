/**
 * Core Plugin API Operations
 *
 * Defines the canonical API operations for the core plugin.
 * These operations are typically generated via proc macros in the Rust crate,
 * but are defined here for the schema level.
 */

import { createOperationBindingsFactory, type DefineOperations } from '../api.js';
import type { DefinePaths } from '../generated.js';
import type { operations, paths } from './generated-types';

export type CorePaths = DefinePaths<paths>;
export type CoreOperations = DefineOperations<operations>;

export const CORE_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  create_entity: { method: 'put', path: '/entity' },
  get_entity_by_id: { method: 'get', path: '/entity/{id}' },
  list_entities: { method: 'get', path: '/entity/list/{type}' },
  patch_entity_by_id: { method: 'patch', path: '/entity/{id}' },
  remove_entity: { method: 'delete', path: '/entity/{entry}/{id}' },
  update_entity: { method: 'post', path: '/entity/{id}' },
});
