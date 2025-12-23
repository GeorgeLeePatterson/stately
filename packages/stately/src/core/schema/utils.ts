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

/** Is the ID a singleton ID, ie '00000000-0000-0000-0000-000000000000' */
export function isSingletonId(id: string): boolean {
  return id === SINGLETON_ID;
}

/**
 * Schema type checking utilities
 */

/**
 * Determine if a node if of type `NullableNode`.
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns boolean
 *
 */
export function isNullable(
  schema: CoreNodes<any> | BaseNode,
): schema is NullableNode<CoreNodes<any>> {
  return isNodeOfType<NullableNode<CoreNodes<any>>>(schema, CoreNodeType.Nullable);
}

/**
 * Determine if a node if of type `ArrayNode`.
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns boolean
 *
 */
export function isArray(schema: CoreNodes<any> | BaseNode): schema is ArrayNode<CoreNodes<any>> {
  return isNodeOfType<ArrayNode<CoreNodes<any>>>(schema, CoreNodeType.Array);
}

/**
 * Determine if a node if of type `ObjectNode`.
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns boolean
 *
 */
export function isObject(schema: CoreNodes<any> | BaseNode): schema is ObjectNode<CoreNodes<any>> {
  return isNodeOfType<ObjectNode<CoreNodes<any>>>(schema, CoreNodeType.Object);
}

/**
 * Determine if a node if of type `PrimitiveNode`.
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns boolean
 *
 */
export function isPrimitive(schema: BaseNode): schema is PrimitiveNode {
  return isNodeOfType<PrimitiveNode>(schema, CoreNodeType.Primitive);
}

/**
 * Determine if a node if of a 'primitive-like' type, ie `PrimitiveNode` or `EnumNode`, or either
 * wrapped in `NullableNode`.
 *
 * ## Note
 *
 * **Peers through `NullableNode`, associates `EnumNode` as primitive**
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns boolean
 *
 */
export function isPrimitiveNodeLike(schema: BaseNode): boolean {
  if (isNullable(schema)) {
    return isPrimitiveNodeLike(schema.innerSchema);
  }
  return schema.nodeType === CoreNodeType.Primitive || schema.nodeType === CoreNodeType.Enum;
}

/**
 * Extract the inner node type from `NullableNode` or `ArrayNode`.
 *
 * @param schema - Runtime node schema (see {@link BaseNode})
 * @returns string
 *
 */
export function extractNodeInnerType(schema: BaseNode): CoreNodeName | string {
  if (isNullable(schema)) {
    return extractNodeInnerType(schema.innerSchema);
  }

  if (isArray(schema)) {
    const items = schema.items;
    if (Array.isArray(items) && items.length > 0) {
      return extractNodeInnerType(items[0]);
    }
  }

  return schema.nodeType;
}

/**
 * Entity validation helper. Simpler than object validation with some extra checks.
 */
export function isEntityValid(
  entity: any | null | undefined,
  schema: BaseNode | undefined,
): boolean {
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
  extractNodeInnerType,
  isEntityValid,
  isPrimitiveNodeLike,
  isSingletonId,
  sortEntityProperties,
} as const satisfies CoreUtils;

type CoreUtils = DefineUtils<{
  isSingletonId: typeof isSingletonId;
  isPrimitiveNodeLike: typeof isPrimitiveNodeLike;
  extractNodeInnerType: typeof extractNodeInnerType;
  isEntityValid: typeof isEntityValid;
  sortEntityProperties: typeof sortEntityProperties;
}>;

export type { CoreUtils };
export { coreUtils };
