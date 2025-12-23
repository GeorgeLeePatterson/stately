import type { NodeMap } from '@statelyjs/schema';
import type { CoreStatelyConfig } from './generated.js';

/**
 * StateEntry type - represents entity state discriminator values.
 *
 * Uses conditional type extraction to provide Config-specific narrowing while maintaining
 * covariance. Direct extraction like `Config['components']['schemas']['StateEntry']` would
 * create invariance when used as Record keys, but conditional extraction with `infer`
 * maintains covariance because the conditional distributes over the constraint.
 */
export type StateEntry<Config extends CoreStatelyConfig = CoreStatelyConfig> = Config extends {
  components: { schemas: { StateEntry: infer S } };
}
  ? S
  : string;

/**
 * Node key type - represents a reference to a schema node by name.
 *
 * Uses conditional type extraction to provide Config-specific narrowing while maintaining
 * covariance. Direct extraction like `keyof Config['nodes']` would create invariance when
 * used as Record keys, but conditional extraction with `infer` maintains covariance.
 */
export type NodeKey<N extends NodeMap = NodeMap> = N extends object ? keyof N : string;

/**
 * Node value type - represents any node value from the Config's nodes map.
 *
 * Uses conditional type extraction to provide Config-specific narrowing while maintaining
 * covariance. Direct extraction like `Config['nodes'][keyof Config['nodes']]` would create
 * invariance when used in covariant positions, but conditional extraction with `infer`
 * maintains covariance.
 */
export type NodeValue<Config extends CoreStatelyConfig = CoreStatelyConfig> = Config extends {
  nodes: infer N;
}
  ? N extends object
    ? N[keyof N]
    : unknown
  : unknown;
