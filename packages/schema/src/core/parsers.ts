/**
 * @stately/schema/parsers
 *
 * Parsing logic for extracting entity metadata from OpenAPI specs
 */

import type { OpenAPIV3_1 } from 'openapi-types';
import { toKebabCase, toTitleCase } from './utils.js';

/**
 * OpenAPI document type (re-exported from openapi-types)
 */
export type OpenAPIDocument = OpenAPIV3_1.Document;

/**
 * Parse entity mappings from the Entity schema's oneOf variants
 */
export function parseEntityMappings<Schemas extends { StateEntry: string }>(
  openapi: OpenAPIDocument,
): Array<{ stateEntry: Schemas['StateEntry']; schemaName: string }> {
  // biome-ignore lint/complexity/useLiteralKeys: ''
  const entitySchema = openapi.components?.schemas?.['Entity'];
  if (!entitySchema?.oneOf) {
    throw new Error('Entity schema not found in OpenAPI spec or missing oneOf');
  }

  return (entitySchema.oneOf as any[]).map((variant: any) => {
    const stateEntry = variant.properties?.type?.enum?.[0] || '';
    const schemaName = variant.properties?.data?.$ref?.split('/').pop() || '';
    return { stateEntry, schemaName };
  });
}

/**
 * Build StateEntry -> Schema name mapping
 */
export function buildStateEntryToSchema<Schemas extends { StateEntry: string }>(
  entityMappings: Array<{ stateEntry: Schemas['StateEntry']; schemaName: string }>,
): Record<Schemas['StateEntry'], string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [stateEntry, schemaName]),
  ) as Record<Schemas['StateEntry'], string>;
}

/**
 * Build StateEntry -> Parsed ObjectNode cache
 */
export function buildEntitySchemaCache<StateEntry extends string, ObjectNodeShape>(
  entityMappings: Array<{ stateEntry: StateEntry; schemaName: string }>,
  generatedSchemas: Record<string, ObjectNodeShape>,
): Record<StateEntry, ObjectNodeShape | null> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [
      stateEntry,
      generatedSchemas[schemaName] || null,
    ]),
  ) as Record<StateEntry, ObjectNodeShape | null>;
}

/**
 * Build URL -> StateEntry mapping
 */
export function buildUrlToStateEntry<Schemas extends { StateEntry: string }>(
  entityMappings: Array<{ stateEntry: Schemas['StateEntry']; schemaName: string }>,
): Record<string, Schemas['StateEntry']> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [toKebabCase(stateEntry), stateEntry]),
  ) as Record<string, Schemas['StateEntry']>;
}

/**
 * Build StateEntry -> URL mapping
 */
export function buildStateEntryToUrl<Schemas extends { StateEntry: string }>(
  entityMappings: Array<{ stateEntry: Schemas['StateEntry']; schemaName: string }>,
): Record<Schemas['StateEntry'], string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toKebabCase(stateEntry)]),
  ) as Record<Schemas['StateEntry'], string>;
}

/**
 * Build StateEntry -> Display name mapping
 */
export function buildEntityDisplayNames<Schemas extends { StateEntry: string }>(
  entityMappings: Array<{ stateEntry: Schemas['StateEntry']; schemaName: string }>,
): Record<Schemas['StateEntry'], string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toTitleCase(stateEntry)]),
  ) as Record<Schemas['StateEntry'], string>;
}
