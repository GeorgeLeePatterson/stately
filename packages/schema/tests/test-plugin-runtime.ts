// biome-ignore lint/correctness/noUnusedVariables: type-level test file
/**
 * Tests runtime patterns for plugin authors - validates:
 * 1. Plugin factory function signatures
 * 2. Runtime validation hook integration
 * 3. Stately builder API usage
 * 4. Type narrowing in validation functions (the key fix we made)
 *
 * Run: npx tsc --noEmit tests/test-plugin-runtime.ts
 */
import type { OpenAPIV3_1 } from "openapi-types";
import type { CoreStatelyConfig } from "../src/core/augment.js";
import { CoreNodeType, type ObjectNode } from "../src/core/nodes.js";
import {
  DefineGeneratedNodes,
  type Schemas,
  stately,
} from "../src/index.js";
import type { PluginFactory } from "../src/stately.js";
import type { ValidateArgs, ValidationResult } from "../src/validation.js";

/**
 * =============================================================================
 * SAMPLE PLUGIN: Custom Validator Plugin
 * =============================================================================
 * This demonstrates the pattern a plugin author would use with helper types
 */

// Step 1: Define the generated nodes structure using the helper
type CustomGeneratedNodes = DefineGeneratedNodes<{
  CustomNode: ObjectNode<CoreStatelyConfig>;
}>;

// Step 2: Create the config type
type CustomConfig = CoreStatelyConfig<
  CoreStatelyConfig["components"],
  CoreStatelyConfig["paths"],
  CustomGeneratedNodes
>;

// Step 3: Create the schemas type
type CustomSchemas = Schemas<CustomConfig>;

/**
 * Plugin factory function - this is what plugin authors export.
 *
 * CRITICAL: Notice it uses the CONCRETE CustomSchemas type, not a generic S.
 * This is the key insight from our narrowing fix - plugin authors should
 * use concrete types in their validation functions.
 */
function createCustomPlugin(): PluginFactory<CustomSchemas> {
  return (runtime) => {
    // Install validation hook
    const validate = (
      args: ValidateArgs<CustomSchemas>,
    ): ValidationResult | undefined => {
      const { schema, data, path } = args;

      // Test: Type narrowing works in validation (the critical fix)
      // Without our fix, this would fail because generic S prevents narrowing
      if (schema.nodeType === CoreNodeType.Object) {
        // ✅ After switch, schema should be narrowed to ObjectNode
        const required = schema.required;
        const propertyKeys = Object.keys(schema.properties);

        if (!data || typeof data !== "object") {
          return {
            valid: false,
            errors: [{ path, message: "Expected object", value: data }],
          };
        }

        if (propertyKeys.length === 0) {
          return {
            valid: false,
            errors: [{ path, message: "Object must define properties" }],
          };
        }

        // Check required fields
        for (const field of required) {
          if (!(field in data)) {
            return {
              valid: false,
              errors: [
                {
                  path: `${path}.${field}`,
                  message: `Missing required field: ${field}`,
                },
              ],
            };
          }
        }

        return { valid: true, errors: [] };
      }

      // Other node types...
      return undefined;
    };

    return {
      ...runtime,
      plugins: {
        ...runtime.plugins,
        custom: {
          validate,
        },
      },
    };
  };
}

/**
 * =============================================================================
 * RUNTIME USAGE TEST
 * =============================================================================
 */

// Mock OpenAPI document
const mockOpenAPI: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: { title: "Test", version: "1.0.0" },
  components: {
    schemas: {
      StateEntry: { type: "string", enum: ["test"] },
      Entity: {
        oneOf: [
          {
            type: "object",
            required: ["type", "data"],
            properties: {
              type: { type: "string", enum: ["test"] },
              data: { $ref: "#/components/schemas/TestData" },
            },
          },
        ],
      },
      TestData: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      EntityId: { type: "string" },
      Summary: { type: "object" },
    },
  },
};

// Mock generated nodes
const mockNodes: CustomConfig["nodes"] = {
  CustomNode: {
    nodeType: "object",
    properties: {
      id: {
        nodeType: "primitive",
        primitiveType: "string",
      },
    },
    required: ["id"],
  },
  Entity: {
    nodeType: "taggedUnion",
    discriminator: "type",
    variants: [],
  },
  EntityData: {
    nodeType: "object",
    properties: {},
    required: [],
  },
};

// Test: Can create runtime with custom plugin
const runtime = stately<CustomSchemas>(mockOpenAPI, mockNodes).withPlugin(
  createCustomPlugin(),
);

// Verify runtime has expected structure
type RuntimeType = typeof runtime;
type HasValidate = "validate" extends keyof RuntimeType ? true : false;
type HasSchema = "schema" extends keyof RuntimeType ? true : false;
type HasPlugins = "plugins" extends keyof RuntimeType ? true : false;

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

const testSchema: ObjectNode<CustomConfig> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: {
      nodeType: CoreNodeType.Primitive,
      primitiveType: "string",
    },
  },
  required: ["id"],
};

// Test: Can call validate
const validationResult = runtime.validate({
  path: "test",
  data: { id: "123" },
  schema: testSchema,
});

// Verify result structure
type ResultValid = typeof validationResult.valid extends boolean ? true : false;
type ResultErrors =
  typeof validationResult.errors extends Array<any> ? true : false;

type ValidationResultValid = AssertTrue<
  ResultValid extends true ? (ResultErrors extends true ? true : false) : false
>;

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

export const runtimeTests = {
  runtime,
  createCustomPlugin,
  validationResult,
} satisfies Record<string, unknown>;

export type RuntimeAssertions = {
  runtimeStructure: RuntimeStructureValid;
  validationResult: ValidationResultValid;
};
