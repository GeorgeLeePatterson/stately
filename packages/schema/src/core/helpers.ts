import type { CoreStatelyConfig } from "./generated.js";

// Derive StateEntry directly from generated components (not from CoreTypes)
export type StateEntry<Config extends CoreStatelyConfig = CoreStatelyConfig> =
  Config['components']['schemas']['StateEntry'] extends string
    ? Config['components']['schemas']['StateEntry']
    : string;

export type NodeKey<Config extends CoreStatelyConfig = CoreStatelyConfig> = keyof Config['nodes'];
