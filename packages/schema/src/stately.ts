/**
 * Stately runtime
 *
 * Lightweight builder that wires OpenAPI-derived schema data into a runtime
 * instance, applies plugins, and exposes helper utilities. The runtime keeps a
 * snapshot of the user-generated OpenAPI document (`data`) plus a registry of
 * helper utilities contributed by plugins. Schema plugins can mutate `runtime.data`,
 * append helpers via `runtime.utils`, and register validation hooks.
 */

import type { OpenAPIV3_1 } from "openapi-types";
import type { StatelyConfig } from "./generated.js";
import {
  runValidationPipeline,
  ValidateHook,
  type ValidateArgs,
  type ValidationResult,
} from "./validation.js";
import { StatelySchemaConfig, StatelySchemas } from "./schema.js";

export interface SchemaRegistry {
  utils: Map<string, (...args: any[]) => unknown>;
}

/**
 * Schema plugin descriptor installed by plugin factory functions.
 */
export interface PluginDescriptor<
  S extends StatelySchemas<StatelyConfig, any>,
> {
  validate?: ValidateHook<S>;
}

/**
 * Runtime plugin factory signature.
 */
export type PluginFactory<S extends StatelySchemas<StatelyConfig, any>> = (
  runtime: Stately<S>,
) => Stately<S>;

export interface Stately<S extends StatelySchemas<any, any>> {
  schema: {
    document: OpenAPIV3_1.Document;
    components: StatelySchemaConfig<S>["components"];
    paths: StatelySchemaConfig<S>["paths"];
    nodes: StatelySchemaConfig<S>["nodes"];
  };
  types: S["types"];
  data: S["data"];
  plugins: S["utils"];
  validate: (args: ValidateArgs<S>) => ValidationResult;
}

export interface StatelyBuilder<S extends StatelySchemas<any, any>>
  extends Stately<S> {
  withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S>;
}

export function createStately<S extends StatelySchemas<any, any>>(
  openapi: OpenAPIV3_1.Document,
  generatedNodes: StatelySchemaConfig<S>["nodes"],
): StatelyBuilder<S> {
  const baseState: Stately<S> = {
    schema: {
      document: openapi,
      components: openapi.components || ({} as S["config"]["components"]),
      paths: openapi.paths || ({} as S["config"]["paths"]),
      nodes: generatedNodes,
    },
    types: {} as S["types"],
    data: {} as S["data"],
    plugins: {} as S["utils"],
    validate: (args) => runValidationPipeline(baseState, args),
  };

  return (function makeBuilder(state: Stately<S>): StatelyBuilder<S> {
    return {
      ...state,
      validate: (args) => runValidationPipeline({ ...state }, args),
      withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S> {
        return makeBuilder(plugin({ ...state }));
      },
    };
  })(baseState);
}
