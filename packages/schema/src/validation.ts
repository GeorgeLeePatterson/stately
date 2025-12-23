/**
 * Validation types for schema validation.
 *
 * This module provides the type definitions for validating data against
 * Stately schemas. The validation system supports recursive validation
 * with depth limiting, plugin-based validation hooks, and detailed
 * error reporting.
 *
 * @module validation
 */

import type { BaseNode } from './nodes.js';
import type { StatelySchemas } from './schema.js';

/**
 * Represents a single validation error with location and context.
 *
 * @example
 * ```typescript
 * const error: ValidationError = {
 *   path: 'user.email',
 *   message: 'Invalid email format',
 *   value: 'not-an-email'
 * };
 * ```
 */
export interface ValidationError {
  /** JSON path to the invalid value (e.g., 'user.address.city') */
  path: string;
  /** Human-readable description of the validation failure */
  message: string;
  /** The actual value that failed validation (optional for security) */
  value?: any;
}

/**
 * Result of a validation operation.
 *
 * Contains the overall validity status and an array of any errors
 * encountered during validation.
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   errors: [
 *     { path: 'name', message: 'Required field missing' }
 *   ]
 * };
 *
 * if (!result.valid) {
 *   result.errors.forEach(err => console.log(`${err.path}: ${err.message}`));
 * }
 * ```
 */
export interface ValidationResult {
  /** Whether the validated data passed all validation rules */
  valid: boolean;
  /** Array of validation errors (empty if valid is true) */
  errors: ValidationError[];
}

/**
 * Configuration options for validation behavior.
 *
 * Controls recursion depth, debugging output, and warning callbacks
 * for deeply nested validation.
 *
 * @example
 * ```typescript
 * const options: ValidationOptions = {
 *   maxDepth: 10,
 *   warnDepth: 5,
 *   debug: true,
 *   onDepthWarning: (path, depth) => {
 *     console.warn(`Deep validation at ${path} (depth: ${depth})`);
 *   }
 * };
 * ```
 */
export interface ValidationOptions {
  /** Current recursion depth (used internally) */
  depth?: number;
  /** Depth at which to trigger warning callback */
  warnDepth?: number;
  /** Maximum allowed recursion depth before stopping validation */
  maxDepth?: number;
  /** Enable verbose debug output during validation */
  debug?: boolean;
  /** Callback invoked when validation exceeds warnDepth */
  onDepthWarning?: (path: string, depth: number) => void;
}

/**
 * Context passed to validation hooks in plugins.
 *
 * Provides all the information needed for a plugin to validate
 * a value at a specific path in the data structure.
 *
 * @typeParam S - The StatelySchemas type being validated against
 * @typeParam Node - The schema node type at this location
 *
 * @example
 * ```typescript
 * function customValidation(args: ValidateArgs): ValidationResult | undefined {
 *   if (args.schema.type === 'string' && typeof args.data !== 'string') {
 *     return {
 *       valid: false,
 *       errors: [{ path: args.path, message: 'Expected string' }]
 *     };
 *   }
 *   return undefined; // Let other validators handle it
 * }
 * ```
 */
export interface ValidateArgs<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  Node extends BaseNode = S['plugin']['AnyNode'],
> {
  /** JSON path to the current location being validated */
  path: string;
  /** The actual data value to validate */
  data: any;
  /** The schema node defining the expected structure */
  schema: Node;
  /** Validation options controlling behavior */
  options?: ValidationOptions;
}

/**
 * Validation hook function signature for plugins.
 *
 * Plugins can provide validation hooks that are called during schema
 * validation. Returning `undefined` indicates the hook doesn't handle
 * this validation case and other hooks should be tried.
 *
 * @typeParam S - The StatelySchemas type being validated against
 * @returns ValidationResult if handled, undefined to pass to next hook
 *
 * @example
 * ```typescript
 * const dateValidator: ValidateHook = (args) => {
 *   if (args.schema.format === 'date-time') {
 *     const date = new Date(args.data);
 *     if (isNaN(date.getTime())) {
 *       return {
 *         valid: false,
 *         errors: [{ path: args.path, message: 'Invalid date format' }]
 *       };
 *     }
 *     return { valid: true, errors: [] };
 *   }
 *   return undefined;
 * };
 * ```
 */
export type ValidateHook<S extends StatelySchemas<any, any> = StatelySchemas<any, any>> = (
  args: ValidateArgs<S>,
) => ValidationResult | undefined;
