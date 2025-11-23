import type { BaseNode } from './nodes.js';
import type { StatelySchemas } from './schema.js';

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
