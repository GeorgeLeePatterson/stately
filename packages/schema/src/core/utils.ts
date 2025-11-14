/**
 * @stately/schema/utils
 *
 * Helper utilities for working with Stately schemas
 */

import type { Schemas } from '../index.js';
import type { DefineUtils } from '../plugin.js';
import type { CoreStatelyConfig } from './augment.js';
import { CoreNodeType, type CoreNodeUnion, type ObjectNode } from './nodes.js';

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

function isPrimitive<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  schema: CoreNodeUnion<Config>,
): boolean {
  return (
    schema.nodeType === CoreNodeType.Primitive ||
    (schema.nodeType === CoreNodeType.Nullable && isPrimitive((schema as any).innerSchema)) ||
    schema.nodeType === CoreNodeType.Enum
  );
}

function extractNodeType<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  schema: CoreNodeUnion<Config>,
): CoreNodeName {
  switch (schema.nodeType) {
    case CoreNodeType.Nullable:
      return extractNodeType((schema as any).innerSchema);
    case CoreNodeType.Array: {
      const items = (schema as any).items;
      if (Array.isArray(items) && items.length > 0) {
        return extractNodeType(items[0]);
      }
      return schema.nodeType as CoreNodeName;
    }
    default:
      return schema.nodeType as CoreNodeName;
  }
}

/**
 * Entity validation helper
 */

function isEntityValid<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entity: Schemas<Config>['types']['EntityData'] | null | undefined,
  schema: ObjectNode<Config> | undefined,
): boolean {
  if (!entity || !schema) return false;
  if (typeof entity !== 'object') return false;

  const nameRequired = 'name' in schema.properties;
  const nameValid = !nameRequired || ('name' in entity && !!(entity as any)?.name);

  if (!nameValid || !entity || !schema) return false;

  if (schema.required) {
    // Cast to Record for runtime validation - EntityData is a union so no index signature
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

function sortEntityProperties<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  properties: Array<[string, CoreNodeUnion<Config>]>,
  value: any,
  required: Set<string>,
): Array<[string, CoreNodeUnion<Config>]> {
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

/**
 * String utilities
 */

function toKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toSpaceCase(str: string): string {
  return str.replace(/[-_]/g, ' ');
}

const coreUtils = {
  extractNodeType,
  isEntityValid,
  isPrimitive,
  isSingletonId,
  sortEntityProperties,
  toKebabCase,
  toSpaceCase,
  toTitleCase,
} as const;

type CoreUtils<Config extends CoreStatelyConfig = CoreStatelyConfig> = DefineUtils<{
  isSingletonId: typeof isSingletonId;
  isPrimitive: typeof isPrimitive;
  extractNodeType: typeof extractNodeType<Config>;
  isEntityValid: typeof isEntityValid<Config>;
  sortEntityProperties: typeof sortEntityProperties<Config>;
  toKebabCase: typeof toKebabCase;
  toTitleCase: typeof toTitleCase;
  toSpaceCase: typeof toSpaceCase;
}>;

export type { CoreUtils };
export { coreUtils };
