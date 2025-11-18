/**
 * Stately runtime
 *
 * Lightweight builder that wires schema data into a runtime instance, applies plugins,
 * and exposes helper utilities. The runtime keeps a snapshot of the raw OpenAPI document
 * for runtime introspection, plus a registry of helper utilities contributed by plugins.
 * Schema plugins can mutate `runtime.data`, append helpers via `runtime.utils`, and
 * register validation hooks.
 *
 * Type safety comes from the generated TypeScript types passed to StatelyConfig, while
 * the raw OpenAPI document is used purely for runtime introspection.
 */

import type { DefineOpenApi } from './generated.js';
import type { StatelySchemaConfig, StatelySchemas } from './schema.js';
import {
  runValidationPipeline,
  type ValidateArgs,
  type ValidateHook,
  type ValidationResult,
} from './validation.js';

export interface SchemaRegistry {
  utils: Map<string, (...args: any[]) => unknown>;
}

/**
 * Schema plugin descriptor installed by plugin factory functions.
 */
export interface PluginDescriptor<S extends StatelySchemas<any, any>> {
  validate?: ValidateHook<S>;
}

/**
 * Runtime plugin factory signature.
 */
export type PluginFactory<S extends StatelySchemas<any, any>> = (runtime: Stately<S>) => Stately<S>;

export interface Stately<S extends StatelySchemas<any, any>> {
  schema: { document: DefineOpenApi<any>; nodes: StatelySchemaConfig<S>['nodes'] };
  data: S['data'];
  plugins: S['utils'];
  validate: (args: ValidateArgs<S>) => ValidationResult;
}

export interface StatelyBuilder<S extends StatelySchemas<any, any>> extends Stately<S> {
  withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S>;
}

// export type StatelySchemaConfig<S> = S extends StatelySchemas<infer Config, any> ? Config : never;

export function createStately<S extends StatelySchemas<any, any>>(
  openapi: DefineOpenApi<any>,
  generatedNodes: S['config']['nodes'],
): StatelyBuilder<S> {
  const baseState: Stately<S> = {
    data: {} as S['data'],
    plugins: {} as S['utils'],
    schema: { document: openapi, nodes: generatedNodes },
    validate: args => runValidationPipeline(baseState, args),
  };

  return (function makeBuilder(state: Stately<S>): StatelyBuilder<S> {
    return {
      ...state,
      validate: args => runValidationPipeline({ ...state }, args),
      withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S> {
        return makeBuilder(plugin({ ...state }));
      },
    };
  })(baseState);
}
