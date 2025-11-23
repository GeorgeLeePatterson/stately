/**
 * @stately/schema - Plugin System
 *
 * Defines the plugin interfaces + helper types for extending Stately schemas.
 *
 * =============================================================================
 * PLUGIN AUTHOR HELPERS - "Fill in the form" types
 * =============================================================================
 * These helpers guide plugin authors to define the correct types for their
 * augments. Use these when creating custom plugins.
 */
import type { AnyRecord, EmptyRecord, NeverRecord } from './helpers.js';
import type { NodeMap, UnknownNode, UnknownNodeType } from './nodes.js';
import type { StatelySchemas } from './schema.js';
import type { ValidateHook } from './validation.js';

/**
 * Plugin helper types for nodes
 */
export type PluginNodeUnion<S extends StatelySchemas<any, any>> = S['plugin']['AnyNode'];

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
export type DefineNodeMap<T extends NodeMap = NodeMap> = { [K in keyof T]: T[K] } & {
  [UnknownNodeType]: UnknownNode;
};

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
export type DefineTypes<T extends AnyRecord = NeverRecord> = T;

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
export type DefineData<T extends AnyRecord = AnyRecord> = T;

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
export type DefineUtils<T extends AnyRecord = EmptyRecord> = T & { validate?: ValidateHook };

/**
 * Describes the structural shape of any plugin augment.
 *
 * IMPORTANT: Prefer `DefinePlugin` if declaring a plugin's augment.
 *
 * Use this when you need to reference plugins generically (e.g., constraints, schema plumbing)
 * without enforcing literal-string 'Name' requirements.
 */
export type PluginAugment<
  Name extends string,
  Nodes extends NodeMap = NodeMap,
  Types extends DefineTypes = NeverRecord,
  Data extends DefineData = NeverRecord,
  Utils extends DefineUtils<AnyRecord> = AnyRecord,
> = { name: Name; nodes: Nodes; types?: Types; data?: Data; utils?: Utils };

export type AnySchemaPlugin = PluginAugment<string, NodeMap, any, any, any>;
export type AnySchemaAugments = readonly AnySchemaPlugin[];
