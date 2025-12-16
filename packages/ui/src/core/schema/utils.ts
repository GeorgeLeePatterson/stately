/**
 * @statelyjs/schema/utils
 *
 * Helper utilities for working with Stately schemas
 */

import { type BaseNode, type DefineUtils, isNodeOfType } from '@statelyjs/schema';
import {
  type ArrayNode,
  type CoreNodes,
  CoreNodeType,
  type NullableNode,
  type ObjectNode,
  type PrimitiveNode,
} from './nodes.js';

type CoreNodeName = (typeof CoreNodeType)[keyof typeof CoreNodeType];

/**
 * ID utilities
 */

export const SINGLETON_ID = '00000000-0000-0000-0000-000000000000';

function isSingletonId(id: string): boolean {
  return id === SINGLETON_ID;
}

/**
 * Schema type checking utilities
 */

export function isNullable(
  schema: CoreNodes<any> | BaseNode,
): schema is NullableNode<CoreNodes<any>> {
  return isNodeOfType<NullableNode<CoreNodes<any>>>(schema, CoreNodeType.Nullable);
}

export function isArray(schema: CoreNodes<any> | BaseNode): schema is ArrayNode<CoreNodes<any>> {
  return isNodeOfType<ArrayNode<CoreNodes<any>>>(schema, CoreNodeType.Array);
}

export function isObject(schema: CoreNodes<any> | BaseNode): schema is ObjectNode<CoreNodes<any>> {
  return isNodeOfType<ObjectNode<CoreNodes<any>>>(schema, CoreNodeType.Object);
}

export function isPrimitive(schema: BaseNode): schema is PrimitiveNode {
  return isNodeOfType<PrimitiveNode>(schema, CoreNodeType.Primitive);
}

export function isPrimitiveNode(schema: BaseNode): boolean {
  if (isNullable(schema)) {
    return isPrimitiveNode(schema.innerSchema);
  }
  return schema.nodeType === CoreNodeType.Primitive || schema.nodeType === CoreNodeType.Enum;
}

function extractNodeType(schema: BaseNode): CoreNodeName | string {
  if (isNullable(schema)) {
    return extractNodeType(schema.innerSchema);
  }

  if (isArray(schema)) {
    const items = schema.items;
    if (Array.isArray(items) && items.length > 0) {
      return extractNodeType(items[0]);
    }
  }

  return schema.nodeType;
}

/**
 * Entity validation helper
 */

function isEntityValid(entity: any | null | undefined, schema: BaseNode | undefined): boolean {
  if (!entity || !schema) return false;
  if (!isObject(schema)) return false;
  if (typeof entity !== 'object') return false;

  const nameRequired = 'name' in schema.properties;
  const nameValid = !nameRequired || ('name' in entity && !!entity?.name);

  if (!nameValid || !entity || !schema) return false;

  if (schema.required) {
    const entityObj = entity as Record<string, any>;
    for (const field of schema.required) {
      if (!(field in entityObj) || entityObj[field] === undefined || entityObj[field] === null) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Property sorting for display
 */

function sortEntityProperties<N extends BaseNode = BaseNode>(
  properties: Array<[string, N]>,
  value: any,
  required: Set<string>,
): Array<[string, N]> {
  return properties.sort(([nameA, nodeA], [nameB, nodeB]) => {
    const isRequiredA = required.has(nameA);
    const isRequiredB = required.has(nameB);
    const valueA = value?.[nameA];
    const valueB = value?.[nameB];
    const isEmptyA = valueA === undefined || valueA === null;
    const isEmptyB = valueB === undefined || valueB === null;
    const isNullableA = nodeA.nodeType === CoreNodeType.Nullable;
    const isNullableB = nodeB.nodeType === CoreNodeType.Nullable;

    const priorityA = (isRequiredA ? 2 : 0) + (isEmptyA ? 0 : 1);
    const priorityB = (isRequiredB ? 2 : 0) + (isEmptyB ? 0 : 1);

    const finalPriorityA = priorityA - (isNullableA ? 0.5 : 0);
    const finalPriorityB = priorityB - (isNullableB ? 0.5 : 0);

    return finalPriorityB - finalPriorityA;
  });
}

const coreUtils: CoreUtils = {
  extractNodeType,
  isEntityValid,
  isPrimitiveNode,
  isSingletonId,
  sortEntityProperties,
} as const satisfies CoreUtils;

type CoreUtils = DefineUtils<{
  isSingletonId: typeof isSingletonId;
  isPrimitiveNode: typeof isPrimitiveNode;
  extractNodeType: typeof extractNodeType;
  isEntityValid: typeof isEntityValid;
  sortEntityProperties: typeof sortEntityProperties;
}>;

export type { CoreUtils };
export { coreUtils };
