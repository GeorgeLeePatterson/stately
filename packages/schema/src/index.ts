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
import { createCorePlugin } from './core/index.js';
import type { CoreSchemaAugment, CoreStatelyConfig } from './core/index.js';
import type {
  StatelySchemas,
  NodesFromConfig,
  SchemaAugment,
  SchemaAugmentNodes,
} from './schema.js';
import type { AnyRecord, EmptyRecord } from './stately.js';
import { createStately } from './stately.js';

/* Internal type for ensuring proper augmentation order */
type AugmentChain<
  Config extends CoreStatelyConfig,
  Extras extends readonly SchemaAugment<any, any>[],
> = readonly [CoreSchemaAugment<Config>, ...Extras];

/* Internal type for maintaining type fidelity across plugin instantiations  */
type PluginNodeMap<
  Config extends CoreStatelyConfig,
  Extras extends readonly SchemaAugment<any, any>[],
> = CoreSchemaAugment<Config>['nodes'] & SchemaAugmentNodes<Extras>;

/**
 * Stately plugin types integration - Main API
 */
export type Schemas<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
  Augments extends readonly SchemaAugment<any, any>[] = [],
> = StatelySchemas<
  Config,
  NodesFromConfig<Config>,
  AugmentChain<Config, Augments>,
  PluginNodeMap<Config, Augments>
>;

/**
 * Stately plugin functionality integration - Main API
 *
 * Convenience helper that seeds the runtime with the core schema plugin so consumers get all core
 * helpers/validators out of the box. Additional schema plugins can be appended by chaining
 * `.withPlugin(...)` on the returned builder.
 */
export function stately<Config extends CoreStatelyConfig, Utils extends AnyRecord = EmptyRecord>(
  openapi: OpenAPIV3_1.Document,
  generatedNodes: Config['nodes'],
  injectedUtils?: Utils,
) {
  return createStately<Config, Utils>(openapi, generatedNodes, injectedUtils).withPlugin(
    createCorePlugin<Config>(),
  );
}


/**
 * Various helper types and low-level tools. Prefer the main APIs where possible.
 */
export { createStately };
export type {
  SchemaAugment,
  SchemaAugmentNodes,
  SchemaAnyNode,
  SchemaNodeMap,
  SchemaNodeOfType,
  SchemaPluginAnyNode,
  SchemaPluginNodeNames,
  SchemaPluginNodeOfType,
  SchemaPluginNodeType,
  NodesFromConfig,
} from './schema.js';
