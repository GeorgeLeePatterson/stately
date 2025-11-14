import { SchemaConfig, Schemas } from "../index.js";
import { PluginFactory } from "../stately.js";
import type { ValidateArgs } from "../validation.js";
import { generateCoreData } from "./data.js";
import { coreUtils } from "./utils.js";
import { validateNode } from "./validation.js";

export const CORE_PLUGIN_NAME: string = 'core' as const;

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
