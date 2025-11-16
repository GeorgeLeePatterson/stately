# Plugin Pattern - Quick Reference

## In a Nutshell

```typescript
// 1. Define operations (operations.ts)
export const FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
} as const satisfies DefineOperationMap;

// 2. Create plugin factory (plugin.ts)
export function createFilesUiPlugin() {
  return (runtime: StatelyRuntime<Schema>) => {
    const api = createHttpBundle(
      runtime.client,
      runtime.schema.schema.document.paths,
      FILES_OPERATION_IDS
    );
    return {
      ...runtime,
      plugins: { ...runtime.plugins, files: { api, utils: {...} } },
    };
  };
}

// 3. Access in hooks/components
export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const runtime = useStatelyUi();
      const api = runtime.plugins.files?.api;
      if (!api) throw new Error('API unavailable');
      
      const { data, error } = await api.call(
        api.operations.uploadFile,
        { body: new FormData() }
      );
      if (error) throw error;
      return data;
    },
  });
}

// 4. Use the hook
const mutation = useUploadFile();
mutation.mutate(file);
```

## Access Patterns

### Get the Runtime
```typescript
const runtime = useStatelyUi();
```

### Access Plugin API
```typescript
const api = runtime.plugins.PLUGIN_NAME?.api;
if (!api) throw new Error('API unavailable');
```

### Call an Operation
```typescript
const { data, error } = await api.call(
  api.operations.OPERATION_NAME,
  { params: {...}, body: {...} }
);
```

### Access Plugin Utils
```typescript
const label = runtime.plugins.PLUGIN_NAME.utils?.functionName(args);
```

### Access Schema Utils
```typescript
const sorted = runtime.schema.plugins.PLUGIN_NAME.sortProperties(items);
```

## Key Files by Plugin

### Core Plugin
- **Definition**: `/packages/ui/src/core/plugin.ts`
- **Operations**: `/packages/ui/src/core/operations.ts`
- **Hooks**: `/packages/ui/src/core/hooks/*.ts`
- **Components**: `/packages/ui/src/core/components/**/*.tsx`

### Files Plugin
- **Definition**: `/packages/files/src/plugin.ts`
- **Operations**: `/packages/files/src/operations.ts`
- **Hooks**: `/packages/files/src/hooks/*.tsx`
- **Components**: `/packages/files/src/components/**/*.tsx`

## Operation IDs Reference

### Core Operations
```typescript
CORE_OPERATION_IDS = {
  createEntity: 'create_entity',
  deleteEntity: 'remove_entity',
  getEntityById: 'get_entity_by_id',
  listEntities: 'list_all_entities',
  listEntitiesByType: 'list_entities',
  patchEntity: 'patch_entity_by_id',
  updateEntity: 'update_entity',
}
```

### Files Operations
```typescript
FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
}
```

## Type Hierarchy

```
StatelyRuntime<Schema, Augments>
├── schema: Stately<Schema>
├── client: Client<Paths>
├── registry: { components, transformers, functions }
├── utils: { getNodeTypeIcon }
└── plugins: {
    [PluginName]: PluginRuntime {
      api?: HttpBundle { operations, call() }
      utils?: { ...functions }
    }
}
```

## Common Operations

### Fetch Data
```typescript
const { data, error } = await api.call(
  api.operations.getEntityById,
  { params: { path: { entity_id: id }, query: { entity_type: type } } }
);
```

### Create Resource
```typescript
const { data, error } = await api.call(
  api.operations.createEntity,
  { body: { data: {...} } }
);
```

### Update Resource
```typescript
const { data, error } = await api.call(
  api.operations.patchEntity,
  { params: { path: { entity_id: id } }, body: {...} }
);
```

### Delete Resource
```typescript
const { data, error } = await api.call(
  api.operations.deleteEntity,
  { params: { path: { entity_id: id } } }
);
```

### List Resources
```typescript
const { data, error } = await api.call(
  api.operations.listEntities,
  { params: { query: { entity_type: type } } }
);
```

## Debugging Tips

### Check if API is Available
```typescript
const api = runtime.plugins.files?.api;
console.log('API available:', !!api);
console.log('Operations:', api?.operations);
```

### Check Operation Metadata
```typescript
const op = api.operations.saveFile;
console.log('Operation:', {
  operationId: op.operationId,
  method: op.method,
  path: op.path,
});
```

### Log API Response
```typescript
const { data, error } = await api.call(api.operations.saveFile, {...});
console.log('Response:', { data, error });
if (error) console.error('API Error:', error);
```

### Verify Plugin Registration
```typescript
const runtime = useStatelyUi();
console.log('Available plugins:', Object.keys(runtime.plugins));
console.log('Files plugin:', runtime.plugins.files);
```

## Migration Checklist

- [ ] Remove `useFilesApi()` calls
- [ ] Replace with `useStatelyUi()` calls
- [ ] Update operation names from old format to new
- [ ] Add null checks for plugin availability
- [ ] Update error handling for API calls
- [ ] Test with React Query integration
- [ ] Verify types in IDE
- [ ] Run tests and build

## Related Documentation

- Full Pattern Guide: `/PLUGIN_PATTERN_GUIDE.md`
- Core Plugin Example: `/packages/ui/src/core/`
- Files Plugin: `/packages/files/src/`
