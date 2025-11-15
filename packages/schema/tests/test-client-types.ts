/**
 * Test client type compatibility with openapi-fetch
 * Simulates the xeo4 integration pattern
 */
import createClient from 'openapi-fetch';
import type { Client } from 'openapi-fetch';
import { DefineComponents, DefineConfig, DefineGeneratedNodes, DefinePaths, SchemaConfig, type Schemas, stately } from '../src/index.js';
import { CoreNodeType } from '../src/core/nodes.js';
import { Stately } from '../src/stately.js';

type AssertTrue<T extends true> = T;

// Mock paths type (similar to what openapi-typescript generates)
type MockPaths = DefinePaths<{
  '/users': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': Array<{ id: string; name: string }>;
          };
        };
      };
    };
  };
  '/posts/{id}': {
    get: {
      parameters: {
        path: { id: string };
      };
      responses: {
        200: {
          content: {
            'application/json': { id: string; title: string; content: string };
          };
        };
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
  Entity: {
     nodeType: CoreNodeType.TaggedUnion,
     discriminator: "type",
     variants: [],
   },
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

// Type assertions to verify correctness
type ApiType = typeof api;
type ApiPathsType = ApiType extends Client<infer P, any> ? P : never;

// Assert 1: api should be Client<MockPaths>
type AssertApiIsClientOfMockPaths = ApiType extends Client<MockPaths, any> ? true : false;
const assert1: AssertApiIsClientOfMockPaths = true;

// Assert 2: Extracted paths should be exactly MockPaths (no intersection)
type AssertExtractedPathsIsMockPaths = AssertTrue<[ApiPathsType] extends [MockPaths]
  ? [MockPaths] extends [ApiPathsType]
    ? true
    : false
  : false>;

// Assert 3: Schema config paths should not have Record<string, any> intersection
type SchemaConfigPaths = MockSchemas['config']['paths'];
// type AssertNoRecordIntersection = AssertTrue<SchemaConfigPaths extends MockPaths & Record<string, any>
//   ? false  // BAD: has the intersection
//   : SchemaConfigPaths extends MockPaths
//     ? true  // GOOD: just MockPaths
//     : false>;

export function statelyUi<Schema extends Schemas<MockConfig>>(
  state: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
) {
  /** */
}

const Y = statelyUi<MockSchemas>(mockSchema, api);

// Assert 4: api should be assignable to what statelyUi expects
// type AssertApiAssignableToExpected = ApiType extends ExpectedClientType ? true : false;
// const assert4: AssertApiAssignableToExpected = true;

// Export for inspection
export type {
  MockSchemas,
  ApiType,
  ApiPathsType,
  SchemaConfigPaths,
};
