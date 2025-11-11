import { type SchemaPluginFactory } from '../plugin.js';
import type { AnyRecord } from '../stately.js';
import { SchemaValidateArgs } from '../validation.js';
import type { CoreStatelyConfig } from './augment.js';
import * as parsers from './parsers.js';
import * as utils from './utils.js';
import { validateNode } from './validation.js';


const coreUtils = {
  toKebabCase: utils.toKebabCase,
  toTitleCase: utils.toTitleCase,
  toSpaceCase: utils.toSpaceCase,
  generateFieldLabel: utils.generateFieldLabel,
  isSingletonId: utils.isSingletonId,
  isPrimitive: utils.isPrimitive<CoreStatelyConfig>,
  extractNodeType: utils.extractNodeType<CoreStatelyConfig>,
  isEntityValid: utils.isEntityValid<CoreStatelyConfig>,
  sortEntityProperties: utils.sortEntityProperties<CoreStatelyConfig>,
  getDefaultValue: utils.getDefaultValue<CoreStatelyConfig>,
} as const;

/**
 * Core schema plugin that wires entity metadata, helpers, and validators.
 */
export function createCorePlugin<
  Config extends CoreStatelyConfig = CoreStatelyConfig,
  Utils extends AnyRecord = AnyRecord,
  Exports extends AnyRecord = AnyRecord,
>(): SchemaPluginFactory<Config, Utils, Exports, AnyRecord> {
  return runtime => {
    const newRuntime = { ...runtime };
    const document = newRuntime.data.document as parsers.OpenAPIDocument;
    const nodes = newRuntime.data.nodes as Config['nodes'];

    const entityMappings = parsers.parseEntityMappings<{ StateEntry: string }>(document);

    Object.assign(newRuntime.data, {
      stateEntryToSchema: parsers.buildStateEntryToSchema(entityMappings),
      entitySchemaCache: parsers.buildEntitySchemaCache(entityMappings, nodes),
      urlToStateEntry: parsers.buildUrlToStateEntry(entityMappings),
      stateEntryToUrl: parsers.buildStateEntryToUrl(entityMappings),
      entityDisplayNames: parsers.buildEntityDisplayNames(entityMappings),
    });

    // Core installs in root utils
    newRuntime.utils = { ...newRuntime.utils, ...coreUtils };

    // Also available in registry
    for (const [key, value] of Object.entries(coreUtils)) {
      newRuntime.registry.utils.set(key, value as (...args: any[]) => unknown);
    }

    // Install plugin
    newRuntime.plugins.installed.push({
      name: 'stately:core',
      validate: (args: SchemaValidateArgs<Config>) =>
        validateNode({ ...args, schema: args.schema as any, integration: newRuntime }),
    });

    return newRuntime;
  };
}
