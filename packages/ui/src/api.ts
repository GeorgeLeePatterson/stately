/**
 * API client utilities for creating typed operation bindings (low-level API).
 *
 * This module provides the infrastructure for creating type-safe API clients
 * from OpenAPI operation bindings. It wraps `openapi-fetch` to provide
 * ergonomic, named operations instead of path-based calls.
 *
 * ## For Most Users
 *
 * You don't need to use this directly. The core plugin from `@statelyjs/stately`
 * automatically creates typed API operations for your schema. Access them via:
 *
 * ```typescript
 * const { plugins } = useStatelyUi();
 * const { data } = await plugins.core.api.operations.listEntities(...);
 * ```
 *
 * ## For Plugin Authors
 *
 * Use `createOperations` when building plugins that need their own API clients:
 *
 * ```typescript
 * import { createOperations } from '@statelyjs/ui/api';
 *
 * const OPERATIONS = {
 *   getUser: { method: 'get', path: '/users/{id}' },
 *   createUser: { method: 'post', path: '/users' },
 * } as const;
 *
 * const api = createOperations(client, OPERATIONS, '/api/v1');
 *
 * // Type-safe calls with full inference
 * const { data } = await api.getUser({ params: { path: { id: '123' } } });
 * ```
 *
 * @module api
 */

import type { Client, FetchResponse, MaybeOptionalInit } from 'openapi-fetch';
import type { HttpMethod, MediaType, RequiredKeysOf } from 'openapi-typescript-helpers';
import { devLog } from './lib/logging';
import { stripTrailing } from './utils';

/**
 * Helper type to determine if init parameter should be optional.
 *
 * Uses the same logic as openapi-fetch's InitParam type to determine
 * whether the init object can be omitted (when no required keys exist).
 *
 * @internal
 */
type MaybeOptionalInitParam<Init> = RequiredKeysOf<Init> extends never
  ? [(Init & { [key: string]: unknown })?]
  : [Init & { [key: string]: unknown }];

/**
 * Map of operation names to typed API functions.
 *
 * Transforms operation bindings into callable functions with full type inference.
 * Each operation is a generic function that captures the specific Init type,
 * allowing options like `parseAs: 'arrayBuffer'` to properly transform the
 * response type via openapi-fetch's ParseAsResponse.
 *
 * @typeParam Paths - OpenAPI paths type from generated types
 * @typeParam Bindings - Operation bindings mapping names to method/path pairs
 * @typeParam Media - Media type for responses (defaults to all MediaType)
 *
 * @example
 * ```typescript
 * type MyOperations = TypedOperations<paths, typeof OPERATIONS>;
 *
 * // Each key becomes a typed function
 * const ops: MyOperations = {
 *   getUser: async (init) => { ... },
 *   createUser: async (init) => { ... },
 * };
 * ```
 */
export type TypedOperations<
  Paths,
  Bindings extends Record<string, { method: HttpMethod; path: any }>,
  Media extends MediaType = MediaType,
> = {
  [K in keyof Bindings]: Bindings[K] extends {
    method: infer M extends HttpMethod;
    path: infer P extends keyof Paths;
  }
    ? Paths[P] extends Record<M, infer Op extends Record<string | number, any>>
      ? <Init extends MaybeOptionalInit<Paths[P], M>>(
          ...init: MaybeOptionalInitParam<Init>
        ) => Promise<FetchResponse<Op, Init, Media>>
      : never
    : never;
};

/**
 * Create typed API operations from operation bindings.
 *
 * Takes an openapi-fetch client and operation bindings, returning an object
 * where each key is a typed function that calls the corresponding API endpoint.
 *
 * @typeParam Paths - OpenAPI paths type from generated types
 * @typeParam Bindings - Operation bindings mapping names to method/path pairs
 * @typeParam Media - Media type for responses
 *
 * @param client - An openapi-fetch client instance
 * @param bindings - Object mapping operation names to `{ method, path }` pairs
 * @param prefix - Optional path prefix to prepend to all operations
 *
 * @returns Object with typed operation functions
 *
 * @example
 * ```typescript
 * import createClient from 'openapi-fetch';
 * import type { paths } from './generated';
 *
 * const client = createClient<paths>({ baseUrl: 'https://api.example.com' });
 *
 * const OPERATIONS = {
 *   listUsers: { method: 'get', path: '/users' },
 *   getUser: { method: 'get', path: '/users/{id}' },
 *   createUser: { method: 'post', path: '/users' },
 * } as const;
 *
 * const api = createOperations(client, OPERATIONS);
 *
 * // Fully typed - params, body, and response are all inferred
 * const { data, error } = await api.getUser({
 *   params: { path: { id: '123' } }
 * });
 * ```
 */
export function createOperations<
  Paths extends {},
  Bindings extends Record<string, { method: HttpMethod; path: any }>,
  Media extends MediaType = MediaType,
>(
  client: Client<Paths, Media>,
  bindings: Bindings,
  prefix = '',
): TypedOperations<Paths, Bindings, Media> {
  const strippedPrefix = stripTrailing(prefix);

  devLog.debug('Base', 'creating operations: ', { bindings, prefix: strippedPrefix });
  const result = {} as TypedOperations<Paths, Bindings, Media>;

  for (const key of Object.keys(bindings) as (keyof Bindings)[]) {
    const { method, path } = bindings[key];
    const prefixedPath = stripTrailing(strippedPrefix ? `${strippedPrefix}${path}` : path); // Apply prefix;
    const upperMethod = method.toUpperCase() as Uppercase<HttpMethod>;

    devLog.debug('Api', 'creating operation', { key, method, path, prefixedPath });

    // Bind the client method with the path pre-filled
    result[key] = ((init?: any) => {
      try {
        return (client as any)[upperMethod](prefixedPath, init);
      } catch (error) {
        console.error(
          'Api',
          `Api error (\
          key=${String(key)}, \
          method=${method}, \
          prefixedPath=${prefixedPath}, \
          path=${path})`,
          { error },
        );
        throw error;
      }
    }) as any;
  }

  return result;
}
