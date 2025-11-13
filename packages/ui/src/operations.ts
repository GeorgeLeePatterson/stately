import type { Client } from 'openapi-fetch';
import type { AnyBaseSchemas } from './base';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type DefineOperationMap<T extends Record<string, string> = Record<string, string>> = T;

type BasePaths<Schema extends AnyBaseSchemas> = Schema['config']['paths'];

export interface OperationMeta<Schema extends AnyBaseSchemas = AnyBaseSchemas> {
  path: keyof BasePaths<Schema> & string;
  method: HttpMethod;
  operationId: string;
}

export type OperationIndex<Schema extends AnyBaseSchemas = AnyBaseSchemas> = Record<
  string,
  OperationMeta<Schema>
>;

export type StatelyOperations<Schema extends AnyBaseSchemas, Ops extends DefineOperationMap> = {
  [K in keyof Ops]: OperationMeta<Schema>;
};

export type OperationOverrides<
  Schema extends AnyBaseSchemas,
  Ops extends DefineOperationMap,
> = Partial<{
  [K in keyof Ops]: Pick<OperationMeta<Schema>, 'path' | 'method'>;
}>;

export interface HttpBundle<
  Schema extends AnyBaseSchemas,
  Ops extends DefineOperationMap = DefineOperationMap,
> {
  operationIndex: OperationIndex<Schema>;
  operations: StatelyOperations<Schema, Ops>;
  call(meta: OperationMeta<Schema>, options: unknown): Promise<any>;
}

const METHOD_KEYS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

export function buildOperationIndex<Schema extends AnyBaseSchemas>(
  paths: BasePaths<Schema>,
): OperationIndex<Schema> {
  const index: Partial<OperationIndex<Schema>> = {};
  for (const [pathKey, record] of Object.entries(paths ?? {})) {
    for (const method of METHOD_KEYS) {
      const op = (record as Record<string, { operationId?: string }>)[method];
      if (op?.operationId) {
        index[op.operationId] = {
          method,
          operationId: op.operationId,
          path: pathKey as keyof BasePaths<Schema> & string,
        };
      }
    }
  }
  return index as OperationIndex<Schema>;
}

export function buildStatelyOperations<
  Schema extends AnyBaseSchemas,
  Ops extends DefineOperationMap,
>(
  index: OperationIndex<Schema>,
  operationIds: Ops,
  overrides?: OperationOverrides<Schema, Ops>,
): StatelyOperations<Schema, Ops> {
  const entries = Object.entries(operationIds).map(([key, operationId]) => {
    const typedKey = key as keyof Ops;
    const override = overrides?.[typedKey];
    if (override) {
      return [typedKey, { ...override, operationId }] as const;
    }
    const resolved = index[operationId];
    if (!resolved) {
      throw new Error(
        `Unable to resolve operation "${operationId}". Provide an override for ${key}.`,
      );
    }
    return [typedKey, resolved] as const;
  });
  return Object.fromEntries(entries) as StatelyOperations<Schema, Ops>;
}

export function createHttpBundle<Schema extends AnyBaseSchemas, Ops extends DefineOperationMap>(
  client: Client<BasePaths<Schema>>,
  paths: BasePaths<Schema>,
  operationIds: Ops,
  overrides?: OperationOverrides<Schema, Ops>,
): HttpBundle<Schema, Ops> {
  const operationIndex = buildOperationIndex(paths);
  const operations = buildStatelyOperations(operationIndex, operationIds, overrides);
  return {
    call(meta, options) {
      return callOperation(client, meta, options);
    },
    operationIndex,
    operations,
  };
}

export function callOperation<Schema extends AnyBaseSchemas>(
  client: Client<BasePaths<Schema>>,
  meta: OperationMeta<Schema>,
  options: any,
): Promise<any> {
  const { method, path } = meta;
  const typedClient = client as Client<Record<string, any>>;
  switch (method) {
    case 'get':
      return typedClient.GET(path, options);
    case 'post':
      return typedClient.POST(path, options);
    case 'put':
      return typedClient.PUT(path, options);
    case 'patch':
      return typedClient.PATCH(path, options);
    case 'delete':
      return typedClient.DELETE(path, options);
    default:
      return typedClient.GET(path, options);
  }
}
