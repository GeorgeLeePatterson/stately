import type { BaseNode } from '../schema.js';

/**
 * =============================================================================
 * CORE NODE TYPES
 * =============================================================================
 */

/**
 * Node types (AST representation of OpenAPI schemas)
 */
export const CoreNodeType = {
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

export type TCoreNodeType = (typeof CoreNodeType)[keyof typeof CoreNodeType];

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

export type TPrimitiveType = (typeof PrimitiveType)[keyof typeof PrimitiveType];

/**
 * =============================================================================
 * BASE NODE TYPES - Internal, not exported
 * =============================================================================
 * These are the raw, generic-free node definitions. Users don't interact with
 * these directly - they get concrete versions through StatelySchemas factory.
 */

/**
 * Forward declaration for AnyNode union
 */
export type AnyCoreNode<EntityType extends string, SchemaName extends string> =
  | PrimitiveNode
  | EnumNode
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
export interface PrimitiveNode extends BaseNode {
  nodeType: typeof CoreNodeType.Primitive;
  primitiveType: TPrimitiveType;
  format?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Enum: string with fixed set of values (no generics needed)
 */
export interface EnumNode extends BaseNode {
  nodeType: typeof CoreNodeType.Enum;
  values: readonly string[];
}

/**
 * Object: struct with named properties
 */
export interface ObjectNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Object;
  properties: Readonly<Record<string, AnyCoreNode<EntityType, SchemaName>>>;
  required: readonly string[];
  merged?: TaggedUnionNodeRaw<EntityType, SchemaName> | UntaggedEnumNodeRaw<EntityType, SchemaName>;
}

/**
 * Array: Vec<T> in Rust
 */
export interface ArrayNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Array;
  items: AnyCoreNode<EntityType, SchemaName>;
}

/**
 * Map/Dictionary: HashMap<String, T> in Rust
 */
export interface MapNodeRaw<EntityType extends string, SchemaName extends string> extends BaseNode {
  nodeType: typeof CoreNodeType.Map;
  valueSchema: AnyCoreNode<EntityType, SchemaName>;
  keyPattern?: string;
}

/**
 * Tuple: Fixed-length heterogeneous array
 */
export interface TupleNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Tuple;
  items: readonly AnyCoreNode<EntityType, SchemaName>[];
}

/**
 * Tagged Union: Rust enum with explicit discriminator
 */
export interface TaggedUnionNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.TaggedUnion;
  discriminator: string;
  variants: ReadonlyArray<{ tag: string; schema: ObjectNodeRaw<EntityType, SchemaName> }>;
}

/**
 * Untagged Enum: Rust enum with inferred discriminator
 */
export interface UntaggedEnumNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.UntaggedEnum;
  variants: ReadonlyArray<{ tag: string; schema: AnyCoreNode<EntityType, SchemaName> }>;
}

/**
 * Link<T>: Either an EntityId string OR inline entity data
 * Generic over EntityType to preserve the discriminator type
 */
export interface LinkNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Link;
  targetType: EntityType;
  inlineSchema: ObjectNodeRaw<EntityType, SchemaName>;
}

/**
 * Nullable: Option<T> in Rust
 */
export interface NullableNodeRaw<EntityType extends string, SchemaName extends string>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Nullable;
  innerSchema: Exclude<AnyCoreNode<EntityType, SchemaName>, NullableNodeRaw<EntityType, SchemaName>>;
}

/**
 * RecursiveRef: Reference to another schema (breaks circular references)
 * Generic over SchemaName to enable type-safe indexing
 */
export interface RecursiveRefNodeRaw<SchemaName extends string> extends BaseNode {
  nodeType: typeof CoreNodeType.RecursiveRef;
  refName: SchemaName;
}
