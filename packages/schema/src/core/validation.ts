/**
 * @stately/schema/validation
 *
 * Validation functions for Stately schemas
 */

import type { SchemaAnyNode, Schemas } from '../index.js';
import type { ValidationError, ValidationOptions, ValidationResult } from '../plugin.js';
import type { AnyRecord, EmptyRecord, Stately } from '../stately.js';
import type { CoreStatelyConfig } from './augment.js';
import { CoreNodeType, type ObjectNodeRaw } from './nodes.js';

type AnySchemaNode<Config extends CoreStatelyConfig> = SchemaAnyNode<Schemas<Config>>;
type ObjectNodeOf<Config extends CoreStatelyConfig> = ObjectNodeRaw<
  Config['components']['schemas']['StateEntry'],
  keyof Config['nodes'] & string
>;

export type ValidatorCallback = (value: unknown, schema: unknown) => boolean;

/**
 * Validation error detail
 */
// types now imported from plugin

/**
 * Validation cache for memoization
 */
const validationCache = new Map<string, ValidationResult>();

/**
 * Create a validation cache key
 */
export function createValidationCacheKey(path: string, data: any): string {
  const dataKey = typeof data === 'object' && data !== null ? JSON.stringify(data) : String(data);
  return `${path}:${dataKey}`;
}

/**
 * Clear the validation cache
 */
export function clearValidationCache(): void {
  validationCache.clear();
}

/**
 * Validate data against a schema node
 */
export function validateNode<
  Config extends CoreStatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  SExt extends AnyRecord = EmptyRecord,
>({
  path,
  data,
  schema,
  options = {},
  integration,
}: {
  path: string;
  data: any;
  schema: AnySchemaNode<Config>;
  options?: ValidationOptions;
  integration?: Stately<Config, IExt, SExt>;
}): ValidationResult {
  // Check cache first
  const cacheKey = createValidationCacheKey(path, data);
  const cached = validationCache.get(cacheKey);
  if (cached) return cached;

  const { depth = 0, warnDepth = 15, maxDepth = 20, debug = false, onDepthWarning } = options;

  if (debug) {
    console.debug(`[Validation] ${path} at depth ${depth}`, { data, nodeType: schema.nodeType });
  }

  // Check depth limits
  if (depth >= maxDepth) {
    if (debug) {
      console.warn(
        `[Validation] Maximum depth (${maxDepth}) reached at ${path}. Skipping deeper validation.`,
      );
    }
    onDepthWarning?.(path, depth);
    return { valid: true, errors: [] };
  }

  if (depth >= warnDepth) {
    onDepthWarning?.(path, depth);
  }

  const nextOptions: ValidationOptions = { ...options, depth: depth + 1 };

  let result: ValidationResult;

  switch (schema.nodeType) {
    case CoreNodeType.Object:
      result = validateObject<Config, IExt, SExt>(
        path,
        data,
        schema as ObjectNodeOf<Config>,
        nextOptions,
        integration,
      );
      break;

    case CoreNodeType.Nullable:
      if (data === null || data === undefined) {
        result = { valid: true, errors: [] };
      } else {
        result = validateNode<Config, IExt, SExt>({
          path,
          data,
        schema: (schema as any).innerSchema as AnySchemaNode<Config>,
          options,
          integration,
        });
      }
      break;

    case CoreNodeType.UntaggedEnum: {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        result = { valid: true, errors: [] };
        break;
      }

      const variant = Object.keys(data)[0];
      if (!variant) {
        result = {
          valid: false,
          errors: [{ path, message: 'Untagged enum must have exactly one variant', value: data }],
        };
        break;
      }

      const variantData = (data as any)[variant];
      const variantSchema = (schema as any).variants.find((v: any) => v.tag === variant);

      if (!variantSchema) {
        result = {
          valid: false,
          errors: [{ path, message: `Unknown variant '${variant}' in untagged enum`, value: data }],
        };
        break;
      }

      result = validateNode<Config, IExt, SExt>({
        path: `${path}.${variant}`,
        data: variantData,
        schema: variantSchema.schema as AnySchemaNode<Config>,
        options: nextOptions,
        integration,
      });
      break;
    }

    case CoreNodeType.Array: {
      if (!Array.isArray(data)) {
        result =
          data === null || data === undefined
            ? { valid: true, errors: [] }
            : { valid: false, errors: [{ path, message: 'Expected an array', value: data }] };
        break;
      }

      const errors: ValidationError[] = [];
      for (let i = 0; i < data.length; i++) {
        const itemResult = validateNode<Config, IExt, SExt>({
          path: `${path}[${i}]`,
          data: (data as any)[i],
          schema: (schema as any).items as AnySchemaNode<Config>,
          options: nextOptions,
          integration,
        });
        if (!itemResult.valid) errors.push(...itemResult.errors);
      }

      result = { valid: errors.length === 0, errors };
      break;
    }

    case CoreNodeType.TaggedUnion: {
      if (!data || typeof data !== 'object') {
        result = { valid: true, errors: [] };
        break;
      }

      const discriminator = (schema as any).discriminator as string;
      const tag = (data as any)[discriminator];

      if (!tag) {
        result = {
          valid: false,
          errors: [
            {
              path: `${path}.${discriminator}`,
              message: `Missing discriminator field '${discriminator}'`,
              value: data,
            },
          ],
        };
        break;
      }

      const variant = (schema as any).variants.find((v: any) => v.tag === tag);
      if (!variant) {
        result = {
          valid: false,
          errors: [
            {
              path: `${path}.${discriminator}`,
              message: `Unknown variant '${String(tag)}' for discriminator '${discriminator}'`,
              value: tag,
            },
          ],
        };
        break;
      }

      result = validateObject<Config, IExt, SExt>(
        path,
        data as Record<string, any>,
        variant.schema as ObjectNodeOf<Config>,
        nextOptions,
        integration,
      );
      break;
    }

    case CoreNodeType.Map: {
      if (!data || typeof data !== 'object') {
        result = { valid: true, errors: [] };
        break;
      }

      const mapErrors: ValidationError[] = [];
      for (const [key, value] of Object.entries(data as Record<string, any>)) {
        const itemResult = validateNode<Config, IExt, SExt>({
          path: `${path}.${key}`,
          data: value,
          schema: (schema as any).valueSchema as AnySchemaNode<Config>,
          options: nextOptions,
          integration,
        });
        if (!itemResult.valid) mapErrors.push(...itemResult.errors);
      }

      result = { valid: mapErrors.length === 0, errors: mapErrors };
      break;
    }

    default:
      result = { valid: true, errors: [] };
  }

  validationCache.set(cacheKey, result);
  return result;
}

/**
 * Validate an object against an ObjectNode schema
 */
export function validateObject<
  Config extends CoreStatelyConfig,
  IExt extends Record<string, unknown> = Record<string, never>,
  SExt extends Record<string, unknown> = Record<string, never>,
>(
  path: string,
  data: Record<string, any>,
  schema: ObjectNodeOf<Config>,
  options: ValidationOptions = {},
  integration?: Stately<Config, IExt, SExt>,
): ValidationResult {
  const { debug = false } = options;

  if (debug) {
    console.debug(`[Validation] Object at ${path}`, { data, schema });
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ path, message: 'Expected an object', value: data }] };
  }

  const required = new Set((schema as any).required || []);
  const errors: ValidationError[] = [];

  for (const [propertyName, propertySchema] of Object.entries((schema as any).properties)) {
    const fieldRequired = required.has(propertyName);
    const fieldValue = (data as any)[propertyName];

    const fieldResult = validateObjectField<Config, IExt, SExt>(
      path,
      propertyName,
      fieldValue,
      propertySchema as AnySchemaNode<Config>,
      fieldRequired,
      options,
      integration,
    );

    if (!fieldResult.valid) {
      errors.push(...fieldResult.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a single object field
 */
export function validateObjectField<
  Config extends CoreStatelyConfig,
  IExt extends Record<string, unknown> = Record<string, never>,
  SExt extends Record<string, unknown> = Record<string, never>,
>(
  parentPath: string,
  fieldName: string,
  fieldValue: any,
  fieldSchema: AnySchemaNode<Config>,
  isRequired: boolean,
  options: ValidationOptions = {},
  integration?: Stately<Config, IExt, SExt>,
): ValidationResult {
  const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

  const isMissing = fieldValue === null || fieldValue === undefined;

  if (isRequired) {
    // For primitives, empty string is invalid
    if (fieldSchema.nodeType === CoreNodeType.Primitive && (isMissing || fieldValue === '')) {
      return {
        valid: false,
        errors: [
          { path: fieldPath, message: `Field '${fieldName}' is required`, value: fieldValue },
        ],
      };
    }

    // For other types, missing or empty object is invalid
    if (
      isMissing ||
      (typeof fieldValue === 'object' &&
        !Array.isArray(fieldValue) &&
        Object.keys(fieldValue as object).length === 0)
    ) {
      return {
        valid: false,
        errors: [
          { path: fieldPath, message: `Field '${fieldName}' is required`, value: fieldValue },
        ],
      };
    }

    // Arrays: empty array is valid, missing array is invalid
    if (fieldSchema.nodeType === CoreNodeType.Array && isMissing) {
      return {
        valid: false,
        errors: [
          { path: fieldPath, message: `Field '${fieldName}' is required`, value: fieldValue },
        ],
      };
    }
  } else {
    // Optional field - if not present, it's valid
    if (isMissing) {
      return { valid: true, errors: [] };
    }
  }

  return validateNode<Config, IExt, SExt>({
    path: fieldPath,
    data: fieldValue,
    schema: fieldSchema,
    options,
    integration,
  });
}
