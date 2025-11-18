import {
  type ArrayNode,
  CoreNodeType,
  type EnumNode,
  type LinkNode,
  type MapNode,
  type NullableNode,
  type ObjectNode,
  type PrimitiveNode,
  type TaggedUnionNode,
  type TupleNode,
  type UntaggedEnumNode,
} from '@stately/schema/core/nodes';
import type { BaseNode } from '@stately/schema/nodes';
import { isNodeOfType } from '@stately/schema/schema';
import { Braces, Brackets, Cog, SendToBack, Shapes, TextCursorInput } from 'lucide-react';
import type { ComponentType } from 'react';

export interface CoreUtils {
  generateFieldLabel(field: string): string;
  getNodeTypeIcon(nodeType: string): ComponentType<any>;
  getDefaultValue(node: BaseNode): any;
}

/**
 * Generate kebab-case label from field name
 */
export function generateFieldLabel(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * Get icon component for a node type
 */
export function getNodeTypeIcon(nodeType: string): ComponentType<any> {
  switch (nodeType) {
    case CoreNodeType.Object:
      return Braces;
    case CoreNodeType.Array:
      return Brackets;
    case CoreNodeType.Primitive:
      return TextCursorInput;
    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return Shapes;
    case CoreNodeType.RecursiveRef:
      return SendToBack;
    default:
      return Cog;
  }
}

/**
 * Default value generation
 *
 * Generates sensible default values for core node types.
 * Returns null for unknown/plugin node types (graceful degradation).
 */
export function getDefaultValue(node: BaseNode): any {
  switch (true) {
    case isNodeOfType<PrimitiveNode>(node, CoreNodeType.Primitive):
      switch (node.primitiveType) {
        case 'string':
          return '';
        case 'number':
        case 'integer':
          return 0;
        case 'boolean':
          return false;
        default:
          return null;
      }

    case isNodeOfType<EnumNode>(node, CoreNodeType.Enum):
      return node.values[0] || '';

    case isNodeOfType<ArrayNode<any>>(node, CoreNodeType.Array):
      return [];

    case isNodeOfType<MapNode<any>>(node, CoreNodeType.Map):
      return {};

    case isNodeOfType<TupleNode>(node, CoreNodeType.Tuple):
      return node.items.map(getDefaultValue);

    case isNodeOfType<ObjectNode<any>>(node, CoreNodeType.Object): {
      const obj: any = {};
      const requiredFields = new Set(node.required || []);
      for (const [name, propNode] of Object.entries(node.properties)) {
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode);
        }
      }
      return obj;
    }

    case isNodeOfType<LinkNode<any>>(node, CoreNodeType.Link):
      return '';

    case isNodeOfType<TaggedUnionNode<any>>(node, CoreNodeType.TaggedUnion):
    case isNodeOfType<UntaggedEnumNode<any>>(node, CoreNodeType.UntaggedEnum):
      return null;

    case isNodeOfType<NullableNode<any>>(node, CoreNodeType.Nullable):
      return null;

    default:
      return null;
  }
}
