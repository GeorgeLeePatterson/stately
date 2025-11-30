import type { BaseNode } from '@stately/schema/nodes';
import type { StatelySchemas } from '@stately/schema/schema';
import { Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AllUiPlugins, AnyUiPlugin } from './plugin';

export interface UiUtils {
  // Universal
  generateFieldLabel(field: string): string;
  stripLeadingSlash(path: string): string;
  stripTrailingSlash(path: string): string;
  mergePathPrefixOptions(base?: string, incoming?: string): string;
  toKebabCase: typeof toKebabCase;
  toTitleCase: typeof toTitleCase;
  toSpaceCase: typeof toSpaceCase;
  camelCaseToKebabCase(field: string): string;
  // Delegates to plugins
  getNodeTypeIcon(node: string): ComponentType<any> | null;
  getDefaultValue(node: BaseNode): any;
}

/**
 * Strip a leading slash
 */
export const stripLeadingSlash = (path: string) => (path?.startsWith('/') ? path.slice(1) : path);

/**
 * Strip a trailing slash
 */
export const stripTrailingSlash = (path: string) =>
  path?.endsWith('/') ? path.slice(0, -1) : path;

export const mergePathPrefixOptions = (base?: string, incoming?: string): string => {
  let pathPrefix = '';
  if (base) {
    pathPrefix = `/${stripLeadingSlash(stripTrailingSlash(base))}`;
  }
  if (incoming) {
    pathPrefix = `${pathPrefix}/${stripLeadingSlash(stripTrailingSlash(incoming))}`;
  }
  return pathPrefix;
};

/**
 * Generate a field label from a string
 */
export function generateFieldLabel(field: string): string {
  return toSpaceCase(camelCaseToKebabCase(field));
}

/**
 * Convert camelCase to kebab-case
 */
export function camelCaseToKebabCase(field: string): string {
  return field
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // Handle acronyms: XMLParser → XML-Parser
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Handle camelCase: userId → user-Id
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * Generate kebab-case label from string
 */
export function toKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}

/**
 * Generate title-case label from string
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/-/g, '_')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert kebab or snake-case to space case
 */
export function toSpaceCase(str: string): string {
  return str.replace(/[-_]/g, ' ');
}

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
    stripLeadingSlash,
    stripTrailingSlash,
    toKebabCase,
    toSpaceCase,
    toTitleCase,
  };
}
