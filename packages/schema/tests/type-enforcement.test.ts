/**
 * Type enforcement tests
 *
 * These tests verify that the StatelySchemas factory correctly extracts and
 * distributes types, and that node types are properly constrained.
 * Run: npx tsc --noEmit tests/type-enforcement.test.ts
 */

import type { StatelySchemas } from '../src/index.js';

// ============================================================================
// Test 1: Valid Schema - Factory extracts and distributes correctly
// ============================================================================

interface ValidComponents {
  StateEntry: 'pipeline' | 'source_config' | 'sink_config';
  Entity:
    | { type: 'pipeline'; data: { name: string; steps: string[] } }
    | { type: 'source_config'; data: { name: string; driver: string } }
    | { type: 'sink_config'; data: { name: string; destination: string } };
  EntityId: string;
}

interface ValidNodes {
  Pipeline: any;
  SourceConfig: any;
  SinkConfig: any;
}

type ValidSchemas = StatelySchemas<{
  components: ValidComponents;
  nodes: ValidNodes;
}>;

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
type TestSchemaNames = ValidSchemas['NodeNames'];
// Expected: 'Pipeline' | 'SourceConfig' | 'SinkConfig'

// ✅ Should work in LinkNode with valid StateEntry value
const validLink: ValidSchemas['LinkNode'] = {
  nodeType: 'link',
  targetType: 'pipeline', // ✅ Valid StateEntry value
  inlineSchema: {
    nodeType: 'object',
    properties: {},
    required: [],
  },
};

// ✅ Should work in MapNode with valid StateEntry value
const validMap: ValidSchemas['MapNode'] = {
  nodeType: 'map',
  keyPattern: 'source_config', // ✅ Valid StateEntry value (optional, so string works too)
  valueSchema: {
    nodeType: 'primitive',
    primitiveType: 'string',
  },
};

// ✅ Should work in RecursiveRefNode with valid schema name
const validRef: ValidSchemas['RecursiveRefNode'] = {
  nodeType: 'recursiveRef',
  refName: 'Pipeline', // ✅ Valid schema name
};

// ============================================================================
// Test 2: Invalid Values - Should produce compile errors
// ============================================================================

// ❌ Invalid StateEntry value in LinkNode
const invalidLink: ValidSchemas['LinkNode'] = {
  nodeType: 'link',
  // @ts-expect-error - 'invalid_type' is not in StateEntry
  targetType: 'invalid_type', // ❌ Error expected
  inlineSchema: {
    nodeType: 'object',
    properties: {},
    required: [],
  },
};

// ❌ Invalid schema name in RecursiveRefNode
const invalidRef: ValidSchemas['RecursiveRefNode'] = {
  nodeType: 'recursiveRef',
  // @ts-expect-error - 'InvalidSchema' is not in NodeNames
  refName: 'InvalidSchema', // ❌ Error expected
};

// ============================================================================
// Test 3: Real-world usage pattern
// ============================================================================

// Simulate what user would do with openapi-typescript generated types
interface SimulatedComponents {
  StateEntry: 'user' | 'post' | 'comment';
  Entity:
    | { type: 'user'; data: { id: string; name: string } }
    | { type: 'post'; data: { id: string; title: string; author_id: string } }
    | { type: 'comment'; data: { id: string; text: string; post_id: string } };
  EntityId: string;
  // ... other schemas ...
}

interface SimulatedNodes {
  User: any;
  Post: any;
  Comment: any;
  UserProfile: any;
  PostMetadata: any;
}

type MySchemas = StatelySchemas<{
  components: SimulatedComponents;
  nodes: SimulatedNodes;
}>;

// ✅ All extracted types are concrete and usable
type MyStateEntry = MySchemas['StateEntry'];
type MyEntity = MySchemas['Entity'];
type MyEntityData = MySchemas['EntityData'];
type MyEntityId = MySchemas['EntityId'];
type MySchemaNames = MySchemas['NodeNames'];

// ✅ All valid StateEntry values work in LinkNode
const userLink: MySchemas['LinkNode'] = {
  nodeType: 'link',
  targetType: 'user', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

const postLink: MySchemas['LinkNode'] = {
  nodeType: 'link',
  targetType: 'post', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

const commentLink: MySchemas['LinkNode'] = {
  nodeType: 'link',
  targetType: 'comment', // ✅
  inlineSchema: { nodeType: 'object', properties: {}, required: [] },
};

// ✅ All valid schema names work in RecursiveRefNode
const userRef: MySchemas['RecursiveRefNode'] = {
  nodeType: 'recursiveRef',
  refName: 'User', // ✅
};

const postMetadataRef: MySchemas['RecursiveRefNode'] = {
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

// ✅ All node types should be usable without generic parameters
type TestPrimitiveNode = MySchemas['PrimitiveNode'];
type TestEnumNode = MySchemas['EnumNode'];
type TestObjectNode = MySchemas['ObjectNode'];
type TestArrayNode = MySchemas['ArrayNode'];
type TestMapNode = MySchemas['MapNode'];
type TestTupleNode = MySchemas['TupleNode'];
type TestTaggedUnionNode = MySchemas['TaggedUnionNode'];
type TestUntaggedEnumNode = MySchemas['UntaggedEnumNode'];
type TestLinkNode = MySchemas['LinkNode'];
type TestNullableNode = MySchemas['NullableNode'];
type TestRecursiveRefNode = MySchemas['RecursiveRefNode'];
type TestRelativePathNode = MySchemas['RelativePathNode'];
type TestAnySchemaNode = MySchemas['AnySchemaNode'];

// ✅ Can use AnySchemaNode in function signatures
function processNode(node: MySchemas['AnySchemaNode']): void {
  switch (node.nodeType) {
    case 'primitive':
      // node is PrimitiveNode
      console.log(node.primitiveType);
      break;
    case 'link':
      // node is LinkNode with concrete targetType
      console.log(node.targetType); // Type: 'user' | 'post' | 'comment'
      break;
    case 'recursiveRef':
      // node is RecursiveRefNode with concrete refName
      console.log(node.refName); // Type: 'User' | 'Post' | 'Comment' | 'UserProfile' | 'PostMetadata'
      break;
  }
}

// ============================================================================
// Test 5: Complex nested structures
// ============================================================================

const complexNode: MySchemas['ObjectNode'] = {
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
  relativePathNode: TestRelativePathNode;
  anySchemaNode: TestAnySchemaNode;
};

// If this file compiles with only the expected @ts-expect-error lines,
// then the type factory is working correctly!
console.log('✅ Type enforcement tests passed!');
