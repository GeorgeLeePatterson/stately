import type { CoreUtils } from './utils.js';
import { SchemaConfig, Schemas } from "../index.js";
import { PluginFactory } from "../stately.js";
import type { ValidateArgs } from "../validation.js";
import { generateCoreData } from "./data.js";
import { coreUtils } from "./utils.js";
import { validateNode } from "./validation.js";
import type { DefineTypes, PluginAugment } from '../plugin.js';
import type { CoreData } from './data.js';
import type { CoreNodeMap } from './nodes.js';
import type { CoreStatelyConfig } from './generated.js';

export const CORE_PLUGIN_NAME: string = 'core' as const;

export type CoreTypes<Config extends CoreStatelyConfig> = DefineTypes<{
  // Derived: Extract the actual data payload from Entity union
  EntityData: Extract<Config['components']['schemas']['Entity'], { type: any; data: any }>['data'];
}>;

export type CorePlugin<Config extends CoreStatelyConfig> = PluginAugment<
  typeof CORE_PLUGIN_NAME,
  CoreNodeMap<Config>,
  CoreTypes<Config>,
  CoreData<Config>,
  CoreUtils<Config>
>;

/**
 * Core schema plugin that wires entity metadata, helpers, and validators.
 */
export function createCorePlugin<
  S extends Schemas<any, any> = Schemas,
>(): PluginFactory<S> {
  return (runtime) => {
    const document = runtime.schema.document;
    const nodes = runtime.schema.nodes as SchemaConfig<S>["nodes"];

    const coreData = generateCoreData(document, nodes);

    return {
      ...runtime,
      data: { ...runtime.data, ...coreData },
      plugins: {
        ...runtime.plugins,
        [CORE_PLUGIN_NAME]: coreUtils,
        validate: (args: ValidateArgs<Schemas>) => validateNode(args),
      },
    };
  };
}
