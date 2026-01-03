import {
  type AnySchemaAugments,
  createSchemaPlugin,
  type DefinePlugin,
  type DefineTypes,
  type NodeValues,
  type PluginAnyNode,
} from '@statelyjs/schema';
import { type CoreData, generateCoreData } from './data.js';
import type { CoreStatelyConfig } from './generated.js';
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
 *
 * Provides:
 * - Entity metadata (types, display names, URLs)
 * - Core utility functions for entity operations
 * - Validation hook for schema nodes
 */
export const corePlugin = createSchemaPlugin<CorePlugin<CoreStatelyConfig, []>>({
  name: CORE_PLUGIN_NAME,

  setup: ctx => {
    const { document, nodes } = ctx.schema;
    const data = generateCoreData(document, nodes);
    return { data };
  },
  utils: { ...coreUtils, validate: validateNode },
});
