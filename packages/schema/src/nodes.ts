import { LiteralKeys } from "./helpers";

/**
 * Base node interface
 */
export interface BaseNode {
  nodeType: string;
  description?: string;
}

/** Node map helper used internally for fallbacks. */
export type NodeMap = Record<string, BaseNode>;

type NodeValues<N> = [LiteralKeys<N>] extends [never]
  ? BaseNode
  : N[LiteralKeys<N>];
type NodeTypeUnion<N> =
  NodeValues<N> extends { nodeType: infer T } ? Extract<T, string> : string;

/**
 * Derived view of nodes
 */
export type NodeInformation<Nodes> = {
  Nodes: Nodes;
  AnyNode: NodeValues<Nodes>;
  NodeNames: LiteralKeys<Nodes>;
  NodeTypes: NodeTypeUnion<Nodes>;
};

type NodeProp<
  Nodes,
  Prop extends keyof NodeInformation<Nodes>,
  Fallback,
> = NodeInformation<Nodes>[Prop] extends infer Value
  ? [Value] extends [never]
    ? Fallback
    : Value
  : Fallback;

export type AllNodes<NodesDefinition> = NodeProp<
  NodesDefinition,
  "Nodes",
  NodeMap
>;
export type NodeUnion<NodesDefinition> = NodeProp<
  NodesDefinition,
  "AnyNode",
  BaseNode
>;
export type NodeNamesUnion<NodesDefinition> = NodeProp<
  NodesDefinition,
  "NodeNames",
  string
>;
export type NodeTypesUnion<NodesDefinition> = NodeProp<
  NodesDefinition,
  "NodeTypes",
  string
>;
