import type { StatelySchemas } from "@stately/schema/schema";
import type { PluginAugment } from "@stately/schema/plugin";
import type { StatelyConfig } from "@stately/schema/generated";

export type BaseSchemas<
  Config extends StatelyConfig = StatelyConfig,
  Augments extends readonly PluginAugment<any, any>[] = [],
> = StatelySchemas<Config, Augments>;

export type AnyBaseSchemas = BaseSchemas<
  StatelyConfig,
  readonly PluginAugment<any, any>[]
>;
