import type { Client, FetchResponse, MaybeOptionalInit } from 'openapi-fetch';
import type { HttpMethod, MediaType } from 'openapi-typescript-helpers';

// Extract operation type using the key, not the path
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
      ? (
          init?: MaybeOptionalInit<Paths[P], M>,
        ) => Promise<FetchResponse<Op, MaybeOptionalInit<Paths[P], M>, Media>>
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

  console.debug('[stately/ui] creating operations: ', { bindings, prefix: strippedPrefix });
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
