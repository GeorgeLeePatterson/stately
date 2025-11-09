/**
 * @stately/schema/helpers
 *
 * Helper utilities for working with Stately schemas
 */

import type { StatelyConfig, StatelySchemas } from './index.js';
import { NodeType } from './index.js';

// Type helpers
export type MaybeHasKey<Key extends string = string, T = unknown> = { [key in Key]?: T };
export type ValidatorMap = Record<string, ValidatorCallback>;
export type ValidatorCallback = (value: unknown, schema: unknown) => boolean;
export type MaybeHasValidators = MaybeHasKey<'validators', ValidatorMap>;

/** Small utility aliases (avoid bare {} in generics) */
export type EmptyRecord = Record<string, never>;
export type AnyRecord = Record<string, unknown>;

/**
 * String utilities
 */

export function toKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}

export function toTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toSpaceCase(str: string): string {
  return str.replace(/[-_]/g, ' ');
}

export function generateFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ID utilities
 */

export const SINGLETON_ID = '00000000-0000-0000-0000-000000000000';

export function isSingletonId(id: string): boolean {
  return id === SINGLETON_ID;
}

/**
 * Schema type checking utilities
 */

export function isPrimitive<Config extends StatelyConfig>(
  schema: StatelySchemas<Config>['AnySchemaNode'],
): boolean {
  return (
    schema.nodeType === NodeType.Primitive ||
    (schema.nodeType === NodeType.Nullable && isPrimitive((schema as any).innerSchema)) ||
    schema.nodeType === NodeType.Enum
  );
}

export function extractNodeType<Config extends StatelyConfig>(
  schema: StatelySchemas<Config>['AnySchemaNode'],
): (typeof NodeType)[keyof typeof NodeType] {
  switch (schema.nodeType) {
    case NodeType.Nullable:
      return extractNodeType((schema as any).innerSchema);
    case NodeType.Array: {
      const items = (schema as any).items;
      if (Array.isArray(items) && items.length > 0) {
        return extractNodeType(items[0]);
      }
      return schema.nodeType;
    }
    default:
      return schema.nodeType;
  }
}

/**
 * Entity validation helper
 */

function validateObjectBasic(obj: any, schema: any): boolean {
  if (!obj || !schema) return false;

  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
        return false;
      }
    }
  }

  return true;
}

export function isEntityValid<Config extends StatelyConfig>(
  entity: StatelySchemas<Config>['EntityData'] | null | undefined,
  schema: StatelySchemas<Config>['ObjectNode'] | undefined,
): boolean {
  if (!entity || !schema) return false;
  if (typeof entity !== 'object') return false;

  const nameRequired = 'name' in schema.properties;
  const nameValid = !nameRequired || ('name' in entity && !!(entity as any)?.name);

  return nameValid && !!entity && validateObjectBasic(entity, schema);
}

/**
 * Property sorting for display
 */

export function sortEntityProperties<Config extends StatelyConfig>(
  properties: Array<[string, StatelySchemas<Config>['AnySchemaNode']]>,
  value: any,
  required: Set<string>,
): Array<[string, StatelySchemas<Config>['AnySchemaNode']]> {
  return properties.sort(([nameA, nodeA], [nameB, nodeB]) => {
    const isRequiredA = required.has(nameA);
    const isRequiredB = required.has(nameB);
    const valueA = value?.[nameA];
    const valueB = value?.[nameB];
    const isEmptyA = valueA === undefined || valueA === null;
    const isEmptyB = valueB === undefined || valueB === null;
    const isNullableA = nodeA.nodeType === NodeType.Nullable;
    const isNullableB = nodeB.nodeType === NodeType.Nullable;

    const priorityA = (isRequiredA ? 2 : 0) + (isEmptyA ? 0 : 1);
    const priorityB = (isRequiredB ? 2 : 0) + (isEmptyB ? 0 : 1);

    const finalPriorityA = priorityA - (isNullableA ? 0.5 : 0);
    const finalPriorityB = priorityB - (isNullableB ? 0.5 : 0);

    return finalPriorityB - finalPriorityA;
  });
}

/**
 * Default value generation
 */

export function getDefaultValue<Config extends StatelyConfig>(
  node: StatelySchemas<Config>['AnySchemaNode'],
): any {
  switch (node.nodeType) {
    case NodeType.Primitive:
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

    case NodeType.Enum:
      return (node as any).values[0] || '';

    case NodeType.Array:
      return [];

    case NodeType.Map:
      return {};

    case NodeType.Tuple:
      return (node as any).items.map(getDefaultValue);

    case NodeType.Object: {
      const obj: any = {};
      const requiredFields = new Set((node as any).required || []);
      for (const [name, propNode] of Object.entries((node as any).properties)) {
        // Only include required fields in the default value
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode as StatelySchemas<Config>['AnySchemaNode']);
        }
      }
      return obj;
    }

    case NodeType.Link:
      return ''; // Empty string for ref mode

    case NodeType.TaggedUnion:
    case NodeType.UntaggedEnum:
      return null; // User must select a variant

    case NodeType.Nullable:
      return null;
  }

  return null;
}
