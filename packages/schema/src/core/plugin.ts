import type { SchemaPluginFactory } from '../plugin.js';
import type { AnyRecord, Stately } from '../stately.js';
import type { CoreStatelyConfig } from './augment.js';
import * as parsers from './parsers.js';
import * as utils from './utils.js';
import { validateNode } from './validation.js';

/**
 * Core schema plugin that wires entity metadata, helpers, and validators.
 */
export function createCorePlugin<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
>(): SchemaPluginFactory<Config, Stately<Config, AnyRecord, AnyRecord>, AnyRecord> {
  return runtime => {
    const document = runtime.data.document as parsers.OpenAPIDocument;
    const nodes = runtime.data.nodes as Config['nodes'];

    const entityMappings = parsers.parseEntityMappings<{ StateEntry: string }>(document);
    const stateEntryToSchema = parsers.buildStateEntryToSchema(entityMappings);
    const entitySchemaCache = parsers.buildEntitySchemaCache(entityMappings, nodes);
    const urlToStateEntry = parsers.buildUrlToStateEntry(entityMappings);
    const stateEntryToUrl = parsers.buildStateEntryToUrl(entityMappings);
    const entityDisplayNames = parsers.buildEntityDisplayNames(entityMappings);

    Object.assign(runtime.data, {
      entityMappings,
      stateEntryToSchema,
      entitySchemaCache,
      urlToStateEntry,
      stateEntryToUrl,
      entityDisplayNames,
    });

    const helperBundle = {
      toKebabCase: utils.toKebabCase,
      toTitleCase: utils.toTitleCase,
      toSpaceCase: utils.toSpaceCase,
      generateFieldLabel: utils.generateFieldLabel,
      isSingletonId: utils.isSingletonId,
      isPrimitive: (schema: unknown) => utils.isPrimitive<Config>(schema as any),
      extractNodeType: (schema: unknown) => utils.extractNodeType<Config>(schema as any),
      isEntityValid: (entity: unknown, schema: unknown) =>
        utils.isEntityValid<Config>(entity as any, schema as any),
      sortEntityProperties: (
        properties: Array<[string, unknown]>,
        value: any,
        required: Set<string>,
      ) => utils.sortEntityProperties<Config>(properties as any, value, required),
      getDefaultValue: (node: unknown) => utils.getDefaultValue<Config>(node as any),
    } as AnyRecord;

    runtime.utils = { ...(runtime.utils as AnyRecord), ...helperBundle } as typeof runtime.utils;

    for (const [key, value] of Object.entries(helperBundle)) {
      runtime.registry.utils.set(key, value as (...args: any[]) => unknown);
    }

    return {
      name: 'stately:schema-core',
      exports: helperBundle,
      validate: ({ path, data, schema, options }) =>
        validateNode({ path, data, schema: schema as any, options, integration: runtime }),
    };
  };
}
