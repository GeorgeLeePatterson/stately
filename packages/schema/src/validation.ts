import type { AnyRecord } from './stately.js';
import { SchemaAnyNode, SchemaNodeMap, StatelyConfig, StatelySchemas } from './schema.js';
import type { Stately } from './stately.js';


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
  schema: SchemaAnyNode<StatelySchemas<Config, SchemaNodeMap, any>>;
  options?: ValidationOptions;
}

/**
 * Validation hook signature used by schema plugins.
 */
export type SchemaValidateHook<Config extends StatelyConfig = StatelyConfig> = (
  args: SchemaValidateArgs<Config>,
) => ValidationResult | undefined;

export function runValidationPipeline<
  Config extends StatelyConfig,
  Utils extends AnyRecord,
  Exports extends AnyRecord,
>(state: Stately<Config, Utils, Exports>, args: SchemaValidateArgs<Config>): ValidationResult {
  const hooks = state.plugins
    .all()
    .map(plugin => plugin.validate)
    .filter((hook): hook is SchemaValidateHook<Config> => Boolean(hook));

  if (hooks.length === 0) {
    throw new Error('No schema validators registered. Apply at least one plugin before using validate().');
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { valid: true, errors: [] };
}
