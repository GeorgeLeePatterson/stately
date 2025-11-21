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

import type { DefineOperations } from './api.js';
import type { CorePlugin, CoreStatelyConfig, DefineCoreConfig } from './core/index.js';
import { corePlugin } from './core/index.js';
import type {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOpenApi,
  DefinePaths,
} from './generated.js';
import type { AnyRecord, EmptyRecord, NeverRecord, RequireLiteral } from './helpers.js';
import type { NodeMap } from './nodes.js';
import type * as PluginTypes from './plugin.js';
import type { AnySchemaAugments, PluginAugment } from './plugin.js';
import type { StatelySchemas } from './schema.js';
import { createStately } from './stately.js';

// Re-exports
export type { OpenAPIV3_1 } from 'openapi-types';
export type {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOperations,
  DefineOpenApi,
  DefinePaths,
};
export type { DefineStatelyConfig } from './generated.js';
export type { AnySchemaPlugin } from './plugin.js';

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
> = PluginAugment<
  RequireLiteral<Name, 'Plugin names must be string literals'>,
  Nodes,
  Types,
  Data,
  Utils
>;

/**
 * Public helper for declaring a full Stately config
 */
export type DefineConfig<
  C extends DefineComponents = DefineComponents,
  P extends DefinePaths = DefinePaths,
  O extends DefineOperations = DefineOperations,
  N extends DefineGeneratedNodes<NodeMap> = DefineGeneratedNodes<NodeMap>,
> = DefineCoreConfig<C, P, O, N>;

/**
 * Stately plugin types integration - Main API
 *
 * Variance annotation enforces that Config can only be used covariantly.
 * This acts as a compile-time guardrail preventing invariant-causing patterns
 * like `keyof Config['nodes']` from being introduced anywhere in the type system.
 */
export type Schemas<
  out Config extends CoreStatelyConfig = CoreStatelyConfig,
  Augments extends AnySchemaAugments = [],
> = StatelySchemas<Config, readonly [CorePlugin<Config, Augments>, ...Augments]>;

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
  nodes: S['config']['nodes'],
) {
  return createStately<S>(openapi, nodes).withPlugin(corePlugin<S>());
}

/**
 * Type helper to access the underlying `StatelyConfig` of a `Schemas`, `StatelySchemas` w/ core.
 */
export type SchemaConfig<S> = S extends Schemas<infer Config, any> ? Config : never;

/**
 * Type helpers for referencing plugin node information
 */
export type PluginNodeUnion<S extends Schemas<any, any> = Schemas> = PluginTypes.PluginNodeUnion<S>;
