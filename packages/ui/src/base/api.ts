import type { Client, FetchResponse, MaybeOptionalInit } from 'openapi-fetch';
import type { HttpMethod, MediaType, RequiredKeysOf } from 'openapi-typescript-helpers';
import { devLog } from './lib/utils';

/**
 * Helper type to determine if init parameter should be optional.
 * Uses the same logic as openapi-fetch's InitParam type.
 */
type MaybeOptionalInitParam<Init> = RequiredKeysOf<Init> extends never
  ? [(Init & { [key: string]: unknown })?]
  : [Init & { [key: string]: unknown }];

/**
 * Extract operation type using the key, not the path.
 *
 * Each operation is a generic function that captures the specific Init type,
 * allowing options like `parseAs: 'arrayBuffer'` to properly transform the
 * response type via openapi-fetch's ParseAsResponse.
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

export function createOperations<
  Paths extends {},
  Bindings extends Record<string, { method: HttpMethod; path: any }>,
  Media extends MediaType = MediaType,
>(
  client: Client<Paths, Media>,
  bindings: Bindings,
  prefix = '',
): TypedOperations<Paths, Bindings, Media> {
  const strippedPrefix = prefix?.endsWith('/') ? prefix.slice(0, -1) : prefix;

  devLog.debug('creating operations: ', { bindings, prefix: strippedPrefix });
  const result = {} as TypedOperations<Paths, Bindings, Media>;

  for (const key of Object.keys(bindings) as (keyof Bindings)[]) {
    const { method, path } = bindings[key];
    const prefixedPath = strippedPrefix ? `${strippedPrefix}${path}` : path; // Apply prefix;
    const upperMethod = method.toUpperCase() as Uppercase<HttpMethod>;

    // Bind the client method with the path pre-filled
    result[key] = ((init?: any) => {
      return (client as any)[upperMethod](prefixedPath, init);
    }) as any;
  }

  return result;
}
