/**
 * Schema Node Types
 *
 * Defines the base node interface and derived types for schema nodes.
 * Nodes represent parsed OpenAPI schema components (objects, arrays, primitives, etc.).
 */

import type { LiteralKeys } from './helpers';

/** Constant for the unknown node type discriminator. */
export const UnknownNodeType = 'unknown';

/** Type alias for the unknown node type string literal. */
export type TUnknownNodeType = typeof UnknownNodeType;

/**
 * Base interface for all schema nodes.
 *
 * Every node in the schema system extends this interface. The `nodeType` discriminator
 * enables TypeScript's discriminated union narrowing for type-safe node handling.
 *
 * Codegen emits `nodeType: 'unknown'` for schemas it cannot parse, allowing graceful
 * degradation - the UI will render a fallback for these.
 *
 * @remarks
 * No index signature is used - this allows TypeScript's discriminated union narrowing
 * to work correctly. All node properties must be explicitly defined in their respective
 * node type interfaces.
 */
export interface BaseNode {
  /** Discriminator identifying the node type (e.g., 'object', 'string', 'array'). */
  nodeType: string;
  /** Optional description from the OpenAPI schema. */
  description?: string;
}

/**
 * Fallback node for schemas that couldn't be parsed.
 * Used when codegen encounters an unsupported or malformed schema.
 */
export interface UnknownNode extends BaseNode {
  nodeType: TUnknownNodeType;
  description?: string;
}

/** A map of node names to their node definitions. */
export type NodeMap = Record<string, BaseNode>;

/**
 * Extracts the union of node values from a node map.
 * Returns `UnknownNode` if the map has no literal keys.
 */
export type NodeValues<N> = [LiteralKeys<N>] extends [never] ? UnknownNode : N[LiteralKeys<N>];

/** Node values union that always includes UnknownNode. */
export type NodeValuesWithUnknown<N> = NodeValues<N & { [UnknownNodeType]: UnknownNode }>;

/** Extracts the union of nodeType strings from a node map. */
export type NodeTypeUnion<N> = NodeValues<N> extends { nodeType: infer T }
  ? Extract<T, string>
  : string;

/**
 * Derived type information from a node map.
 * Provides convenient access to node types, unions, and discriminators.
 *
 * @typeParam Nodes - The node map to derive information from
 */
export type NodeInformation<Nodes> = {
  /** The node map with UnknownNode included. */
  Nodes: Nodes & { [UnknownNodeType]: UnknownNode };
  /** Union of all node types (for discriminated union patterns). */
  AnyNode: NodeValuesWithUnknown<Nodes>;
  /** Union of all node name strings. */
  NodeNames: LiteralKeys<Nodes & { [UnknownNodeType]: UnknownNode }>;
  /** Union of all nodeType discriminator values. */
  NodeTypes: NodeValuesWithUnknown<Nodes> extends { nodeType: infer T }
    ? Extract<T, string>
    : string;
};
