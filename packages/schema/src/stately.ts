/**
 * @statelyjs/schema - Stately Schema Runtime
 *
 * This module provides the schema runtime that powers Stately's form generation
 * and validation. It parses OpenAPI schemas into typed AST nodes and provides
 * utilities for working with entity data.
 *
 * ## Overview
 *
 * The schema runtime is created from two inputs:
 * 1. **OpenAPI document** - The raw JSON/object for runtime introspection
 * 2. **Generated nodes** - Pre-parsed schema nodes from codegen (`PARSED_SCHEMAS`)
 *
 * Type safety comes from your generated TypeScript types, while the OpenAPI
 * document enables runtime features like dynamic field rendering.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { PARSED_SCHEMAS } from './generated/schemas';
 * import openapiDoc from './openapi.json';
 *
 * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
 *
 * // Access schema nodes
 * const pipelineSchema = schema.schema.nodes['Pipeline'];
 *
 * // Validate data
 * const result = schema.validate({
 *   data: { name: 'My Pipeline' },
 *   schema: pipelineSchema,
 *   path: 'Pipeline',
 * });
 * ```
 *
 * ## With Plugins
 *
 * Schema plugins extend the runtime with additional data, utilities, and validation:
 *
 * ```typescript
 * import { corePlugin } from '@statelyjs/stately/core';
 *
 * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
 *   .withPlugin(corePlugin());
 *
 * // Access plugin utilities
 * schema.plugins.core.sortEntityProperties(...);
 * ```
 *
 * @packageDocumentation
 */

import type { DefineOpenApi } from './generated.js';
import { UnknownNodeType } from './nodes.js';
import type { StatelySchemaConfig, StatelySchemas } from './schema.js';
import type { ValidateArgs, ValidateHook, ValidationResult } from './validation.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Factory function for creating schema plugins.
 *
 * A plugin factory receives the current runtime and returns an augmented runtime.
 * Plugins can add data to `runtime.data`, utilities to `runtime.plugins`, and
 * validation hooks.
 *
 * @typeParam S - The application's schema type
 *
 * @example
 * ```typescript
 * const myPlugin: PluginFactory<MySchemas> = (runtime) => ({
 *   ...runtime,
 *   data: { ...runtime.data, myData: computeMyData(runtime) },
 *   plugins: { ...runtime.plugins, myPlugin: { utils: myUtils } },
 * });
 * ```
 */
export type PluginFactory<S extends StatelySchemas<any, any>> = (runtime: Stately<S>) => Stately<S>;

/**
 * Loader function for code-split runtime schemas.
 *
 * When using codegen with entry points, some schemas may be split into a separate
 * bundle for lazy loading. This function loads those schemas on demand.
 *
 * @returns A promise resolving to the additional schema nodes
 */
export type RuntimeSchemaLoader<S extends StatelySchemas<any, any>> = () => Promise<
  Partial<S['config']['nodes']>
>;

/**
 * The Stately schema runtime.
 *
 * Contains the parsed schema nodes, plugin data, and validation utilities.
 * Created via `createStately()`.
 *
 * @typeParam S - The application's schema type
 */
export interface Stately<S extends StatelySchemas<any, any>> {
  /** The schema document and parsed nodes */
  schema: {
    /** Raw OpenAPI document for runtime introspection */
    document: DefineOpenApi<any>;
    /** Pre-parsed schema nodes from codegen */
    nodes: StatelySchemaConfig<S>['nodes'];
  };
  /** Plugin-contributed data (entity caches, computed values, etc.) */
  data: S['data'];
  /** Plugin-contributed utilities and validation hooks */
  plugins: S['utils'];
  /** Validate data against a schema node */
  validate: (args: ValidateArgs<S>) => ValidationResult;
  /**
   * Optional loader for code-split runtime schemas.
   * When provided, RecursiveRef nodes can resolve schemas that were split out during codegen.
   */
  loadRuntimeSchemas?: RuntimeSchemaLoader<S>;
}

/**
 * Builder interface for chaining plugin additions.
 *
 * Extends `Stately` with `withPlugin()` for fluent plugin composition.
 */
export interface StatelyBuilder<S extends StatelySchemas<any, any>> extends Stately<S> {
  /**
   * Add a plugin to the schema runtime.
   *
   * Plugins can contribute data, utilities, and validation hooks.
   * Returns a new builder for chaining.
   *
   * @param plugin - The plugin factory function
   * @returns A new builder with the plugin applied
   */
  withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S>;
}

/**
 * Options for creating a Stately schema runtime.
 */
export interface CreateStatelyOptions<S extends StatelySchemas<any, any>> {
  /**
   * Optional loader for code-split runtime schemas.
   *
   * Provide this when using codegen with entry points to enable lazy loading
   * of schemas that were split out (e.g., recursive schemas).
   *
   * @example
   * ```typescript
   * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS, {
   *   runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
   * });
   * ```
   */
  runtimeSchemas?: RuntimeSchemaLoader<S>;
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a Stately schema runtime.
 *
 * This is the main entry point for creating a schema runtime. The returned
 * builder can be extended with plugins via `withPlugin()`.
 *
 * @typeParam S - Your application's schema type (from `Schemas<DefineConfig<...>>`)
 *
 * @param openapi - The raw OpenAPI document (JSON object)
 * @param generatedNodes - Pre-parsed schema nodes from codegen (`PARSED_SCHEMAS`)
 * @param options - Optional configuration (runtime schema loader, etc.)
 *
 * @returns A schema builder that can be extended with plugins
 *
 * @example Basic usage
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { PARSED_SCHEMAS } from './generated/schemas';
 * import openapiDoc from './openapi.json';
 *
 * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
 * ```
 *
 * @example With plugins
 * ```typescript
 * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
 *   .withPlugin(corePlugin())
 *   .withPlugin(filesPlugin());
 * ```
 *
 * @example With code-split schemas
 * ```typescript
 * const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS, {
 *   runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
 * });
 * ```
 */
export function createStately<S extends StatelySchemas<any, any>>(
  openapi: DefineOpenApi<any>,
  generatedNodes: S['config']['nodes'],
  options?: CreateStatelyOptions<S>,
): StatelyBuilder<S> {
  const baseState: Stately<S> = {
    data: {} as S['data'],
    loadRuntimeSchemas: options?.runtimeSchemas,
    plugins: {} as S['utils'],
    schema: { document: openapi, nodes: generatedNodes },
    validate: args => runValidationPipeline(baseState.plugins, args),
  };

  return (function makeBuilder(state: Stately<S>): StatelyBuilder<S> {
    return {
      ...state,
      validate: args => runValidationPipeline(state.plugins, args),
      withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S> {
        return makeBuilder(plugin({ ...state }));
      },
    };
  })(baseState);
}

function runValidationPipeline<P extends { [key: string]: { validate?: ValidateHook<any> } }>(
  plugins: P,
  args: ValidateArgs<any>,
): ValidationResult {
  const pluginNames = Object.keys(plugins);
  const hooks = Object.values(plugins)
    .filter(plugin => !!plugin?.validate)
    .map(plugin => plugin.validate)
    .filter((hook): hook is ValidateHook<any> => Boolean(hook));

  const { schema, options } = args ?? {};
  const debug = options?.debug;
  if (debug) console.debug('[@statelyjs/schema] (Validation) validating', { args, pluginNames });

  // Handle unknown nodeTypes from codegen - skip validation
  if (schema.nodeType === UnknownNodeType) {
    if (debug)
      console.debug(
        `[@statelyjs/schema] (Validation) Skipping unknown nodeType: ${args.schema.nodeType}`,
      );
    return { errors: [], valid: true };
  }

  if (hooks.length === 0) {
    console.debug('[@statelyjs/schema] (Validation) no validations registered', { args });
    return { errors: [], valid: true };
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { errors: [], valid: true };
}
