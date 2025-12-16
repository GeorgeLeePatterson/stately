/**
 * @statelyjs/schema/parsers
 *
 * Parsing logic for extracting entity metadata from OpenAPI specs
 */

import type { DefineData } from '@statelyjs/schema';
import { toKebabCase, toTitleCase } from '@/base/utils.js';
import type { CoreStatelyConfig } from './generated.js';
import type { NodeValue, StateEntry } from './helpers.js';

/**
 * Parse entity mappings from the Entity schema's oneOf variants
 *
 * @param document - Raw OpenAPI document (unknown type, introspected at runtime)
 */
function parseEntityMappings<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  document: unknown,
): Array<{ stateEntry: StateEntry<Config>; schemaName: string }> {
  // Runtime introspection of raw OpenAPI document structure
  const doc = document as any;
  const entitySchema = doc?.components?.schemas?.Entity;
  if (!entitySchema?.oneOf) {
    throw new Error('Entity schema not found in OpenAPI spec or missing oneOf');
  }

  return entitySchema.oneOf.map((variant: any) => {
    const stateEntry = (variant.properties?.type?.enum?.[0] || '') as StateEntry<Config>;
    const schemaName = variant.properties?.data?.$ref?.split('/').pop() || '';
    return { schemaName, stateEntry };
  });
}

/**
 * Build StateEntry -> Schema name mapping
 */
function buildStateEntryToSchema<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [stateEntry, schemaName]),
  ) as Record<StateEntry<Config>, string>;
}

/**
 * Build StateEntry -> Parsed ObjectNode cache
 */
function buildEntitySchemaCache<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
  generatedSchemas: Config['nodes'],
): Record<StateEntry<Config>, NodeValue<Config> | null> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [
      stateEntry,
      generatedSchemas[schemaName as keyof Config['nodes']] || null,
    ]),
  ) as Record<StateEntry<Config>, NodeValue<Config> | null>;
}

/**
 * Build URL -> StateEntry mapping
 */
function buildUrlToStateEntry<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<string, StateEntry<Config>> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [toKebabCase(stateEntry), stateEntry]),
  ) as Record<string, StateEntry<Config>>;
}

/**
 * Build StateEntry -> URL mapping
 */
function buildStateEntryToUrl<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toKebabCase(stateEntry)]),
  ) as Record<StateEntry<Config>, string>;
}

/**
 * Build StateEntry -> Display name mapping
 */
function buildEntityDisplayNames<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [stateEntry, toTitleCase(stateEntry)]),
  ) as Record<StateEntry<Config>, string>;
}

function generateCoreData<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  document: unknown,
  generatedNodes: Config['nodes'] | undefined,
) {
  if (!document) return {};

  const entityMappings = parseEntityMappings<Config>(document);
  console.debug('[stately/schema] generated entity mappings: ', { entityMappings });

  let entitySchemaCache = {};
  if (generatedNodes) {
    entitySchemaCache = buildEntitySchemaCache<Config>(entityMappings, generatedNodes);
  }
  console.debug('[stately/schema] generated entity schema cache: ', { entitySchemaCache });

  return {
    entityDisplayNames: buildEntityDisplayNames<Config>(entityMappings),
    entitySchemaCache,
    stateEntryToSchema: buildStateEntryToSchema<Config>(entityMappings),
    stateEntryToUrl: buildStateEntryToUrl<Config>(entityMappings),
    urlToStateEntry: buildUrlToStateEntry<Config>(entityMappings),
  };
}

type CoreData<Config extends CoreStatelyConfig = CoreStatelyConfig> = DefineData<{
  entityDisplayNames: Record<StateEntry<Config>, string>;
  entitySchemaCache: Config['nodes'];
  stateEntryToSchema: Record<StateEntry<Config>, string>;
  stateEntryToUrl: Record<StateEntry<Config>, string>;
  urlToStateEntry: Record<string, StateEntry<Config>>;
}>;

export type { CoreData };
export { generateCoreData };
