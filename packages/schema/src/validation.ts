/**
 * @stately/schema/validation
 *
 * Validation functions for Stately schemas
 */

import type { AnyRecord, EmptyRecord, MaybeHasValidators } from './helpers.js';
import { NodeType, type StatelyConfig, type StatelySchemas } from './index.js';
import type { Stately } from './stately.js';

/**
 * Validation error detail
 */
export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation options
 */
export interface ValidationOptions {
  depth?: number;
  warnDepth?: number;
  maxDepth?: number;
  debug?: boolean;
  onDepthWarning?: (path: string, depth: number) => void;
}

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
 * Validate data against a schema
 */
export function validateSchema<
  Config extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  SExt extends AnyRecord = EmptyRecord,
>(
  path: string,
  data: any,
  schema: StatelySchemas<Config>['AnySchemaNode'],
  options: ValidationOptions = {},
  integration?: Stately<Config, IExt, SExt>,
): ValidationResult {
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

  // 🔌 Custom node validation if provided (schema-plugin hook)
  const nodeType = (schema as any).nodeType as string;

  // Narrow extensions to something that may have `validators`
  const validators = (integration?.extensions as MaybeHasValidators | undefined)?.validators;

  // Safe optional index by string key
  const customValidator = validators?.[nodeType];

  // Extension validate
  if (customValidator) {
    if (!customValidator(data, schema as any)) {
      return { valid: false, errors: [{ path, message: `Invalid ${nodeType}`, value: data }] };
    }
  }

  let result: ValidationResult;

  switch (schema.nodeType) {
    case NodeType.Object:
      result = validateObject<Config, IExt, SExt>(
        path,
        data,
        schema as StatelySchemas<Config>['ObjectNode'],
        nextOptions,
        integration,
      );
      break;

    case NodeType.Nullable:
      if (data === null || data === undefined) {
        result = { valid: true, errors: [] };
      } else {
        result = validateSchema<Config, IExt, SExt>(
          path,
          data,
          (schema as any).innerSchema as StatelySchemas<Config>['AnySchemaNode'],
          options,
          integration,
        );
      }
      break;

    case NodeType.UntaggedEnum: {
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

      result = validateSchema<Config, IExt, SExt>(
        `${path}.${variant}`,
        variantData,
        variantSchema.schema as StatelySchemas<Config>['AnySchemaNode'],
        nextOptions,
        integration,
      );
      break;
    }

    case NodeType.Array: {
      if (!Array.isArray(data)) {
        result =
          data === null || data === undefined
            ? { valid: true, errors: [] }
            : { valid: false, errors: [{ path, message: 'Expected an array', value: data }] };
        break;
      }

      const errors: ValidationError[] = [];
      for (let i = 0; i < data.length; i++) {
        const itemResult = validateSchema<Config, IExt, SExt>(
          `${path}[${i}]`,
          (data as any)[i],
          (schema as any).items as StatelySchemas<Config>['AnySchemaNode'],
          nextOptions,
          integration,
        );
        if (!itemResult.valid) errors.push(...itemResult.errors);
      }

      result = { valid: errors.length === 0, errors };
      break;
    }

    case NodeType.TaggedUnion: {
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
        variant.schema as StatelySchemas<Config>['ObjectNode'],
        nextOptions,
        integration,
      );
      break;
    }

    case NodeType.Map: {
      if (!data || typeof data !== 'object') {
        result = { valid: true, errors: [] };
        break;
      }

      const mapErrors: ValidationError[] = [];
      for (const [key, value] of Object.entries(data as Record<string, any>)) {
        const itemResult = validateSchema<Config, IExt, SExt>(
          `${path}.${key}`,
          value,
          (schema as any).valueSchema as StatelySchemas<Config>['AnySchemaNode'],
          nextOptions,
          integration,
        );
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
  Config extends StatelyConfig,
  IExt extends Record<string, unknown> = Record<string, never>,
  SExt extends Record<string, unknown> = Record<string, never>,
>(
  path: string,
  data: Record<string, any>,
  schema: StatelySchemas<Config>['ObjectNode'],
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
      propertySchema as StatelySchemas<Config>['AnySchemaNode'],
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
  Config extends StatelyConfig,
  IExt extends Record<string, unknown> = Record<string, never>,
  SExt extends Record<string, unknown> = Record<string, never>,
>(
  parentPath: string,
  fieldName: string,
  fieldValue: any,
  fieldSchema: StatelySchemas<Config>['AnySchemaNode'],
  isRequired: boolean,
  options: ValidationOptions = {},
  integration?: Stately<Config, IExt, SExt>,
): ValidationResult {
  const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

  const isMissing = fieldValue === null || fieldValue === undefined;

  if (isRequired) {
    // For primitives, empty string is invalid
    if (fieldSchema.nodeType === NodeType.Primitive && (isMissing || fieldValue === '')) {
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
    if (fieldSchema.nodeType === NodeType.Array && isMissing) {
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

  return validateSchema<Config, IExt, SExt>(
    fieldPath,
    fieldValue,
    fieldSchema,
    options,
    integration,
  );
}
