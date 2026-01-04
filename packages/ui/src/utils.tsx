/**
 * Utility functions for StatelyUi.
 *
 * This module provides helper functions for string manipulation, path handling,
 * and runtime utilities. These are used throughout the UI package and are
 * available via `runtime.utils`.
 *
 * @module utils
 */

import type { BaseNode } from '@statelyjs/schema/nodes';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import { Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AllUiPlugins, AnyUiPlugin } from './plugin';

/**
 * Collection of utility functions available on the runtime.
 *
 * Access via `runtime.utils` in components. Plugins can extend these
 * utilities by providing their own implementations of `getNodeTypeIcon`
 * and `getDefaultValue`.
 */
export interface UiUtils {
  // String utilities
  /** Generate a human-readable label from a field name */
  generateFieldLabel(field: string): string;
  /** Remove leading character (default: '/') from a path */
  stripLeading(path: string): string;
  /** Remove trailing character (default: '/') from a path */
  stripTrailing(path: string): string;
  /** Merge base and incoming path prefixes into a single path */
  mergePathPrefixOptions(base?: string, incoming?: string): string;
  /** Convert underscores to hyphens */
  toKebabCase: typeof toKebabCase;
  /** Convert kebab/snake-case to Title Case */
  toTitleCase: typeof toTitleCase;
  /** Convert kebab/snake-case to space-separated words */
  toSpaceCase: typeof toSpaceCase;
  /** Convert camelCase to kebab-case */
  camelCaseToKebabCase(field: string): string;

  // Plugin-delegated utilities
  /**
   * Get an icon component for a node type.
   * Delegates to plugins; returns Dot icon if no plugin handles it.
   */
  getNodeTypeIcon(node: string): ComponentType<any> | null;
  /**
   * Get the default value for a node type.
   * Delegates to plugins for type-specific defaults.
   */
  getDefaultValue(node: BaseNode): any;
}

/**
 * Remove a leading character from a string.
 *
 * @param path - The string to process
 * @param char - The character to remove (default: '/')
 * @returns The string without the leading character
 *
 * @example
 * ```typescript
 * stripLeading('/api/users'); // 'api/users'
 * stripLeading('--flag', '-'); // '-flag'
 * ```
 */
export const stripLeading = (path: string, char = '/') =>
  path?.startsWith(char) ? path.slice(char.length) : path;

/**
 * Remove a trailing character from a string.
 *
 * @param path - The string to process
 * @param char - The character to remove (default: '/')
 * @returns The string without the trailing character
 *
 * @example
 * ```typescript
 * stripTrailing('/api/users/'); // '/api/users'
 * ```
 */
export const stripTrailing = (path: string, char = '/') =>
  path?.endsWith(char) ? path.slice(0, -1 * char.length) : path;

/**
 * Merge base and incoming path prefixes into a normalized path.
 *
 * @param base - Base path prefix
 * @param incoming - Additional path to append
 * @returns Combined path with proper slash handling
 *
 * @example
 * ```typescript
 * mergePathPrefixOptions('/api', 'v1'); // '/api/v1'
 * mergePathPrefixOptions('/api/', '/v1/'); // '/api/v1'
 * ```
 */
export const mergePathPrefixOptions = (base?: string, incoming?: string): string => {
  let pathPrefix = '';
  if (base) {
    pathPrefix = `/${stripLeading(stripTrailing(base))}`;
  }
  if (incoming) {
    pathPrefix = `${stripTrailing(pathPrefix)}/${stripLeading(stripTrailing(incoming))}`;
  }
  return pathPrefix;
};

/**
 * Generate a human-readable label from a field name.
 *
 * Converts camelCase or snake_case to space-separated words.
 *
 * @param field - The field name to convert
 * @returns A human-readable label
 *
 * @example
 * ```typescript
 * generateFieldLabel('userName'); // 'user name'
 * generateFieldLabel('created_at'); // 'created at'
 * ```
 */
export function generateFieldLabel(field: string): string {
  return toTitleCase(field);
}

/**
 * Generate a unique form ID for field components.
 *
 * Used internally by field-edit and field-view components for
 * React key generation and form element IDs.
 *
 * @param fieldType - The type of the field (e.g., 'string', 'number')
 * @param propertyName - The property name in the schema
 * @param formId - Optional parent form ID for namespacing
 * @returns A unique identifier string
 */
export function generateFieldFormId({
  fieldType,
  propertyName,
  instanceFormId = '',
  formId = '',
}: {
  fieldType: string;
  propertyName: string;
  instanceFormId?: string;
  formId?: string;
}): string {
  const instanceSuffix = instanceFormId ? `__${instanceFormId}` : '';
  const suffix = formId ? `__${formId}` : '';
  return `[${[fieldType, propertyName].join('__')}${instanceSuffix}]${suffix}`;
}

/**
 * Split a string into words.
 *
 * @param input - The string to split
 * @returns An array of words
 */
export function splitWords(input: string): string[] {
  return (
    input
      // XMLParser → XML Parser
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      // userId → user Id
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // snake_case / kebab-case → spaces
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)
  );
}

/**
 * Convert camelCase or PascalCase to kebab-case.
 *
 * Handles acronyms correctly (e.g., XMLParser → xml-parser).
 *
 * @param field - The string to convert
 * @returns The kebab-case version
 *
 * @example
 * ```typescript
 * camelCaseToKebabCase('userId'); // 'user-id'
 * camelCaseToKebabCase('XMLParser'); // 'xml-parser'
 * camelCaseToKebabCase('getHTTPResponse'); // 'get-http-response'
 * ```
 */
export function camelCaseToKebabCase(field: string): string {
  return field
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // Handle acronyms: XMLParser → XML-Parser
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Handle camelCase: userId → user-Id
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * Convert underscores to hyphens.
 *
 * @param str - The string to convert
 * @returns The string with underscores replaced by hyphens
 *
 * @example
 * ```typescript
 * toKebabCase('user_name'); // 'user-name'
 * ```
 */
export function toKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}

/**
 * Convert kebab-case or snake_case to Title Case.
 *
 * @param str - The string to convert
 * @returns Title case string with spaces
 *
 * @example
 * ```typescript
 * toTitleCase('user-name'); // 'User Name'
 * toTitleCase('created_at'); // 'Created At'
 * ```
 */
export function toTitleCase(str?: string): string {
  return splitWords(str ?? '')
    .map(w =>
      // Preserve ALL-CAPS acronyms like XML, ID, HTTP
      w.length > 1 && w === w.toUpperCase()
        ? w
        : w.length > 1
          ? w[0].toUpperCase() + w.slice(1)
          : w,
    )
    .join(' ');
}

/**
 * Convert kebab-case or snake_case to space-separated words.
 *
 * @param str - The string to convert
 * @returns Space-separated string
 *
 * @example
 * ```typescript
 * toSpaceCase('user-name'); // 'user name'
 * toSpaceCase('created_at'); // 'created at'
 * ```
 */
export function toSpaceCase(str: string): string {
  return str.replace(/[-_]/g, ' ');
}

/**
 * Create the runtime utilities object with plugin delegation.
 *
 * @internal Used by `createStatelyUi` to build the utils object.
 */
export function runtimeUtils<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
>(plugins: AllUiPlugins<Schema, Augments>): UiUtils {
  return {
    camelCaseToKebabCase,
    generateFieldLabel,
    getDefaultValue(node: BaseNode): any {
      for (const plugin of Object.values(plugins)) {
        const hook = plugin?.utils?.getDefaultValue;
        if (!hook) continue;
        const icon = hook(node);
        if (icon) return icon;
      }

      return Dot;
    },
    getNodeTypeIcon(node: string): ComponentType<any> {
      for (const plugin of Object.values(plugins)) {
        const hook = plugin?.utils?.getNodeTypeIcon;
        if (!hook) continue;
        const icon = hook(node);
        if (icon) return icon;
      }
      return Dot;
    },
    mergePathPrefixOptions,
    stripLeading,
    stripTrailing,
    toKebabCase,
    toSpaceCase,
    toTitleCase,
  };
}
