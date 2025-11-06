/**
 * @stately/schema/openapi
 *
 * Runtime function for extracting entity metadata from openapi.json.
 * Takes concrete runtime values (openapi.json data and generated schemas)
 * and returns typed mappings and helper functions.
 */

import type { StatelySchemas, StatelyConfig } from './index.js';
import { NodeType } from './index.js';

/**
 * Minimal OpenAPI document structure
 */
interface OpenAPIDocument {
  components?: {
    schemas?: Record<string, any>;
  };
}

/**
 * Validation error detail
 */
export interface ValidationError {
  /** Path to the invalid field (e.g., 'pipeline.source.buffer_size') */
  path: string;
  /** Error message */
  message: string;
  /** The invalid value */
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Current recursion depth (internal, auto-managed) */
  depth?: number;
  /** Maximum depth before warning (default: 15) */
  warnDepth?: number;
  /** Maximum depth before error (default: 20) */
  maxDepth?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Callback for depth warnings */
  onDepthWarning?: (path: string, depth: number) => void;
}

/**
 * Result returned from createOpenAPIIntegration
 * All types are derived from StatelySchemas using the provided generics
 */
export interface OpenAPIIntegration<Schemas extends StatelySchemas<any>> {
  // ===== Raw Inputs (passed through) =====

  /**
   * OpenAPI component schemas (openapi.components.schemas)
   */
  schemas: Schemas['components'];

  /**
   * Generated schema nodes (PARSED_SCHEMAS)
   */
  nodes: Schemas['nodes'];

  // ===== Parsed Entity Mappings =====

  /**
   * Entity mappings extracted from Entity oneOf
   * Maps StateEntry values to their corresponding schema names
   */
  entityMappings: Array<{
    stateEntry: Schemas['StateEntry'];
    schemaName: string;
  }>;

  /**
   * StateEntry -> Schema name
   * Example: { 'pipeline': 'Pipeline', 'source_config': 'SourceConfig' }
   */
  stateEntryToSchema: Record<Schemas['StateEntry'], string>;

  /**
   * StateEntry -> Parsed ObjectNode
   * Example: { 'pipeline': ObjectNode, 'source_config': ObjectNode }
   */
  entitySchemaCache: Record<Schemas['StateEntry'], Schemas['ObjectNode'] | null>;

  /**
   * URL string -> StateEntry
   * Example: { 'source-config': 'source_config' }
   */
  urlToStateEntry: Record<string, Schemas['StateEntry']>;

  /**
   * StateEntry -> URL string
   * Example: { 'source_config': 'source-config' }
   */
  stateEntryToUrl: Record<Schemas['StateEntry'], string>;

  /**
   * StateEntry -> Display name
   * Example: { 'source_config': 'Source Config' }
   */
  entityDisplayNames: Record<Schemas['StateEntry'], string>;

  // ===== Helper Functions =====

  isPrimitive: (schema: Schemas['AnySchemaNode']) => boolean;
  extractNodeType: (schema: Schemas['AnySchemaNode']) => typeof NodeType[keyof typeof NodeType];
  isEntityValid: (
    entity: Schemas['EntityData'] | null | undefined,
    schema: Schemas['ObjectNode'] | undefined,
  ) => boolean;
  sortEntityProperties: (
    properties: Array<[string, Schemas['AnySchemaNode']]>,
    value: any,
    required: Set<string>,
  ) => Array<[string, Schemas['AnySchemaNode']]>;

  // ===== String Utilities =====

  /**
   * Convert snake_case to Title Case for display
   * Example: 'source_config' -> 'Source Config'
   */
  toTitleCase: (str: string) => string;

  /**
   * Convert snake_case to kebab-case for URLs
   * Example: 'source_config' -> 'source-config'
   */
  toKebabCase: (str: string) => string;

  /**
   * Convert snake_case/kebab-case to space case
   * Example: 'source_config' -> 'source config'
   */
  toSpaceCase: (str: string) => string;

  /**
   * Generate a human-readable label from a field name
   * Example: 'field_name' -> 'Field Name'
   */
  generateFieldLabel: (fieldName: string) => string;

  // ===== ID Utilities =====

  /**
   * Determine if an id is a singleton id (all zeros UUID)
   * Example: '00000000-0000-0000-0000-000000000000' -> true
   */
  isSingletonId: (id: string) => boolean;

  // ===== Default Values =====

  /**
   * Get default value for a schema node
   * Returns appropriate default based on node type
   */
  getDefaultValue: (node: Schemas['AnySchemaNode']) => any;

  // ===== Validation =====

  /**
   * Validation error details
   */
  validateSchema: (
    path: string,
    data: any,
    schema: Schemas['AnySchemaNode'],
    options?: ValidationOptions,
  ) => ValidationResult;

  /**
   * Validate an object against an ObjectNode schema
   */
  validateObject: (
    path: string,
    data: Record<string, any>,
    schema: Schemas['ObjectNode'],
    options?: ValidationOptions,
  ) => ValidationResult;

  /**
   * Validate a single object field
   */
  validateObjectField: (
    path: string,
    fieldName: string,
    fieldValue: any,
    fieldSchema: Schemas['AnySchemaNode'],
    isRequired: boolean,
    options?: ValidationOptions,
  ) => ValidationResult;

  /**
   * Create a validation result cache key for memoization
   */
  createValidationCacheKey: (path: string, data: any) => string;
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

function generateFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ID utilities
 */
export const SINGLETON_ID = '00000000-0000-0000-0000-000000000000';

function isSingletonId(id: string): boolean {
  return id === SINGLETON_ID;
}

/**
 * Basic validation helper (used internally)
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

/**
 * Create OpenAPI integration with runtime entity metadata
 *
 * This function takes TWO concrete runtime values:
 * 1. openapi: The imported openapi.json data
 * 2. generatedSchemas: The generated schema nodes (PARSED_SCHEMAS)
 *
 * It returns typed mappings and helpers based on StatelySchemas.
 *
 * @example
 * ```typescript
 * import openapi from './openapi.json';
 * import { PARSED_SCHEMAS } from './generated-schemas';
 *
 * type Xeo4Schemas = StatelySchemas<{
 *   components: typeof openapi.components.schemas;
 *   nodes: typeof PARSED_SCHEMAS;
 * }>;
 *
 * const integration = createOpenAPIIntegration<
 *   typeof openapi.components.schemas,
 *   typeof PARSED_SCHEMAS
 * >(openapi, PARSED_SCHEMAS);
 * ```
 */
export function createOpenAPIIntegration<
  Components extends StatelyConfig['components'],
  Nodes extends StatelyConfig['nodes']
>(
  openapi: OpenAPIDocument,
  generatedSchemas: Nodes,
): OpenAPIIntegration<StatelySchemas<{ components: Components; nodes: Nodes }>> {
  type Schemas = StatelySchemas<{ components: Components; nodes: Nodes }>;

  // Extract Entity schema from openapi.json
  const entitySchema = openapi.components?.schemas?.['Entity'];
  if (!entitySchema?.oneOf) {
    throw new Error('Entity schema not found in OpenAPI spec or missing oneOf');
  }

  // Parse entity mappings from Entity oneOf variants
  const entityMappings: Array<{
    stateEntry: Schemas['StateEntry'];
    schemaName: string;
  }> = (entitySchema.oneOf as any[]).map((variant: any) => {
    const stateEntry = variant.properties?.type?.enum?.[0] || '';
    const schemaName = variant.properties?.data?.$ref?.split('/').pop() || '';
    return { stateEntry, schemaName };
  });

  // Build: StateEntry -> Schema name
  const stateEntryToSchema = Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [stateEntry, schemaName]),
  ) as Record<Schemas['StateEntry'], string>;

  // Build: StateEntry -> Parsed ObjectNode
  const entitySchemaCache = Object.entries(stateEntryToSchema).reduce(
    (acc, [stateEntry, schemaName]) => {
      const schema = generatedSchemas[schemaName as string];
      if (!schema) {
        console.warn(`Schema not found for ${stateEntry} (${schemaName})`);
      }
      acc[stateEntry as Schemas['StateEntry']] = schema || null;
      return acc;
    },
    {} as Record<Schemas['StateEntry'], Schemas['ObjectNode'] | null>,
  );

  // Build: URL string -> StateEntry
  const urlToStateEntry = Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [toKebabCase(stateEntry), stateEntry]),
  ) as Record<string, Schemas['StateEntry']>;

  // Build: StateEntry -> URL string
  const stateEntryToUrl = Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toKebabCase(stateEntry)]),
  ) as Record<Schemas['StateEntry'], string>;

  // Build: StateEntry -> Display name
  const entityDisplayNames = Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toTitleCase(stateEntry)]),
  ) as Record<Schemas['StateEntry'], string>;

  // Helper: Is schema primitive?
  const isPrimitive = (schema: Schemas['AnySchemaNode']): boolean => {
    return (
      schema.nodeType === NodeType.Primitive ||
      (schema.nodeType === NodeType.Nullable && isPrimitive((schema as any).innerSchema)) ||
      schema.nodeType === NodeType.Enum
    );
  };

  // Helper: Extract node type from nested schemas
  const extractNodeType = (
    schema: Schemas['AnySchemaNode'],
  ): typeof NodeType[keyof typeof NodeType] => {
    switch (schema.nodeType) {
      case NodeType.Nullable:
        return extractNodeType((schema as any).innerSchema);
      case NodeType.Array:
        const items = (schema as any).items;
        if (Array.isArray(items) && items.length > 0) {
          return extractNodeType(items[0]);
        }
        return schema.nodeType;
      default:
        return schema.nodeType;
    }
  };

  // Helper: Validate entity against schema
  const isEntityValid = (
    entity: Schemas['EntityData'] | null | undefined,
    schema: Schemas['ObjectNode'] | undefined,
  ): boolean => {
    if (!entity || !schema) return false;
    if (typeof entity !== 'object') return false;

    const nameRequired = 'name' in schema.properties;
    const nameValid = !nameRequired || ('name' in entity && !!(entity as any)?.name);

    return nameValid && !!entity && validateObjectBasic(entity, schema);
  };

  // Helper: Sort properties for display
  const sortEntityProperties = (
    properties: Array<[string, Schemas['AnySchemaNode']]>,
    value: any,
    required: Set<string>,
  ): Array<[string, Schemas['AnySchemaNode']]> => {
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
  };

  // Helper: Get default value for a schema node
  const getDefaultValue = (node: Schemas['AnySchemaNode']): any => {
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
          // Optional fields will be undefined/omitted until user explicitly sets them
          if (requiredFields.has(name)) {
            obj[name] = getDefaultValue(propNode as Schemas['AnySchemaNode']);
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
  };

  // Helper: Create validation cache key for memoization
  const createValidationCacheKey = (path: string, data: any): string => {
    // Create a stable cache key from path and data
    // For objects/arrays, use JSON.stringify; for primitives, use direct value
    const dataKey = typeof data === 'object' && data !== null
      ? JSON.stringify(data)
      : String(data);
    return `${path}:${dataKey}`;
  };

  // TODO: Remove - Questions on validateSchemas

  // Helper: Validate schema
  const validateSchema = (
    path: string,
    data: any,
    schema: Schemas['AnySchemaNode'],
    options: ValidationOptions = {},
  ): ValidationResult => {
    const {
      depth = 0,
      warnDepth = 15,
      maxDepth = 20,
      debug = false,
      onDepthWarning,
    } = options;

    if (debug) {
      console.debug(`[Validation] ${path} at depth ${depth}`, { data, nodeType: schema.nodeType });
    }

    // Check depth limits
    if (depth >= maxDepth) {
      // WARNING: Returning valid=true here because we cannot break existing applications
      // that have deep nesting. If validation has passed up to this point, we assume
      // the rest is valid rather than failing the entire form.
      if (debug) {
        console.warn(`[Validation] Maximum depth (${maxDepth}) reached at ${path}. Skipping deeper validation.`);
      }
      if (onDepthWarning) {
        onDepthWarning(path, depth);
      }
      return { valid: true, errors: [] };
    }

    if (depth >= warnDepth && onDepthWarning) {
      onDepthWarning(path, depth);
    }

    const nextOptions: ValidationOptions = { ...options, depth: depth + 1 };

    switch (schema.nodeType) {
      case NodeType.Object:
        return validateObject(path, data, schema as Schemas['ObjectNode'], nextOptions);

      case NodeType.Nullable:
        // Null/undefined is valid for nullable
        if (data === null || data === undefined) {
          return { valid: true, errors: [] };
        }
        return validateSchema(path, data, (schema as any).innerSchema, options);

      case NodeType.UntaggedEnum: {
        // Note: Empty/missing check is handled by validateObjectField for required fields
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          // If we got here, the field is optional and empty, which is valid
          return { valid: true, errors: [] };
        }

        const variant = Object.keys(data)[0];
        if (!variant) {
          return {
            valid: false,
            errors: [{
              path,
              message: 'Untagged enum must have exactly one variant',
              value: data,
            }],
          };
        }

        const variantData = data[variant];
        const variantSchema = (schema as any).variants.find((v: any) => v.tag === variant);

        if (!variantSchema) {
          return {
            valid: false,
            errors: [{
              path,
              message: `Unknown variant '${variant}' in untagged enum`,
              value: data,
            }],
          };
        }

        return validateSchema(`${path}.${variant}`, variantData, variantSchema.schema, nextOptions);
      }

      case NodeType.Array: {
        // Note: Missing/empty array check is handled by validateObjectField for required fields
        if (!Array.isArray(data)) {
          // Non-array values: undefined/null are valid (handled by parent), other types are errors
          if (data === null || data === undefined) {
            return { valid: true, errors: [] };
          }
          return {
            valid: false,
            errors: [{
              path,
              message: 'Expected an array',
              value: data,
            }],
          };
        }

        // Empty array [] is valid (presence, not length constraint)
        const errors: ValidationError[] = [];
        for (let i = 0; i < data.length; i++) {
          const itemResult = validateSchema(
            `${path}[${i}]`,
            data[i],
            (schema as any).items,
            nextOptions,
          );
          if (!itemResult.valid) {
            errors.push(...itemResult.errors);
          }
        }

        return {
          valid: errors.length === 0,
          errors,
        };
      }

      case NodeType.TaggedUnion: {
        // Note: Empty/missing check is handled by validateObjectField for required fields
        if (!data || typeof data !== 'object') {
          // If we got here, it's optional and empty, which is valid
          return { valid: true, errors: [] };
        }

        const discriminator = (schema as any).discriminator;
        const tag = data[discriminator];

        if (!tag) {
          return {
            valid: false,
            errors: [{
              path: `${path}.${discriminator}`,
              message: `Missing discriminator field '${discriminator}'`,
              value: data,
            }],
          };
        }

        const variant = (schema as any).variants.find((v: any) => v.tag === tag);
        if (!variant) {
          return {
            valid: false,
            errors: [{
              path: `${path}.${discriminator}`,
              message: `Unknown variant '${tag}' for discriminator '${discriminator}'`,
              value: tag,
            }],
          };
        }

        return validateObject(path, data, variant.schema, nextOptions);
      }

      case NodeType.Map: {
        if (!data || typeof data !== 'object') {
          return { valid: true, errors: [] };
        }

        const errors: ValidationError[] = [];
        for (const [key, value] of Object.entries(data)) {
          const itemResult = validateSchema(
            `${path}.${key}`,
            value,
            (schema as any).valueSchema,
            nextOptions,
          );
          if (!itemResult.valid) {
            errors.push(...itemResult.errors);
          }
        }

        return {
          valid: errors.length === 0,
          errors,
        };
      }

      // Primitives, Enums, Links, RecursiveRef, RelativePath, Tuple
      // These don't need deep validation - just presence checks
      default:
        return { valid: true, errors: [] };
    }
  };

  // Helper: Validate object
  const validateObject = (
    path: string,
    data: Record<string, any>,
    schema: Schemas['ObjectNode'],
    options: ValidationOptions = {},
  ): ValidationResult => {
    const { debug = false } = options;

    if (debug) {
      console.debug(`[Validation] Object at ${path}`, { data, schema });
    }

    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: [{
          path,
          message: 'Expected an object',
          value: data,
        }],
      };
    }

    const required = new Set((schema as any).required || []);
    const errors: ValidationError[] = [];

    // Validate each property
    for (const [propertyName, propertySchema] of Object.entries((schema as any).properties)) {
      const fieldRequired = required.has(propertyName);
      const fieldValue = data[propertyName];

      const fieldResult = validateObjectField(
        path,
        propertyName,
        fieldValue,
        propertySchema as Schemas['AnySchemaNode'],
        fieldRequired,
        options,
      );

      if (!fieldResult.valid) {
        errors.push(...fieldResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Helper: Validate object field
  const validateObjectField = (
    parentPath: string,
    fieldName: string,
    fieldValue: any,
    fieldSchema: Schemas['AnySchemaNode'],
    isRequired: boolean,
    options: ValidationOptions = {},
  ): ValidationResult => {
    const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

    // Check for missing values
    const isMissing = fieldValue === null || fieldValue === undefined;

    // Required field validation
    if (isRequired) {
      // For primitives (string), empty string is invalid
      if (fieldSchema.nodeType === NodeType.Primitive && (isMissing || fieldValue === '')) {
        return {
          valid: false,
          errors: [{
            path: fieldPath,
            message: `Field '${fieldName}' is required`,
            value: fieldValue,
          }],
        };
      }

      // For other types (objects, enums, unions), missing or empty object is invalid
      if (isMissing || (typeof fieldValue === 'object' && !Array.isArray(fieldValue) && Object.keys(fieldValue).length === 0)) {
        return {
          valid: false,
          errors: [{
            path: fieldPath,
            message: `Field '${fieldName}' is required`,
            value: fieldValue,
          }],
        };
      }

      // Arrays: empty array [] is valid (presence check, not length check)
      // Missing array is invalid
      if (fieldSchema.nodeType === NodeType.Array && isMissing) {
        return {
          valid: false,
          errors: [{
            path: fieldPath,
            message: `Field '${fieldName}' is required`,
            value: fieldValue,
          }],
        };
      }
    } else {
      // Optional field - if not present, it's valid
      if (isMissing) {
        return { valid: true, errors: [] };
      }
    }

    // Validate the field value against its schema
    return validateSchema(fieldPath, fieldValue, fieldSchema, options);
  };

  return {
    // Pass through raw inputs
    schemas: openapi.components?.schemas as Schemas['components'],
    nodes: generatedSchemas as Schemas['nodes'],

    // Parsed mappings
    entityMappings,
    stateEntryToSchema,
    entitySchemaCache,
    urlToStateEntry,
    stateEntryToUrl,
    entityDisplayNames,

    // Helper functions
    isPrimitive,
    extractNodeType,
    isEntityValid,
    sortEntityProperties,

    // String utilities
    toTitleCase,
    toKebabCase,
    toSpaceCase,
    generateFieldLabel,

    // ID utilities
    isSingletonId,

    // Default values
    getDefaultValue,

    // Validation
    validateSchema,
    validateObject,
    validateObjectField,
    createValidationCacheKey,
  };
}
