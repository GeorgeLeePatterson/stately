import type {
  StatelySchemas as BaseSchemas,
  SchemaAnyNode,
  SchemaNodeMap,
  StatelyConfig,
} from './schema.js';
import type { Stately } from './stately.js';

// schema/plugin.ts
/**
 * @stately/schema - Plugin System
 *
 * Defines the plugin interfaces + helper types for extending Stately schemas.
 */

type AnyRecord = Record<string, unknown>;
type EmptyRecord = Record<never, never>;

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationOptions {
  depth?: number;
  warnDepth?: number;
  maxDepth?: number;
  debug?: boolean;
  onDepthWarning?: (path: string, depth: number) => void;
}

/**
 * Validation hook context passed to plugins.
 */
export interface SchemaValidateArgs<Config extends StatelyConfig = StatelyConfig> {
  path: string;
  data: any;
  schema: SchemaAnyNode<BaseSchemas<Config, SchemaNodeMap, any>>;
  options?: ValidationOptions;
  runtime: Stately<Config, AnyRecord, AnyRecord>;
}

/**
 * Validation hook signature used by schema plugins.
 */
export type SchemaValidateHook<Config extends StatelyConfig = StatelyConfig> = (
  args: SchemaValidateArgs<Config>,
) => ValidationResult | undefined;

/**
 * Schema plugin descriptor returned by plugin factory functions.
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
 * Backwards-compatible alias for schema plugin descriptors.
 */
export type StatelySchemaPlugin<
  Config extends StatelyConfig = StatelyConfig,
  Exports extends AnyRecord = EmptyRecord,
> = SchemaPluginDescriptor<Config, Exports>;

/**
 * Runtime plugin factory signature.
 */
export type SchemaPluginFactory<
  Config extends StatelyConfig,
  Runtime extends Stately<Config, AnyRecord, AnyRecord> = Stately<Config, AnyRecord, AnyRecord>,
  Exports extends AnyRecord = EmptyRecord,
> = (runtime: Runtime) => SchemaPluginDescriptor<Config, Exports>;
