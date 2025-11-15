import type { LiteralKeys } from './helpers';

export const UnknownNodeType = 'unknown';
export type TUnknownNodeType = typeof UnknownNodeType;

/**
 * Base node interface
 *
 * The nodeType can be any string. Codegen emits "unknown" for schemas it cannot parse,
 * which allows graceful degradation - the UI will show "Unknown node type" for these.
 */
export interface BaseNode {
  nodeType: string;
  description?: string;
  [key: string]: unknown;
}

export interface UnknownNode extends BaseNode {
  nodeType: TUnknownNodeType;
  description?: string;
}

/** Node map helper used internally for fallbacks. */
export type NodeMap = Record<string, BaseNode>;

type NodeValues<N> = [LiteralKeys<N>] extends [never] ? BaseNode | UnknownNode : N[LiteralKeys<N>];
type NodeTypeUnion<N> = NodeValues<N> extends { nodeType: infer T } ? Extract<T, string> : string;

/**
 * Derived view of nodes
 */
export type NodeInformation<Nodes> = {
  Nodes: Nodes & { [UnknownNodeType]: UnknownNode };
  AnyNode: NodeValues<Nodes>;
  NodeNames: LiteralKeys<Nodes>;
  NodeTypes: NodeTypeUnion<Nodes> | TUnknownNodeType;
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

export type AllNodes<NodesDefinition> = NodeProp<NodesDefinition, 'Nodes', NodeMap>;
export type NodeUnion<NodesDefinition> = NodeProp<NodesDefinition, 'AnyNode', BaseNode>;
export type NodeNamesUnion<NodesDefinition> = NodeProp<NodesDefinition, 'NodeNames', string>;
export type NodeTypesUnion<NodesDefinition> = NodeProp<NodesDefinition, 'NodeTypes', string>;
