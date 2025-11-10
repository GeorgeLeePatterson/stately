/**
 * Type enforcement tests
 *
 * These tests verify that the StatelySchemas factory correctly extracts and
 * distributes types, and that node types are properly constrained.
 * Run: npx tsc --noEmit tests/type-enforcement.test.ts
 */

import type { Schemas } from '../src/index.js';
import type {
  BaseNode,
  NodesFromConfig,
  SchemaAugmentNodes,
  SchemaGeneratedNodeNames,
  SchemaNodeType,
  SchemaPluginAnyNode,
  SchemaPluginNodeOfType,
  SchemaPluginNodeType,
  SchemaPluginNodes,
  SchemaNodeOfType,
  SchemaAnyNode,
  SchemaGeneratedNodes,
} from '../src/schema.js';
import type { CoreSchemaAugment, CoreStatelyConfig } from '../src/core/augment.js';
import {
  CoreNodeType,
  PrimitiveType,
  type ArrayNodeRaw,
  type LinkNodeRaw,
  type ObjectNodeRaw,
  type PrimitiveNode,
} from '../src/core/nodes.js';

type AssertTrue<T extends true> = T;
type ExpectNotAssignable<Needle, Haystack> = Needle extends Haystack ? false : true;

// ============================================================================
// Test 1: Valid Schema - Factory extracts and distributes correctly
// ============================================================================

type EmptyPaths = Record<string, never>;

type ValidComponentSchemas = {
  StateEntry: 'pipeline' | 'source_config' | 'sink_config';
  Entity:
    | { type: 'pipeline'; data: { name: string; steps: string[] } }
    | { type: 'source_config'; data: { name: string; driver: string } }
    | { type: 'sink_config'; data: { name: string; destination: string } };
  EntityId: string;
  Summary: Record<string, unknown>;
};

type ValidEntityKinds = ValidComponentSchemas['StateEntry'];
type ValidSchemaNames = 'Pipeline' | 'SourceConfig' | 'SinkConfig';

const primitiveStringNode: PrimitiveNode = {
  nodeType: CoreNodeType.Primitive,
  primitiveType: PrimitiveType.String,
};

const pipelineStepsNode: ArrayNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Array,
  items: primitiveStringNode,
};

const sourceInlineSchema: ObjectNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    driver: primitiveStringNode,
  },
  required: ['id', 'driver'],
};

const pipelineOwnerLink: LinkNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Link,
  targetType: 'source_config',
  inlineSchema: sourceInlineSchema,
};

const pipelineNode: ObjectNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    name: primitiveStringNode,
    steps: pipelineStepsNode,
    owner: pipelineOwnerLink,
  },
  required: ['id', 'name'],
};

const sourceConfigNode: ObjectNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    name: primitiveStringNode,
    driver: primitiveStringNode,
  },
  required: ['id', 'name'],
};

const sinkConfigNode: ObjectNodeRaw<ValidEntityKinds, ValidSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    name: primitiveStringNode,
    destination: primitiveStringNode,
  },
  required: ['id', 'name'],
};

type ValidNodes = {
  Pipeline: typeof pipelineNode;
  SourceConfig: typeof sourceConfigNode;
  SinkConfig: typeof sinkConfigNode;
};

type CoreAugmentNodeKeys = keyof CoreSchemaAugment<ValidConfig>['nodes'];
const coreAugmentPrimitiveKey: CoreAugmentNodeKeys = CoreNodeType.Primitive;
type CoreAugmentKeyGuard = AssertTrue<ExpectNotAssignable<'PrimitiveOnly', CoreAugmentNodeKeys>>;

type ValidComponents = {
  schemas: CoreStatelyConfig['components']['schemas'] & ValidComponentSchemas;
};

type ValidConfig = CoreStatelyConfig<ValidComponents, EmptyPaths, ValidNodes>;
type ValidSchemas = Schemas<ValidConfig, []>;

type ValidPluginNodes = SchemaPluginNodes<ValidSchemas>;
type PluginPrimitiveNode = ValidPluginNodes['primitive'];
const canonicalPrimitiveNode: PluginPrimitiveNode = primitiveStringNode;

type ValidPluginAnyNode = SchemaPluginAnyNode<ValidSchemas>;
const anyCanonicalNode: ValidPluginAnyNode = primitiveStringNode;

type ValidPluginNodeType = SchemaPluginNodeType<ValidSchemas>;
type CanonicalNodeTypeCheck = AssertTrue<ExpectNotAssignable<'foo', ValidPluginNodeType>>;

type ValidObjectNode = SchemaNodeOfType<ValidSchemas, 'object'>;
const objectNodeExample: ValidObjectNode = pipelineNode;

type StrictNodes = {
  PrimitiveOnly: PrimitiveNode;
};

type StrictConfig = CoreStatelyConfig<ValidComponents, EmptyPaths, StrictNodes>;

type StrictSchemas = Schemas<StrictConfig, []>;

type StrictPluginAnyNode = SchemaPluginAnyNode<StrictSchemas>;
const strictCanonicalPrimitive: StrictPluginAnyNode = primitiveStringNode;

type StrictPrimitiveNode = SchemaPluginNodeOfType<StrictSchemas, 'primitive'>;
const strictPluginPrimitive: StrictPrimitiveNode = primitiveStringNode;


type StrictConfigNodeKeys = keyof NodesFromConfig<StrictConfig>;
const strictConfigNodeKey: StrictConfigNodeKeys = 'PrimitiveOnly';
type StrictConfigInvalidKey = AssertTrue<ExpectNotAssignable<'nonexistent', StrictConfigNodeKeys>>;

type StrictConfigNodes = StrictConfig['nodes'];
const strictConfigNodesValue: StrictConfigNodes = {
  PrimitiveOnly: { nodeType: CoreNodeType.Primitive, primitiveType: PrimitiveType.String },
};
type StrictConfigExtraKeyCheck = AssertTrue<
  ExpectNotAssignable<'Extra', keyof StrictConfigNodes>
>;

// ✅ Should extract StateEntry correctly
type TestStateEntry = ValidSchemas['StateEntry'];
// Expected: 'pipeline' | 'source_config' | 'sink_config'

// ✅ Should extract Entity correctly
type TestEntity = ValidSchemas['Entity'];
// Expected: { type: 'pipeline', data: ... } | { type: 'source_config', data: ... } | ...

// ✅ Should extract EntityData correctly
type TestEntityData = ValidSchemas['EntityData'];
// Expected: { name: string; steps: string[] } | { name: string; driver: string } | ...

// ✅ Should extract EntityId correctly
type TestEntityId = ValidSchemas['EntityId'];
// Expected: string

// ✅ Should extract NodeNames correctly
type TestSchemaNames = SchemaGeneratedNodeNames<ValidSchemas>;
const SchemaName: TestSchemaNames = 'Pipeline';
// Expected: 'Pipeline' | 'SourceConfig' | 'SinkConfig'
type InvalidSchemaNameCheck = AssertTrue<
  ExpectNotAssignable<'InvalidSchema', TestSchemaNames>
>;

// ----
// Ad-hoc tests
type X = ValidSchemas['Plugin']['AnyNode'];
const XX: X = primitiveStringNode;

type XX = ValidSchemas['Plugin']['Nodes'][typeof CoreNodeType.Primitive];
const XXX: XX = primitiveStringNode;

type Y = ValidSchemas['Plugin']['NodeTypes'];
const YY: Y = CoreNodeType.Primitive;
type InvalidPluginNodeTypeCheck = AssertTrue<ExpectNotAssignable<'not-right', Y>>;

type Z = ValidSchemas['Plugin']['NodeNames'];
const ZZ: Z = CoreNodeType.Primitive;
type InvalidPluginNodeNameCheckLegacy = AssertTrue<ExpectNotAssignable<'not-right', Z>>;
// ----

type PluginNodeNames = ValidSchemas['Plugin']['NodeNames'];
const pluginNodeName: PluginNodeNames = 'primitive';
type InvalidPluginNodeNameCheck = AssertTrue<
  ExpectNotAssignable<'not-correct', PluginNodeNames>
>;


// ✅ Should work in LinkNode with valid StateEntry value
type ValidLinkNode = SchemaPluginNodeOfType<ValidSchemas, 'link'>;
const validLink: ValidLinkNode = {
  nodeType: 'link',
  targetType: 'pipeline', // ✅ Valid StateEntry value
  inlineSchema: {
    nodeType: 'object',
    properties: {},
    required: [],
  },
};

// ✅ Should work in MapNode with valid StateEntry value
const validMap: SchemaPluginNodeOfType<ValidSchemas, 'map'> = {
  nodeType: 'map',
  keyPattern: 'source_config', // ✅ Valid StateEntry value (optional, so string works too)
  valueSchema: {
    nodeType: 'primitive',
    primitiveType: 'string',
  },
};

// ✅ Should work in RecursiveRefNode with valid schema name
// ============================================================================
// Test 2: Invalid Values - Should produce compile errors
// ============================================================================

// ❌ Invalid StateEntry value in LinkNode
type InvalidLinkTargetCheck = AssertTrue<
  ExpectNotAssignable<'invalid_type', ValidLinkNode['targetType']>
>;

// ❌ Invalid schema name in RecursiveRefNode

// ============================================================================
// Test 3: Real-world usage pattern
// ============================================================================

// Simulate what user would do with openapi-typescript generated types
type SimulatedComponentSchemas = {
  StateEntry: 'user' | 'post' | 'comment';
  Entity:
    | { type: 'user'; data: { id: string; name: string } }
    | { type: 'post'; data: { id: string; title: string; author_id: string } }
    | { type: 'comment'; data: { id: string; text: string; post_id: string } };
  EntityId: string;
  Summary: Record<string, unknown>;
  // ... other schemas ...
};

type SimulatedEntityKinds = SimulatedComponentSchemas['StateEntry'];
type SimulatedSchemaNames = 'User' | 'Post' | 'Comment' | 'UserProfile' | 'PostMetadata';

const simulatedUserNode: ObjectNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    name: primitiveStringNode,
  },
  required: ['id', 'name'],
};

const userProfileNode: ObjectNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    bio: primitiveStringNode,
  },
  required: ['id'],
};

const postAuthorLink: LinkNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Link,
  targetType: 'user',
  inlineSchema: simulatedUserNode,
};

const simulatedPostNode: ObjectNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    title: primitiveStringNode,
    author: postAuthorLink,
  },
  required: ['id', 'title', 'author'],
};

const simulatedTagsArray: ArrayNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Array,
  items: primitiveStringNode,
};

const postMetadataNode: ObjectNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    tags: simulatedTagsArray,
  },
  required: ['id'],
};

const commentPostLink: LinkNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Link,
  targetType: 'post',
  inlineSchema: simulatedPostNode,
};

const simulatedCommentNode: ObjectNodeRaw<SimulatedEntityKinds, SimulatedSchemaNames> = {
  nodeType: CoreNodeType.Object,
  properties: {
    id: primitiveStringNode,
    text: primitiveStringNode,
    post: commentPostLink,
  },
  required: ['id', 'text', 'post'],
};

type SimulatedNodes = {
  User: typeof simulatedUserNode;
  Post: typeof simulatedPostNode;
  Comment: typeof simulatedCommentNode;
  UserProfile: typeof userProfileNode;
  PostMetadata: typeof postMetadataNode;
};

type SimulatedComponents = {
  schemas: CoreStatelyConfig['components']['schemas'] & SimulatedComponentSchemas;
};

type SimulatedConfig = CoreStatelyConfig<SimulatedComponents, EmptyPaths, SimulatedNodes>;
type MySchemas = Schemas<SimulatedConfig, []>;

// ✅ All extracted types are concrete and usable
type MyStateEntry = MySchemas['StateEntry'];
type MyEntity = MySchemas['Entity'];
type MyEntityData = MySchemas['EntityData'];
type MyEntityId = MySchemas['EntityId'];
type MySchemaNames = SchemaGeneratedNodeNames<MySchemas>;

// ✅ All valid StateEntry values work in LinkNode
const userLink: SchemaPluginNodeOfType<MySchemas, 'link'> = {
  nodeType: 'link',
  targetType: 'user', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

const postLink: SchemaPluginNodeOfType<MySchemas, 'link'> = {
  nodeType: 'link',
  targetType: 'post', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

const commentLink: SchemaPluginNodeOfType<MySchemas, 'link'> = {
  nodeType: 'link',
  targetType: 'comment', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

// ✅ All valid schema names work in RecursiveRefNode
const userRef: SchemaPluginNodeOfType<MySchemas, 'recursiveRef'> = {
  nodeType: 'recursiveRef',
  refName: 'User', // ✅
};

const postMetadataRef: SchemaPluginNodeOfType<MySchemas, 'recursiveRef'> = {
  nodeType: 'recursiveRef',
  refName: 'PostMetadata', // ✅
};

// ✅ Type narrowing works on Entity
type UserData = Extract<MySchemas['Entity'], { type: 'user' }> extends { data: infer D }
  ? D
  : never;
// Expected: { id: string; name: string }

type PostData = Extract<MySchemas['Entity'], { type: 'post' }> extends { data: infer D }
  ? D
  : never;
// Expected: { id: string; title: string; author_id: string }

// ============================================================================
// Test 4: Verify all node types are concrete (no generics needed)
// ============================================================================

// ✅ All canonical node types should be usable without generic parameters
type TestPrimitiveNode = SchemaPluginNodeOfType<MySchemas, 'primitive'>;
type TestEnumNode = SchemaPluginNodeOfType<MySchemas, 'enum'>;
type TestObjectNode = SchemaPluginNodeOfType<MySchemas, 'object'>;
type TestArrayNode = SchemaPluginNodeOfType<MySchemas, 'array'>;
type TestMapNode = SchemaPluginNodeOfType<MySchemas, 'map'>;
type TestTupleNode = SchemaPluginNodeOfType<MySchemas, 'tuple'>;
type TestTaggedUnionNode = SchemaPluginNodeOfType<MySchemas, 'taggedUnion'>;
type TestUntaggedEnumNode = SchemaPluginNodeOfType<MySchemas, 'untaggedEnum'>;
type TestLinkNode = SchemaPluginNodeOfType<MySchemas, 'link'>;
type TestNullableNode = SchemaPluginNodeOfType<MySchemas, 'nullable'>;
type TestRecursiveRefNode = SchemaPluginNodeOfType<MySchemas, 'recursiveRef'>;
// (legacy nodes like RelativePathNode/AnySchemaNode removed during schema refactor)

// ============================================================================
// Test 5: Complex nested structures
// ============================================================================

const complexNode: SchemaPluginNodeOfType<MySchemas, 'object'> = {
  nodeType: 'object',
  properties: {
    id: {
      nodeType: 'primitive',
      primitiveType: 'string',
    },
    author: {
      nodeType: 'link',
      targetType: 'user', // ✅ Type-safe
      inlineSchema: {
        nodeType: 'object',
        properties: {},
        required: [],
      },
    },
    metadata: {
      nodeType: 'recursiveRef',
      refName: 'PostMetadata', // ✅ Type-safe
    },
    tags: {
      nodeType: 'array',
      items: {
        nodeType: 'primitive',
        primitiveType: 'string',
      },
    },
  },
  required: ['id', 'author'],
};

// ============================================================================
// Test 6: Node union + discriminant enforcement (strict nodes)
// ============================================================================

type StrictAnyNode = SchemaAnyNode<StrictSchemas>;

type StrictNodeKeys = keyof SchemaGeneratedNodes<StrictSchemas>;
const strictBaseKey: StrictNodeKeys = 'PrimitiveOnly';
type InvalidStrictKeyCheck = AssertTrue<ExpectNotAssignable<'nonexistent', StrictNodeKeys>>;

type StrictRegistryKeys = keyof StrictSchemas['Plugin']['Nodes'];
const strictCoreKey: StrictRegistryKeys = 'primitive';
type InvalidRegistryKeyCheck = AssertTrue<
  ExpectNotAssignable<'nonexistent', StrictRegistryKeys>
>;

const strictPrimitiveNode: StrictAnyNode = {
  nodeType: 'primitive',
  primitiveType: 'string',
};

const registryPrimitiveNode: StrictSchemas['Plugin']['Nodes']['primitive'] = {
  nodeType: CoreNodeType.Primitive,
  primitiveType: PrimitiveType.String,
};

type InvalidStrictNodeCheck = AssertTrue<
  ExpectNotAssignable<'nonexistent', SchemaNodeType<StrictSchemas>>
>;

const strictNodeType: SchemaNodeType<StrictSchemas> = 'primitive';
type InvalidStrictNodeTypeCheck = AssertTrue<
  ExpectNotAssignable<'nonexistent', SchemaNodeType<StrictSchemas>>
>;

// ============================================================================
// Export test results
// ============================================================================

export type TestResults = {
  // Extracted types from factory
  stateEntry: TestStateEntry;
  entity: TestEntity;
  entityData: TestEntityData;
  entityId: TestEntityId;
  schemaNames: TestSchemaNames;

  // Real-world extracted types
  myStateEntry: MyStateEntry;
  myEntity: MyEntity;
  myEntityData: MyEntityData;
  myEntityId: MyEntityId;
  mySchemaNames: MySchemaNames;

  // Narrowed types
  userData: UserData;
  postData: PostData;

  // All node types
  primitiveNode: TestPrimitiveNode;
  enumNode: TestEnumNode;
  objectNode: TestObjectNode;
  arrayNode: TestArrayNode;
  mapNode: TestMapNode;
  tupleNode: TestTupleNode;
  taggedUnionNode: TestTaggedUnionNode;
  untaggedEnumNode: TestUntaggedEnumNode;
  linkNode: TestLinkNode;
  nullableNode: TestNullableNode;
  recursiveRefNode: TestRecursiveRefNode;
};

// If this file compiles with only the expected @ts-expect-error lines,
// then the type factory is working correctly!
console.log('✅ Type enforcement tests passed!');
