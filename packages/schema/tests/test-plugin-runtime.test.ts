// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Tests runtime patterns for plugin authors - validates:
 * 1. Plugin factory function signatures
 * 2. Runtime validation hook integration
 * 3. Stately builder API usage
 * 4. Type narrowing in validation functions (the key fix we made)
 *
 * Run: pnpx tsc --noEmit tests/test-plugin-runtime.ts
 */
import type { CoreStatelyConfig } from '../src/core/generated.js';
import { CoreNodeType, type ObjectNode } from '../src/core/nodes.js';
import { type DefineGeneratedNodes, type Schemas, stately } from '../src/index.js';
import type { PluginFactory } from '../src/stately.js';
import type { ValidateArgs, ValidationResult } from '../src/validation.js';

/**
 * =============================================================================
 * SAMPLE PLUGIN: Custom Validator Plugin
 * =============================================================================
 * This demonstrates the pattern a plugin author would use with helper types
 */

// Step 1: Define the generated nodes structure using the helper
type CustomGeneratedNodes = DefineGeneratedNodes<{ CustomNode: ObjectNode }>;

/**
 * Plugin factory function - this is what plugin authors export.
 *
 * CRITICAL: Notice it uses the CONCRETE CustomSchemas type, not a generic S.
 * This is the key insight from our narrowing fix - plugin authors should
 * use concrete types in their validation functions.
 */
function createCustomPlugin(): PluginFactory<CustomSchemas> {
  return runtime => {
    // Test: Type narrowing works in validation (the critical fix)
    // This function demonstrates that narrowing works within the plugin
    const customValidate = (args: ValidateArgs<CustomSchemas>): ValidationResult | undefined => {
      const { schema, data, path } = args;

      // Without our fix, this would fail because generic S prevents narrowing
      if (schema.nodeType === CoreNodeType.Object) {
        // ✅ After switch, schema should be narrowed to ObjectNode
        const required = schema.required;
        const propertyKeys = Object.keys(schema.properties);

        if (!data || typeof data !== 'object') {
          return { errors: [{ message: 'Expected object', path, value: data }], valid: false };
        }

        if (propertyKeys.length === 0) {
          return { errors: [{ message: 'Object must define properties', path }], valid: false };
        }

        // Check required fields
        for (const field of required) {
          if (!(field in data)) {
            return {
              errors: [{ message: `Missing required field: ${field}`, path: `${path}.${field}` }],
              valid: false,
            };
          }
        }

        return { errors: [], valid: true };
      }

      // Other node types...
      return undefined;
    };

    // Simply return runtime as-is (plugin doesn't need to extend runtime.plugins)
    // The test is about validating that type narrowing works in customValidate
    return runtime;
  };
}

/**
 * =============================================================================
 * RUNTIME USAGE TEST
 * =============================================================================
 */

// Mock raw OpenAPI document (passed as unknown to runtime)
const mockOpenAPI = {
  components: {
    schemas: {
      Entity: {
        oneOf: [
          {
            properties: {
              data: { $ref: '#/components/schemas/TestData' },
              type: { enum: ['test'], type: 'string' },
            },
            required: ['type', 'data'],
            type: 'object',
          },
        ],
      },
      EntityId: { type: 'string' },
      StateEntry: { enum: ['test'], type: 'string' },
      Summary: { type: 'object' },
      TestData: { properties: { id: { type: 'string' } }, type: 'object' },
    },
  },
  info: { title: 'Test', version: '1.0.0' },
  openapi: '3.1.0',
};

// Mock generated nodes
const mockNodes = {
  CustomNode: {
    nodeType: 'object' as const,
    properties: { id: { nodeType: 'primitive' as const, primitiveType: 'string' } },
    required: ['id'],
  },
  Entity: { discriminator: 'type' as const, nodeType: 'taggedUnion' as const, variants: [] },
} as const;

// Step 2: Create the config type
type CustomConfig = CoreStatelyConfig<
  CoreStatelyConfig['components'] & { schemas: { StateEntry: 'test1' | 'test2' } },
  CoreStatelyConfig['paths'],
  CoreStatelyConfig['operations'],
  typeof mockNodes
>;

// Step 3: Create the schemas type
type CustomSchemas = Schemas<CustomConfig>;

type X = CustomSchemas['config']['components']['schemas']['StateEntry'];
type XX = CustomSchemas['config']['nodes'];

// Test: Can create runtime with custom plugin
const runtime = stately<CustomSchemas>(mockOpenAPI, mockNodes).withPlugin(createCustomPlugin());

const x = runtime.data.entityDisplayNames.test1;
const xx = runtime.data.entityDisplayNames.test2;

// Verify runtime has expected structure
type RuntimeType = typeof runtime;
type HasValidate = 'validate' extends keyof RuntimeType ? true : false;
type HasSchema = 'schema' extends keyof RuntimeType ? true : false;
type HasPlugins = 'plugins' extends keyof RuntimeType ? true : false;

type AssertTrue<T extends true> = T;
type RuntimeStructureValid = AssertTrue<
  HasValidate extends true
    ? HasSchema extends true
      ? HasPlugins extends true
        ? true
        : false
      : false
    : false
>;

/**
 * =============================================================================
 * VALIDATION USAGE TEST
 * =============================================================================
 */

const testSchema: ObjectNode = {
  nodeType: CoreNodeType.Object,
  properties: { id: { nodeType: CoreNodeType.Primitive, primitiveType: 'string' } },
  required: ['id'],
};

// Test: Can call validate
const validationResult = runtime.validate({
  data: { id: '123' },
  path: 'test',
  schema: testSchema,
});

// Verify result structure
type ResultValid = typeof validationResult.valid extends boolean ? true : false;
type ResultErrors = typeof validationResult.errors extends Array<any> ? true : false;

type ValidationResultValid = AssertTrue<
  ResultValid extends true ? (ResultErrors extends true ? true : false) : false
>;

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

export const runtimeTests = { createCustomPlugin, runtime, validationResult } satisfies Record<
  string,
  unknown
>;

export type RuntimeAssertions = {
  runtimeStructure: RuntimeStructureValid;
  validationResult: ValidationResultValid;
};
