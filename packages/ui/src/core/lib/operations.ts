import type { Client } from 'openapi-fetch';
import type { CorePaths, CoreSchemas, CoreStateEntry } from '@/core';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const DEFAULT_OPERATION_IDS = {
  listEntitiesByType: 'list_entities',
  getEntityById: 'get_entity_by_id',
  createEntity: 'create_entity',
  updateEntity: 'update_entity',
  patchEntity: 'patch_entity_by_id',
  deleteEntity: 'remove_entity',
  listEntities: 'list_all_entities',
} as const;

export type StatelyOperationKey = keyof typeof DEFAULT_OPERATION_IDS;

export interface OperationMeta<Schema extends CoreSchemas = CoreSchemas> {
  path: keyof CorePaths<Schema> & string;
  method: HttpMethod;
  operationId: string;
}

export type OperationIndex<Schema extends CoreSchemas = CoreSchemas> = Record<
  string,
  OperationMeta<Schema>
>;

export type StatelyOperations<Schema extends CoreSchemas = CoreSchemas> = {
  [K in StatelyOperationKey]: OperationMeta<Schema>;
};

export type OperationOverrides<Schema extends CoreSchemas = CoreSchemas> = Partial<{
  [K in StatelyOperationKey]: Pick<OperationMeta<Schema>, 'path' | 'method'>;
}>;

const METHOD_KEYS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

export function buildOperationIndex<Schema extends CoreSchemas>(
  paths: CorePaths<Schema>,
): OperationIndex<Schema> {
  const index: Partial<OperationIndex<Schema>> = {};
  for (const [pathKey, record] of Object.entries(paths ?? {})) {
    for (const method of METHOD_KEYS) {
      const op = (record as Record<string, { operationId?: string }>)[method];
      if (op?.operationId) {
        index[op.operationId] = {
          path: pathKey as keyof CorePaths<Schema> & string,
          method,
          operationId: op.operationId,
        };
      }
    }
  }
  return index as OperationIndex<Schema>;
}

export function buildStatelyOperations<Schema extends CoreSchemas = CoreSchemas>(
  index: OperationIndex<Schema>,
  overrides?: OperationOverrides<Schema>,
): StatelyOperations<Schema> {
  const entries = Object.entries(DEFAULT_OPERATION_IDS).map(([key, operationId]) => {
    const override = overrides?.[key as StatelyOperationKey];
    if (override) {
      return [key, { ...override, operationId }] as const;
    }
    const resolved = index[operationId];
    if (!resolved) {
      throw new Error(
        `Unable to resolve Stately operation "${operationId}". Verify the openapi feature is enabled and the spec was generated with #[stately::axum_api(openapi)].`,
      );
    }
    return [key, resolved] as const;
  });
  return Object.fromEntries(entries) as StatelyOperations<Schema>;
}

export interface StatelyEntityApi<Schema extends CoreSchemas = CoreSchemas> {
  listByType(args: {
    type: CoreStateEntry<Schema>;
  }): Promise<any>;
  get(args: {
    id: string;
    type: CoreStateEntry<Schema>;
  }): Promise<any>;
}

export interface StatelyApi<Schema extends CoreSchemas = CoreSchemas> {
  entity: StatelyEntityApi<Schema>;
}

export function createStatelyApi<Schema extends CoreSchemas = CoreSchemas>(
  client: Client<CorePaths<Schema> & {}>,
  operations: StatelyOperations<Schema>,
): StatelyApi<Schema> {
  return {
    entity: {
      listByType({ type }) {
        const meta = operations.listEntitiesByType;
        return callOperation(client, meta, {
          params: { path: { type } },
        });
      },
      get({ id, type }) {
        const meta = operations.getEntityById;
        return callOperation(client, meta, {
          params: { path: { id }, query: { type } },
        });
      },
    },
  };
}

export function callOperation<Schema extends CoreSchemas>(
  client: Client<CorePaths<Schema> & {}>,
  meta: OperationMeta<Schema>,
  options: any,
): Promise<any> {
  const { method, path } = meta;
  const anyClient = client as Client<Record<string, any>>;
  switch (method) {
    case 'get':
      return anyClient.GET(path as any, options);
    case 'post':
      return anyClient.POST(path as any, options);
    case 'put':
      return anyClient.PUT(path as any, options);
    case 'patch':
      return anyClient.PATCH(path as any, options);
    case 'delete':
      return anyClient.DELETE(path as any, options);
    default:
      return anyClient.GET(path as any, options);
  }
}
