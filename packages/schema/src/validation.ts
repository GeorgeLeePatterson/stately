import { type BaseNode, UnknownNodeType } from './nodes.js';
import type { StatelySchemas } from './schema.js';
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
export interface ValidateArgs<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  Node extends BaseNode = S['plugin']['AnyNode'],
> {
  path: string;
  data: any;
  schema: Node;
  options?: ValidationOptions;
}

/**
 * Validation hook signature used by schema plugins.
 */
export type ValidateHook<S extends StatelySchemas<any, any> = StatelySchemas<any, any>> = (
  args: ValidateArgs<S>,
) => ValidationResult | undefined;

export function runValidationPipeline<S extends StatelySchemas<any, any>>(
  state: Stately<S>,
  args: ValidateArgs<S>,
): ValidationResult {
  // Handle unknown nodeTypes from codegen - skip validation
  if (args.schema.nodeType === UnknownNodeType) {
    if (args.options?.debug) {
      console.debug(`[Validation] Skipping unknown nodeType: ${args.schema.nodeType}`);
    }
    return { errors: [], valid: true };
  }

  const hooks = Object.values(state.plugins as Record<string, any>)
    .map(plugin => plugin?.validate)
    .filter((hook): hook is ValidateHook<S> => Boolean(hook));

  if (hooks.length === 0) {
    throw new Error(
      'No schema validators registered. Apply at least one plugin before using validate().',
    );
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { errors: [], valid: true };
}
