/**
 * @stately/schema - Plugin System
 *
 * Defines the plugin interfaces + helper types for extending Stately schemas.
 */
import type { AnyRecord, EmptyRecord } from './helpers.js';
import type { BaseNode, NodeInformation, NodeMap } from './nodes.js';

/**
 * Schema augment contributed by a plugin. Each augment registers the canonical
 * node map it provides plus any additional helper types it wants to merge into
 * the final `Schemas` surface. Plugin authors only need to supply the node map;
 * everything else will be wired into the `Plugin` view automatically.
 */
export type SchemaAugment<
  Name extends string,
  Nodes = NodeMap,
  Types = EmptyRecord,
  Data extends AnyRecord = EmptyRecord,
  Utils extends AnyRecord = EmptyRecord,
> = {
  name: Name;
  nodes: Nodes extends NodeMap ? Nodes : Nodes & NodeMap;
  types?: Types;
  data?: Data;
  utils?: Utils;
};

/**
 * Plugin helper types for nodes
 */
export type PluginNodeMap<Schema> = Schema extends { plugin: NodeInformation<any> }
  ? Schema['plugin']['Nodes']
  : NodeMap;
export type PluginNodeUnion<Schema> = Schema extends { plugin: NodeInformation<any> }
  ? Schema['plugin']['AnyNode']
  : BaseNode;
export type PluginNodeNames<Schema> = Schema extends { plugin: NodeInformation<any> }
  ? Schema['plugin']['NodeNames']
  : string;
export type PluginNodeTypes<Schema> = Schema extends { plugin: NodeInformation<any> }
  ? Schema['plugin']['NodeTypes']
  : string;

/**
 * =============================================================================
 * PLUGIN AUTHOR HELPERS - "Fill in the form" types
 * =============================================================================
 * These helpers guide plugin authors to define the correct types for their
 * augments. Use these when creating custom plugins.
 */

/**
 * Define the node map for your plugin augment.
 * The type system will automatically add the required index signature.
 *
 * @example
 * ```typescript
 * type MyNodeMap = DefineNodeMap<{
 *   myCustomNode: MyCustomNodeType;
 *   anotherNode: AnotherNodeType;
 * }>;
 * ```
 */
export type DefineNodeMap<
  T extends Record<string, BaseNode> = Record<string, BaseNode>,
> = T;

/**
 * Define additional types to expose from your plugin.
 *
 * @example
 * ```typescript
 * type MyTypes = DefineTypes<{
 *   MyHelper: { foo: string };
 *   MyConfig: { bar: number };
 * }>;
 * ```
 */
export type DefineTypes<T extends AnyRecord = EmptyRecord> = T;

/**
 * Define runtime data to expose from your plugin.
 *
 * @example
 * ```typescript
 * type MyData = DefineData<{
 *   registry: Map<string, string>;
 *   cache: Record<string, unknown>;
 * }>;
 * ```
 */
export type DefineData<T extends AnyRecord = EmptyRecord> = T;

/**
 * Define utility functions to expose from your plugin.
 *
 * @example
 * ```typescript
 * type MyUtils = DefineUtils<{
 *   parseFile: (path: string) => FileNode;
 *   validateFile: (file: FileNode) => boolean;
 * }>;
 * ```
 */
export type DefineUtils<T extends AnyRecord = EmptyRecord> = T;
