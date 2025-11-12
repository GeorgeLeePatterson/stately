// biome-ignore lint/correctness/noUnusedVariables: type-level test file
/**
 * Verifies that the canonical node helpers exported from @stately/schema
 * align with the core node definitions (PrimitiveNode, ObjectNode, etc.).
 *
 * Run: npx tsc --noEmit tests/test-core-nodes.ts
 */
import type { CoreStatelyConfig } from "../src/core/augment.js";
import {
  CoreNodeType,
  type ObjectNode,
  type PrimitiveNode,
  PrimitiveType,
} from "../src/core/nodes.js";
import type {
  GeneratedNodeNames,
  PluginNodeTypes,
  PluginNodeUnion,
  PluginNodes,
  Schemas,
} from "../src/index.js";

/**
 * Minimal component extension to feed into CoreStatelyConfig.
 * We only care about StateEntry + Entity typing for these tests.
 */
type SampleComponentSchemas = {
  StateEntry: "sample";
  Entity: { type: "sample"; data: { id: string; name: string } };
  EntityId: string;
  Summary: Record<string, unknown>;
};

type SampleComponents = CoreStatelyConfig["components"] & {
  schemas: CoreStatelyConfig["components"]["schemas"] & SampleComponentSchemas;
};

type SampleNodes = {
  Sample: ObjectNode<SampleConfig>;
};

type SampleConfig = CoreStatelyConfig<
  SampleComponents,
  CoreStatelyConfig["paths"],
  SampleNodes
>;
type SampleSchemas = Schemas<SampleConfig, []>;

// Helpers resolved from Schemas should be concrete types
type SamplePluginNodes = PluginNodes<SampleSchemas>;
type SamplePluginAnyNode = PluginNodeUnion<SampleSchemas>;
type SamplePluginNodeTypes = PluginNodeTypes<SampleSchemas>;
type SampleGeneratedNodeNames = GeneratedNodeNames<SampleConfig>;

// Assert plugin nodes expose the canonical primitive/object nodes
const primitiveSampleNode: PrimitiveNode = {
  nodeType: CoreNodeType.Primitive,
  primitiveType: PrimitiveType.String,
};

const objectSampleNode: SamplePluginNodes[typeof CoreNodeType.Object] = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveSampleNode,
    name: primitiveSampleNode,
  },
  required: ["id", "name"],
};

// Any plugin node should accept the canonical primitive node
const anyNodeCheck: SamplePluginAnyNode = primitiveSampleNode;

// Node type key is constrained to known core node types
const pluginNodeTypeCheck: SamplePluginNodeTypes = CoreNodeType.Primitive;

// Generated node names reflect the Sample node key
const generatedNodeNameCheck: SampleGeneratedNodeNames = "Sample";

type AssertTrue<T extends true> = T;
type ExpectNotAssignable<Needle, Haystack> = Needle extends Haystack
  ? false
  : true;

// Type-level guards
type InvalidNodeTypeCheck = AssertTrue<
  ExpectNotAssignable<"not-a-node-type", SamplePluginNodeTypes>
>;
type InvalidNodeNameCheck = AssertTrue<
  ExpectNotAssignable<"invalid", SampleGeneratedNodeNames>
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
  SampleComponents & {
    schemas: SampleComponents["schemas"] & { CustomField: string };
  },
  CoreStatelyConfig["paths"],
  SampleNodes & { CustomNode: ObjectNode<any> }
>;
type UserSchemas = Schemas<UserConfig, []>;

// These should all work (variance test)
type UserPluginNodes = PluginNodes<UserSchemas>; // ✅ Should accept UserSchemas
type UserPluginUnion = PluginNodeUnion<UserSchemas>; // ✅ Should accept UserSchemas

// Type narrowing test: Can a plugin author use the type guard?
import { isNodeOfType } from "../src/index.js";

function processNodeWithTypeGuard(schema: SamplePluginAnyNode): string {
  // Test isNodeOfType narrows correctly
  if (
    isNodeOfType<SampleSchemas, typeof CoreNodeType.Object>(
      schema,
      CoreNodeType.Object,
    )
  ) {
    // ✅ Should have access to properties after narrowing
    const props = schema.properties;
    const required = schema.required;
    return `object with ${Object.keys(props).length} properties, ${required.length} required`;
  }

  if (
    isNodeOfType<SampleSchemas, typeof CoreNodeType.Primitive>(
      schema,
      CoreNodeType.Primitive,
    )
  ) {
    // ✅ Should have access to primitiveType after narrowing
    return `primitive: ${schema.primitiveType}`;
  }

  return "unknown";
}

// Export dummy usages so the compiler enforces the assignments above
export const sampleNodes = {
  primitiveSampleNode,
  objectSampleNode,
  anyNodeCheck,
  pluginNodeTypeCheck,
  generatedNodeNameCheck,
  processNodeWithTypeGuard,
} satisfies Record<string, unknown>;

export type SampleTypeAssertions = {
  invalidType: InvalidNodeTypeCheck;
  invalidName: InvalidNodeNameCheck;
  // Variance assertions
  userNodes: UserPluginNodes;
  userUnion: UserPluginUnion;
};
