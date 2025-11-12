import { StatelyConfig } from "./generated.js";
import { PluginNodeUnion } from "./plugin.js";
import { StatelySchemas } from "./schema.js";
import type { Stately } from "./stately.js";

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
export interface ValidateArgs<
  S extends StatelySchemas<StatelyConfig, any> = StatelySchemas<
    StatelyConfig,
    any
  >,
  Node = PluginNodeUnion<S>,
> {
  path: string;
  data: any;
  schema: Node;
  options?: ValidationOptions;
}

/**
 * Validation hook signature used by schema plugins.
 */
export type ValidateHook<
  Schema extends StatelySchemas<StatelyConfig, any> = StatelySchemas<
    StatelyConfig,
    any
  >,
> = (args: ValidateArgs<Schema>) => ValidationResult | undefined;

export function runValidationPipeline<Schemas extends StatelySchemas<any, any>>(
  state: Stately<Schemas>,
  args: ValidateArgs<Schemas>,
): ValidationResult {
  const hooks = Object.values(state.plugins as Record<string, any>)
    .map((plugin) => plugin?.["validate"])
    .filter((hook): hook is ValidateHook<Schemas> => Boolean(hook));

  if (hooks.length === 0) {
    throw new Error(
      "No schema validators registered. Apply at least one plugin before using validate().",
    );
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { valid: true, errors: [] };
}
