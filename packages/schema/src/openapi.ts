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
 * Result returned from createOpenAPIIntegration
 * All types are derived from StatelySchemas using the provided generics
 */
export interface OpenAPIIntegration<Schemas extends StatelySchemas<any>> {
  // ===== Raw Inputs (passed through) =====

  /**
   * Raw OpenAPI component schemas (openapi.components.schemas)
   */
  schemas: Schemas['components'];

  /**
   * Generated schema nodes (PARSED_SCHEMAS)
   */
  nodes: Schemas['nodes'];

  // ===== Parsed Entity Mappings =====

  /**
   * Raw entity mappings extracted from Entity oneOf
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

function validateObject(obj: any, schema: any): boolean {
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

    return nameValid && !!entity && validateObject(entity, schema);
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
  };
}
