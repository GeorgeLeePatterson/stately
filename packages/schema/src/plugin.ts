import type { StatelyConfig } from './schema.js';
import type { Stately } from './stately.js';
import { SchemaValidateHook } from './validation.js';

// schema/plugin.ts
/**
 * @stately/schema - Plugin System
 *
 * Defines the plugin interfaces + helper types for extending Stately schemas.
 */

type AnyRecord = Record<string, unknown>;
type EmptyRecord = Record<never, never>;

/**
 * Schema plugin descriptor installed by plugin factory functions.
 */
export interface SchemaPluginDescriptor<
  Config extends StatelyConfig = StatelyConfig,
  Exports extends AnyRecord = EmptyRecord,
> {
  name: string;
  exports?: Exports;
  api?: Record<string, unknown>;
  validate?: SchemaValidateHook<Config>;
}

/**
 * Runtime plugin factory signature.
 */
export type SchemaPluginFactory<
  Config extends StatelyConfig,
  Utils extends AnyRecord = AnyRecord,
  Exports extends AnyRecord = AnyRecord,
  PluginExt extends AnyRecord = EmptyRecord,
> = (runtime: Stately<Config, Utils, Exports>) => Stately<Config, Utils, Exports & PluginExt>;
