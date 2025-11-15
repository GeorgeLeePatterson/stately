/**
 * @stately/schema/validation
 *
 * Validation functions for Stately schemas
 */

import type { SchemaConfig, Schemas } from '../index.js';
import type {
  ValidateArgs,
  ValidationError,
  ValidationOptions,
  ValidationResult,
} from '../validation.js';
import type { CoreNodeUnion, ObjectNode } from './nodes.js';
import { CoreNodeType } from './nodes.js';

export type ValidatorCallback = (value: unknown, schema: unknown) => boolean;

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
export function validateNode({
  path,
  data,
  schema: rawSchema,
  options = {},
}: ValidateArgs<Schemas>): ValidationResult {
  const schema = rawSchema as CoreNodeUnion<SchemaConfig<Schemas>>;
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
    return { errors: [], valid: true };
  }

  if (depth >= warnDepth) {
    onDepthWarning?.(path, depth);
  }

  const nextOptions: ValidationOptions = { ...options, depth: depth + 1 };

  let result: ValidationResult;

  switch (schema.nodeType) {
    case CoreNodeType.Object:
      result = validateObject({ data, options: nextOptions, path, schema });
      break;

    case CoreNodeType.Nullable:
      if (data === null || data === undefined) {
        result = { errors: [], valid: true };
      } else {
        result = validateNode({ data, options, path, schema: schema.innerSchema });
      }
      break;

    case CoreNodeType.UntaggedEnum: {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        result = { errors: [], valid: true };
        break;
      }

      const variant = Object.keys(data)[0];
      if (!variant) {
        result = {
          errors: [{ message: 'Untagged enum must have exactly one variant', path, value: data }],
          valid: false,
        };
        break;
      }

      const variantData = (data as any)[variant];
      const variantSchema = (schema as any).variants.find((v: any) => v.tag === variant);

      if (!variantSchema) {
        result = {
          errors: [{ message: `Unknown variant '${variant}' in untagged enum`, path, value: data }],
          valid: false,
        };
        break;
      }

      result = validateNode({
        data: variantData,
        options: nextOptions,
        path: `${path}.${variant}`,
        schema: variantSchema.schema,
      });
      break;
    }

    case CoreNodeType.Array: {
      if (!Array.isArray(data)) {
        result =
          data === null || data === undefined
            ? { errors: [], valid: true }
            : { errors: [{ message: 'Expected an array', path, value: data }], valid: false };
        break;
      }

      const errors: ValidationError[] = [];
      for (let i = 0; i < data.length; i++) {
        const itemResult = validateNode({
          data: (data as any)[i],
          options: nextOptions,
          path: `${path}[${i}]`,
          schema: schema.items,
        });
        if (!itemResult.valid) errors.push(...itemResult.errors);
      }

      result = { errors, valid: errors.length === 0 };
      break;
    }

    case CoreNodeType.TaggedUnion: {
      if (!data || typeof data !== 'object') {
        result = { errors: [], valid: true };
        break;
      }

      const discriminator = (schema as any).discriminator as string;
      const tag = (data as any)[discriminator];

      if (!tag) {
        result = {
          errors: [
            {
              message: `Missing discriminator field '${discriminator}'`,
              path: `${path}.${discriminator}`,
              value: data,
            },
          ],
          valid: false,
        };
        break;
      }

      const variant = (schema as any).variants.find((v: any) => v.tag === tag);
      if (!variant) {
        result = {
          errors: [
            {
              message: `Unknown variant '${String(tag)}' for discriminator '${discriminator}'`,
              path: `${path}.${discriminator}`,
              value: tag,
            },
          ],
          valid: false,
        };
        break;
      }

      result = validateObject({ data, options: nextOptions, path, schema: variant.schema });
      break;
    }

    case CoreNodeType.Map: {
      if (!data || typeof data !== 'object') {
        result = { errors: [], valid: true };
        break;
      }

      const mapErrors: ValidationError[] = [];
      for (const [key, value] of Object.entries(data as Record<string, any>)) {
        const itemResult = validateNode({
          data: value,
          options: nextOptions,
          path: `${path}.${key}`,
          schema: schema.valueSchema,
        });
        if (!itemResult.valid) mapErrors.push(...itemResult.errors);
      }

      result = { errors: mapErrors, valid: mapErrors.length === 0 };
      break;
    }

    default:
      result = { errors: [], valid: true };
  }

  validationCache.set(cacheKey, result);
  return result;
}

// TODO: Remove
// type ValidateFieldArgs<
//   S extends Schemas = Schemas,
//   N = AnyCoreNode<SchemaConfig<S>>
// > = Omit<ValidateArgs<S>, 'schema'> & { schema: N };

/**
 * Validate an object against an ObjectNode schema
 */
export function validateObject(
  args: Omit<ValidateArgs<Schemas>, 'schema'> & { schema: ObjectNode<SchemaConfig<Schemas>> },
): ValidationResult {
  const { path, data, schema, options } = args;
  const { debug = false } = options || {};

  if (debug) {
    console.debug(`[Validation] Object at ${path}`, { data, schema });
  }

  if (!data || typeof data !== 'object') {
    return { errors: [{ message: 'Expected an object', path, value: data }], valid: false };
  }

  const required = new Set((schema as any).required || []);
  const errors: ValidationError[] = [];

  for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
    const fieldRequired = required.has(propertyName);
    const fieldValue = data[propertyName];

    const fieldResult = validateObjectField(
      propertyName,
      { data: fieldValue, options, path, schema: propertySchema },
      fieldRequired,
    );

    if (!fieldResult.valid) {
      errors.push(...fieldResult.errors);
    }
  }

  return { errors, valid: errors.length === 0 };
}

// path: string;
// data: any;
// schema: plugin node union for S;
// options?: ValidationOptions;

/**
 * Validate a single object field
 */
export function validateObjectField(
  name: string,
  args: ValidateArgs<Schemas>,
  isRequired: boolean,
): ValidationResult {
  const { path: parentPath, data, schema } = args;
  const fieldPath = parentPath ? `${parentPath}.${name}` : name;
  const isMissing = data === null || data === undefined;

  if (isRequired) {
    // For primitives, empty string is invalid
    if (schema.nodeType === CoreNodeType.Primitive && (isMissing || data === '')) {
      return {
        errors: [{ message: `Field '${name}' is required`, path: fieldPath, value: data }],
        valid: false,
      };
    }

    // For other types, missing or empty object is invalid
    if (
      isMissing ||
      (typeof data === 'object' && !Array.isArray(data) && Object.keys(data as object).length === 0)
    ) {
      return {
        errors: [{ message: `Field '${name}' is required`, path: fieldPath, value: data }],
        valid: false,
      };
    }

    // Arrays: empty array is valid, missing array is invalid
    if (schema.nodeType === CoreNodeType.Array && isMissing) {
      return {
        errors: [{ message: `Field '${name}' is required`, path: fieldPath, value: data }],
        valid: false,
      };
    }
    // Optional field - if not present, it's valid
  } else if (isMissing) {
    return { errors: [], valid: true };
  }

  return validateNode(args);
}
