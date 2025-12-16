/**
 * NOTE: These types are the *internal* building blocks for the public API that
 * lives in `src/index.ts`. Consumers and plugin authors should import from
 * `@statelyjs/schema` rather than referencing this module directly. Keeping the
 * internals in one place makes it easier to reason about how the Generated/Plugin
 * views are assembled while still presenting a clean surface at the package root.
 */
import type { GeneratedNodeMap, StatelyConfig } from './generated';
import type { AnyRecord, EmptyRecord, UnionToIntersection } from './helpers';
import type { BaseNode, NodeInformation, NodeMap } from './nodes';
import type { AnySchemaAugments, PluginAugment } from './plugin';
import type { ValidateHook } from './validation';

/**
 * Base schema builder – derives shared surface area without core additions.
 *
 * This type helper is the core type helper, without any assumptions baked in, not even "core".
 * Prefer the exported `Schemas` in the entrypoint of the package.
 *
 * Variance annotation enforces that Config can only be used covariantly, preventing
 * invariant-causing patterns like `keyof Config['nodes']` from being introduced.
 */
export type StatelySchemas<out Config extends StatelyConfig, Augments extends AnySchemaAugments> = {
  /** Store raw configuration and plugin augmentations */
  config: Config;
  augments: Augments;
  generated: NodeInformation<GeneratedNodeMap<Config>>;
  plugin: NodeInformation<AugmentPluginNodes<Augments>>;
  types: AugmentPluginTypes<Augments>;
  data: AugmentPluginData<Augments>;
  utils: AugmentPluginUtils<Augments>;
};

export type StatelySchemaConfig<S> = S extends StatelySchemas<infer Config, any> ? Config : never;

/**
 * Type guard for narrowing plugin node unions by nodeType.
 *
 * Use this helper when you need to narrow a `PluginNodeUnion<S>` to a specific node type
 * based on its `nodeType` discriminator. This is particularly useful in validation functions
 * and other plugin code that needs to handle different node types.
 *
 * @example
 * ```typescript
 * function processNode(schema: PluginNodeUnion<MySchemas>) {
 *   if (isNodeOfType<ObjectNode>(schema, 'object')) {
 *     // schema is now narrowed to ObjectNode
 *     console.log(schema.properties);
 *   }
 * }
 * ```
 */
export function isNodeOfType<N extends BaseNode>(
  schema: BaseNode,
  nodeType: N['nodeType'],
): schema is N {
  return schema.nodeType === nodeType;
}

export type DerivedPluginNodes<Augments> = AugmentPluginNodes<Augments>;
export type PluginAnyNode<Augments extends AnySchemaAugments> = DerivedPluginNodes<Augments>;

type AugmentPluginNodes<Augments> = Augments extends readonly PluginAugment<
  any,
  infer Nodes,
  any,
  any,
  any
>[]
  ? UnionToIntersection<Nodes>
  : NodeMap;

type AugmentPluginTypes<Augments> = Augments extends readonly PluginAugment<
  any,
  any,
  infer Types,
  any,
  any
>[]
  ? UnionToIntersection<Types>
  : EmptyRecord;

type AugmentPluginData<Augments> = (Augments extends readonly PluginAugment<
  any,
  any,
  any,
  infer Data,
  any
>[]
  ? UnionToIntersection<Data>
  : EmptyRecord) &
  AnyRecord;

type AugmentPluginUtils<Augments> = Augments extends readonly [
  ...infer Rest extends readonly PluginAugment<string>[],
  infer Last extends PluginAugment<string>,
]
  ? AugmentPluginUtils<Rest> & PluginUtilsOf<Last>
  : EmptyRecord;

type PluginUtilsOf<Augment> = Augment extends PluginAugment<infer Name, any, any, any, infer Utils>
  ? { [K in Name]: Utils extends Record<string, any> ? Utils & { validate?: ValidateHook } : Utils }
  : AnyRecord;
