# Plugin Architecture Analysis - Summary

## What You Asked For

You wanted to understand:
1. How core plugin components access API operations
2. Whether there's a context provider for plugin operations
3. How hooks interact with the plugin runtime
4. What patterns exist in components, hooks, and context files

## What I Found

### The Architecture

The plugin system uses a **context-based dependency injection pattern** with type-safe augmentation:

```
StatelyUiContext (React Context)
    ↓
useStatelyUi() (Hook)
    ↓
StatelyRuntime<Schema, Augments>
    ├── schema: Stately<Schema>
    ├── client: OpenAPI Client
    ├── registry: Components, Transformers, Functions
    ├── utils: Runtime utilities
    └── plugins: {
        [PluginName]: PluginRuntime {
          api: HttpBundle { operations, call() }
          utils: Plugin utilities
        }
    }
```

### Key Components

1. **Context Provider** (`/packages/ui/src/base/context.tsx`)
   - `StatelyUiContext` - Stores the entire `StatelyRuntime`
   - `StatelyUiProvider` - Wraps your app, provides context
   - `useStatelyUi()` - Retrieves runtime from context (throws if not in provider)

2. **Plugin Descriptor** (`/packages/ui/src/base/plugin.ts`)
   ```typescript
   interface PluginRuntime<Schema, Ops, Utils> {
     api?: HttpBundle<Schema, Ops>;      // API operations
     utils?: PluginUtils<Utils>;         // Plugin utilities
   }
   ```

3. **HTTP Bundle** (`/packages/ui/src/base/operations.ts`)
   ```typescript
   interface HttpBundle<Schema, Ops> {
     operationIndex: OperationIndex;     // Map of operationIds
     operations: StatelyOperations;      // Pre-resolved metadata
     call(meta, options): Promise<any>;  // Execute operation
   }
   ```

### How Core Plugin Does It

**1. Define Operations** (`operations.ts`)
```typescript
export const CORE_OPERATION_IDS = {
  createEntity: 'create_entity',
  deleteEntity: 'remove_entity',
  getEntityById: 'get_entity_by_id',
  // ...
} as const satisfies DefineOperationMap;
```

**2. Create Plugin Factory** (`plugin.ts`)
```typescript
export function coreUiPlugin<Schema>(): StatelyUiPluginFactory {
  return (runtime: StatelyRuntime<Schema>) => {
    // Build HTTP bundle
    const api = buildCoreHttpBundle(
      runtime.client,
      runtime.schema.schema.document.paths,
      CORE_OPERATION_IDS
    );

    // Register components
    registerCoreComponents(runtime.registry.components);

    // Create descriptor
    const descriptor: CorePluginRuntime<Schema> = {
      api,
      utils: { generateFieldLabel, getDefaultValue, getNodeTypeIcon },
    };

    // Return updated runtime
    return {
      ...runtime,
      plugins: { ...runtime.plugins, [CORE_PLUGIN_NAME]: descriptor },
    };
  };
}
```

**3. Use in Hooks** (`hooks/use-entity-data.ts`)
```typescript
export function useEntityData<Schema>({ entity, identifier, disabled }) {
  const runtime = useStatelyUi();              // Get runtime from context
  const coreApi = runtime.plugins.core?.api;  // Access plugin's API

  return useQuery({
    queryFn: async () => {
      const { data, error } = await coreApi.call(
        coreApi.operations.getEntityById,      // Pre-resolved operation
        { params: { path: { entity_id: identifier } } }
      );
      if (error) throw new Error('Failed to fetch entity');
      return data;
    },
    queryKey: ['entity', entity, identifier],
  });
}
```

**4. Use in Components** (`components/entity-form-edit.tsx`)
```typescript
export function EntityFormEdit<Schema>({ node, value, onChange }) {
  const { schema, plugins } = useStatelyUi();

  // Use plugin utilities
  const label = plugins.core.utils?.generateFieldLabel(fieldName);

  // Access schema plugins
  const sorted = schema.plugins.core.sortEntityProperties(
    properties,
    entityData,
    required
  );

  return <div>{/* render */}</div>;
}
```

## The Pattern in One Page

```
1. DEFINE OPERATIONS
   ├─ Create constant mapping: JS name → OpenAPI operationId
   └─ Use: as const satisfies DefineOperationMap

2. CREATE PLUGIN FACTORY
   ├─ Receive: BaseRuntime
   ├─ Build: HttpBundle from schema paths + operationIds
   ├─ Register: Components into registry
   ├─ Create: PluginRuntime descriptor { api, utils }
   └─ Return: Updated runtime with plugin added

3. PROVIDE AT APP ROOT
   ├─ Create: Runtime with schema and client
   ├─ Apply: Plugin factories via withPlugin()
   ├─ Wrap: App in StatelyUiProvider with runtime
   └─ Now: All components can access plugin

4. ACCESS IN COMPONENTS/HOOKS
   ├─ Get: runtime = useStatelyUi()
   ├─ Check: api = runtime.plugins.PLUGIN_NAME?.api
   ├─ Call: { data, error } = await api.call(api.operations.OPERATION, {...})
   └─ Use: data or throw error
```

## Why This Pattern Works

### Type Safety
- Operations are pre-resolved at plugin initialization
- No manual operation lookup needed
- IDE autocomplete for `api.operations.OPERATION_NAME`
- Type checking across entire stack

### Decoupling
- Components don't know about OpenAPI internals
- Operations are abstracted behind clean API
- Easy to mock or replace for testing
- Plugin registration is declarative

### Consistency
- Same pattern for every plugin (core, files, custom)
- Predictable access: `runtime.plugins[name].api`
- Uniform error handling
- Clear separation of concerns

### Extensibility
- Add new plugins without changing existing code
- Augments system allows type-safe plugin composition
- Schema and UI plugins work together seamlessly
- Custom utilities per plugin

## Current State of Files Plugin

### ✓ Correct
- `operations.ts` - Defines `FILES_OPERATION_IDS` correctly
- `plugin.ts` - Implements `createFilesUiPlugin()` correctly
- Plugin factory structure is correct

### ✗ Broken
- `lib/files-api.ts` - `useFilesApi()` commented out (old pattern)
- `hooks/use-save-file.tsx` - Stub mutation, no actual API call
- `components/fields/edit/upload.tsx` - References undefined `useFilesApi()`
- `components/views/file-*.tsx` - Likely also broken

### What Needs Fixing
1. Delete or document `lib/files-api.ts`
2. Update `use-save-file.tsx` to use `useStatelyUi()`
3. Update `upload.tsx` to use `runtime.plugins.files.api`
4. Update all file explorer/selector components
5. Add proper type safety with Schema generics

## Documents Provided

1. **PLUGIN_PATTERN_GUIDE.md** (2,500 lines)
   - Complete architectural explanation
   - Step-by-step pattern breakdown
   - Applied to files plugin
   - Type safety benefits
   - Component access patterns
   - Implementation checklist
   - Common pitfalls

2. **PLUGIN_QUICK_REFERENCE.md** (200 lines)
   - TL;DR version
   - Quick copy-paste patterns
   - Common operations
   - Debugging tips
   - Migration checklist

3. **MIGRATION_EXAMPLES.md** (600 lines)
   - Before/after code samples
   - Real components from the codebase
   - Concrete hooks examples
   - Custom hook patterns
   - API call patterns

## Next Steps

To fix the files plugin:

1. **Update `use-save-file.tsx`**
   - Replace commented `useFilesApi()` with `useStatelyUi()`
   - Access `runtime.plugins.files?.api`
   - Call `api.call(api.operations.saveFile, {...})`

2. **Update `upload.tsx`**
   - Same pattern: `useStatelyUi()` → `runtime.plugins.files?.api`
   - Call `api.call(api.operations.uploadFile, {...})`
   - Add proper error handling

3. **Update file explorer/selector components**
   - Use `useQuery` with `useStatelyUi()` pattern
   - Call `api.operations.listFiles` for listings
   - Add availability checks

4. **Delete `lib/files-api.ts`**
   - No longer needed
   - Pattern is now direct via `runtime.plugins.files.api`

5. **Run tests**
   - Verify API calls work
   - Check error handling
   - Test type checking

## Key Insights

### The Core Truth
Components don't call API functions directly. Instead:
1. The plugin factory builds the HTTP bundle upfront
2. The bundle is stored in the runtime descriptor
3. The runtime is provided via React context
4. Components retrieve it via `useStatelyUi()` and access `runtime.plugins[name].api`

### Why Not useFilesApi()?
The old pattern created a separate hook that:
- Duplicated operation resolution logic
- Didn't integrate with plugin system
- Couldn't access plugin utilities
- Made testing harder
- Lost type information

The new pattern:
- Integrates seamlessly with plugin system
- Reuses operation resolution from factory
- Provides access to utilities
- Easier to test and mock
- Full type safety

### The Magic of Augments
The `Augments` type parameter allows:
```typescript
type Augments = [CoreUiAugment<Schema>, FilesUiAugment<Schema>];

type Runtime = StatelyRuntime<Schema, Augments>;
// runtime.plugins = {
//   core: CorePluginRuntime<Schema>,
//   files: FilesPluginRuntime<Schema>
// }
```

TypeScript distributes the augments into a type-safe plugin map automatically.

## Questions Answered

**Q: How do core plugin components access API operations?**
A: Via `useStatelyUi()` → `runtime.plugins.core.api.call(api.operations.OPERATION, ...)`

**Q: Is there a context provider?**
A: Yes! `StatelyUiContext` + `StatelyUiProvider` + `useStatelyUi()` hook

**Q: How do hooks interact with plugin runtime?**
A: They call `useStatelyUi()` to get the runtime, then access `plugins[name].api` for operations

**Q: What patterns exist?**
A: Context provider → Plugin factory → Hook → Component. Consistent across all plugins.

## Canonical Pattern in 3 Steps

```typescript
// 1. In your hook/component
const runtime = useStatelyUi();
const api = runtime.plugins.files?.api;

// 2. Call operation
const { data, error } = await api.call(
  api.operations.saveFile,
  { body: {...} }
);

// 3. Handle response
if (error) throw error;
return data;
```

That's it. Same pattern for every plugin operation.
