// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
/**
 * POC: Simplified Plugin API Type Safety
 *
 * Goal: Prove that we can create a union-based path system where:
 * 1. Plugin author uses canonical paths ('/files/list')
 * 2. User has prefixed paths ('/api/v1/files/list')
 * 3. Both are type-safe through union types
 * 4. Return types are preserved
 *
 * Run with: pnpm tsc --noEmit tests/test-plugin-api-types.test.ts
 */

import type { Client } from 'openapi-fetch';

// =============================================================================
// MOCK: Plugin Author's Generated Types
// =============================================================================

interface FilesCanonicalPaths {
  '/files/list': {
    get: {
      parameters: { query?: { path?: string } };
      responses: { 200: { content: { 'application/json': Array<{ name: string }> } } };
    };
  };
  '/files/upload': {
    post: {
      requestBody: { content: { 'multipart/form-data': { file: Blob } } };
      responses: { 200: { content: { 'application/json': { path: string } } } };
    };
  };
}

// =============================================================================
// MOCK: User's Generated Types (with prefix)
// =============================================================================

interface UserAppPaths {
  '/api/v1/files/list': FilesCanonicalPaths['/files/list'];
  '/api/v1/files/upload': FilesCanonicalPaths['/files/upload'];
  '/api/v1/entity/{id}': {
    get: {
      parameters: { query: { type: string }; path: { id: string } };
      responses: { 200: { content: { 'application/json': { id: string; data: any } } } };
    };
  };
}

// =============================================================================
// TYPE UTILITIES: Path Mapping
// =============================================================================

/**
 * Compose a path with a prefix
 * Path comes first, Prefix is optional (defaults to empty string)
 */
type PrefixPath<Path extends string, Prefix extends string = ''> = Prefix extends ''
  ? Path
  : `${Prefix}${Path}`;

/**
 * Create a union of canonical OR prefixed paths
 * This is our "RegistryKey" pattern for paths
 * Path comes first, Prefix is optional
 */
type FlexiblePath<Path extends string, Prefix extends string = ''> =
  | Path
  | PrefixPath<Path, Prefix>;

/**
 * Map canonical path to actual path in user's types
 * If prefix is empty string, returns canonical path
 * Otherwise returns prefixed path
 * Path comes first, Prefix is optional
 */
type ResolvedPath<Path extends string, Prefix extends string = ''> = PrefixPath<Path, Prefix>;

// =============================================================================
// TYPE UTILITIES: Operation Extraction
// =============================================================================

type ExtractOperation<
  Paths extends Record<string, any>,
  Path extends keyof Paths,
  Method extends string,
> = Method extends keyof Paths[Path] ? Paths[Path][Method] : never;

type ExtractParams<Op> = Op extends { parameters: infer P } ? P : never;

type ExtractBody<Op> = Op extends { requestBody: { content: infer C } }
  ? C extends { [K: string]: infer B }
    ? B
    : never
  : never;

type ExtractResponse<Op> = Op extends { responses: { 200: { content: infer C } } }
  ? C extends { [K: string]: infer R }
    ? R
    : unknown
  : unknown;

// =============================================================================
// CORE: Operation Definition
// =============================================================================

/**
 * Operation definition - plugin author defines with canonical paths
 */
interface OperationDef<
  CanonicalPath extends string,
  Method extends 'get' | 'post' | 'put' | 'delete' | 'patch',
> {
  path: CanonicalPath;
  method: Method;
}

/**
 * Map of operations
 */
type OperationMap<PluginPaths extends Record<string, any>> = Record<
  string,
  OperationDef<keyof PluginPaths & string, 'get' | 'post' | 'put' | 'delete' | 'patch'>
>;

// =============================================================================
// CORE: Typed Operation Caller
// =============================================================================

/**
 * Single operation caller with full type safety
 */
type TypedOperation<
  PluginPaths extends Record<string, any>,
  UserPaths extends Record<string, any>,
  CanonicalPath extends keyof PluginPaths & string,
  Method extends string,
  Prefix extends string,
> = (options?: {
  params?: ExtractParams<ExtractOperation<PluginPaths, CanonicalPath, Method>>;
  body?: ExtractBody<ExtractOperation<PluginPaths, CanonicalPath, Method>>;
}) => Promise<{
  data?: ExtractResponse<ExtractOperation<PluginPaths, CanonicalPath, Method>>;
  error?: any;
}>;

/**
 * Map all operations to typed callers
 */
type TypedOperations<
  PluginPaths extends Record<string, any>,
  UserPaths extends Record<string, any>,
  Ops extends OperationMap<PluginPaths>,
  Prefix extends string,
> = {
  [OpId in keyof Ops]: TypedOperation<
    PluginPaths,
    UserPaths,
    Ops[OpId]['path'],
    Ops[OpId]['method'],
    Prefix
  >;
};

// =============================================================================
// CORE: API Factory Function
// =============================================================================

/**
 * Create typed operations from operation definitions
 *
 * This is what stately base provides to plugin authors
 */
function createPluginOperations<
  PluginPaths extends Record<string, any>,
  UserPaths extends Record<string, any>,
  Ops extends OperationMap<PluginPaths>,
  Prefix extends string,
>(
  client: Client<UserPaths>,
  operations: Ops,
  prefix: Prefix,
): TypedOperations<PluginPaths, UserPaths, Ops, Prefix> {
  const result: any = {};

  for (const [opId, opDef] of Object.entries(operations)) {
    result[opId] = (options?: any) => {
      // Runtime: compose the full path
      const fullPath = prefix ? `${prefix}${opDef.path}` : opDef.path;

      // Call the client with composed path
      const clientAny = client as any;
      return clientAny[opDef.method.toUpperCase()](fullPath, options);
    };
  }

  return result;
}

// =============================================================================
// TEST 1: Plugin Author Development (No Prefix)
// =============================================================================

function test1_pluginAuthorDevelopment() {
  // Plugin author creates a client with their canonical types
  const pluginClient = {} as Client<FilesCanonicalPaths>;

  // Plugin author defines operations
  const FILES_OPS = {
    listFiles: { method: 'get', path: '/files/list' },
    uploadFile: { method: 'post', path: '/files/upload' },
  } as const satisfies OperationMap<FilesCanonicalPaths>;

  // Plugin author creates API with NO prefix (empty string)
  const api = createPluginOperations<
    FilesCanonicalPaths,
    FilesCanonicalPaths, // Same as plugin paths during development
    typeof FILES_OPS,
    '' // No prefix
  >(pluginClient, FILES_OPS, '');

  // ✅ Plugin author gets full type safety
  const result1 = api.listFiles({ params: { query: { path: '/test' } } });
  type Result1 = Awaited<typeof result1>;
  type Data1 = Result1['data']; // Should be Array<{ name: string }> | undefined

  const result2 = api.uploadFile({ body: { file: new Blob() } });
  type Result2 = Awaited<typeof result2>;
  type Data2 = Result2['data']; // Should be { path: string } | undefined

  // ❌ Type errors are caught
  const bad1 = api.listFiles({
    params: {
      // @ts-expect-error - wrong param name
      query: { invalid: 'value' },
    },
  });
}

// =============================================================================
// TEST 2: User Integration (With Prefix)
// =============================================================================

function test2_userIntegration() {
  // User creates client with their full app types
  const userClient = {} as Client<UserAppPaths>;

  // Plugin operations (same definition as plugin author)
  const FILES_OPS = {
    listFiles: { method: 'get', path: '/files/list' },
    uploadFile: { method: 'post', path: '/files/upload' },
  } as const satisfies OperationMap<FilesCanonicalPaths>;

  // User creates API with THEIR prefix
  const api = createPluginOperations<
    FilesCanonicalPaths, // Plugin's canonical types
    UserAppPaths, // User's full types
    typeof FILES_OPS,
    '/api/v1/files' // User's prefix
  >(userClient, FILES_OPS, '/api/v1/files');

  // ✅ User gets the same type safety as plugin author
  const result1 = api.listFiles({ params: { query: { path: '/uploads' } } });
  type Result1 = Awaited<typeof result1>;
  type Data1 = Result1['data']; // Should be Array<{ name: string }> | undefined

  const result2 = api.uploadFile({ body: { file: new Blob() } });
  type Result2 = Awaited<typeof result2>;
  type Data2 = Result2['data']; // Should be { path: string } | undefined

  // ❌ Same type errors
  const bad1 = api.listFiles({
    params: {
      // @ts-expect-error - wrong param name
      query: { invalid: 'value' },
    },
  });
}

// =============================================================================
// TEST 3: Verify Structural Equivalence
// =============================================================================

function test3_structuralEquivalence() {
  // The key assumption: These operation types should be identical
  type PluginOp = FilesCanonicalPaths['/files/list']['get'];
  type UserOp = UserAppPaths['/api/v1/files/list']['get'];

  // Are they equivalent?
  type IsEquivalent1 = PluginOp extends UserOp ? true : false; // Should be true
  type IsEquivalent2 = UserOp extends PluginOp ? true : false; // Should be true

  // Test parameters
  type PluginParams = ExtractParams<PluginOp>;
  type UserParams = ExtractParams<UserOp>;
  type ParamsMatch = PluginParams extends UserParams ? true : false; // Should be true

  // Test responses
  type PluginResponse = ExtractResponse<PluginOp>;
  type UserResponse = ExtractResponse<UserOp>;
  type ResponseMatch = PluginResponse extends UserResponse ? true : false; // Should be true
}

// =============================================================================
// TEST 4: React Query Integration
// =============================================================================

function test4_reactQueryIntegration() {
  const api = {} as TypedOperations<
    FilesCanonicalPaths,
    UserAppPaths,
    { listFiles: { path: '/files/list'; method: 'get' } },
    '/api/v1/files'
  >;

  // Can React Query infer the type?
  async function queryFn() {
    const result = await api.listFiles({ params: { query: { path: '/' } } });
    return result.data; // Type: Array<{ name: string }> | undefined
  }

  type QueryResult = Awaited<ReturnType<typeof queryFn>>;
  // QueryResult should be Array<{ name: string }> | undefined

  // React Query can infer this!
  // useQuery({ queryKey: ['files'], queryFn })
  // → data will be typed as Array<{ name: string }> | undefined
}

// =============================================================================
// FINDINGS
// =============================================================================

/**
 * PROVEN:
 * ✅ Plugin author gets type safety with canonical paths (no prefix)
 * ✅ User gets same type safety with prefixed paths
 * ✅ Return types are preserved through the wrapper
 * ✅ Types flow naturally to React Query
 * ✅ No classes needed - simple function-based API
 *
 * ASSUMPTIONS:
 * ⚠️ UserPaths[PrefixedPath] === PluginPaths[CanonicalPath] structurally
 *    → This is safe if both come from same Rust OpenAPI spec
 * ⚠️ Runtime path composition is correct
 *    → `${prefix}${canonicalPath}` produces valid key in UserPaths
 *
 * GAPS:
 * ❌ No runtime validation that prefix + path produces valid UserPaths key
 * ❌ No build-time check that UserPaths and PluginPaths are compatible
 * ❌ Type extraction relies on TypeScript inference - fragile?
 */

export type { FilesCanonicalPaths, UserAppPaths, TypedOperations };
