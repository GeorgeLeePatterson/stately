import type { Schemas } from '@stately/schema';
import type { Client } from 'openapi-fetch';
import {
  createHttpBundle,
  type DefineOperationMap,
  type HttpBundle,
  type OperationOverrides,
} from '@/base/operations';
import type { CorePaths } from '.';

export const CORE_OPERATION_IDS = {
  createEntity: 'create_entity',
  deleteEntity: 'remove_entity',
  getEntityById: 'get_entity_by_id',
  listEntities: 'list_all_entities',
  listEntitiesByType: 'list_entities',
  patchEntity: 'patch_entity_by_id',
  updateEntity: 'update_entity',
} as const satisfies DefineOperationMap;

export type CoreOperationMap = typeof CORE_OPERATION_IDS;

export type CoreHttpBundle<Schema extends Schemas<any, any>> = HttpBundle<Schema, CoreOperationMap>;

export function buildCoreHttpBundle<Schema extends Schemas<any, any>>(
  client: Client<CorePaths<Schema>>,
  paths: CorePaths<Schema>,
  overrides?: OperationOverrides<Schema, CoreOperationMap>,
): CoreHttpBundle<Schema> {
  return createHttpBundle(client, paths, CORE_OPERATION_IDS, overrides);
}
