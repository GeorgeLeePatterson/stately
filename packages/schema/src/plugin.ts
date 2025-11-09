// schema/plugin.ts
/**
 * @stately/schema - Plugin System
 *
 * Defines the plugin interface for extending Stately schemas
 */

import type { StatelyConfig, StatelySchemas } from './index.js';

/**
 * Base node interface that all node types must extend
 */
export interface BaseSchemaNode {
  nodeType: string;
  description?: string;
}

/**
 * Schema plugin interface
 */
export interface StatelySchemaPlugin<
  Nodes extends Record<string, BaseSchemaNode>,
  Extensions = Record<string, any>,
> {
  nodes: Nodes;
  extensions: Extensions;
}

/**
 * Type helper: Verify plugin node types exist in schemas
 * Ties the check to the caller's Config (not a generic Schemas).
 */
export type ValidatePlugin<
  Config extends StatelyConfig,
  Plugin extends StatelySchemaPlugin<any, any>,
> = keyof Plugin['nodes'] extends keyof StatelySchemas<Config>['nodes'] ? Plugin : never;
