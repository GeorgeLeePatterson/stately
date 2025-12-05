/**
 * Core plugin entrypoint.
 *
 * Treat this module like any other Stately plugin: it exposes the schema augment
 * (`CorePlugin`), the runtime plugin factory (`createCorePlugin`), and the
 * node helpers that plugin authors might want to reuse. Import everything from
 * here instead of reaching directly into ./augment or ./plugin.
 */

import type {
  PluginNodeUnion as BasePluginNodeUnion,
  Stately as BaseStately,
  StatelyBuilder as BaseStatelyBuilder,
} from '@stately/schema';
import {
  type AnySchemaAugments,
  createStately,
  type DefineOpenApi,
  type StatelySchemas,
} from '@stately/schema';
import type { CoreStatelyConfig } from './generated.js';
import { CoreNodeType, PrimitiveType } from './nodes.js';
import { CORE_PLUGIN_NAME, type CorePlugin, corePlugin } from './plugin.js';
import { SINGLETON_ID } from './utils.js';

// Re-exports
export type { CoreStatelyConfig, DefineCoreConfig } from './generated.js';
export type { NodeKey, StateEntry } from './helpers.js';
export type {
  ArrayNode,
  CoreNodeMap,
  CoreNodes,
  EnumNode,
  LinkNode,
  MapNode,
  NullableNode,
  ObjectNode,
  PrimitiveNode,
  RecursiveRefNode,
  TaggedUnionNode,
  TCoreNodeType,
  TPrimitiveType,
  TupleNode,
  UnionNode,
  UntaggedEnumNode,
} from './nodes.js';
export type { CorePlugin } from './plugin.js';
export { CoreNodeType, corePlugin, CORE_PLUGIN_NAME, PrimitiveType, SINGLETON_ID };

export type Stately<S extends Schemas<any, any> = Schemas> = BaseStately<S>;
export type StatelyBuilder<S extends Schemas<any, any> = Schemas> = BaseStatelyBuilder<S>;

/**
 * Stately plugin types integration for schemas - Main API
 *
 * Variance annotation enforces that Config can only be used covariantly.
 * This acts as a compile-time guardrail preventing invariant-causing patterns
 * like `keyof Config['nodes']` from being introduced anywhere in the type system.
 */
export type Schemas<
  out Config extends CoreStatelyConfig = CoreStatelyConfig,
  Augments extends AnySchemaAugments = [],
> = StatelySchemas<Config, readonly [CorePlugin<Config, Augments>, ...Augments]>;

/**
 * Stately plugin functionality integration - Main API
 *
 * Convenience helper that seeds the runtime with the core schema plugin so consumers get all core
 * helpers/validators out of the box. Additional schema plugins can be appended by chaining
 * `.withPlugin(...)` on the returned builder.
 *
 * @param openapi - OpenAPI document (accepts JSON imports and typed documents)
 * @param nodes - Generated node map from codegen
 */
export function stately<S extends Schemas<any, any> = Schemas>(
  openapi: DefineOpenApi<any>,
  nodes: S['config']['nodes'],
) {
  return createStately<S>(openapi, nodes).withPlugin(corePlugin<S>());
}

/**
 * Type helper to access the underlying `StatelyConfig` of a `Schemas`, `StatelySchemas` w/ core.
 */
export type SchemaConfig<S> = S extends Schemas<infer Config, any> ? Config : never;

/**
 * Type helpers for referencing plugin node information
 */
export type PluginNodeUnion<S extends Schemas<any, any> = Schemas> = BasePluginNodeUnion<S>;
