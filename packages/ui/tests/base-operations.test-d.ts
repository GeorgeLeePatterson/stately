import type { AnyPaths, OperationBindings, OperationEntry } from '@stately/schema/api';
import type { HttpMethod } from 'openapi-typescript-helpers';
import type { Client } from 'openapi-fetch';
import { createOperations, type TypedOperations } from '../src/base/api';

type AssertTrue<T extends true> = T;
type Equal<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
  ? true
  : false;

interface CanonicalPathsBase {
  '/entity/{id}': {
    get: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': { id: string; name: string } } } };
    };
  };
}

type CanonicalPaths = CanonicalPathsBase & AnyPaths;

type CanonicalOperationMap = { getEntityById: OperationEntry };

const CANONICAL_OPERATIONS = {
  getEntityById: { method: 'get', path: '/entity/{id}' },
} as const satisfies OperationBindings<CanonicalPaths, CanonicalOperationMap>;

type OpsFor<P extends AnyPaths> = OperationBindings<P, CanonicalOperationMap>;

declare const canonicalClient: Client<CanonicalPaths>;
const canonicalApi = createOperations<CanonicalPaths, OpsFor<CanonicalPaths>>(
  canonicalClient,
  CANONICAL_OPERATIONS as OpsFor<CanonicalPaths>,
);

const { data: _ } = await canonicalApi.getEntityById({ params: { path: { id: 'abc' } } });
// @ts-expect-error missing required params
canonicalApi.getEntityById({});

type RuntimePaths = CanonicalPaths & { '/entity/{id}': CanonicalPaths['/entity/{id}'] };

declare const runtimeClient: Client<RuntimePaths>;
const runtimeApi = createOperations<RuntimePaths, OpsFor<RuntimePaths>>(
  runtimeClient,
  CANONICAL_OPERATIONS as OpsFor<RuntimePaths>,
);

type RuntimeResult = Awaited<ReturnType<typeof runtimeApi.getEntityById>>;
type RuntimeData = RuntimeResult['data'];
type ExpectedData =
  CanonicalPaths['/entity/{id}']['get']['responses'][200]['content']['application/json'];

type _DataMatches = AssertTrue<Equal<RuntimeData, ExpectedData | undefined>>;

function useMockEntity<Paths extends RuntimePaths>(
  id: string,
  runtime: TypedOperations<Paths, OpsFor<Paths>>,
) {
  return runtime.getEntityById({ params: { path: { id } } });
}

async function userComponent() {
  const result = await useMockEntity('abc', runtimeApi);
  return result.data?.name;
}

// @ts-expect-error invalid param shape
runtimeApi.getEntityById({ params: { query: { bad: true } } });
