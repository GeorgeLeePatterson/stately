/**
 * Stately runtime
 *
 * Lightweight builder that wires schema data into a runtime instance, applies plugins,
 * and exposes helper utilities. The runtime keeps a snapshot of the raw OpenAPI document
 * for runtime introspection, plus a registry of helper utilities contributed by plugins.
 * Schema plugins can mutate `runtime.data`, append helpers via `runtime.utils`, and
 * register validation hooks.
 *
 * Type safety comes from the generated TypeScript types passed to StatelyConfig, while
 * the raw OpenAPI document is used purely for runtime introspection.
 */

import type { DefineOpenApi } from './generated.js';
import { UnknownNodeType } from './nodes.js';
import type { StatelySchemaConfig, StatelySchemas } from './schema.js';
import type { ValidateArgs, ValidateHook, ValidationResult } from './validation.js';

/**
 * Runtime plugin factory signature.
 */
export type PluginFactory<S extends StatelySchemas<any, any>> = (runtime: Stately<S>) => Stately<S>;

export interface Stately<S extends StatelySchemas<any, any>> {
  schema: { document: DefineOpenApi<any>; nodes: StatelySchemaConfig<S>['nodes'] };
  data: S['data'];
  plugins: S['utils'];
  validate: (args: ValidateArgs<S>) => ValidationResult;
}

export interface StatelyBuilder<S extends StatelySchemas<any, any>> extends Stately<S> {
  withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S>;
}

export function createStately<S extends StatelySchemas<any, any>>(
  openapi: DefineOpenApi<any>,
  generatedNodes: S['config']['nodes'],
): StatelyBuilder<S> {
  const baseState: Stately<S> = {
    data: {} as S['data'],
    plugins: {} as S['utils'],
    schema: { document: openapi, nodes: generatedNodes },
    validate: args => runValidationPipeline(baseState.plugins, args),
  };

  return (function makeBuilder(state: Stately<S>): StatelyBuilder<S> {
    return {
      ...state,
      validate: args => runValidationPipeline(state.plugins, args),
      withPlugin(plugin: PluginFactory<S>): StatelyBuilder<S> {
        return makeBuilder(plugin({ ...state }));
      },
    };
  })(baseState);
}

function runValidationPipeline<P extends { [key: string]: { validate?: ValidateHook<any> } }>(
  plugins: P,
  args: ValidateArgs<any>,
): ValidationResult {
  const pluginNames = Object.keys(plugins);
  const hooks = Object.values(plugins)
    .filter(plugin => !!plugin?.validate)
    .map(plugin => plugin.validate)
    .filter((hook): hook is ValidateHook<any> => Boolean(hook));

  const { schema, options } = args ?? {};
  const debug = options?.debug;
  if (debug) console.debug('[stately/schema] (Validation) validating:', { args, pluginNames });

  // Handle unknown nodeTypes from codegen - skip validation
  if (schema.nodeType === UnknownNodeType) {
    if (debug) console.debug(`[Validation] Skipping unknown nodeType: ${args.schema.nodeType}`);
    return { errors: [], valid: true };
  }

  if (hooks.length === 0) {
    console.debug('[Validation] no validations registered', { args });
    return { errors: [], valid: true };
  }

  for (const hook of hooks) {
    const result = hook(args);
    if (result) {
      return result;
    }
  }

  return { errors: [], valid: true };
}
