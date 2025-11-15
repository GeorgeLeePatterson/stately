// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Test client type compatibility with openapi-fetch
 * Simulates the xeo4 integration pattern
 */

import type { Client } from 'openapi-fetch';
import createClient from 'openapi-fetch';
import { CoreNodeType } from '../src/core/nodes.js';
import type { AssertTrue } from '../src/helpers.js';
import {
  type DefineComponents,
  type DefineConfig,
  type DefineGeneratedNodes,
  type DefinePaths,
  type Schemas,
  stately,
} from '../src/index.js';
import type { Stately } from '../src/stately.js';

// Mock paths type (similar to what openapi-typescript generates)
type MockPaths = DefinePaths<{
  '/users': {
    get: {
      responses: { 200: { content: { 'application/json': Array<{ id: string; name: string }> } } };
    };
  };
  '/posts/{id}': {
    get: {
      parameters: { path: { id: string } };
      responses: {
        200: { content: { 'application/json': { id: string; title: string; content: string } } };
      };
    };
  };
}>;

// Mock components (similar to xeo4)
type MockComponents = DefineComponents<{
  schemas: {
    User: { id: string; name: string };
    Post: { id: string; title: string; content: string };
    StateEntry: 'draft' | 'published' | 'archived';
    Entity:
      | { type: 'user'; data: { id: string; name: string } }
      | { type: 'post'; data: { id: string; title: string; content: string } };
    EntityId: string;
    Summary: { id?: string; name?: string; description?: string | null };
  };
}>;

// Mock nodes (minimal for test)
const MOCK_PARSED_SCHEMAS: Schemas['config']['nodes'] = {
  Entity: { discriminator: 'type', nodeType: CoreNodeType.TaggedUnion, variants: [] },
};

// Create config and schema types (matching xeo4 pattern)
type MockConfig = DefineConfig<
  MockComponents,
  MockPaths,
  DefineGeneratedNodes<typeof MOCK_PARSED_SCHEMAS>
>;
type MockSchemas = Schemas<MockConfig>;

// Create the client (matching xeo4 pattern)
declare const mockOpenApiDoc: any;
export const api = createClient<MockPaths>({ baseUrl: 'http://localhost:3000' });

// Create the schema runtime (matching xeo4 pattern)
export const mockSchema = stately<MockSchemas>(mockOpenApiDoc, MOCK_PARSED_SCHEMAS);

type EntityData = MockSchemas['types']['EntityData'];
// @ts-expect-error Not defined, no plugins augmented
type OtherData = MockSchemas['types']['OtherData'];
const entityData = mockSchema.types.EntityData;
// @ts-expect-error Not defined, no plugins augmented
const otherData = mockSchema.types.OtherData;

// Type assertions to verify correctness
type ApiType = typeof api;
type ApiPathsType = ApiType extends Client<infer P, any> ? P : never;

// Assert: api should be Client<MockPaths>
type AssertApiIsClientOfMockPaths = AssertTrue<
  ApiType extends Client<MockPaths, any> ? true : false
>;

// Assert: Extracted paths should be exactly MockPaths (no intersection)
type AssertExtractedPathsIsMockPaths = AssertTrue<
  [ApiPathsType] extends [MockPaths] ? ([MockPaths] extends [ApiPathsType] ? true : false) : false
>;

// Assert: Schema config paths should not have Record<string, any> intersection
type SchemaConfigPaths = MockSchemas['config']['paths'];

export function statelyUi<Schema extends Schemas<MockConfig>>(
  state: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
) {
  /** */
}

const _ = statelyUi<MockSchemas>(mockSchema, api);

// Export for inspection
export type { MockSchemas, ApiType, ApiPathsType, SchemaConfigPaths };
