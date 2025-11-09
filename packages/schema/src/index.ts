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

/**
 * Configuration for the StatelySchemas factory
 * User provides RAW inputs - factory does the rest
 */
export interface StatelyConfig {
  /**
   * components: OpenAPI components object
   * Must contain required schemas: StateEntry, Entity, EntityId, Summary
   */
  components: OpenAPIV3_1.ComponentsObject & {
    schemas: {
      StateEntry: string;
      Entity: Record<string, any>;
      EntityId: string;
      Summary: { id: string; name: string; description: string; [key: string]: any };
      [key: string]: any;
    };
  };

  /**
   * paths: OpenAPI paths object
   * Contains all API endpoint definitions
   */
  paths: OpenAPIV3_1.PathsObject;

  /**
   * nodes: Generated schema AST nodes
   * A record mapping schema names to their parsed node representations
   * Kept as Record<string, any> to avoid circular dependency with AnySchemaNode
   */
  nodes: Record<string, any>;
}

/**
 * =============================================================================
 * SCHEMA NODE TYPES - AST Representation
 * =============================================================================
 */

/**
 * Node types (AST representation of OpenAPI schemas)
 */
export const NodeType = {
  Primitive: 'primitive',
  Enum: 'enum',
  Object: 'object',
  Array: 'array',
  Map: 'map',
  Tuple: 'tuple',
  TaggedUnion: 'taggedUnion',
  UntaggedEnum: 'untaggedEnum',
  Link: 'link',
  Nullable: 'nullable',
  RecursiveRef: 'recursiveRef',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

/**
 * Primitive data types
 */
export const PrimitiveType = {
  String: 'string',
  Number: 'number',
  Integer: 'integer',
  Boolean: 'boolean',
  Path: 'path',
} as const;

export type PrimitiveType = (typeof PrimitiveType)[keyof typeof PrimitiveType];

/**
 * =============================================================================
 * BASE NODE TYPES - Internal, not exported
 * =============================================================================
 * These are the raw, generic-free node definitions. Users don't interact with
 * these directly - they get concrete versions through StatelySchemas factory.
 */

/**
 * Base interface - just nodeType
 */
interface BaseNode {
  nodeType: NodeType;
  description?: string;
}

/**
 * Forward declaration for AnyNode union
 */
type AnyNode<EntityType extends string, SchemaName extends string> =
  | PrimitiveNodeRaw
  | EnumNodeRaw
  | ObjectNodeRaw<EntityType, SchemaName>
  | ArrayNodeRaw<EntityType, SchemaName>
  | MapNodeRaw<EntityType, SchemaName>
  | TupleNodeRaw<EntityType, SchemaName>
  | TaggedUnionNodeRaw<EntityType, SchemaName>
  | UntaggedEnumNodeRaw<EntityType, SchemaName>
  | LinkNodeRaw<EntityType, SchemaName>
  | NullableNodeRaw<EntityType, SchemaName>
  | RecursiveRefNodeRaw<SchemaName>;

/**
 * Primitive types: string, number, integer, boolean (no generics needed)
 */
interface PrimitiveNodeRaw extends BaseNode {
  nodeType: typeof NodeType.Primitive;
  primitiveType: PrimitiveType;
  format?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Enum: string with fixed set of values (no generics needed)
 */
interface EnumNodeRaw extends BaseNode {
  nodeType: typeof NodeType.Enum;
  values: readonly string[];
}

/**
 * Object: struct with named properties
 */
interface ObjectNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Object;
  properties: Readonly<Record<string, AnyNode<EntityType, SchemaName>>>;
  required: readonly string[];
  merged?: TaggedUnionNodeRaw<EntityType, SchemaName> | UntaggedEnumNodeRaw<EntityType, SchemaName>;
}

/**
 * Array: Vec<T> in Rust
 */
interface ArrayNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Array;
  items: AnyNode<EntityType, SchemaName>;
}

/**
 * Map/Dictionary: HashMap<String, T> in Rust
 */
interface MapNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Map;
  valueSchema: AnyNode<EntityType, SchemaName>;
  keyPattern?: string;
}

/**
 * Tuple: Fixed-length heterogeneous array
 */
interface TupleNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Tuple;
  items: readonly AnyNode<EntityType, SchemaName>[];
}

/**
 * Tagged Union: Rust enum with explicit discriminator
 */
interface TaggedUnionNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof NodeType.TaggedUnion;
  discriminator: string;
  variants: ReadonlyArray<{ tag: string; schema: ObjectNodeRaw<EntityType, SchemaName> }>;
}

/**
 * Untagged Enum: Rust enum with inferred discriminator
 */
interface UntaggedEnumNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof NodeType.UntaggedEnum;
  variants: ReadonlyArray<{ tag: string; schema: AnyNode<EntityType, SchemaName> }>;
}

/**
 * Link<T>: Either an EntityId string OR inline entity data
 * Generic over EntityType to preserve the discriminator type
 */
interface LinkNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Link;
  targetType: EntityType;
  inlineSchema: ObjectNodeRaw<EntityType, SchemaName>;
}

/**
 * Nullable: Option<T> in Rust
 */
interface NullableNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.Nullable;
  innerSchema: Exclude<AnyNode<EntityType, SchemaName>, NullableNodeRaw<EntityType, SchemaName>>;
}

/**
 * RecursiveRef: Reference to another schema (breaks circular references)
 * Generic over SchemaName to enable type-safe indexing
 */
interface RecursiveRefNodeRaw<SchemaName extends string> extends BaseNode {
  nodeType: typeof NodeType.RecursiveRef;
  refName: SchemaName;
}

// Type helper to extract the specific Entity variant based on type
export type ExtractEntityByType<
  Schemas extends StatelySchemas,
  T extends Schemas['StateEntry'],
> = Extract<Schemas['Entity'], { type: T }>;

/**
 * =============================================================================
 * STATELY SCHEMAS - Type-Level Factory (PUBLIC API)
 * =============================================================================
 */

/**
 * The StatelySchemas factory - call this ONCE with your raw inputs
 * It extracts, distributes, and returns ALL types you need
 */
export interface StatelySchemas<Config extends StatelyConfig = StatelyConfig> {
  // ===== Raw OpenAPI Document Parts =====

  /**
   * components: OpenAPI components object
   */
  components: Config['components'];

  /**
   * paths: OpenAPI paths object
   */
  paths: Config['paths'];

  // ===== Entity Types (from components) =====
  // These are extracted from components['schemas'] and exposed

  /**
   * StateEntry: Union of entity type discriminators
   * Example: 'pipeline' | 'source_config' | 'transform'
   */
  StateEntry: Config['components']['schemas']['StateEntry'];

  /**
   * Entity: Tagged union wrapper for CRUD operations
   * Example: { type: 'pipeline', data: Pipeline } | { type: 'source_config', data: SourceConfig }
   */
  Entity: Config['components']['schemas']['Entity'];

  /**
   * EntityData: Union of all entity data types (unwrapped from Entity)
   * Example: Pipeline | SourceConfig | Transform
   */
  EntityData: Config['components']['schemas']['Entity'] extends { data: infer D }
    ? D extends { name?: string }
      ? D
      : Record<string, any>
    : never;

  /**
   * EntityId: Unique identifier for entities (UUID v7)
   */
  EntityId: Config['components']['schemas']['EntityId'];

  /**
   * Nodes: Generated schema nodes
   */
  nodes: Config['nodes'];

  /**
   * NodeNames: Union of all schema names from generated schemas
   */
  NodeNames: keyof Config['nodes'] | string;

  // ===== Node Types (with distributed generics) =====
  // These have StateEntry and NodeNames already baked in

  PrimitiveNode: PrimitiveNodeRaw;
  EnumNode: EnumNodeRaw;
  ObjectNode: ObjectNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  ArrayNode: ArrayNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  MapNode: MapNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  TupleNode: TupleNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  TaggedUnionNode: TaggedUnionNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  UntaggedEnumNode: UntaggedEnumNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  LinkNode: LinkNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  NullableNode: NullableNodeRaw<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
  RecursiveRefNode: RecursiveRefNodeRaw<keyof Config['nodes'] & string>;

  // Union of all nodes
  AnySchemaNode: AnyNode<
    Config['components']['schemas']['StateEntry'],
    keyof Config['nodes'] & string
  >;
}

import type { StatelySchemaPlugin } from './plugin.js';
import type {
  Stately,
  StatelyBuilder,
  ValidationError,
  ValidationOptions,
  ValidationResult,
} from './stately.js';
export type {
  StatelySchemaPlugin,
  Stately,
  StatelyBuilder,
  ValidationError,
  ValidationOptions,
  ValidationResult,
};

/**
 * Stately integration - Main API
 */
import { stately } from './stately.js';
export { stately };
