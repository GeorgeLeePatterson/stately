/**
 * Stately schema types and utilities.
 *
 * This module provides the main schema types for Stately applications.
 * It re-exports types from `@statelyjs/schema` and adds the core plugin
 * types automatically.
 *
 * ## Key Types
 *
 * - **`DefineConfig`** - Define your application's schema configuration
 * - **`Schemas`** - The schema type used throughout your app
 * - **`stately`** - Factory function to create a schema runtime
 *
 * @example
 * ```typescript
 * import { stately, type DefineConfig, type Schemas } from '@statelyjs/stately/schema';
 * import type { components, paths, operations } from './generated/types';
 * import { PARSED_SCHEMAS } from './generated/schemas';
 *
 * // Define your schema configuration
 * type MyConfig = DefineConfig<components, paths, operations>;
 *
 * // Create the schemas type for your app
 * type MySchemas = Schemas<MyConfig>;
 *
 * // Create the runtime
 * const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
 * ```
 *
 * @module schema
 */

import type {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOperations,
  DefinePaths,
} from '@statelyjs/schema';
import { createOperationBindingsFactory, createSchemaPlugin } from '@statelyjs/schema';
import type { NodeMap } from '@statelyjs/schema/nodes';
import type { DefineCoreConfig, Schemas } from './core/index.js';
import { CORE_PLUGIN_NAME, coreSchemaUtils, stately } from './core/index.js';

/**
 * Define your application's Stately configuration.
 *
 * This type helper combines your OpenAPI-generated types with Stately's
 * core plugin to create a complete configuration type. Use this when
 * defining your `Schemas` type.
 *
 * The core plugin is automatically included, providing:
 * - Entity CRUD operations
 * - Standard node types (primitives, objects, arrays, etc.)
 * - Link resolution utilities
 *
 * @typeParam C - Components type from OpenAPI codegen (e.g., `components`)
 * @typeParam P - Paths type from OpenAPI codegen (e.g., `paths`)
 * @typeParam O - Operations type from OpenAPI codegen (e.g., `operations`)
 * @typeParam N - Generated node map from Stately codegen (usually inferred)
 *
 * @example
 * ```typescript
 * import type { components, paths, operations } from './generated/types';
 *
 * type MyConfig = DefineConfig<components, paths, operations>;
 * type MySchemas = Schemas<MyConfig>;
 * ```
 */
export type DefineConfig<
  C extends DefineComponents = DefineComponents,
  P extends DefinePaths = DefinePaths,
  O extends object = object,
  N extends DefineGeneratedNodes<NodeMap> = DefineGeneratedNodes<NodeMap>,
> = DefineCoreConfig<C, P, DefineOperations<O>, N>;

export type {
  AnyPaths,
  AnyRecord,
  AnySchemaAugments,
  AnySchemaPlugin,
  BaseNode,
  DefineComponentSchemas,
  DefineComponents,
  DefineData,
  DefineGeneratedNodes,
  DefineNodeMap,
  DefineOperations,
  DefinePaths,
  DefinePlugin,
  DefineTypes,
  DefineUtils,
  EmptyRecord,
  GeneratedNodeMap,
  NeverRecord,
  NodeInformation,
  NodeMap,
  OperationBindings,
  PluginFactory,
  PluginNodeUnion,
  SchemaPluginConfig,
  SchemaPluginContext,
  SchemaPluginResult,
} from '@statelyjs/schema';
export type {
  Stately,
  StatelyBuilder,
} from './core/schema/index.js';

/** Stately plugin types integration - Main API */
export type { Schemas };

export {
  coreSchemaUtils,
  createOperationBindingsFactory,
  createSchemaPlugin,
  CORE_PLUGIN_NAME,
  stately,
};
