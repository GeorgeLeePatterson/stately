import type { CorePaths } from '@stately/schema/core';
import { CORE_OPERATIONS } from '@stately/schema/core/api';
import type { Client, FetchResponse } from 'openapi-fetch';
import { createOperations } from '../src/base/api';

type Assert<T extends true> = T;
type Equal<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
  ? true
  : false;

declare const client: Client<CorePaths>;

const api = createOperations(client, CORE_OPERATIONS);

api.getEntityById({ params: { path: { id: 'valid-id' } } });

// @ts-expect-error - id must be a string path param
api.getEntityById({ params: { path: { id: 123 } } });

type Result = Awaited<ReturnType<(typeof api)['getEntityById']>>;
type Success = Extract<Result, { data: any }>;
type ExpectedData =
  CorePaths['/entity/{id}']['get']['responses'][200]['content']['application/json'];

type _ReturnMatches = Assert<Equal<Success['data'], ExpectedData>>;
type _ResultExtendsFetchResponse = Assert<
  Equal<
    Result,
    FetchResponse<
      CorePaths['/entity/{id}']['get'],
      Parameters<(typeof api)['getEntityById']>[0],
      `${string}/${string}`
    >
  >
>;
