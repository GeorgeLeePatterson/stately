import type { BaseNode } from '@statelyjs/schema/nodes';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import { Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AllUiPlugins, AnyUiPlugin } from './plugin';

export interface UiUtils {
  // Universal
  generateFieldLabel(field: string): string;
  stripLeading(path: string): string;
  stripTrailing(path: string): string;
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
export const stripLeading = (path: string, char = '/') =>
  path?.startsWith(char) ? path.slice(char.length) : path;

/**
 * Strip a trailing slash
 */
export const stripTrailing = (path: string, char = '/') =>
  path?.endsWith(char) ? path.slice(0, -1 * char.length) : path;

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
 * Generate a field label from a string
 */
export function generateFieldLabel(field: string): string {
  return toSpaceCase(camelCaseToKebabCase(field));
}

/**
 * Generate a unique form id for field routers (field-edit and field-view)
 */
export function generateFieldFormId(fieldType: string, propertyName: string, formId = ''): string {
  const suffix = formId ? `__${formId}` : '';
  return `[${[fieldType, propertyName].join('__')}]${suffix}`;
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
    stripLeading,
    stripTrailing,
    toKebabCase,
    toSpaceCase,
    toTitleCase,
  };
}
