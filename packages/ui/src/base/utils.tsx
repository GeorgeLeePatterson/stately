import type { BaseNode } from '@stately/schema/nodes';
import type { StatelySchemas } from '@stately/schema/schema';
import { Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AllUiPlugins, AnyUiPlugin } from './plugin';

export interface UiUtils {
  // Universal
  generateFieldLabel(field: string): string;
  stripTrailingSlash(path: string): string;
  toKebabCase: typeof toKebabCase;
  toTitleCase: typeof toTitleCase;
  toSpaceCase: typeof toSpaceCase;
  // Delegates to plugins
  getNodeTypeIcon(node: string): ComponentType<any> | null;
  getDefaultValue(node: BaseNode): any;
}

/**
 * Strip a trailing slash
 */
export const stripTrailingSlash = (path: string) =>
  path?.endsWith('/') ? path.slice(0, -1) : path;

/**
 * Generate field label from string
 */
export function generateFieldLabel(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1-$2')
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
    stripTrailingSlash,
    toKebabCase,
    toSpaceCase,
    toTitleCase,
  };
}
