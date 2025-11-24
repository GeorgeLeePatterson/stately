import type { Schemas } from '@stately/schema';
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
import type { Stately } from '@stately/schema/stately';
import { Braces, Brackets, SendToBack, Shapes, TextCursorInput } from 'lucide-react';
import type { ComponentType } from 'react';
import type { CoreStateEntry } from '.';

export interface CoreUiUtils {
  // Base overrides
  getNodeTypeIcon(nodeType: string): ComponentType<any> | null;
  getDefaultValue(node: BaseNode): any;
  // Core specific
  generateEntityTypeDisplay<S extends Schemas = Schemas>(
    data: Stately<S>['data'],
  ): { description: string; label: string; type: string; entity: CoreStateEntry<S> }[];
  getEntityIcon<S extends Schemas = Schemas>(entity: CoreStateEntry<S>): ComponentType<any>;
  resolveEntityType<S extends Schemas = Schemas>(entity: string, data: Stately<S>['data']): string;
}

/**
 * Get icon component for a node type
 */
export function getNodeTypeIcon(nodeType: string): ComponentType<any> | null {
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
      return null;
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

// Generate entity types from metadata
export function generateEntityTypeDisplay<S extends Schemas = Schemas>(
  data: Stately<S>['data'],
): { description: string; label: string; type: string; entity: CoreStateEntry<S> }[] {
  return (Object.keys(data.entityDisplayNames) as CoreStateEntry<S>[]).map(entry => ({
    description: `${data.entityDisplayNames[entry]} configurations`,
    entity: entry,
    label: data.entityDisplayNames[entry],
    type: data.stateEntryToUrl[entry],
  }));
}

export function resolveEntityType<S extends Schemas = Schemas>(
  entity: string,
  data: Stately<S>['data'],
): string {
  if (entity in data.urlToStateEntry) {
    return data.urlToStateEntry[entity];
  }
  return (
    Object.entries(data.entityDisplayNames).find(
      ([_, displayName]) => displayName === entity,
    )?.[0] ?? entity
  );
}
