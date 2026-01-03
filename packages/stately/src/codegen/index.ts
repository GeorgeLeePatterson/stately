/**
 * Codegen plugin types for building custom schema transformers.
 *
 * This module provides the types needed to create custom codegen plugins
 * that transform OpenAPI schemas into Stately's internal node representation.
 *
 * @example
 * ```typescript
 * import type { CodegenPlugin } from '@statelyjs/stately/codegen';
 *
 * const myPlugin: CodegenPlugin = {
 *   name: 'my-plugin',
 *   match: (schema) => schema['x-my-custom'] !== undefined,
 *   transform: (schema, ctx) => ({
 *     type: 'custom',
 *     // ... transform logic
 *   }),
 * };
 * ```
 *
 * @module codegen
 */

export type { CodegenPlugin, CodegenPluginContext, OpenAPISpec } from './config.js';
