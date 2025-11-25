/**
 * API Type Utilities
 *
 * Minimal type helpers for defining plugin API operations.
 * Plugin authors define operations that map friendly names to OpenAPI paths.
 */

import type { HttpMethod, PathsWithMethod } from 'openapi-typescript-helpers';

export type AnyPaths = object;

export type OperationEntry = {
  parameters?: Record<string, any>;
  requestBody?: Record<string, any>;
  responses: Record<string | number, any>;
};

export type OperationMap<T = any> = T extends Record<string, OperationEntry> ? T : any;

export type DefineOperations<T extends {} = OperationMap> = {
  [K in keyof T]: OperationEntry;
};
/**
 * Extract the operation definition from Paths at a specific path+method
 */
export type ExtractOperation<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod,
> = Paths[Path] extends Record<Method, infer Op> ? Op : never;

/**
 * Map operation bindings to their actual operation types from the OpenAPI spec.
 * This is what gives you the typed parameters/responses in stately/ui.
 */
export type OperationsFromBindings<
  Paths,
  Bindings extends Record<string, { method: HttpMethod; path: any }>,
> = {
  [K in keyof Bindings]: Bindings[K] extends { method: infer M; path: infer P }
    ? M extends HttpMethod
      ? P extends keyof Paths
        ? ExtractOperation<Paths, P, M>
        : never
      : never
    : never;
};

/**
 * Define operations for a plugin.
 */
export type OperationBindings<Paths, Operations extends OperationMap> = Record<
  keyof Operations,
  { method: HttpMethod; path: Extract<keyof Paths, string> }
>;

/**
 * Type helper to get the validated bindings type WITH literal preservation
 */
export type InferOperationBindings<T> = T extends Record<string, { method: infer M; path: infer P }>
  ? { [K in keyof T]: { method: M; path: P } }
  : never;

/**
 * Factory function
 * @returns OperationBindings<Paths, Ops>
 */
export const createOperationBindingsFactory =
  <Paths extends object, Ops extends OperationMap>() =>
  <const T extends Record<keyof Ops, { method: HttpMethod; path: any }>>(
    ops: T & {
      [K in keyof T]: T[K] extends { method: infer M; path: infer P }
        ? M extends HttpMethod
          ? P extends PathsWithMethod<Paths, M>
            ? { method: M; path: P }
            : never
          : never
        : never;
    },
  ): T => {
    return ops;
  };
