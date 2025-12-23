import type {
  AnySchemaAugments,
  DefinePlugin,
  DefineTypes,
  NodeValues,
  PluginAnyNode,
  PluginFactory,
} from '@statelyjs/schema';
import { type CoreData, generateCoreData } from './data.js';
import type { CoreStatelyConfig } from './generated.js';
import type { Schemas } from './index.js';
import type { CoreNodeMap } from './nodes.js';
import type { CoreUtils } from './utils.js';
import { coreUtils } from './utils.js';
import { validateNode } from './validation.js';

export const CORE_PLUGIN_NAME = 'core' as const;

export type CoreTypes<Config extends CoreStatelyConfig> = DefineTypes<{
  // Derived: Extracts the actual data payload from Entity union of a particular impl
  EntityData: Config['components']['schemas']['Entity']['data'];
}>;

export type CorePlugin<
  Config extends CoreStatelyConfig,
  Augments extends AnySchemaAugments,
> = DefinePlugin<
  typeof CORE_PLUGIN_NAME,
  CoreNodeMap<NodeValues<PluginAnyNode<Augments>>>,
  CoreTypes<Config>,
  CoreData<Config>,
  CoreUtils
>;

/**
 * Core schema plugin that wires entity metadata, helpers, and validators.
 */
export function corePlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    const document = runtime.schema.document;
    const coreData = generateCoreData(document, runtime.schema.nodes);

    return {
      ...runtime,
      data: { ...runtime.data, ...coreData },
      plugins: { ...runtime.plugins, [CORE_PLUGIN_NAME]: { ...coreUtils, validate: validateNode } },
    };
  };
}
