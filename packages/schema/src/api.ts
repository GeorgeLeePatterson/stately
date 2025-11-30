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
 * Define operations for a plugin.
 */
export type OperationBindings<Paths, Operations extends OperationMap> = Record<
  keyof Operations,
  { method: HttpMethod; path: Extract<keyof Paths, string> }
>;

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
