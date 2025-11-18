/**
 * Implementation Design Specification
 *
 * This file shows the complete design split into:
 * 1. @stately/schema - Type utilities (schema-level)
 * 2. @stately/ui/base - Runtime implementation (ui-level)
 * 3. Plugin author usage - How to define plugin APIs
 *
 * Run: pnpm tsc --noEmit tests/test-implementation-design.test.ts
 */

import type { Client } from 'openapi-fetch';

// =============================================================================
// SECTION 1: @stately/schema - Type Utilities
// =============================================================================
// Location: packages/schema/src/api.ts (new file)

/**
 * Compose a path with an optional prefix
 */
export type PrefixPath<Path extends string, Prefix extends string = ''> = Prefix extends ''
  ? Path
  : `${Prefix}${Path}`;

/**
 * Operation definition
 */
export interface OperationDef<
  Path extends string,
  Method extends 'get' | 'post' | 'put' | 'delete' | 'patch',
> {
  path: Path;
  method: Method;
}

/**
 * Map of operations - plugin authors define this
 */
export type OperationMap<Paths extends Record<string, any>> = Record<
  string,
  OperationDef<keyof Paths & string, 'get' | 'post' | 'put' | 'delete' | 'patch'>
>;

/**
 * Helper for plugin authors to define operations with type safety
 */
export type DefineOperations<Paths extends Record<string, any>> = OperationMap<Paths>;

// =============================================================================
// SECTION 2: @stately/ui/base - Runtime Implementation
// =============================================================================
// Location: packages/ui/src/base/api.ts (new file)

/**
 * Extract operation from paths by path and method
 */
type GetOperation<
  Paths extends Record<string, any>,
  Path extends keyof Paths,
  Method extends string,
> = Method extends keyof Paths[Path] ? Paths[Path][Method] : never;

/**
 * Extract parameters from operation
 */
type GetParams<Op> = Op extends { parameters: infer P } ? P : never;

/**
 * Extract request body from operation
 */
type GetBody<Op> = Op extends { requestBody: { content: infer C } }
  ? C extends { [K: string]: infer B }
    ? B
    : never
  : never;

/**
 * Extract response data from operation
 */
type GetResponse<Op> = Op extends { responses: { 200: { content: infer C } } }
  ? C extends { [K: string]: infer R }
    ? R
    : unknown
  : unknown;

/**
 * Typed operation caller
 */
type TypedOperation<
  PluginPaths extends Record<string, any>,
  Path extends keyof PluginPaths & string,
  Method extends string,
> = (options?: {
  params?: GetParams<GetOperation<PluginPaths, Path, Method>>;
  body?: GetBody<GetOperation<PluginPaths, Path, Method>>;
}) => Promise<{ data?: GetResponse<GetOperation<PluginPaths, Path, Method>>; error?: any }>;

/**
 * Typed operations object - one method per operation
 */
export type TypedOperations<
  PluginPaths extends Record<string, any>,
  Ops extends OperationMap<PluginPaths>,
> = {
  [OpId in keyof Ops]: TypedOperation<PluginPaths, Ops[OpId]['path'], Ops[OpId]['method']>;
};

/**
 * Create typed operations from operation definitions
 *
 * This is the core function that stately provides
 */
export function createOperations<
  PluginPaths extends Record<string, any>,
  UserPaths extends Record<string, any>,
  Ops extends OperationMap<PluginPaths>,
>(client: Client<UserPaths>, operations: Ops, prefix?: string): TypedOperations<PluginPaths, Ops> {
  const result: any = {};

  for (const [opId, opDef] of Object.entries(operations)) {
    result[opId] = (options?: any) => {
      // Compose full path at runtime
      const fullPath = prefix ? `${prefix}${opDef.path}` : opDef.path;

      // Call the client
      const clientAny = client as any;
      return clientAny[opDef.method.toUpperCase()](fullPath, options);
    };
  }

  return result;
}

// =============================================================================
// SECTION 3: Plugin Author Usage
// =============================================================================
// Location: packages/files/src/api.ts (plugin package)

// Step 1: Import generated types from plugin's canonical openapi.json
interface FilesCanonicalPaths {
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
      responses: { 200: { content: { 'application/json': { path: string; uuid: string } } } };
    };
  };
}

// Step 2: Define operations using canonical paths
const FILES_OPERATIONS = {
  listFiles: { method: 'get', path: '/files/list' },
  uploadFile: { method: 'post', path: '/files/upload' },
} as const satisfies DefineOperations<FilesCanonicalPaths>;

// Step 3: Export typed API for the plugin
export type FilesApi = TypedOperations<FilesCanonicalPaths, typeof FILES_OPERATIONS>;

// Step 4: Plugin factory function
export function filesUiPlugin<Schema>(config?: { prefix?: string }) {
  return (runtime: { client: Client<any> }) => {
    // Create operations with user's prefix
    const api = createOperations<
      FilesCanonicalPaths,
      any, // User's paths - we don't know them at plugin dev time
      typeof FILES_OPERATIONS
    >(runtime.client, FILES_OPERATIONS, config?.prefix);

    return { api };
  };
}

// =============================================================================
// VERIFICATION TESTS
// =============================================================================

function test_pluginAuthorDevelopment() {
  // Plugin author tests with their canonical types
  const devClient = {} as Client<FilesCanonicalPaths>;

  const api = createOperations<FilesCanonicalPaths, FilesCanonicalPaths, typeof FILES_OPERATIONS>(
    devClient,
    FILES_OPERATIONS,
  );

  // ✅ Full type safety
  const result1 = api.listFiles({ params: { query: { path: '/test' } } });
  type R1 = Awaited<typeof result1>; // { data?: Array<{ name: string; type: string }>; error?: any }

  const result2 = api.uploadFile({ body: { file: new Blob() } });
  type R2 = Awaited<typeof result2>; // { data?: { path: string; uuid: string }; error?: any }

  // ❌ Type errors
  const bad = api.listFiles({
    params: {
      // @ts-expect-error - invalid param
      query: { invalid: 'param' },
    },
  });
}

function test_userIntegration() {
  // User's generated types (with prefix)
  interface UserPaths {
    '/api/v1/files/list': FilesCanonicalPaths['/files/list'];
    '/api/v1/files/upload': FilesCanonicalPaths['/files/upload'];
  }

  const userClient = {} as Client<UserPaths>;

  const api = createOperations<FilesCanonicalPaths, UserPaths, typeof FILES_OPERATIONS>(
    userClient,
    FILES_OPERATIONS,
    '/api/v1/files',
  );

  // ✅ Same type safety as plugin author
  const result = api.listFiles({ params: { query: { path: '/uploads' } } });
  type R = Awaited<typeof result>; // { data?: Array<{ name: string; type: string }>; error?: any }
}

function test_reactQuery() {
  const api = {} as FilesApi;

  // React Query integration
  const queryFn = async () => {
    const { data } = await api.listFiles({ params: { query: { path: '/' } } });
    return data; // Type: Array<{ name: string; type: string }> | undefined
  };

  // useQuery({ queryKey: ['files'], queryFn })
  // → data will be inferred as Array<{ name: string; type: string }> | undefined ✅
}

// =============================================================================
// IMPLEMENTATION CHECKLIST
// =============================================================================

/**
 * TODO - @stately/schema:
 * [ ] Create packages/schema/src/api.ts
 * [ ] Add exports: PrefixPath, OperationDef, OperationMap, DefineOperations
 * [ ] Update packages/schema/src/index.ts to export from api.ts
 *
 * TODO - @stately/ui:
 * [ ] Create packages/ui/src/base/api.ts
 * [ ] Implement createOperations() function
 * [ ] Add type utilities: TypedOperations, GetOperation, GetParams, GetBody, GetResponse
 * [ ] Update packages/ui/src/base/index.ts to export from api.ts
 * [ ] Remove old operations.ts (or refactor existing code to use new system)
 *
 * TODO - Plugin authors:
 * [ ] Generate types from canonical openapi.json
 * [ ] Define OPERATIONS constant with DefineOperations<>
 * [ ] Export FilesApi type = TypedOperations<>
 * [ ] Use createOperations() in plugin factory
 *
 * TODO - Users:
 * [ ] Generate types from their openapi.json (with prefixes)
 * [ ] Pass prefix when calling plugin factory
 * [ ] Get fully typed API access via runtime.plugins.files.api
 */

/**
 * MIGRATION PATH from current system:
 *
 * 1. Introduce new api.ts alongside existing operations.ts
 * 2. Update core plugin to use new system (prove it works)
 * 3. Update files plugin to use new system
 * 4. Deprecate old operations.ts
 * 5. Update documentation
 */
