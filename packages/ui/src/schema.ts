import type {
  DefineComponents,
  DefineGeneratedNodes,
  DefineOperations,
  DefinePaths,
} from '@stately/schema';
import { createOperationBindingsFactory } from '@stately/schema';
import type { NodeMap } from '@stately/schema/nodes';
import type { DefineCoreConfig, Schemas } from './core/index.js';
import { CORE_PLUGIN_NAME, coreSchemaUtils, stately } from './core/index.js';

// ------------------------
// Stately Schema (Core): Root level stately schema definitions
// ------------------------

/**
 * Public helper for declaring a full Stately config
 */
export type DefineConfig<
  C extends DefineComponents = DefineComponents,
  P extends DefinePaths = DefinePaths,
  O extends DefineOperations = DefineOperations,
  N extends DefineGeneratedNodes<NodeMap> = DefineGeneratedNodes<NodeMap>,
> = DefineCoreConfig<C, P, O, N>;

export type {
  AnyPaths,
  AnyRecord,
  AnySchemaAugments,
  AnySchemaPlugin,
  BaseNode,
  DefineComponentSchemas,
  DefineComponents,
  DefineData,
  DefineGeneratedNodes,
  DefineNodeMap,
  DefineOperations,
  DefinePaths,
  DefinePlugin,
  DefineTypes,
  DefineUtils,
  EmptyRecord,
  GeneratedNodeMap,
  NeverRecord,
  NodeInformation,
  NodeMap,
  OperationBindings,
  PluginFactory,
  PluginNodeUnion,
} from '@stately/schema';
export type {
  Stately,
  StatelyBuilder,
} from './core/schema/index.js';

/** Stately plugin types integration - Main API */
export type { Schemas };

export { coreSchemaUtils, stately, CORE_PLUGIN_NAME, createOperationBindingsFactory };
