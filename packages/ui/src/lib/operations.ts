import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { Client } from 'openapi-fetch';

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

export interface OperationMeta<Config extends StatelyConfig = StatelyConfig> {
  path: keyof StatelySchemas<Config>['paths'] & string;
  method: HttpMethod;
  operationId: string;
}

export type StatelyOperations<Config extends StatelyConfig = StatelyConfig> = {
  [K in StatelyOperationKey]: OperationMeta<Config>;
};

export type OperationOverrides<Config extends StatelyConfig = StatelyConfig> = Partial<{
  [K in StatelyOperationKey]: Pick<OperationMeta<Config>, 'path' | 'method'>;
}>;

const METHOD_KEYS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

export function buildStatelyOperations<Config extends StatelyConfig = StatelyConfig>(
  paths: StatelySchemas<Config>['paths'],
  overrides?: OperationOverrides<Config>,
): StatelyOperations<Config> {
  const entries = Object.entries(DEFAULT_OPERATION_IDS).map(([key, operationId]) => {
    const override = overrides?.[key as StatelyOperationKey];
    if (override) {
      return [key, { ...override, operationId }] as const;
    }
    const resolved = resolveOperation(paths, operationId);
    return [key, resolved] as const;
  });
  return Object.fromEntries(entries) as StatelyOperations<Config>;
}

function resolveOperation<Config extends StatelyConfig>(
  paths: StatelySchemas<Config>['paths'],
  operationId: string,
): OperationMeta<Config> {
  for (const [pathKey, record] of Object.entries(paths ?? {})) {
    for (const method of METHOD_KEYS) {
      const op = (record as Record<string, { operationId?: string }>)[method];
      if (op?.operationId === operationId) {
        return {
          path: pathKey as keyof StatelySchemas<Config>['paths'] & string,
          method,
          operationId,
        };
      }
    }
  }
  throw new Error(
    `Unable to resolve Stately operation "${operationId}". Verify the openapi feature is enabled and the spec was generated with #[stately::axum_api(openapi)].`,
  );
}

export interface StatelyEntityApi<Config extends StatelyConfig = StatelyConfig> {
  listByType(args: {
    type: StatelySchemas<Config>['StateEntry'];
  }): Promise<any>;
  get(args: {
    id: string;
    type: StatelySchemas<Config>['StateEntry'];
  }): Promise<any>;
}

export interface StatelyApi<Config extends StatelyConfig = StatelyConfig> {
  entity: StatelyEntityApi<Config>;
}

export function createStatelyApi<Config extends StatelyConfig = StatelyConfig>(
  client: Client<StatelySchemas<Config>['paths'] & {}>,
  operations: StatelyOperations<Config>,
): StatelyApi<Config> {
  return {
    entity: {
      listByType({ type }) {
        const meta = operations.listEntitiesByType;
        return callClient(client, meta.method, meta.path, {
          params: { path: { type } },
        });
      },
      get({ id, type }) {
        const meta = operations.getEntityById;
        return callClient(client, meta.method, meta.path, {
          params: { path: { id }, query: { type } },
        });
      },
    },
  };
}

function callClient<Config extends StatelyConfig>(
  client: Client<StatelySchemas<Config>['paths'] & {}>,
  method: HttpMethod,
  path: keyof StatelySchemas<Config>['paths'] & string,
  options: any,
): Promise<any> {
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
