// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Tests that plugin utils can be accessed with proper types.
 * This validates the fix for the Record<string, AnyRecord> index signature issue.
 *
 * ISSUE: When AugmentPluginUtils has `& Record<string, AnyRecord>`, accessing
 * runtime.plugins.core.utilFunction resolves to type `unknown` instead of the
 * specific util function type.
 *
 * Run: npx tsc --noEmit tests/test-plugin-utils-access.ts
 */
import type { CoreStatelyConfig } from '../src/core/generated.js';
import type { CoreNodeUnion } from '../src/core/nodes.js';
import type { AssertTrue } from '../src/helpers.js';
import type { Schemas } from '../src/index.js';
import { stately } from '../src/index.js';
import type { Stately } from '../src/stately.js';

/**
 * =============================================================================
 * SETUP: Create a minimal runtime with core plugin
 * =============================================================================
 */

type TestConfig = CoreStatelyConfig;
type TestSchemas = Schemas<TestConfig>;

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

const mockNodes: TestConfig['nodes'] = {
  Entity: {
    discriminator: 'type',
    nodeType: 'taggedUnion',
    variants: [{ schema: { nodeType: 'object', properties: {}, required: [] }, tag: 'test' }],
  },
};

const runtime = stately<TestSchemas>(mockOpenAPI, mockNodes);

/**
 * =============================================================================
 * TEST: Access core plugin utils with proper types (CONCRETE TYPE)
 * =============================================================================
 */

// This should NOT be type unknown!
// Before fix: runtime.plugins.core resolves to AnyRecord (Record<string, unknown>)
// After fix: runtime.plugins.core should have CoreUtils<TestConfig> type
const corePlugin = runtime.plugins.core;

// Test: Can access isPrimitive with proper type
const isPrimitive = runtime.plugins.core.isPrimitive;

const entityMapping = runtime.data;
const x = entityMapping.entityDisplayNames;

/**
 * =============================================================================
 * TEST: Access via GENERIC (this is the real issue!)
 * =============================================================================
 */

// This reproduces the actual issue in object-wizard.tsx
function testWithGeneric<S extends TestSchemas>(statelyRuntime: Stately<S>) {
  // This is what happens in components - accessing plugins on a generic
  const genericIsPrimitive = statelyRuntime.plugins.core.isPrimitive;

  type GenericIsPrimitiveType = typeof genericIsPrimitive;

  // This should be a function, not unknown!
  type GenericIsPrimitiveIsFunction = GenericIsPrimitiveType extends (schema: any) => boolean
    ? true
    : false;

  return genericIsPrimitive;
}

// Test: isPrimitive is a function, not unknown
type IsPrimitiveType = typeof isPrimitive;

// This should pass - isPrimitive is a function
type IsPrimitiveIsFunction = IsPrimitiveType extends (schema: CoreNodeUnion<TestConfig>) => boolean
  ? true
  : false;

// Test: Can call isPrimitive
const testNode: CoreNodeUnion<TestConfig> = { nodeType: 'primitive', primitiveType: 'string' };

const result: boolean = runtime.plugins.core.isPrimitive(testNode);

// Test: Can access other core utils
const extractNodeType = runtime.plugins.core.extractNodeType;
const isEntityValid = runtime.plugins.core.isEntityValid;
const sortEntityProperties = runtime.plugins.core.sortEntityProperties;

type ExtractNodeTypeIsFunction = typeof extractNodeType extends (
  schema: CoreNodeUnion<TestConfig>,
) => string
  ? true
  : false;

type AllUtilsAreTyped = AssertTrue<
  IsPrimitiveIsFunction extends true
    ? ExtractNodeTypeIsFunction extends true
      ? true
      : false
    : false
>;

/**
 * =============================================================================
 * TEST: Can iterate over plugins (spreading works)
 * =============================================================================
 */

// This should still work after removing index signature
const allPlugins = { ...runtime.plugins };
const hasCore = 'core' in allPlugins;

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

export const pluginUtilsTests = {
  allPlugins,
  corePlugin,
  hasCore,
  isPrimitive,
  result,
  runtime,
} satisfies Record<string, unknown>;

export type PluginUtilsAssertions = {
  isPrimitiveIsFunction: IsPrimitiveIsFunction;
  extractNodeTypeIsFunction: ExtractNodeTypeIsFunction;
  allUtilsTyped: AllUtilsAreTyped;
};
