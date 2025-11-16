# Stately UI Plugin Architecture Documentation

## Overview

This folder contains comprehensive documentation of the Stately UI plugin architecture. The documentation explains how plugin components access API operations through a context-based dependency injection pattern.

## What You'll Find

Seven markdown documents totaling ~6,000 words and numerous diagrams:

1. **PLUGIN_DOCUMENTATION_INDEX.md** - Master index and navigation guide (START HERE)
2. **PLUGIN_ANALYSIS_SUMMARY.md** - Executive summary and quick answers
3. **PLUGIN_PATTERN_GUIDE.md** - Deep dive into architecture and patterns
4. **MIGRATION_EXAMPLES.md** - Before/after code examples
5. **PLUGIN_QUICK_REFERENCE.md** - Cheat sheet for quick lookup
6. **CANONICAL_PATTERN_FILES.md** - File locations and references
7. **PLUGIN_VISUAL_GUIDE.md** - ASCII diagrams and visual flows

## The Pattern in 10 Seconds

```typescript
// 1. Components call useStatelyUi() to get the runtime
const runtime = useStatelyUi();

// 2. Access the plugin's API via runtime.plugins[name].api
const api = runtime.plugins.files?.api;

// 3. Call pre-resolved operations
const { data, error } = await api.call(
  api.operations.uploadFile,
  { body: formData }
);

// 4. Handle the response
if (error) throw error;
return data;
```

That's the entire pattern. Consistent. Type-safe. Extensible.

## Why This Matters

The files plugin components currently use a broken pattern (`useFilesApi()` is commented out). This documentation shows:

- How the core plugin does it correctly
- Why the pattern works
- How to apply it to the files plugin
- Concrete before/after examples
- Type safety benefits
- Troubleshooting guide

## Quick Navigation

### I want to...

**Understand the big picture** → Read `PLUGIN_ANALYSIS_SUMMARY.md`

**See real code examples** → Read `MIGRATION_EXAMPLES.md`

**Learn every detail** → Read `PLUGIN_PATTERN_GUIDE.md`

**Find specific code** → Read `CANONICAL_PATTERN_FILES.md`

**Understand data flow** → Read `PLUGIN_VISUAL_GUIDE.md`

**Get quick snippets** → Read `PLUGIN_QUICK_REFERENCE.md`

**Navigate everything** → Read `PLUGIN_DOCUMENTATION_INDEX.md`

## Files to Update (Based on Analysis)

### High Priority
- `/packages/files/src/hooks/use-save-file.tsx` - Broken mutation hook
- `/packages/files/src/components/fields/edit/upload.tsx` - Missing API calls

### Medium Priority
- `/packages/files/src/components/views/file-explorer.tsx`
- `/packages/files/src/components/views/file-selector.tsx`
- `/packages/files/src/hooks/use-file-view.tsx`

### Low Priority
- `/packages/files/src/lib/files-api.ts` - Delete (old pattern)

## Key Insights

### Architecture Stack
```
useStatelyUi()
    ↓
StatelyUiContext (React Context)
    ↓
StatelyRuntime<Schema, Augments>
    ↓
plugins: { core: {...}, files: {...} }
    ↓
each plugin: { api: HttpBundle, utils: {...} }
    ↓
api.operations.OPERATION_NAME
    ↓
api.call(operation, options)
```

### Type Distribution
The `Augments` type parameter automatically distributes plugin types:
```typescript
// Declared
type Augments = [CoreUiAugment<Schema>, FilesUiAugment<Schema>];

// Becomes
type Plugins = {
  core: CorePluginRuntime<Schema>;
  files: FilesPluginRuntime<Schema>;
};

// Used in
const runtime = useStatelyUi<Schema, Augments>();
runtime.plugins.core.api  // ✓ Type-safe
runtime.plugins.files.api // ✓ Type-safe
```

### Plugin Factory Pattern
```typescript
export function createFilesUiPlugin<Schema>(): StatelyUiPluginFactory {
  return (runtime: StatelyRuntime<Schema>) => {
    // 1. Build HTTP bundle
    const api = createHttpBundle(
      runtime.client,
      runtime.schema.schema.document.paths,
      FILES_OPERATION_IDS
    );

    // 2. Register components
    registry.components.set(makeRegistryKey(FilesNodeType.RelativePath, 'edit'), Component);

    // 3. Create descriptor
    const descriptor: FilesPluginRuntime<Schema> = { api, utils: {...} };

    // 4. Return updated runtime
    return {
      ...runtime,
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: descriptor },
    };
  };
}
```

## Core Plugin as Reference

The core plugin (`@stately/ui/src/core/`) is the canonical example:

**Files:** `/packages/ui/src/core/operations.ts`
- Define operation ID mapping

**File:** `/packages/ui/src/core/plugin.ts`
- Create plugin factory (copy this structure)

**File:** `/packages/ui/src/core/hooks/use-entity-data.ts`
- Show hook pattern (copy this approach)

**File:** `/packages/ui/src/core/components/views/entity/entity-detail-view.tsx`
- Show component pattern (copy this approach)

## Implementation Steps

1. **Read** `PLUGIN_ANALYSIS_SUMMARY.md` (5 min)
2. **Review** `MIGRATION_EXAMPLES.md` for your components (10 min)
3. **Reference** `PLUGIN_QUICK_REFERENCE.md` while coding (ongoing)
4. **Check** `CANONICAL_PATTERN_FILES.md` for existing patterns (as needed)
5. **Consult** `PLUGIN_VISUAL_GUIDE.md` if stuck (as needed)

## Common Patterns

### In Hooks
```typescript
export function useMyHook() {
  const runtime = useStatelyUi();
  const api = runtime.plugins.files?.api;
  
  return useMutation({
    mutationFn: async (data) => {
      if (!api) throw new Error('API unavailable');
      const { data: result, error } = await api.call(
        api.operations.saveFile,
        { body: data }
      );
      if (error) throw error;
      return result;
    },
  });
}
```

### In Components
```typescript
export function MyComponent() {
  const runtime = useStatelyUi();
  const api = runtime.plugins.files?.api;
  
  if (!api) return <div>API unavailable</div>;
  
  const handleAction = async () => {
    const { data, error } = await api.call(
      api.operations.uploadFile,
      { body: formData }
    );
    // Handle response
  };
  
  return <button onClick={handleAction}>Upload</button>;
}
```

### With React Query
```typescript
const { data, isLoading, error } = useQuery({
  enabled: !!api,
  queryKey: ['files', path],
  queryFn: async () => {
    if (!api) throw new Error('API unavailable');
    const { data, error } = await api.call(
      api.operations.listFiles,
      { params: { query: { path } } }
    );
    if (error) throw error;
    return data;
  },
});
```

## Troubleshooting

**"useStatelyUi must be used within StatelyUiProvider"**
- Make sure component is within provider tree

**"Cannot read property 'api' of undefined"**
- Add null check: `if (!api) throw new Error(...)`

**"Type error: plugins.nonexistent is not assignable"**
- Plugin not in Augments array or not applied with .withPlugin()

**"Cannot find operation 'OPERATION_NAME'"**
- Check operation ID in operations.ts matches OpenAPI spec

See full troubleshooting in `PLUGIN_PATTERN_GUIDE.md`

## Next Steps

1. Start with `PLUGIN_DOCUMENTATION_INDEX.md` for navigation
2. Read `PLUGIN_ANALYSIS_SUMMARY.md` for overview
3. Review examples in `MIGRATION_EXAMPLES.md`
4. Update files following the pattern
5. Reference `PLUGIN_QUICK_REFERENCE.md` while coding
6. Consult other docs as needed

## Document Map

```
PLUGIN_DOCUMENTATION_INDEX.md
├─ Master navigation
├─ Quick start guide
└─ Links to all documents

PLUGIN_ANALYSIS_SUMMARY.md
├─ What was asked
├─ Architecture overview
├─ Current state
└─ Questions answered

PLUGIN_PATTERN_GUIDE.md
├─ Architecture stack
├─ Key components
├─ Canonical pattern
└─ Type safety benefits

MIGRATION_EXAMPLES.md
├─ Example 1: Hook
├─ Example 2: Component
├─ Example 3: Component
└─ Example 4: Custom hook

PLUGIN_QUICK_REFERENCE.md
├─ In a nutshell
├─ Access patterns
└─ Debugging tips

CANONICAL_PATTERN_FILES.md
├─ Architecture files
├─ Core plugin files
├─ Files plugin files
└─ Type hierarchy

PLUGIN_VISUAL_GUIDE.md
├─ Data flow diagram
├─ Runtime structure
├─ Component access flow
└─ Other diagrams
```

## Key Files in Codebase

### Core Plugin (Canonical Example)
- `/packages/ui/src/core/operations.ts` - Operation IDs
- `/packages/ui/src/core/plugin.ts` - Plugin factory
- `/packages/ui/src/core/hooks/use-entity-data.ts` - Hook pattern
- `/packages/ui/src/core/components/views/entity/` - Component patterns

### Files Plugin (Needs Updating)
- `/packages/files/src/operations.ts` - Operation IDs (✓ Correct)
- `/packages/files/src/plugin.ts` - Plugin factory (✓ Correct)
- `/packages/files/src/hooks/use-save-file.tsx` - Update needed
- `/packages/files/src/components/` - Update needed

### Base System
- `/packages/ui/src/base/context.tsx` - Context provider system
- `/packages/ui/src/base/runtime.ts` - Runtime builder
- `/packages/ui/src/base/plugin.ts` - Plugin types
- `/packages/ui/src/base/operations.ts` - Operation types

## Summary

The Stately UI plugin pattern is elegant and consistent:

1. **Operations** are defined as constants
2. **Plugin factories** build the HTTP bundle and register components
3. **Context providers** make the runtime available
4. **Components/hooks** call `useStatelyUi()` to access the plugin API
5. **Type safety** is automatic via TypeScript distribution

All seven documents support understanding this single pattern applied consistently across the codebase.

Start with `PLUGIN_DOCUMENTATION_INDEX.md` for complete navigation and guidance.
