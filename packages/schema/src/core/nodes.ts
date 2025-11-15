import type { BaseNode } from '../nodes.js';
import type { DefineNodeMap } from '../plugin.js';
import type { CoreStatelyConfig } from './generated.js';
import type { NodeKey, StateEntry } from './helpers.js';

/**
 * Node types (AST representation of OpenAPI schemas)
 */
export const CoreNodeType = {
  Array: 'array',
  Enum: 'enum',
  Link: 'link',
  Map: 'map',
  Nullable: 'nullable',
  Object: 'object',
  Primitive: 'primitive',
  RecursiveRef: 'recursiveRef',
  TaggedUnion: 'taggedUnion',
  Tuple: 'tuple',
  UntaggedEnum: 'untaggedEnum',
} as const;

export type TCoreNodeType = (typeof CoreNodeType)[keyof typeof CoreNodeType];

/**
 * Primitive data types
 */
export const PrimitiveType = {
  Boolean: 'boolean',
  Integer: 'integer',
  Number: 'number',
  Path: 'path',
  String: 'string',
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
export interface ObjectNode<Config extends CoreStatelyConfig = CoreStatelyConfig> extends BaseNode {
  nodeType: typeof CoreNodeType.Object;
  properties: Readonly<Record<string, CoreNodeUnion<Config>>>;
  required: readonly string[];
  merged?: TaggedUnionNode<Config> | UntaggedEnumNode<Config>;
}

/**
 * Array: Vec<T> in Rust
 */
export interface ArrayNode<Config extends CoreStatelyConfig = CoreStatelyConfig> extends BaseNode {
  nodeType: typeof CoreNodeType.Array;
  items: CoreNodeUnion<Config>;
}

/**
 * Map/Dictionary: HashMap<String, T> in Rust
 */
export interface MapNode<Config extends CoreStatelyConfig = CoreStatelyConfig> extends BaseNode {
  nodeType: typeof CoreNodeType.Map;
  valueSchema: CoreNodeUnion<Config>;
  keyPattern?: string;
}

/**
 * Tuple: Fixed-length heterogeneous array
 */
export interface TupleNode<Config extends CoreStatelyConfig = CoreStatelyConfig> extends BaseNode {
  nodeType: typeof CoreNodeType.Tuple;
  items: readonly CoreNodeUnion<Config>[];
}

/**
 * Tagged Union: Rust enum with explicit discriminator
 */
export interface TaggedUnionNode<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
  Discriminator extends string = string,
> extends BaseNode {
  nodeType: typeof CoreNodeType.TaggedUnion;
  discriminator: Discriminator;
  variants: ReadonlyArray<{ tag: string; schema: ObjectNode<Config> }>;
}

/**
 * Untagged Enum: Rust enum with inferred discriminator
 */
export interface UntaggedEnumNode<Config extends CoreStatelyConfig = CoreStatelyConfig>
  extends BaseNode {
  nodeType: typeof CoreNodeType.UntaggedEnum;
  variants: ReadonlyArray<{ tag: string; schema: CoreNodeUnion<Config> }>;
}

/**
 * Link<T>: Either an EntityId string OR inline entity data
 * Generic over EntityType to preserve the discriminator type
 */
export interface LinkNode<Config extends CoreStatelyConfig = CoreStatelyConfig> extends BaseNode {
  nodeType: typeof CoreNodeType.Link;
  targetType: StateEntry<Config>;
  inlineSchema: ObjectNode<Config>;
}

/**
 * Nullable: Option<T> in Rust
 */
export interface NullableNode<Config extends CoreStatelyConfig = CoreStatelyConfig>
  extends BaseNode {
  nodeType: typeof CoreNodeType.Nullable;
  innerSchema: Exclude<CoreNodeUnion<Config>, NullableNode<Config>>;
}

/**
 * RecursiveRef: Reference to another schema (breaks circular references)
 * Generic over SchemaName to enable type-safe indexing
 */
export interface RecursiveRefNode<Config extends CoreStatelyConfig = CoreStatelyConfig>
  extends BaseNode {
  nodeType: typeof CoreNodeType.RecursiveRef;
  refName: NodeKey<Config>;
}

export type CoreNodeMap<Config extends CoreStatelyConfig = CoreStatelyConfig> = DefineNodeMap<{
  [CoreNodeType.Primitive]: PrimitiveNode;
  [CoreNodeType.Enum]: EnumNode;
  [CoreNodeType.Object]: ObjectNode<Config>;
  [CoreNodeType.Array]: ArrayNode<Config>;
  [CoreNodeType.Map]: MapNode<Config>;
  [CoreNodeType.Tuple]: TupleNode<Config>;
  [CoreNodeType.TaggedUnion]: TaggedUnionNode<Config>;
  [CoreNodeType.UntaggedEnum]: UntaggedEnumNode<Config>;
  [CoreNodeType.Link]: LinkNode<Config>;
  [CoreNodeType.Nullable]: NullableNode<Config>;
  [CoreNodeType.RecursiveRef]: RecursiveRefNode<Config>;
}>;

/**
 * Union of all core node types, plus BaseNode to allow any nodeType (including "unknown").
 * This allows codegen to emit nodes with nodeType: "unknown" when it cannot parse a schema.
 */
export type CoreNodeUnion<Config extends CoreStatelyConfig = CoreStatelyConfig> =
  CoreNodeMap<Config>[keyof CoreNodeMap<Config>];
