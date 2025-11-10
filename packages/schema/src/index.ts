/**
 * @stately/schema
 *
 * Generic type definitions for Stately schema nodes that work with
 * user-provided OpenAPI-generated types.
 *
 * Design Philosophy:
 * - StatelySchemas is the SINGLE SOURCE OF TRUTH
 * - ALL type derivations CASCADE from StatelySchemas
 * - Entity.type === StateEntry is ENFORCED (matching Rust proc macro guarantees)
 * - As we discover new required types, we add them to StatelySchemas
 * - Everything else derives from there
 */

/**
 * =============================================================================
 * CORE SCHEMA INTERFACE - Type-Level Factory
 * =============================================================================
 *
 * StatelySchemas is a TYPE-LEVEL FACTORY that takes RAW inputs and returns
 * a namespace of CONCRETE types. It acts as a DISTRIBUTOR:
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
 * Usage:
 * ```typescript
 * type MySchemas = StatelySchemas<{
 *   components: components['schemas'];
 *   nodes: typeof PARSED_SCHEMAS;
 * }>;
 *
 * // Use ALL concrete types - no generics needed!
 * type StateEntry = MySchemas['StateEntry'];   // From components
 * type Entity = MySchemas['Entity'];           // From components
 * type LinkNode = MySchemas['LinkNode'];       // Has StateEntry baked in
 * type RecursiveRef = MySchemas['RecursiveRefNode']; // Has NodeNames baked in
 * ```
 */

import type { OpenAPIV3_1 } from 'openapi-types';
import type { CoreSchemaAugment, CoreStatelyConfig } from './core/augment.js';
import { createCorePlugin } from './core/plugin.js';
import type {
  StatelySchemas,
  NodesFromConfig,
  SchemaAugment,
  SchemaAugmentNodes,
} from './schema.js';
import type { AnyRecord, EmptyRecord } from './stately.js';
import { createStately } from './stately.js';

type AugmentChain<
  Config extends CoreStatelyConfig,
  Extras extends readonly SchemaAugment<any, any>[],
> = readonly [CoreSchemaAugment<Config>, ...Extras];

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

export { createStately };
