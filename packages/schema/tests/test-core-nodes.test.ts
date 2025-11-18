// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Verifies that the canonical node helpers exported from @stately/schema
 * align with the core node definitions (PrimitiveNode, ObjectNode, etc.).
 *
 * Run: npx tsc --noEmit tests/test-core-nodes.ts
 */
import type { CoreStatelyConfig } from '../src/core/generated.js';
import {
  type CoreNodeMap,
  CoreNodeType,
  type ObjectNode,
  type PrimitiveNode,
  PrimitiveType,
} from '../src/core/nodes.js';
import { isObject, isPrimitive } from '../src/core/utils.js';
import type { AssertTrue } from '../src/helpers.js';
import type { PluginNodeUnion, Schemas } from '../src/index.js';

/**
 * Minimal component extension to feed into CoreStatelyConfig.
 * These reflect the GENERATED types structure (from openapi-typescript),
 * not raw OpenAPI structure.
 */
type SampleComponentSchemas = {
  StateEntry: 'sample'; // Generated as string literal union
  Entity: { type: 'sample'; data: { id: string; name: string } }; // Generated as discriminated union
  EntityId: string;
  Summary: { id: string; name: string; description?: string | null };
};

type SampleComponents = { schemas: SampleComponentSchemas };

type SampleNodes = { Sample: ObjectNode };

type SampleConfig = CoreStatelyConfig<
  SampleComponents,
  CoreStatelyConfig['paths'],
  CoreStatelyConfig['operations'],
  SampleNodes
>;
type SampleSchemas = Schemas<SampleConfig, []>;

// Helpers resolved from Schemas should be concrete types
type SamplePluginAnyNode = PluginNodeUnion<SampleSchemas>;

// Assert plugin nodes expose the canonical primitive/object nodes
const primitiveSampleNode: PrimitiveNode = {
  nodeType: CoreNodeType.Primitive,
  primitiveType: PrimitiveType.String,
};

const objectSampleNode: CoreNodeMap[typeof CoreNodeType.Object] = {
  nodeType: CoreNodeType.Object,
  properties: { id: primitiveSampleNode, name: primitiveSampleNode },
  required: ['id', 'name'],
};

// Any plugin node should accept the canonical primitive node
const anyNodeCheck: SamplePluginAnyNode = primitiveSampleNode;

type ExpectNotAssignable<Needle, Haystack> = Needle extends Haystack ? false : true;

// Type-level guards
type InvalidNodeTypeCheck = AssertTrue<
  ExpectNotAssignable<'not-a-node-type', Schemas['plugin']['NodeNames']>
>;
type InvalidNodeNameCheck = AssertTrue<
  ExpectNotAssignable<'invalid', Schemas['plugin']['NodeTypes']>
>;

/**
 * =============================================================================
 * VARIANCE AND NARROWING TESTS
 * =============================================================================
 * These tests verify the critical fixes for Config variance and type narrowing
 * that allow plugin authors to use proto-configs while users use specific configs.
 */

// Test: Plugin helpers accept user schemas with more specific configs
type UserConfig = CoreStatelyConfig<
  SampleComponents & { schemas: SampleComponents['schemas'] & { CustomField: string } },
  CoreStatelyConfig['paths'],
  CoreStatelyConfig['operations'],
  SampleNodes & { CustomNode: ObjectNode }
>;
type UserSchemas = Schemas<UserConfig, []>;

// These should all work (variance test)
type UserPluginUnion = PluginNodeUnion<UserSchemas>; // ✅ Should accept UserSchemas

function processNodeWithTypeGuard(schema: SamplePluginAnyNode): string {
  // Test isNodeOfType narrows correctly
  if (isObject(schema)) {
    // ✅ Should have access to properties after narrowing
    const props = schema.properties;
    const required = schema.required;
    return `object with ${Object.keys(props).length} properties, ${required.length} required`;
  }

  if (isPrimitive(schema)) {
    // ✅ Should have access to primitiveType after narrowing
    return `primitive: ${schema.primitiveType}`;
  }

  return 'unknown';
}

// Export dummy usages so the compiler enforces the assignments above
export const sampleNodes = {
  anyNodeCheck,
  objectSampleNode,
  primitiveSampleNode,
  processNodeWithTypeGuard,
} satisfies Record<string, unknown>;

export type SampleTypeAssertions = {
  invalidType: InvalidNodeTypeCheck;
  invalidName: InvalidNodeNameCheck;
  // Variance assertions
  userUnion: UserPluginUnion;
};
