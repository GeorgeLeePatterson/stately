/**
 * @stately/schema/utils
 *
 * Helper utilities for working with Stately schemas
 */

import type { SchemaAnyNode, Schemas } from '../index.js';
import type { CoreStatelyConfig } from './augment.js';
import { CoreNodeType, type ObjectNodeRaw } from './nodes.js';

type CoreNodeName = (typeof CoreNodeType)[keyof typeof CoreNodeType];
type ObjectNodeSchema<Config extends CoreStatelyConfig> = ObjectNodeRaw<
  Config['components']['schemas']['StateEntry'],
  keyof Config['nodes'] & string
>;
type AnySchemaNode<Config extends CoreStatelyConfig> = SchemaAnyNode<Schemas<Config>>;

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

export function isPrimitive<Config extends CoreStatelyConfig>(
  schema: AnySchemaNode<Config>,
): boolean {
  return (
    schema.nodeType === CoreNodeType.Primitive ||
    (schema.nodeType === CoreNodeType.Nullable && isPrimitive((schema as any).innerSchema)) ||
    schema.nodeType === CoreNodeType.Enum
  );
}

export function extractNodeType<Config extends CoreStatelyConfig>(
  schema: AnySchemaNode<Config>,
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

export function isEntityValid<Config extends CoreStatelyConfig>(
  entity: Schemas<Config>['EntityData'] | null | undefined,
  schema: ObjectNodeSchema<Config> | undefined,
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

export function sortEntityProperties<Config extends CoreStatelyConfig>(
  properties: Array<[string, AnySchemaNode<Config>]>,
  value: any,
  required: Set<string>,
): Array<[string, AnySchemaNode<Config>]> {
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
 * Default value generation
 */

export function getDefaultValue<Config extends CoreStatelyConfig>(
  node: AnySchemaNode<Config>,
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
      for (const [name, propNode] of Object.entries((node as any).properties)) {
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode as AnySchemaNode<Config>);
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
