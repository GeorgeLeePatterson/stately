/**
 * @stately/schema - Core Stately Integration
 *
 * The main entry point for creating a Stately integration.
 * Refactored to support plugin system.
 */

import type { AnyRecord, EmptyRecord } from './helpers.js';
import * as helpers from './helpers.js';
import type { StatelyConfig, StatelySchemas } from './index.js';
import * as parsers from './parsers.js';
import type { BaseSchemaNode, StatelySchemaPlugin, ValidatePlugin } from './plugin.js';
import * as validation from './validation.js';

export type { BaseSchemaNode, StatelySchemaPlugin } from './plugin.js';
// Re-export types
export type {
  ValidationError,
  ValidationOptions,
  ValidationResult,
} from './validation.js';

/**
 * Core Stately runtime
 * - Config: the user's concrete config
 * - IExt: integration-time helpers injected at construction (fixed)
 * - SExt: schema-plugin extensions accumulated via .withPlugin (grows)
 */
export interface Stately<
  Config extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  SExt extends AnyRecord = EmptyRecord,
> {
  // ===== Data (Raw Inputs) =====
  /** OpenAPI component schemas */
  schemas: StatelySchemas<Config>['components'];
  /** OpenAPI paths */
  paths: StatelySchemas<Config>['paths'];
  /** Generated schema nodes (PARSED_SCHEMAS) */
  nodes: StatelySchemas<Config>['nodes'];

  /** Entity mappings from Entity oneOf */
  entityMappings: Array<{ stateEntry: StatelySchemas<Config>['StateEntry']; schemaName: string }>;
  /** StateEntry -> Schema name */
  stateEntryToSchema: Record<StatelySchemas<Config>['StateEntry'], string>;
  /** StateEntry -> Parsed ObjectNode */
  entitySchemaCache: Record<
    StatelySchemas<Config>['StateEntry'],
    StatelySchemas<Config>['ObjectNode'] | null
  >;
  /** URL string -> StateEntry */
  urlToStateEntry: Record<string, StatelySchemas<Config>['StateEntry']>;
  /** StateEntry -> URL string */
  stateEntryToUrl: Record<StatelySchemas<Config>['StateEntry'], string>;
  /** StateEntry -> Display name */
  entityDisplayNames: Record<StatelySchemas<Config>['StateEntry'], string>;

  // ===== Helpers (Utility Functions) =====
  helpers: {
    /** Check if schema is a primitive type */
    isPrimitive: (schema: StatelySchemas<Config>['AnySchemaNode']) => boolean;
    /** Extract node type from schema */
    extractNodeType: (
      schema: StatelySchemas<Config>['AnySchemaNode'],
    ) => StatelySchemas<Config>['AnySchemaNode']['nodeType'];
    /** Validate entity data against schema */
    isEntityValid: (
      entity: StatelySchemas<Config>['EntityData'] | null | undefined,
      schema: StatelySchemas<Config>['ObjectNode'] | undefined,
    ) => boolean;
    /** Sort entity properties for display */
    sortEntityProperties: (
      properties: Array<[string, StatelySchemas<Config>['AnySchemaNode']]>,
      value: any,
      required: Set<string>,
    ) => Array<[string, StatelySchemas<Config>['AnySchemaNode']]>;
    /** Convert snake_case to Title Case */
    toTitleCase: (str: string) => string;
    /** Convert snake_case to kebab-case */
    toKebabCase: (str: string) => string;
    /** Convert snake_case/kebab-case to space case */
    toSpaceCase: (str: string) => string;
    /** Generate human-readable label from field name */
    generateFieldLabel: (fieldName: string) => string;
    /** Check if ID is singleton (all zeros UUID) */
    isSingletonId: (id: string) => boolean;
    /** Get default value for schema node */
    getDefaultValue: (node: StatelySchemas<Config>['AnySchemaNode']) => any;
  } & IExt;

  // ===== Schema plugin extensions (accumulated) =====
  extensions: SExt;

  // ===== Validate (Validation Functions) =====
  validate: {
    /** Validate data against schema */
    schema: (
      path: string,
      data: any,
      schema: StatelySchemas<Config>['AnySchemaNode'],
      options?: validation.ValidationOptions,
    ) => validation.ValidationResult;

    /** Validate object against ObjectNode schema */
    object: (
      path: string,
      data: Record<string, any>,
      schema: StatelySchemas<Config>['ObjectNode'],
      options?: validation.ValidationOptions,
    ) => validation.ValidationResult;

    /** Validate single object field */
    field: (
      path: string,
      fieldName: string,
      fieldValue: any,
      fieldSchema: StatelySchemas<Config>['AnySchemaNode'],
      isRequired: boolean,
      options?: validation.ValidationOptions,
    ) => validation.ValidationResult;

    /** Create validation cache key */
    cacheKey: (path: string, data: any) => string;
    /** Clear validation cache */
    clearCache: () => void;
  };
}

/**
 * Stately builder - supports plugin registration
 */
export interface StatelyBuilder<
  Config extends StatelyConfig,
  IExt extends AnyRecord,
  SExt extends AnyRecord,
> extends Stately<Config, IExt, SExt> {
  /**
   * Register a schema plugin
   *
   * Plugins declare node types (must extend BaseSchemaNode) and can add:
   * - Validators for custom node types
   * - Helper functions
   * - Any schema-related functionality
   *
   * TypeScript will error if the plugin's node types aren't in your schemas.
   */
  withPlugin<Nodes extends Record<string, BaseSchemaNode>, E extends AnyRecord = EmptyRecord>(
    plugin: ValidatePlugin<Config, StatelySchemaPlugin<Nodes, E>>,
  ): StatelyBuilder<Config, IExt, SExt & E>;
}

/**
 * Create a Stately integration from OpenAPI spec and generated schemas
 *
 * @param openapi - OpenAPI document containing Entity schema
 * @param generatedSchemas - Generated schema nodes (OpenAPI generated nodes, `codegen`)
 * @param injectedHelpers - optional integration-time helpers (IExt)
 * @returns Stately builder with .withPlugin() support
 */
export function stately<Config extends StatelyConfig, IExt extends AnyRecord = EmptyRecord>(
  openapi: parsers.OpenAPIDocument,
  generatedSchemas: Config['nodes'],
  injectedHelpers?: IExt,
): StatelyBuilder<Config, IExt, EmptyRecord> {
  type Schemas = StatelySchemas<Config>;

  // Parse entity mappings
  const entityMappings = parsers.parseEntityMappings<Schemas>(openapi);
  const stateEntryToSchema = parsers.buildStateEntryToSchema<Schemas>(entityMappings);
  const entitySchemaCache = parsers.buildEntitySchemaCache<Schemas>(
    entityMappings,
    generatedSchemas,
  );
  const urlToStateEntry = parsers.buildUrlToStateEntry<Schemas>(entityMappings);
  const stateEntryToUrl = parsers.buildStateEntryToUrl<Schemas>(entityMappings);
  const entityDisplayNames = parsers.buildEntityDisplayNames<Schemas>(entityMappings);

  // Concretize helper signatures to Schemas (wrap the generic helpers)
  const concreteHelpers = {
    isPrimitive: (schema: Schemas['AnySchemaNode']) => helpers.isPrimitive<Config>(schema),
    extractNodeType: (schema: Schemas['AnySchemaNode']) => helpers.extractNodeType<Config>(schema),
    isEntityValid: (
      entity: Schemas['EntityData'] | null | undefined,
      schema: Schemas['ObjectNode'] | undefined,
    ) => helpers.isEntityValid<Config>(entity, schema),
    sortEntityProperties: (
      properties: Array<[string, Schemas['AnySchemaNode']]>,
      value: any,
      required: Set<string>,
    ) => helpers.sortEntityProperties<Config>(properties, value, required),
    toTitleCase: helpers.toTitleCase,
    toKebabCase: helpers.toKebabCase,
    toSpaceCase: helpers.toSpaceCase,
    generateFieldLabel: helpers.generateFieldLabel,
    isSingletonId: helpers.isSingletonId,
    getDefaultValue: (node: Schemas['AnySchemaNode']) => helpers.getDefaultValue<Config>(node),
    ...(injectedHelpers as IExt),
  } as const;

  // Base runtime
  const base = {
    schemas: openapi.components?.schemas as Schemas['components'],
    paths: openapi.paths as Schemas['paths'],
    nodes: generatedSchemas,
    entityMappings,
    stateEntryToSchema,
    entitySchemaCache,
    urlToStateEntry,
    stateEntryToUrl,
    entityDisplayNames,
    helpers: concreteHelpers,
    validate: {
      schema: validation.validateSchema,
      object: validation.validateObject,
      field: validation.validateObjectField,
      cacheKey: validation.createValidationCacheKey,
      clearCache: validation.clearValidationCache,
    },
  };

  // Builder factory ensures SExt widens correctly
  function makeBuilder<SExt extends AnyRecord>(
    state: Stately<Config, IExt, SExt>,
  ): StatelyBuilder<Config, IExt, SExt> {
    return {
      ...state,

      validate: {
        ...state.validate,
        schema: (path, data, schema, options) =>
          validation.validateSchema<Config, IExt, SExt>(path, data, schema, options, state),
        object: (path, data, schema, options) =>
          validation.validateObject<Config, IExt, SExt>(path, data, schema, options, state),
        field: (path, fieldName, fieldValue, fieldSchema, isRequired, options) =>
          validation.validateObjectField<Config, IExt, SExt>(
            path,
            fieldName,
            fieldValue,
            fieldSchema,
            isRequired,
            options,
            state,
          ),
      },

      withPlugin<Nodes extends Record<string, BaseSchemaNode>, E extends AnyRecord = EmptyRecord>(
        plugin: ValidatePlugin<Config, StatelySchemaPlugin<Nodes, E>>,
      ): StatelyBuilder<Config, IExt, SExt & E> {
        const next: Stately<Config, IExt, SExt & E> = {
          ...state,
          // helpers remain fixed (base + IExt)
          extensions: { ...state.extensions, ...(plugin.extensions || {}) } as SExt & E,
        };
        return makeBuilder(next);
      },
    };
  }

  const initial: Stately<Config, IExt, EmptyRecord> = { ...base, extensions: {} as EmptyRecord };

  return makeBuilder(initial);
}
