import type { OpenAPIV3_1 } from 'openapi-types';

/** Small utility aliases */
export type EmptyRecord = Record<never, never>;
export type AnyRecord = Record<string, unknown>;

type ComponentsWithSchemas = Omit<OpenAPIV3_1.ComponentsObject, 'schemas'> & {
  schemas: Record<string, unknown>;
};

/**
 * Base interface - just nodeType
 */
export interface BaseNode {
  nodeType: string;
  description?: string;
}

export interface StatelyConfig<
  Components extends ComponentsWithSchemas = ComponentsWithSchemas,
  Paths extends OpenAPIV3_1.PathsObject = OpenAPIV3_1.PathsObject,
  Nodes = Record<string, unknown>,
> {
  components: Components;
  paths: Paths;
  nodes: Nodes;
}

/** Node map helper used internally for fallbacks. */
export type SchemaNodeMap = Record<string, BaseNode>;

/**
 * Schema augment contributed by a plugin. Registers node shapes and optional extra fields.
 */
export type SchemaAugment<
  Nodes = SchemaNodeMap,
  Extras extends Record<string, unknown> = {},
> = { nodes: Nodes } & Extras;

type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

type AugmentNodesUnion<Augments extends readonly SchemaAugment<any, any>[]> =
  Augments[number] extends SchemaAugment<infer Nodes, any> ? Nodes : never;

/** Internal utility: fold a tuple of augments into a single node map. */
type MergeAugmentNodes<Augments extends readonly SchemaAugment<any, any>[]> = [Augments] extends [[]]
  ? {}
  : UnionToIntersection<AugmentNodesUnion<Augments>>;

/** Merge extra fields contributed by augments (everything except `nodes`). */
type AugmentExtrasUnion<Augments extends readonly SchemaAugment<any, any>[]> =
  Augments[number] extends SchemaAugment<any, any> ? Omit<Augments[number], 'nodes'> : never;

type MergeAugmentExtras<Augments extends readonly SchemaAugment<any, any>[]> = [Augments] extends [[]]
  ? {}
  : UnionToIntersection<AugmentExtrasUnion<Augments>>;

type StringKeys<T> = Extract<keyof T, string>;
type LiteralNodeKeys<T> = StringKeys<T> extends infer Keys
  ? string extends Keys
    ? never
    : Keys
  : never;

/** Normalize arbitrary node maps into the schema node map shape. */
type NormalizeNodes<N> = [StringKeys<N>] extends [never]
  ? SchemaNodeMap
  : {
      [K in StringKeys<N>]: N[K] extends BaseNode ? N[K] : BaseNode;
    };

type HasLiteralKeys<T> = [LiteralNodeKeys<T>] extends [never]
  ? false
  : true;

type NodeValues<N> = [LiteralNodeKeys<N>] extends [never] ? BaseNode : N[LiteralNodeKeys<N>];

type NodeTypeUnion<N> = NodeValues<N> extends { nodeType: infer T }
  ? Extract<T, string>
  : string;

type CanonicalNodeMap<Augments extends readonly SchemaAugment<any, any>[]> =
  MergeAugmentNodes<Augments>;

type GeneratedShape<Nodes> = {
  Nodes: Nodes;
  AnyNode: NodeValues<Nodes>;
  NodeNames: LiteralNodeKeys<Nodes>;
  NodeTypes: NodeTypeUnion<Nodes>;
};

type PluginShape<PluginNodes> = {
  Nodes: PluginNodes;
  AnyNode: NodeValues<PluginNodes>;
  NodeNames: LiteralNodeKeys<PluginNodes>;
  NodeTypes: NodeTypeUnion<PluginNodes>;
};

/**
 * Base schema builder – derives shared surface area without core additions.
 *
 * This type helper is the core type helper, without any assumptions baked in, not even "core".
 * Prefer the exported `Schemas` in the entrypoint of the package.
 */
export type StatelySchemas<
  Config extends StatelyConfig,
  BaseNodes,
  Augments extends readonly SchemaAugment<any, any>[] = [],
  PluginNodeMap = CanonicalNodeMap<Augments>,
> = {
  /** Generated schema view (user-specific) */
  Generated: GeneratedShape<BaseNodes>;
  /** Plugin schema view (canonical) */
  Plugin: PluginShape<PluginNodeMap>;
  /** Generated schema node map (user-specific) */
  Nodes: BaseNodes;
  /** Canonical plugin node definitions */
  PluginNodes: PluginNodeMap;
  /** Convenience mirrors */
  GeneratedNodes: GeneratedShape<BaseNodes>['Nodes'];
  GeneratedAnyNode: GeneratedShape<BaseNodes>['AnyNode'];
  GeneratedNodeNames: GeneratedShape<BaseNodes>['NodeNames'];
  GeneratedNodeTypes: GeneratedShape<BaseNodes>['NodeTypes'];
  PluginAnyNode: PluginShape<PluginNodeMap>['AnyNode'];
  PluginNodeNames: PluginShape<PluginNodeMap>['NodeNames'];
  PluginNodeTypes: PluginShape<PluginNodeMap>['NodeTypes'];
  /** Raw OpenAPI components */
  components: Config['components'];
  /** Convenience alias for component schemas */
  schemas: Config['components']['schemas'];
  /** Raw OpenAPI paths */
  paths: Config['paths'];
  /** Generated schema node map */
  nodes: BaseNodes;
  /** Schema name union */
  NodeNames: HasLiteralKeys<BaseNodes> extends true
    ? LiteralNodeKeys<BaseNodes>
    : [LiteralNodeKeys<MergeAugmentNodes<Augments>>] extends [never]
        ? string
        : LiteralNodeKeys<MergeAugmentNodes<Augments>>;
  /** Union of every node type */
  AnyNode: HasLiteralKeys<BaseNodes> extends true
    ? NodeValues<BaseNodes>
    : NodeValues<PluginNodeMap>;
  /** Union of nodeType literals */
  NodeTypes: HasLiteralKeys<BaseNodes> extends true
    ? NodeTypeUnion<BaseNodes>
    : NodeTypeUnion<PluginNodeMap>;
} & MergeAugmentExtras<Augments>;

export type SchemaAnyNode<Schema> = Schema extends { AnyNode: infer T }
  ? [T] extends [never]
      ? BaseNode
      : T
  : BaseNode;
export type SchemaNodeType<Schema> = Schema extends { NodeTypes: infer Types }
  ? [Types] extends [never]
      ? string
      : Extract<Types, string>
  : string;
export type NodesOf<Schema extends { Nodes: unknown }> = Schema['Nodes'];
export type SchemaPluginNodes<Schema> = Schema extends { Plugin: { Nodes: infer P } }
  ? P
  : SchemaNodeMap;
export type SchemaPluginAnyNode<Schema> = Schema extends { Plugin: { AnyNode: infer T } }
  ? [T] extends [never]
      ? BaseNode
      : T
  : BaseNode;
export type SchemaPluginNodeType<Schema> = Schema extends { Plugin: { NodeTypes: infer Types } }
  ? [Types] extends [never]
      ? string
      : Extract<Types, string>
  : string;
export type SchemaPluginNodeNames<Schema> = Schema extends { Plugin: { NodeNames: infer Names } }
  ? Names extends string
      ? Names
      : string
  : string;
export type SchemaNodeOfType<
  Schema,
  Type extends SchemaNodeType<Schema>,
> = Extract<SchemaAnyNode<Schema>, { nodeType: Type }>;
export type SchemaPluginNodeOfType<
  Schema,
  Type extends SchemaPluginNodeType<Schema>,
> = Extract<SchemaPluginAnyNode<Schema>, { nodeType: Type }>;

/** Default helper to coerce arbitrary node maps into SchemaNodeMap. */
export type NodesFromConfig<Config extends StatelyConfig> = NormalizeNodes<Config['nodes']>;

export type SchemaAugmentNodes<
  Augments extends readonly SchemaAugment<any, any>[],
> = CanonicalNodeMap<Augments>;
