import type { LiteralKeys } from './helpers';

export const UnknownNodeType = 'unknown';
export type TUnknownNodeType = typeof UnknownNodeType;

/**
 * Base node interface
 *
 * The nodeType can be any string. Codegen emits "unknown" for schemas it cannot parse,
 * which allows graceful degradation - the UI will show "Unknown node type" for these.
 *
 * NOTE: No index signature - this allows TypeScript's discriminated union narrowing to work.
 * All node properties must be explicitly defined in their respective node type interfaces.
 */
export interface BaseNode {
  nodeType: string;
  description?: string;
}

export interface UnknownNode extends BaseNode {
  nodeType: TUnknownNodeType;
  description?: string;
}

/** Node map helper used internally for fallbacks. */
export type NodeMap = Record<string, BaseNode>;

export type NodeValues<N> = [LiteralKeys<N>] extends [never] ? UnknownNode : N[LiteralKeys<N>];
export type NodeValuesWithUnknown<N> = NodeValues<N & { [UnknownNodeType]: UnknownNode }>;

export type NodeTypeUnion<N> = NodeValues<N> extends { nodeType: infer T }
  ? Extract<T, string>
  : string;

/**
 * Derived view of nodes
 */
export type NodeInformation<Nodes> = {
  Nodes: Nodes & { [UnknownNodeType]: UnknownNode };
  AnyNode: NodeValuesWithUnknown<Nodes>;
  NodeNames: LiteralKeys<Nodes & { [UnknownNodeType]: UnknownNode }>;
  NodeTypes: NodeValuesWithUnknown<Nodes> extends { nodeType: infer T }
    ? Extract<T, string>
    : string;
};
