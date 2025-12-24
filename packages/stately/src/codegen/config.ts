/**
 * Configuration types for the Stately code generator.
 *
 * This module contains all type definitions, interfaces, and configuration
 * structures used by the codegen system.
 */

import { BaseNode } from "@statelyjs/schema";

// =============================================================================
// Core Types
// =============================================================================

/**
 * A serialized schema node - the output format of the parsing process.
 *
 * All nodes must at least be structured on top of `BaseNode`
 *
 * Additional properties vary by node type (properties, items, variants, etc.).
 */
export interface SerializedNode extends BaseNode {
  [key: string]: any;
}

/**
 * Cache entry for tracking schema parsing state.
 * Used for cycle detection during recursive parsing.
 */
export interface SchemaCache {
  node: SerializedNode | null;
  state: 'uninitialized' | 'parsing' | 'complete';
}

// =============================================================================
// OpenAPI Types
// =============================================================================

/**
 * OpenAPI specification structure (minimal typing for plugin use).
 */
export interface OpenAPISpec {
  components?: { schemas?: Record<string, any> };
  [key: string]: any;
}

// =============================================================================
// Plugin Types
// =============================================================================

/**
 * Context provided to plugins during schema transformation.
 */
export interface CodegenPluginContext {
  /** The name of the schema being parsed (if known) */
  schemaName?: string;
  /** Resolve a $ref string to its schema definition */
  resolveRef: (ref: string) => any | undefined;
  /** Recursively parse a schema (for nested structures) */
  parseSchema: (schema: any, schemaName?: string) => SerializedNode | null;
}

/**
 * A codegen plugin that transforms OpenAPI schemas to SerializedNodes.
 */
export interface CodegenPlugin {
  /** Unique identifier for the plugin */
  name: string;
  /** Human-readable description */
  description?: string;
  /**
   * Optional function to declare entry point schemas for code splitting.
   * Entry points are parsed into the main bundle; schemas reached only
   * through recursion are split into a runtime bundle for lazy loading.
   *
   * If not provided or returns undefined/empty, all schemas are bundled together.
   *
   * @param spec - The full OpenAPI specification
   * @returns Array of schema names to use as entry points
   */
  entryPoints?: (spec: OpenAPISpec) => string[] | undefined;
  /**
   * Optional predicate to determine if this plugin should handle a schema.
   * If not provided, the plugin is considered a match for all schemas.
   */
  match?: (schema: any, ctx: CodegenPluginContext) => boolean;
  /**
   * Transform a schema into a SerializedNode.
   * Return null/undefined to pass to the next plugin.
   */
  transform: (schema: any, ctx: CodegenPluginContext) => SerializedNode | null | undefined;
}
