import type { OpenAPIV3_1 } from 'openapi-types';
import type { StringKeys } from './helpers';
import type {
  AllNodes,
  BaseNode,
  NodeMap,
  NodeNamesUnion,
  NodeTypesUnion,
  NodeUnion,
} from './nodes';

/**
 * Base provided configuration
 */
export interface StatelyConfig<
  Components extends OpenAPIV3_1.ComponentsObject = OpenAPIV3_1.ComponentsObject,
  Paths extends OpenAPIV3_1.PathsObject<any, any> = OpenAPIV3_1.PathsObject<any, any>,
  Nodes extends Record<string, BaseNode> = Record<string, BaseNode>,
> {
  components: Components;
  paths: Paths;
  nodes: Nodes;
}

/**
 * Define the Config
 *
 * @example
 * ```typescript
 * type MyStatelyConfig = DefineStatelyConfig<{
 *   components: {},
 *   paths: {},
 *   nodes: {},
 * }>;
 * ```
 */
export type DefineStatelyConfig<
  C extends DefineComponents<{}> = DefineComponents<{}>,
  P extends DefinePaths<{}> = DefinePaths<{}>,
  N extends DefineGeneratedNodes<{}> = DefineGeneratedNodes<{}>,
> = StatelyConfig<
  C & StatelyConfig['components'],
  P & StatelyConfig['paths'],
  N
>;

/**
 * =============================================================================
 * CONFIG DEFINITION HELPERS - "Fill in the form" types for StatelyConfig
 * =============================================================================
 * These helpers guide plugin authors to define the correct types for configs
 * that their plugins expect. Use these when creating custom config types.
 */

/**
 * Define the OpenAPI components structure your plugin expects.
 *
 * @example
 * ```typescript
 * type MyComponents = DefineComponents<{
 *   schemas: {
 *     MyEntity: { type: 'object'; properties: {...} };
 *   }
 * }>;
 * ```
 */
export type DefineComponents<
  T extends Partial<OpenAPIV3_1.ComponentsObject> = OpenAPIV3_1.ComponentsObject,
> = T;

/**
 * Define the OpenAPI components schemas structure your plugin expects.
 *
 * @example
 * ```typescript
 * type MyComponentsSchemas = DefineComponentSchemas<{
 *   MyEntity: { type: 'object'; properties: {...} };
 * }>;
 * ```
 */
export type DefineComponentSchemas<
  T extends OpenAPIV3_1.ComponentsObject['schemas'] = OpenAPIV3_1.ComponentsObject['schemas'],
> = T;

/**
 * Define the OpenAPI paths structure your plugin expects.
 *
 * @example
 * ```typescript
 * type MyPaths = DefinePaths<{
 *   '/api/users': { get: {...} };
 * }>;
 * ```
 */
export type DefinePaths<
  T extends OpenAPIV3_1.PathsObject<any, any> = OpenAPIV3_1.PathsObject<any, any>,
> = T;

/**
 * Define the generated node structure your plugin expects.
 * All nodes must extend BaseNode.
 *
 * @example
 * ```typescript
 * type MyGeneratedNodes = DefineGeneratedNodes<{
 *   User: ObjectNode;
 *   Post: ObjectNode;
 * }>;
 * ```
 */
export type DefineGeneratedNodes<T extends Record<string, any> = Record<string, BaseNode>> = T extends Record<string, BaseNode> ? T : never;

export type GeneratedNodeMap<Config extends StatelyConfig> = [StringKeys<Config['nodes']>] extends [
  never,
]
  ? NodeMap
  : {
      [K in StringKeys<Config['nodes']>]: Config['nodes'][K] extends BaseNode
        ? Config['nodes'][K]
        : BaseNode;
    };

export type GeneratedNodes<Config extends StatelyConfig> = AllNodes<GeneratedNodeMap<Config>>;
export type GeneratedNodeUnion<Config extends StatelyConfig> = NodeUnion<GeneratedNodeMap<Config>>;
export type GeneratedNodeNames<Config extends StatelyConfig> = NodeNamesUnion<
  GeneratedNodeMap<Config>
>;
export type GeneratedNodeTypes<Config extends StatelyConfig> = NodeTypesUnion<
  GeneratedNodeMap<Config>
>;
