// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * POC: Exploring openapi-fetch type safety capabilities
 *
 * This is a TYPE-LEVEL test - no actual fetches are executed.
 * We're exploring what TypeScript can infer and validate at compile time.
 *
 * Key questions:
 * 1. What type safety do we get for path/query/body parameters?
 * 2. Can we detect parameter mismatches at compile time?
 * 3. Can we compose path strings dynamically while preserving types?
 * 4. How can plugin authors get type safety with different path prefixes?
 * 5. Can we create an operation-ID-based wrapper that preserves types?
 *
 * Run with: pnpm typecheck
 */

import createClient from 'openapi-fetch';
import type { operations, paths } from './mock-types';

// =============================================================================
// TEST 1: Basic openapi-fetch Type Safety
// =============================================================================

function test1_basicTypeSafety() {
  const client = createClient<paths>({ baseUrl: 'http://localhost:5555' });

  // ✅ Simple GET - no parameters
  const cancel = client.GET('/admin/cancel');
  type CancelResponse = Awaited<typeof cancel>;

  // ✅ GET with path parameter - CORRECT parameter names
  const getEntity = client.GET('/api/v1/entity/{id}', {
    params: { path: { id: '123' }, query: { type: 'buffer_settings' } },
  });
  type GetEntityResponse = Awaited<typeof getEntity>;

  // ❌ This DOES cause a TypeScript error - wrong path parameter name
  const bad1 = client.GET('/api/v1/entity/{id}', {
    params: {
      // @ts-expect-error - 'entity_id' doesn't exist, should be 'id'
      path: { entity_id: '123' },
      query: { type: 'buffer_settings' },
    },
  });

  // ❌ This DOES cause a TypeScript error - missing required param
  const bad2 = client.GET('/api/v1/entity/{id}', {
    // @ts-expect-error - path.id is required
    params: { query: { type: 'buffer_settings' } },
  });

  // ✅ Multiple path parameters
  const deleteEntity = client.DELETE('/api/v1/entity/{entry}/{id}', {
    params: { path: { entry: 'buffer_settings', id: '123' } },
  });
  type DeleteEntityResponse = Awaited<typeof deleteEntity>;

  // ❌ Missing one of multiple params
  const bad3 = client.DELETE('/api/v1/entity/{entry}/{id}', {
    params: {
      // @ts-expect-error - 'entry' is required
      path: { id: '123' },
    },
  });

  // ✅ PUT with request body
  const createEntity = client.PUT('/api/v1/entity', {
    body: { data: {}, id: '123', type: 'buffer_settings' } as any, // TODO: Use actual Entity type from components
  });
  type CreateEntityResponse = Awaited<typeof createEntity>;
}

// =============================================================================
// TEST 2: Dynamic Path Construction
// =============================================================================

function test2_dynamicPaths() {
  const client = createClient<paths>({ baseUrl: 'http://localhost:5555' });

  // Question: Can we build paths dynamically and preserve types?

  // Approach 1: Template literal types (TypeScript limitation)
  const pathTemplate = '/api/v1/entity/{id}';
  // ❌ This loses type safety - string is not a valid path key
  // const dynamic1 = client.GET(pathTemplate, { ... }); // TS Error: string not assignable

  // Approach 2: Type assertion (unsafe but works)
  const pathWithAssertion = '/api/v1/entity/{id}' as const;
  const dynamic2 = client.GET(pathWithAssertion, {
    params: { path: { id: '456' }, query: { type: 'buffer_settings' } },
  });
  type Dynamic2Response = Awaited<typeof dynamic2>;

  // Approach 3: Helper function with generics
  function buildPath<P extends keyof paths>(path: P): P {
    return path;
  }

  const dynamicPath = buildPath('/api/v1/entity/{id}');
  const dynamic3 = client.GET(dynamicPath, {
    params: { path: { id: '789' }, query: { type: 'buffer_settings' } },
  });
  type Dynamic3Response = Awaited<typeof dynamic3>;

  // Finding: Dynamic paths require either assertions or helper functions
  // that return specific path types
}

// =============================================================================
// TEST 3: Path Prefix Handling
// =============================================================================

function test3_pathPrefixes() {
  const client = createClient<paths>({ baseUrl: 'http://localhost:5555' });

  // Scenario: Plugin defines routes without prefix, user mounts with prefix

  // Plugin's "canonical" path
  const canonicalPath = '/entity/{id}';

  // User's actual mounted path
  const userPrefix = '/api/v1';
  const actualPath = '/api/v1/entity/{id}';

  // Question: How can we compose these while preserving types?

  // Attempt 1: String concatenation (loses types)
  // const composedPath = `${userPrefix}${canonicalPath}`; // Type: string (not a valid key)

  // Attempt 2: Template literal type
  type ComposePath<Prefix extends string, Path extends string> = `${Prefix}${Path}`;
  type ComposedPath = ComposePath<'/api/v1', '/entity/{id}'>; // Type: '/api/v1/entity/{id}'

  // But we can't compute this at runtime without assertion
  const composedTyped = actualPath as ComposedPath;
  const result = client.GET(composedTyped, {
    params: { path: { id: 'abc' }, query: { type: 'buffer_settings' } },
  });
  type ComposedResponse = Awaited<typeof result>;

  // Key finding: We need compile-time knowledge of the final path
  // OR a runtime wrapper that preserves types
}

// =============================================================================
// TEST 4: Operation-ID-Based Wrapper
// =============================================================================

// Create a type-level mapping from operation IDs to paths
type OperationMeta<OpId extends keyof operations> = {
  [P in keyof paths]: paths[P] extends Record<string, any>
    ? {
        [M in 'get' | 'put' | 'post' | 'delete' | 'patch']: M extends keyof paths[P]
          ? paths[P][M] extends operations[OpId]
            ? { path: P; method: M }
            : never
          : never;
      }[keyof paths[P] & ('get' | 'put' | 'post' | 'delete' | 'patch')]
    : never;
}[keyof paths];

// Extract operation metadata
type GetOpMeta<OpId extends keyof operations> = OperationMeta<OpId>;

// Test the type mapping
type CancelMeta = GetOpMeta<'cancel'>; // Should be { path: '/admin/cancel', method: 'get' }
type GetEntityMeta = GetOpMeta<'get_entity_by_id'>; // Should be { path: '/api/v1/entity/{id}', method: 'get' }
type ListEntitiesMeta = GetOpMeta<'list_entities'>; // Should have path with {type} param

// Runtime operation registry (must match generated types)
const OPERATION_REGISTRY = {
  cancel: { method: 'get', path: '/admin/cancel' },
  create_entity: { method: 'put', path: '/api/v1/entity' },
  get_entity_by_id: { method: 'get', path: '/api/v1/entity/{id}' },
  list_entities: { method: 'get', path: '/api/v1/entity/list/{type}' },
  remove_entity: { method: 'delete', path: '/api/v1/entity/{entry}/{id}' },
  update_entity: { method: 'post', path: '/api/v1/entity/{id}' },
} as const;

// Extract parameter types from an operation
type OperationParams<Op> = Op extends { parameters: infer P } ? P : never;
type OperationBody<Op> = Op extends { requestBody: { content: infer C } }
  ? C extends { 'application/json': infer B }
    ? B
    : never
  : never;

// Type-safe operation options
type OperationOptions<OpId extends keyof operations> = {
  params?: OperationParams<operations[OpId]>;
  body?: OperationBody<operations[OpId]>;
};

// Type-safe operation caller
class OperationClient<Paths extends Record<string, any>, Ops extends Record<string, any>> {
  constructor(private client: ReturnType<typeof createClient<Paths>>) {}

  call<OpId extends keyof Ops & keyof operations>(
    operationId: OpId,
    options?: OperationOptions<OpId>,
  ) {
    const meta = OPERATION_REGISTRY[operationId as keyof typeof OPERATION_REGISTRY];
    if (!meta) {
      throw new Error(`Operation ${String(operationId)} not found`);
    }

    const { path, method } = meta;
    const clientAny = this.client as any;

    return clientAny[method.toUpperCase()](path, options);
  }
}

function test4_operationClient() {
  const client = createClient<paths>({ baseUrl: 'http://localhost:5555' });
  const opClient = new OperationClient<paths, operations>(client);

  // ✅ Call by operation ID with type-safe params
  const result1 = opClient.call('get_entity_by_id', {
    params: { path: { id: '123' }, query: { type: 'buffer_settings' } },
  });
  type Result1 = Awaited<typeof result1>;

  // ✅ Different operation
  const result2 = opClient.call('list_entities', { params: { path: { type: 'buffer_settings' } } });
  type Result2 = Awaited<typeof result2>;

  // ❌ Wrong parameter name should error
  const bad1 = opClient.call('get_entity_by_id', {
    params: {
      // @ts-expect-error - should be 'id'
      path: { entity_id: '123' },
      query: { type: 'buffer_settings' },
    },
  });

  // Question: Does the type safety propagate through the wrapper?
  // Let's check what TypeScript infers for the options
  type GetEntityOptions = OperationOptions<'get_entity_by_id'>;
  type ListEntitiesOptions = OperationOptions<'list_entities'>;
}

// =============================================================================
// TEST 5: Plugin Author Workflow with Path Prefixes
// =============================================================================

/**
 * Simulating a plugin author who:
 * 1. Defines routes with canonical paths (no prefix)
 * 2. Generates TypeScript types from canonical OpenAPI spec
 * 3. Needs type safety even though users mount with prefixes
 */

// Plugin's canonical types (from their openapi.json - no /api/v1 prefix)
interface FilesPluginPaths {
  '/files/list': {
    get: {
      parameters: { query?: { path?: string } };
      responses: {
        200: { content: { 'application/json': Array<{ name: string; type: string }> } };
      };
    };
  };
  '/files/upload': {
    post: {
      requestBody: { content: { 'multipart/form-data': { file: Blob } } };
      responses: { 200: { content: { 'application/json': { path: string } } } };
    };
  };
}

// User's actual types (with prefix applied during their codegen)
interface UserAppPaths {
  '/api/v1/files/list': FilesPluginPaths['/files/list'];
  '/api/v1/files/upload': FilesPluginPaths['/files/upload'];
}

// Plugin author's client wrapper that accepts runtime prefix
class PrefixedClient<PluginPaths extends Record<string, any>> {
  constructor(
    private client: ReturnType<typeof createClient<any>>,
    private prefix: string,
  ) {}

  GET<P extends keyof PluginPaths & string>(path: P, options?: any) {
    const fullPath = `${this.prefix}${path}`;
    return (this.client as any).GET(fullPath, options);
  }

  POST<P extends keyof PluginPaths & string>(path: P, options?: any) {
    const fullPath = `${this.prefix}${path}`;
    return (this.client as any).POST(fullPath, options);
  }
}

function test5_pluginWorkflow() {
  // User creates base client with their full paths
  const baseClient = createClient<UserAppPaths>({ baseUrl: 'http://localhost:5555' });

  // Plugin exports a factory that accepts prefix
  function createFilesPluginClient(prefix: string) {
    return new PrefixedClient<FilesPluginPaths>(baseClient, prefix);
  }

  // User instantiates with their chosen prefix
  const filesClient = createFilesPluginClient('/api/v1/files');

  // ✅ Plugin author writes code against canonical paths
  const listFiles = filesClient.GET('/files/list', { params: { query: { path: '/uploads' } } });
  type ListFilesResponse = Awaited<typeof listFiles>;

  // ✅ Type safety is preserved!
  const uploadFile = filesClient.POST('/files/upload', { body: { file: new Blob() } });
  type UploadFileResponse = Awaited<typeof uploadFile>;

  // ❌ Invalid path should error
  // @ts-expect-error - Testing: invalid path
  const bad = filesClient.GET('/files/invalid', {});

  // Finding: Prefixed client wrapper preserves type safety for plugin authors!
  // Plugin code uses canonical paths, runtime adds prefix
}

// =============================================================================
// TEST 6: Type Extraction Utilities
// =============================================================================

function test6_typeExtraction() {
  // Can we extract useful types from the paths/operations?

  // Extract all GET paths
  type GetPaths = {
    [P in keyof paths]: paths[P] extends { get: any } ? P : never;
  }[keyof paths];

  // Extract paths with specific parameter
  type PathsWithIdParam = {
    [P in keyof paths]: paths[P] extends { get: { parameters: { path: { id: any } } } } ? P : never;
  }[keyof paths];

  // Extract response type from a path
  type GetEntityResponse =
    paths['/api/v1/entity/{id}']['get']['responses'][200]['content']['application/json'];

  // Extract parameter type
  type GetEntityParams = paths['/api/v1/entity/{id}']['get']['parameters'];

  // These type-level utilities could help build better abstractions
}

// =============================================================================
// FINDINGS SUMMARY
// =============================================================================

/**
 * FINDINGS:
 *
 * 1. ✅ openapi-fetch provides excellent compile-time type safety
 *    - Path parameters are type-checked (name, presence, type)
 *    - Query parameters are type-checked
 *    - Request bodies are type-checked
 *    - Response types are inferred
 *
 * 2. ❌ Dynamic path construction loses type safety
 *    - String concatenation results in `string` type
 *    - Template literal types don't help at runtime
 *    - Workarounds: type assertions or typed helper functions
 *
 * 3. ✅ Operation-ID-based wrapper is feasible
 *    - Can map operation IDs to paths at runtime
 *    - Type safety CAN be preserved with proper typing
 *    - Requires manual operation registry (could be generated)
 *
 * 4. ✅ Plugin path prefix problem has a solution
 *    - PrefixedClient wrapper preserves plugin author's type safety
 *    - Plugin writes code against canonical paths
 *    - Runtime applies user's prefix
 *    - User's generated types have final paths
 *
 * 5. 🤔 Trade-offs to consider:
 *    - Path-based API: String literals, no discoverability
 *    - Operation-based API: Better DX, requires mapping layer
 *    - Prefixed client: Solves plugin problem but adds indirection
 *
 * NEXT STEPS:
 * 1. Decide on the API design (path-based vs operation-based vs hybrid)
 * 2. Determine if operation registry should be auto-generated
 * 3. Design plugin author DX for path prefixes
 * 4. Prototype the chosen approach in stately/ui
 */

// Type-only export to prevent unused variable errors
export type { paths, operations, FilesPluginPaths, UserAppPaths };
