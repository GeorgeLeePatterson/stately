import type { BaseNode, DefineNodeMap } from '@stately/schema';

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
  Union: 'union',
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
 * CORE NODE TYPES - Structural Definitions
 * =============================================================================
 *
 * These define the STRUCTURAL shape of core nodes without Config generics.
 * This design choice:
 * - Preserves covariance (no invariant Config parameters)
 * - Allows plugin nodes to appear anywhere BaseNode is accepted
 * - Maintains type safety through structural subtyping
 * - Separates node TYPE space (defined here) from node INSTANCE space (in generated schemas)
 *
 * Concrete type information is preserved in generated schemas via 'as const'.
 * Components receive fully-typed node instances through Schemas['generated']['Nodes'].
 */

/**
 * Primitive types: string, number, integer, boolean
 */
export interface PrimitiveNode extends BaseNode {
  nodeType: typeof CoreNodeType.Primitive;
  primitiveType: TPrimitiveType;
  format?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Enum: string with fixed set of values
 */
export interface EnumNode extends BaseNode {
  nodeType: typeof CoreNodeType.Enum;
  values: readonly string[];
}

/**
 * Object: struct with named properties
 *
 * `additionalProperties` captures the value schema for any dynamic keys
 * beyond the fixed `properties` (e.g., from `#[serde(flatten)]` on a HashMap).
 */
export interface ObjectNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Object;
  properties: Readonly<Record<string, CoreNodes<ChildNode>>>;
  required: readonly string[];
  additionalProperties?: CoreNodes<ChildNode>;
  merged?: TaggedUnionNode<ChildNode> | UntaggedEnumNode<ChildNode>;
}

/**
 * Array: Vec<T> in Rust
 */
export interface ArrayNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Array;
  items: CoreNodes<ChildNode>;
}

/**
 * Map/Dictionary: HashMap<String, T> in Rust
 */
export interface MapNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Map;
  valueSchema: CoreNodes<ChildNode>;
  keyPattern?: string;
}

/**
 * Tuple: Fixed-length heterogeneous array
 */
export interface TupleNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Tuple;
  items: readonly CoreNodes<ChildNode>[];
}

/**
 * Tagged Union: Rust enum with explicit discriminator
 *
 * Unit variants (no associated data) have `schema: null`.
 */
export interface TaggedUnionNode<
  ChildNode extends BaseNode = never,
  Discriminator extends string = string,
> extends BaseNode {
  nodeType: typeof CoreNodeType.TaggedUnion;
  discriminator: Discriminator;
  variants: ReadonlyArray<{ tag: string; schema: ObjectNode<ChildNode> | null }>;
}

/**
 * Untagged Enum: Rust enum with inferred discriminator
 *
 * Unit variants (no associated data) have `schema: null`.
 */
export interface UntaggedEnumNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.UntaggedEnum;
  variants: ReadonlyArray<{ tag: string; schema: CoreNodes<ChildNode> | null }>;
}

/**
 * Union: Generic oneOf/anyOf fallback
 *
 * Used when we can't identify a specific tagged/untagged pattern.
 * The value is exactly one of the variant schemas - no tag wrapping.
 */
export interface UnionNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Union;
  variants: ReadonlyArray<{ schema: CoreNodes<ChildNode>; label?: string }>;
}

/**
 * Link<T>: Either an EntityId string OR inline entity data
 * Generic over EntityType to preserve the discriminator type
 */
export interface LinkNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Link;
  targetType: string;
  inlineSchema: ObjectNode<ChildNode>;
}

/**
 * Nullable: Option<T> in Rust
 */
export interface NullableNode<ChildNode extends BaseNode = never> extends BaseNode {
  nodeType: typeof CoreNodeType.Nullable;
  innerSchema: CoreNodes<ChildNode>;
}

/**
 * RecursiveRef: Reference to another schema (breaks circular references)
 * Generic over SchemaName to enable type-safe indexing
 */
export interface RecursiveRefNode extends BaseNode {
  nodeType: typeof CoreNodeType.RecursiveRef;
  refName: string;
}

export type CoreNodeMap<ChildNode extends BaseNode = never> = DefineNodeMap<{
  [CoreNodeType.Primitive]: PrimitiveNode;
  [CoreNodeType.Enum]: EnumNode;
  [CoreNodeType.Object]: ObjectNode<ChildNode>;
  [CoreNodeType.Array]: ArrayNode<ChildNode>;
  [CoreNodeType.Map]: MapNode<ChildNode>;
  [CoreNodeType.Tuple]: TupleNode<ChildNode>;
  [CoreNodeType.TaggedUnion]: TaggedUnionNode<ChildNode>;
  [CoreNodeType.UntaggedEnum]: UntaggedEnumNode<ChildNode>;
  [CoreNodeType.Union]: UnionNode<ChildNode>;
  [CoreNodeType.Link]: LinkNode<ChildNode>;
  [CoreNodeType.Nullable]: NullableNode<ChildNode>;
  [CoreNodeType.RecursiveRef]: RecursiveRefNode;
}>;

export type CoreNodes<ChildNode extends BaseNode = never> =
  | PrimitiveNode
  | EnumNode
  | ObjectNode<ChildNode>
  | ArrayNode<ChildNode>
  | MapNode<ChildNode>
  | TupleNode<ChildNode>
  | TaggedUnionNode<ChildNode>
  | UntaggedEnumNode<ChildNode>
  | UnionNode<ChildNode>
  | LinkNode<ChildNode>
  | NullableNode<ChildNode>
  | RecursiveRefNode
  | ChildNode;
