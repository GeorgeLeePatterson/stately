# Plugin Architecture Pattern Guide

## Overview

The Stately UI plugin system provides a canonical pattern for how plugin components access API operations through a centralized runtime context. This guide explains the patterns demonstrated in `@stately/ui/src/core` and how to apply them to other plugins like `@stately/files`.

## The Architecture Stack

```
Component
    ↓
Hook (useEntityData, useSaveFile)
    ↓
useStatelyUi() [Context Hook]
    ↓
StatelyUiContext [React Context]
    ↓
runtime.plugins[PLUGIN_NAME].api [HttpBundle]
    ↓
OpenAPI Client (openapi-fetch)
```

## Key Components

### 1. Context Provider & Hook

**File:** `/packages/ui/src/base/context.tsx`

```typescript
// Create a provider for your app
const StatelyUiProvider = createStatelyUiProvider<MySchemas, Augments>();

// Create a typed hook for accessing the runtime
const useStatelyUi = createUseBaseStatelyUi<MySchemas, Augments>();

// In your app
<StatelyUiProvider value={runtime}>
  <App />
</StatelyUiProvider>
```

**Key Properties:**
- Stores the entire `StatelyRuntime<Schema, Augments>` in React context
- Type-safe: knows exactly which plugins are available
- Accessible from any component via `useStatelyUi()`

### 2. Plugin Runtime Descriptor

**File:** `/packages/ui/src/base/plugin.ts`

```typescript
interface PluginRuntime<Schema, Ops, Utils> {
  api?: HttpBundle<Schema, Ops>;      // API operations bundle
  utils?: PluginUtils<Utils>;         // Utility functions
}
```

**What it contains:**
- `api`: The HTTP bundle with all available operations
- `utils`: Plugin-specific utility functions

### 3. HTTP Bundle (API Operations)

**File:** `/packages/ui/src/base/operations.ts`

The `HttpBundle` provides:
```typescript
interface HttpBundle<Schema, Ops> {
  operationIndex: OperationIndex<Schema>;        // Map of operationIds to metadata
  operations: StatelyOperations<Schema, Ops>;    // Resolved operations
  call(meta, options): Promise<any>;             // Make API calls
}
```

## The Canonical Pattern

### Step 1: Define Operations

**Files Example:** `/packages/files/src/operations.ts`

```typescript
export const FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
} as const satisfies DefineOperationMap;

export type FilesOperationMap = typeof FILES_OPERATION_IDS;
```

**Key Points:**
- Map JavaScript names to OpenAPI operationIds
- Use `as const satisfies DefineOperationMap` for type safety
- Operationids must exist in the OpenAPI document

### Step 2: Create UI Plugin Factory

**Core Example:** `/packages/ui/src/core/plugin.ts`

```typescript
export type CorePluginRuntime<S> = PluginRuntime<
  S,
  CoreOperationMap,
  CorePluginUtils<S>
>;

export function coreUiPlugin<Schema, Augments>(): StatelyUiPluginFactory<Schema, Augments> {
  return (runtime: StatelyRuntime<Schema, Augments>) => {
    // Extract paths from schema
    const paths = runtime.schema.schema.document.paths;
    
    // Build HTTP bundle with operations
    const api = buildCoreHttpBundle(runtime.client, paths);

    // Register components
    registerCoreComponents(runtime.registry.components);

    // Create descriptor
    const descriptor: CorePluginRuntime<Schema> = {
      api,
      utils: {
        generateFieldLabel,
        getDefaultValue,
        getNodeTypeIcon,
      },
    };

    // Return updated runtime with plugin added
    return {
      client: runtime.client,
      plugins: { ...runtime.plugins, [CORE_PLUGIN_NAME]: descriptor },
      registry: runtime.registry,
      schema: runtime.schema,
      utils: runtime.utils,
    };
  };
}
```

**Key Points:**
- Receives the base runtime
- Builds the HTTP bundle from the OpenAPI document
- Registers components into the registry
- Returns the runtime with plugin added to `runtime.plugins[PLUGIN_NAME]`

### Step 3: Access in Hooks

**Core Example:** `/packages/ui/src/core/hooks/use-entity-data.ts`

```typescript
export function useEntityData<Schema>({
  entity,
  identifier,
  disabled,
}: {...}) {
  const runtime = useStatelyUi();                    // Get runtime from context
  const coreApi = runtime.plugins.core?.api;        // Access plugin's API bundle

  return useQuery({
    enabled: fetchEnabled,
    queryFn: async () => {
      if (!coreApi) {
        throw new Error('Core entity API is unavailable.');
      }

      const { data, error } = await coreApi.call(
        coreApi.operations.getEntityById,            // Use pre-resolved operation
        {
          params: {
            path: { entity_id: identifier },
            query: { entity_type: entity },
          },
        }
      );

      if (error) {
        throw new Error('Failed to fetch entity');
      }

      return data;
    },
    queryKey: ['entity', entity, identifier],
  });
}
```

**Key Points:**
- Call `useStatelyUi()` to get the runtime (throws if not in provider)
- Access the plugin via `runtime.plugins[PLUGIN_NAME]`
- Use `coreApi.operations.OPERATION_NAME` for pre-resolved operation metadata
- Call `coreApi.call()` with operation metadata and options

### Step 4: Access in Components

**Core Example:** `/packages/ui/src/core/components/views/entity/entity-form-edit.tsx`

```typescript
export function EntityFormEdit<Schema>({
  node,
  value,
  onChange,
  isRootEntity,
  isLoading,
}: EntityFormEditProps<Schema>) {
  const { schema, plugins } = useStatelyUi();       // Get runtime

  // Use plugin utils directly
  const label = plugins.core.utils?.generateFieldLabel(fieldName);
  
  const propertiesWithoutName = schema.plugins.core.sortEntityProperties(
    properties,
    entityData,
    required,
  );

  // Render...
}
```

**Key Points:**
- Call `useStatelyUi()` even in presentational components
- Access utils for non-API functionality: `plugins.PLUGIN_NAME.utils.FUNCTION`
- Access schema plugins: `schema.plugins.PLUGIN_NAME.FUNCTION`

## Applied to Files Plugin

### Current State (Commented Out)

**File:** `/packages/files/src/lib/files-api.ts`

The old pattern tried to create a standalone hook, but this doesn't integrate with the plugin runtime:

```typescript
// OLD PATTERN (DON'T USE)
export function useFilesApi(options?: FilesApiOptions) {
  const { client, http } = useStatelyUi();
  const operationIndex = http.operationIndex;
  
  // Manually resolving operations - wrong pattern!
  const listMeta = resolve(operationIds.list);
  
  return {
    list(args) { ... },
    save(args) { ... },
    upload(args) { ... },
  };
}
```

**Problems:**
- Duplicates operation resolution logic
- Doesn't follow the plugin descriptor pattern
- Components can't access plugin utilities
- Tight coupling between files and UI layer

### New Pattern (To Implement)

Following the core plugin pattern:

```typescript
// 1. Already defined in operations.ts
export const FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
} as const satisfies DefineOperationMap;

// 2. Plugin factory (in plugin.ts) - already implemented
export function createFilesUiPlugin<Schema>(): StatelyUiPluginFactory<Schema> {
  return (runtime: StatelyRuntime<Schema>) => {
    const paths = runtime.schema.schema.document.paths;
    const api = createHttpBundle(runtime.client, paths, FILES_OPERATION_IDS);
    
    const descriptor: FilesPluginRuntime<Schema> = { api, utils: filesUiUtils };
    
    return {
      ...runtime,
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: descriptor },
    };
  };
}

// 3. Use in hooks (NEW PATTERN - Simple and Direct)
export const useSaveFile = ({ onSuccess }: { onSuccess: (data: FileUploadResponse) => void }) => {
  return useMutation({
    mutationFn: async ({ content, filename }: { content: string; filename?: string }) => {
      const runtime = useStatelyUi();
      const filesApi = runtime.plugins.files?.api;
      
      if (!filesApi) throw new Error('Files API is unavailable');

      const { data, error } = await filesApi.call(
        filesApi.operations.saveFile,
        { body: { content, name: filename } }
      );

      if (!data || error) throw new Error('Save failed');
      return data as FileUploadResponse;
    },
    onError: error => {
      console.error('Compose save error:', error);
      toast.error('Failed to save file');
    },
    onSuccess: data => {
      toast.success('File saved successfully');
      onSuccess(data);
    },
  });
};

// 4. Use in components (NEW PATTERN - Direct and Simple)
export function UploadField({ formId, onChange, value, placeholder }: UploadFieldProps) {
  const [isPending, setIsPending] = useState(false);
  const runtime = useStatelyUi();
  const filesApi = runtime.plugins.files?.api;

  const handleFileUpload = async (file: File) => {
    if (!filesApi) {
      toast.error('Files API is unavailable');
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await filesApi.call(
        filesApi.operations.uploadFile,
        { body: formData }
      );

      if (!data || error) throw new Error('Upload failed');
      
      onChange({ dir: 'data', path: data.path });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsPending(false);
    }
  };

  // Render...
}
```

## Key Differences from Old Pattern

| Aspect | Old Pattern | New Pattern |
|--------|-----------|------------|
| **API Access** | Custom `useFilesApi()` hook | Direct `runtime.plugins.files.api` |
| **Operation Lookup** | Manual index resolution | Pre-resolved via `api.operations` |
| **Error Handling** | Custom wrapper logic | Direct use of `callOperation` |
| **Plugin Integration** | Standalone utility | Full plugin descriptor integration |
| **Type Safety** | Weak typing | Full end-to-end typing |
| **Utilities Access** | Not available | Via `plugins.PLUGIN_NAME.utils` |

## Type Safety Benefits

### 1. Plugin Runtime Types

```typescript
// Exactly one type per plugin
type CorePluginRuntime<S> = PluginRuntime<S, CoreOperationMap, CorePluginUtils<S>>;
type FilesPluginRuntime<S> = PluginRuntime<S, FilesOperationMap, FilesUiPluginUtils<S>>;

// Runtime type distribution via augments
type StatelyRuntime<S, Augments> = {
  plugins: {
    core: CorePluginRuntime<S>;
    files: FilesPluginRuntime<S>;
    // ... more plugins
  };
}
```

### 2. Operation Type Safety

```typescript
// Operations are pre-resolved with full typing
const operation = filesApi.operations.saveFile;
// type of operation = OperationMeta<Schema>
// Has: path, method, operationId

// Call with type-checked options
await filesApi.call(operation, {
  body: { content: "...", name: "..." }
});
```

### 3. Hook Type Safety

```typescript
const runtime = useStatelyUi<MySchemas, [CoreUiAugment, FilesUiAugment]>();

// Full intellisense
runtime.plugins.core.api          // ✓ Available
runtime.plugins.files.api         // ✓ Available
runtime.plugins.nonexistent.api   // ✗ Type error
```

## Component Access Patterns

### Pattern 1: Direct API Calls in Hooks

Use when you need to call the API directly (e.g., in `useMutation`):

```typescript
const { mutate } = useMutation({
  mutationFn: async (args) => {
    const runtime = useStatelyUi();
    const api = runtime.plugins.files?.api;
    if (!api) throw new Error('API unavailable');
    
    const { data, error } = await api.call(
      api.operations.saveFile,
      { body: args }
    );
    if (error) throw error;
    return data;
  },
});
```

### Pattern 2: Query Hooks for Data Fetching

Use when you need cached queries (e.g., `useQuery`):

```typescript
const useEntityData = ({ entity, identifier, disabled }) => {
  const runtime = useStatelyUi();
  const api = runtime.plugins.core?.api;

  return useQuery({
    enabled: !!identifier && !disabled && !!api,
    queryFn: async () => {
      if (!api) throw new Error('API unavailable');
      const { data, error } = await api.call(
        api.operations.getEntityById,
        { params: { path: { entity_id: identifier } } }
      );
      if (error) throw error;
      return data;
    },
    queryKey: ['entity', entity, identifier],
  });
};
```

### Pattern 3: Component Utils Access

Use when you need utility functions without API calls:

```typescript
export function MyComponent() {
  const { plugins } = useStatelyUi();
  
  // Access utility functions
  const label = plugins.core.utils?.generateFieldLabel('fieldName');
  const icon = plugins.core.utils?.getNodeTypeIcon('TypeName');
  
  return <div>{label}</div>;
}
```

### Pattern 4: Schema Plugin Access

Use when you need schema-level plugins:

```typescript
export function MyComponent() {
  const { schema } = useStatelyUi();
  
  // Access schema plugins (registered at schema layer)
  const properties = schema.plugins.core.sortEntityProperties(
    entries,
    data,
    required
  );
  
  return <div>{/* ... */}</div>;
}
```

## Implementation Checklist for Files Plugin

- [ ] **operations.ts**: Define `FILES_OPERATION_IDS` (✓ Already done)
- [ ] **plugin.ts**: Implement `createFilesUiPlugin()` (✓ Already done)
- [ ] **hooks/use-save-file.tsx**: Update to use `runtime.plugins.files.api`
- [ ] **hooks/use-file-view.tsx**: Update to use `runtime.plugins.files.api` if needed
- [ ] **components/fields/edit/upload.tsx**: Update to use `runtime.plugins.files.api`
- [ ] **components/views/file-explorer.tsx**: Update to use `runtime.plugins.files.api`
- [ ] **components/views/file-selector.tsx**: Update to use `runtime.plugins.files.api`
- [ ] **components/fields/edit/relative-path-field.tsx**: Update if needed
- [ ] **components/fields/edit/versioned-data-field.tsx**: Update if needed
- [ ] **lib/files-api.ts**: Delete or convert to documentation

## Common Pitfalls to Avoid

### 1. Using Old Hook Pattern

```typescript
// ✗ WRONG
const filesApi = useFilesApi();

// ✓ CORRECT
const runtime = useStatelyUi();
const filesApi = runtime.plugins.files?.api;
```

### 2. Forgetting Null Checks

```typescript
// ✗ WRONG
const api = runtime.plugins.files.api; // Could be undefined

// ✓ CORRECT
const api = runtime.plugins.files?.api;
if (!api) throw new Error('API unavailable');
```

### 3. Accessing Outside Provider

```typescript
// ✗ WRONG - Will throw if not in provider
function StandaloneComponent() {
  const runtime = useStatelyUi(); // ERROR!
}

// ✓ CORRECT - Always used within provider
<StatelyUiProvider value={runtime}>
  <App />
</StatelyUiProvider>
```

### 4. Manual Operation Resolution

```typescript
// ✗ WRONG - Duplicates resolution logic
const meta = http.operationIndex['save_file'];

// ✓ CORRECT - Use pre-resolved operations
const meta = api.operations.saveFile;
```

## Summary

The canonical plugin pattern is simple and consistent:

1. **Define** operation IDs in `operations.ts`
2. **Create** a plugin factory that builds the HTTP bundle and registers components
3. **Access** the plugin via `useStatelyUi()` in any component
4. **Use** `runtime.plugins.PLUGIN_NAME.api` to make API calls

This pattern ensures:
- Type safety across the entire stack
- Consistent plugin integration
- Easy component access to APIs and utilities
- Proper error handling and availability checks
- Clean separation of concerns
