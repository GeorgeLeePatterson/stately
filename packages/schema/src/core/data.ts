/**
 * @stately/schema/parsers
 *
 * Parsing logic for extracting entity metadata from OpenAPI specs
 */

import type { CoreSchemaTypes, CoreStatelyConfig } from "./augment.js";
import { coreUtils } from "./utils.js";

type SchemaTypes<Config extends CoreStatelyConfig = CoreStatelyConfig> =
  CoreSchemaTypes<Config>;
type StateEntry<Config extends CoreStatelyConfig = CoreStatelyConfig> =
  SchemaTypes<Config>["StateEntry"] extends string
    ? SchemaTypes<Config>["StateEntry"]
    : string;
/**
 * Parse entity mappings from the Entity schema's oneOf variants
 */
function parseEntityMappings<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  components: Config["components"],
): Array<{ stateEntry: StateEntry<Config>; schemaName: string }> {
  // biome-ignore lint/complexity/useLiteralKeys: ''
  const entitySchema = components?.schemas?.["Entity"];
  if (!entitySchema?.oneOf) {
    throw new Error("Entity schema not found in OpenAPI spec or missing oneOf");
  }

  return entitySchema.oneOf.map((variant) => {
    const stateEntry =
      (variant.properties?.type?.enum?.[0] || "") as StateEntry<Config>;
    const schemaName = variant.properties?.data?.$ref?.split("/").pop() || "";
    return { stateEntry, schemaName };
  });
}

/**
 * Build StateEntry -> Schema name mapping
 */
function buildStateEntryToSchema<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [
      stateEntry,
      schemaName,
    ]),
  ) as Record<StateEntry<Config>, string>;
}

/**
 * Build StateEntry -> Parsed ObjectNode cache
 */
function buildEntitySchemaCache<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
  generatedSchemas: Config["nodes"],
): Record<StateEntry<Config>, Config["nodes"][keyof Config["nodes"]] | null> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry, schemaName }) => [
      stateEntry,
      generatedSchemas[schemaName as keyof Config["nodes"]] || null,
    ]),
  ) as Record<StateEntry, Config["nodes"][keyof Config["nodes"]] | null>;
}

/**
 * Build URL -> StateEntry mapping
 */
function buildUrlToStateEntry<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<string, StateEntry<Config>> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [
      coreUtils.toKebabCase(stateEntry),
      stateEntry,
    ]),
  ) as Record<string, StateEntry<Config>>;
}

/**
 * Build StateEntry -> URL mapping
 */
function buildStateEntryToUrl<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [
      stateEntry,
      coreUtils.toKebabCase(stateEntry),
    ]),
  ) as Record<StateEntry<Config>, string>;
}

/**
 * Build StateEntry -> Display name mapping
 */
function buildEntityDisplayNames<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(
  entityMappings: Array<{ stateEntry: StateEntry<Config>; schemaName: string }>,
): Record<StateEntry<Config>, string> {
  return Object.fromEntries(
    entityMappings.map(({ stateEntry }) => [
      stateEntry,
      coreUtils.toTitleCase(stateEntry),
    ]),
  ) as Record<StateEntry<Config>, string>;
}

function generateCoreData<Config extends CoreStatelyConfig = CoreStatelyConfig>(
  components: Config["components"] | undefined,
  generatedNodes: Config["nodes"] | undefined,
) {
  if (!components) return {};

  const entityMappings = parseEntityMappings(components);

  let entitySchemaCache = {};
  if (generatedNodes) {
    entitySchemaCache = buildEntitySchemaCache(entityMappings, generatedNodes);
  }

  return {
    stateEntryToSchema: buildStateEntryToSchema(entityMappings),
    urlToStateEntry: buildUrlToStateEntry(entityMappings),
    stateEntryToUrl: buildStateEntryToUrl(entityMappings),
    entityDisplayNames: buildEntityDisplayNames(entityMappings),
    entitySchemaCache,
  };
}

type CoreData<Config extends CoreStatelyConfig = CoreStatelyConfig> =
  ReturnType<typeof generateCoreData<Config>>;

export type { CoreData };
export { generateCoreData };
