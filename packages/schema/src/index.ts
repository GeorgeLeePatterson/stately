/**
 * @stately/schema
 *
 * Generic type definitions for Stately schema nodes that work with user-provided OpenAPI-generated
 * types and plugin augmentations.
 *
 * Design Philosophy:
 * - StatelySchemas (exported as `Schemas`) is the single source of truth
 * - ALL type derivations cascade from `StatelySchemas` (exported as `Schemas`)
 * - Everything else derives from there
 */

/**
 * =============================================================================
 * CORE SCHEMA INTERFACES - Type-Level Factory and `stately` Schema Builder
 * =============================================================================
 *
 * StatelySchemas is a type-level factory that takes RAW inputs and returns a namespace of CONCRETE
 * types and plugin augmented types.
 *
 * It acts as a DISTRIBUTOR:
 * 1. Takes raw components['schemas'] and PARSED_SCHEMAS
 * 2. Extracts what it needs (StateEntry, Entity, etc.)
 * 3. Distributes those to internal node types
 * 4. Exposes EVERYTHING back to the user
 *
 * Design Philosophy:
 * - User provides RAW inputs ONCE (components, nodes)
 * - Factory extracts, distributes, and exposes
 * - Get back ALL types (entity types + node types)
 * - No threading generics through the codebase
 * - Types "just work" like calling a function
 *
 * Views exposed on the resulting `Schemas` type:
 * - `Schemas['Generated']`
 *     Mirrors the literal OpenAPI/codegen output (user-specific entities, nodes, etc.).
 *     Use this inside your application when you want to interact with the concrete schema.
 * - `Schemas['Plugin']`
 *     Aggregates every node contributed by core + installed augments.
 *     Use this when authoring a plugin so you always have the canonical AST contracts even before
 *     a user runs codegen.
 *
 * Usage:
 * ```typescript
 * type MySchemas = Schemas<{
 *  components: typeof openapiComponents,
 *  nodes: typeof generatedAstNodes,
 * }, [Plugin1Augment, Plugin2Augment]>;
 *
 * // Generated view = user-specific OpenAPI/codegen output
 * const pipelineNode = MySchemas['Generated'].Nodes.Pipeline;
 * // Plugin view = canonical nodes contributed by augments (core, files, etc.)
 * const linkNode = MySchemas['Plugin'].Nodes.link;
 * ```
 */

import type { OpenAPIV3_1 } from 'openapi-types';
import type { CorePlugin, CoreStatelyConfig, DefineCoreConfig } from './core/index.js';
import { createCorePlugin } from './core/index.js';
import type * as GeneratedTypes from './generated.js';
import {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOpenApi,
  DefinePaths,
  DefineStatelyConfig,
} from './generated.js';
import type * as PluginTypes from './plugin.js';
import type { PluginAugment } from './plugin.js';

// Export plugin-author helpers
import type { StatelySchemas } from './schema.js';
import { createStately } from './stately.js';
export type { OpenAPIV3_1 };
export { DefineComponents, DefineGeneratedNodes, DefineOpenApi, DefinePaths, DefineStatelyConfig };

export type DefineConfig<
  C extends DefineComponents<{}> = DefineComponents<{}>,
  P extends DefinePaths<{}> = DefinePaths<{}>,
  N extends DefineGeneratedNodes<{}> = DefineGeneratedNodes<{}>,
> = DefineCoreConfig<C, P, N>;

/**
 * Stately plugin types integration - Main API
 */
export type Schemas<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
  Augments extends readonly PluginAugment<any, any>[] = [],
> = StatelySchemas<Config, readonly [CorePlugin<Config>, ...Augments]>;

// Type helper
export type SchemaConfig<S> = S extends Schemas<infer Config, any> ? Config : never;

/**
 * Type helpers for referencing generated node information
 */
export type GeneratedNodes<C extends CoreStatelyConfig = CoreStatelyConfig> =
  GeneratedTypes.GeneratedNodes<C>;
export type GeneratedNodeUnion<C extends CoreStatelyConfig = CoreStatelyConfig> =
  GeneratedTypes.GeneratedNodeUnion<C>;
export type GeneratedNodeNames<C extends CoreStatelyConfig = CoreStatelyConfig> =
  GeneratedTypes.GeneratedNodeNames<C>;
export type GeneratedNodeTypes<C extends CoreStatelyConfig = CoreStatelyConfig> =
  GeneratedTypes.GeneratedNodeTypes<C>;

/**
 * Type helpers for referencing plugin node information
 */
export type PluginNodes<S extends StatelySchemas<any, any> = Schemas> =
  PluginTypes.PluginNodeMap<S>;
export type PluginNodeUnion<S extends StatelySchemas<any, any> = Schemas> =
  PluginTypes.PluginNodeUnion<S>;
export type PluginNodeNames<S extends StatelySchemas<any, any> = Schemas> =
  PluginTypes.PluginNodeNames<S>;
export type PluginNodeTypes<S extends StatelySchemas<any, any> = Schemas> =
  PluginTypes.PluginNodeTypes<S>;

/**
 * Stately plugin functionality integration - Main API
 *
 * Convenience helper that seeds the runtime with the core schema plugin so consumers get all core
 * helpers/validators out of the box. Additional schema plugins can be appended by chaining
 * `.withPlugin(...)` on the returned builder.
 *
 * @param openapi - OpenAPI document (accepts JSON imports and typed documents)
 * @param nodes - Generated node map from codegen
 */
export function stately<S extends Schemas<any, any> = Schemas>(
  openapi: DefineOpenApi<any>,
  nodes: SchemaConfig<S>['nodes'],
) {
  return createStately<S>(openapi, nodes).withPlugin(createCorePlugin<S>());
}
