import type { CoreStatelyConfig } from '@stately/schema/core/generated';
import { CoreNodeType, type CoreNodeUnion } from '@stately/schema/core/nodes';
import { Braces, Brackets, Cog, SendToBack, Shapes, TextCursorInput } from 'lucide-react';
import type { ComponentType } from 'react';
import { getComponentByPath } from '@/registry';
import type { ComponentRegistry } from '@/runtime';
import { Schemas } from '@stately/schema';

export interface CoreUtils<Schema extends Schemas = Schemas> {
  generateFieldLabel(field: string): string;
  getDefaultValue(node: Schema['plugin']['AnyNode']): unknown;
  sortEntityProperties(
    properties: Array<[string, Schema['plugin']['AnyNode']]>,
    value: any,
    required: Set<string>,
  ): Array<[string, Schema['plugin']['AnyNode']]>;
  extractNodeType(node: Schema['plugin']['AnyNode']): Schema['plugin']['AnyNode']['nodeType'];
}

/**
 * Get the icon component for a given node type.
 * First checks the component registry for a custom icon, falls back to defaults.
 */
export function getNodeTypeIcon(
  nodeType: string,
  registry?: ComponentRegistry,
): ComponentType<any> {
  // Look up an icon component for this nodeType
  const iconExt = registry ? getComponentByPath(registry, nodeType, ['icon']) : undefined;

  // If the registry provided a React component for the icon, return it directly.
  // The registry returns a ComponentType, not a callable factory, so don't invoke it.
  if (iconExt) {
    return iconExt as unknown as ComponentType<any>;
  }

  switch (nodeType) {
    case CoreNodeType.Object:
      return Braces;
    case CoreNodeType.Tuple:
    case CoreNodeType.Array:
      return Brackets;
    case CoreNodeType.Primitive:
      return TextCursorInput;
    case CoreNodeType.Map:
      return SendToBack;
    case CoreNodeType.Enum:
    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return Shapes;
    case CoreNodeType.Link:
      return Cog;
    default:
      return Cog;
  }
}

export function generateFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Default value generation
 */

export function getDefaultValue<Config extends CoreStatelyConfig>(
  node: CoreNodeUnion<Config>,
): any {
  switch (node.nodeType) {
    case CoreNodeType.Primitive:
      switch ((node as any).primitiveType) {
        case 'string':
          return '';
        case 'number':
        case 'integer':
          return 0;
        case 'boolean':
          return false;
      }
      break;

    case CoreNodeType.Enum:
      return (node as any).values[0] || '';

    case CoreNodeType.Array:
      return [];

    case CoreNodeType.Map:
      return {};

    case CoreNodeType.Tuple:
      return (node as any).items.map(getDefaultValue);

    case CoreNodeType.Object: {
      const obj: any = {};
      const requiredFields = new Set((node as any).required || []);
      for (const [name, propNode] of Object.entries(node.properties)) {
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode);
        }
      }
      return obj;
    }

    case CoreNodeType.Link:
      return '';

    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return null;

    case CoreNodeType.Nullable:
      return null;
  }

  return null;
}
