/**
 * @statelyjs/schema - Schema Type System
 *
 * Low-level type definitions for Stately schema nodes. This package provides
 * the foundational types that work with user-provided OpenAPI-generated types
 * and plugin augmentations.
 *
 * ## For Most Users
 *
 * **Use `@statelyjs/stately` instead.** It re-exports these types with the
 * core plugin included automatically:
 *
 * ```typescript
 * import { stately, type DefineConfig, type Schemas } from '@statelyjs/stately/schema';
 * ```
 *
 * ## For Plugin Authors
 *
 * Use this package directly when building schema plugins:
 *
 * ```typescript
 * import { createStately, type DefinePlugin, type BaseNode } from '@statelyjs/schema';
 * ```
 *
 * ## Key Exports
 *
 * - **`createStately`** - Factory for creating schema runtimes
 * - **`DefinePlugin`** - Helper type for defining schema plugins
 * - **`BaseNode`** - Base interface for all schema nodes
 * - **`StatelySchemas`** - The complete schemas type
 */

import type { DefineOperations } from './api.js';
import { createOperationBindingsFactory } from './api.js';
import type {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOpenApi,
  DefinePaths,
} from './generated.js';
import type { AnyRecord, EmptyRecord, NeverRecord, RequireLiteral } from './helpers.js';
import type { NodeMap } from './nodes.js';
import type * as PluginTypes from './plugin.js';
import { isNodeOfType } from './schema.js';
import { createSchemaPlugin, createStately } from './stately.js';

// Re-exports
export type { OpenAPIV3_1 } from 'openapi-types';
export type {
  PluginTypes,
  DefineComponents,
  DefineGeneratedNodes,
  DefineOperations,
  DefineOpenApi,
  DefinePaths,
  NodeMap,
  AnyRecord,
  EmptyRecord,
  NeverRecord,
  RequireLiteral,
};

export type { AnyPaths, OperationBindings, OperationEntry, OperationMap } from './api.js';
export type {
  BaseConfig,
  DefineComponentSchemas,
  DefineStatelyConfig,
  GeneratedNodeMap,
  StatelyConfig,
} from './generated.js';
export type {
  BaseNode,
  NodeInformation,
  NodeValues,
  TUnknownNodeType,
  UnknownNode,
  UnknownNodeType,
} from './nodes.js';
export type {
  AnySchemaAugments,
  AnySchemaPlugin,
  DefineData,
  DefineNodeMap,
  DefineTypes,
  DefineUtils,
  PluginAugment,
  PluginNodeUnion,
} from './plugin.js';
export type { PluginAnyNode, StatelySchemaConfig, StatelySchemas } from './schema.js';
export type {
  CreateStatelyOptions,
  PluginFactory,
  RuntimeSchemaLoader,
  SchemaPluginConfig,
  SchemaPluginContext,
  SchemaPluginResult,
  Stately,
  StatelyBuilder,
} from './stately.js';
export { createSchemaPlugin, createStately };
export type {
  ValidateArgs,
  ValidateHook,
  ValidationError,
  ValidationOptions,
  ValidationResult,
} from './validation.js';
export { createOperationBindingsFactory, isNodeOfType };

/**
 * Public helper for declaring a plugin augment.
 *
 * Schema augment contributed by a plugin. Each augment registers the canonical
 * node map it provides plus any additional helper types it wants to merge into
 * the final `Schemas` surface. Plugin authors only need to supply the node map;
 * everything else will be wired into the `Plugin` view automatically.
 *
 * Enforces string-literal names so downstream utilities preserve keyed utils, types, and data.
 * Plugin authors should export their augments defined with this type
 */
export type DefinePlugin<
  Name extends string,
  Nodes extends NodeMap = NodeMap,
  Types extends PluginTypes.DefineTypes = NeverRecord,
  Data extends PluginTypes.DefineData = NeverRecord,
  Utils extends PluginTypes.DefineUtils<AnyRecord> = EmptyRecord,
> = PluginTypes.PluginAugment<
  RequireLiteral<Name, 'Plugin names must be string literals'>,
  Nodes,
  Types,
  Data,
  Utils
>;
