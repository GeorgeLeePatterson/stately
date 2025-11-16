# Canonical Plugin Pattern - File Reference Guide

## Architecture Files by Purpose

### Context & Runtime System

#### Core Context Setup
**File:** `/packages/ui/src/base/context.tsx`
- `StatelyUiContext` - React context storing the runtime
- `createStatelyUiProvider()` - Creates typed provider component
- `createUseBaseStatelyUi()` - Creates typed hook
- `StatelyUiProvider` - Default untyped provider
- **Usage:** `useStatelyUi()` in any component within provider

**File:** `/packages/ui/src/context.tsx`
- `createUseStatelyUi()` - App-level hook creator
- Combines core plugin with custom augments
- **Usage:** `export const useStatelyUi = createUseStatelyUi<Schemas>()`

---

### Runtime & Plugin Types

**File:** `/packages/ui/src/base/runtime.ts`
- `StatelyRuntime<Schema, Augments>` - Main runtime interface
- `StatelyUiBuilder<Schema, Augments>` - Fluent builder API
- `createStatelyUi<Schema, Augments>(schema, client)` - Runtime builder
- **Pattern:** `statelyUi.withPlugin(coreUiPlugin).withPlugin(filesUiPlugin)`

**File:** `/packages/ui/src/base/plugin.ts`
- `PluginRuntime<Schema, Ops, Utils>` - Plugin descriptor interface
- `UiPluginAugment<Name, Schema, Ops, Utils>` - Plugin augment type
- `MergeUiAugments<Schema, Augments>` - Type distribution helper
- `AugmentPlugins<Schema, Augments>` - Merged plugin map type
- **Usage:** Define plugin types, implement augments

---

### HTTP Operations

**File:** `/packages/ui/src/base/operations.ts`
- `DefineOperationMap` - Type for operation ID mapping
- `OperationMeta<Schema>` - Operation metadata interface
- `HttpBundle<Schema, Ops>` - API operations bundle
- `buildOperationIndex()` - Creates operation lookup
- `buildStatelyOperations()` - Resolves operation metadata
- `createHttpBundle()` - Creates complete bundle
- `callOperation()` - Executes HTTP operation
- **Pattern:** Used by all plugin factories to build API

---

## Core Plugin Implementation

### Core Plugin Files

**File:** `/packages/ui/src/core/operations.ts`
```
CORE_OPERATION_IDS constant definition
├─ createEntity: 'create_entity'
├─ deleteEntity: 'remove_entity'
├─ getEntityById: 'get_entity_by_id'
├─ listEntities: 'list_all_entities'
├─ listEntitiesByType: 'list_entities'
├─ patchEntity: 'patch_entity_by_id'
└─ updateEntity: 'update_entity'
```

**File:** `/packages/ui/src/core/plugin.ts`
```
PLUGIN FACTORY - The canonical example!

Types defined:
├─ CorePluginRuntime<S>
├─ CoreUiAugment<S>
├─ CorePluginName
├─ CorePluginUtils<S>
└─ CoreNodeType

Functions:
├─ coreUiPlugin<Schema, Augments>()
│  ├─ Receives: StatelyRuntime<Schema, Augments>
│  ├─ Builds: HttpBundle via buildCoreHttpBundle()
│  ├─ Registers: Components via registerCoreComponents()
│  ├─ Creates: CorePluginRuntime descriptor
│  └─ Returns: Updated runtime with core plugin added
└─ registerCoreComponents(registry)
   └─ Maps node types to field components
```

**File:** `/packages/ui/src/core/index.ts`
```
Exports all core plugin types and utilities:
├─ useStatelyUi = createUseStatelyUi<Schemas>()
├─ CORE_OPERATION_IDS constant
├─ coreUiPlugin (factory)
├─ Core type exports (CoreObjectNode, CoreEntity, etc.)
└─ Utility exports (generateFieldLabel, getNodeTypeIcon, etc.)
```

### Core Plugin Hooks

**File:** `/packages/ui/src/core/hooks/use-entity-data.ts`
```
CANONICAL HOOK PATTERN
├─ Gets runtime: const runtime = useStatelyUi()
├─ Accesses API: const coreApi = runtime.plugins.core?.api
├─ Uses in useQuery:
│  └─ await coreApi.call(coreApi.operations.getEntityById, {...})
└─ Returns: TanStack Query result
```

**File:** `/packages/ui/src/core/hooks/use-edit-entity-data.tsx`
- Wraps `useEntityData` for edit workflows
- Adds UI state management (editEntity, editNote)

**File:** `/packages/ui/src/core/hooks/use-entity-schema.ts`
- Resolves entity schema from cache
- Returns typed schema or error

**File:** `/packages/ui/src/core/hooks/use-object-field.tsx`
- Manages object field interactions

### Core Plugin Components

**File:** `/packages/ui/src/core/components/views/entity/entity-detail-view.tsx`
```
CANONICAL COMPONENT PATTERN
├─ Gets runtime: const { schema } = useStatelyUi()
├─ Uses utilities: schema.plugins.core.sortEntityProperties()
├─ Renders fields: <FieldView node={schema} value={data} />
└─ Type-safe: Fully typed with <Schema extends Schemas>
```

**File:** `/packages/ui/src/core/components/views/entity/entity-form-edit.tsx`
```
ACCESS PATTERN
├─ Hook: const { schema, plugins } = useStatelyUi()
├─ Utils: plugins.core.utils?.generateFieldLabel(fieldName)
├─ Schema: schema.plugins.core.sortEntityProperties(...)
└─ Children: FieldEdit components for each property
```

**File:** `/packages/ui/src/core/components/views/entity/entity-edit-view.tsx`
- Coordinator component
- Routes between Form, JSON, and Wizard edit modes

**File:** `/packages/ui/src/core/components/views/link/link-detail-view.tsx`
```
API CALL PATTERN in Component
├─ Hook: useEntityData<Schema>({ entity, identifier })
│  └─ Internally uses runtime.plugins.core.api
├─ Renders: LinkRefView or LinkInlineView
└─ Lazy loads: Referenced entities via API
```

**File:** `/packages/ui/src/core/components/fields/`
- `edit/` - Edit mode field components
  - `array-field.tsx`, `enum-field.tsx`, `map-field.tsx`, etc.
- `view/` - View mode field components
  - Mirror structure of edit fields

---

## Files Plugin Implementation

### Files Plugin Files

**File:** `/packages/files/src/operations.ts`
```
OPERATION IDS DEFINITION
export const FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
} as const satisfies DefineOperationMap;

export type FilesOperationMap = typeof FILES_OPERATION_IDS;
```

**File:** `/packages/files/src/plugin.ts`
```
PLUGIN FACTORY - Following canonical pattern

Schema Plugin:
├─ FILES_PLUGIN_NAME constant
├─ FilesUtils type definition
├─ filesUtils implementation
└─ filesSchemaPlugin factory

UI Plugin:
├─ FilesUiPluginUtils type
├─ filesUiUtils implementation
├─ FilesPluginRuntime<S> type
├─ FilesUiPlugin<S> type
└─ createFilesUiPlugin<Schema, Augments>()
   ├─ Receives: StatelyRuntime<Schema, Augments>
   ├─ Builds: HttpBundle via createHttpBundle()
   ├─ Registers: Components (RelativePath edit/view)
   ├─ Creates: FilesPluginRuntime descriptor
   └─ Returns: Updated runtime with files plugin added
```

### Files Plugin Hooks (To Be Updated)

**File:** `/packages/files/src/hooks/use-save-file.tsx`
```
SHOULD BE UPDATED TO:
├─ Get runtime: const runtime = useStatelyUi<Schema>()
├─ Access API: const api = runtime.plugins.files?.api
├─ In mutation: const { data, error } = await api.call(...)
└─ Check error: if (error) throw error
```

**File:** `/packages/files/src/hooks/use-file-view.tsx`
- List files via API
- Cache results with TanStack Query

### Files Plugin Components (To Be Updated)

**File:** `/packages/files/src/components/fields/edit/upload.tsx`
```
SHOULD BE UPDATED TO:
├─ Get runtime: const runtime = useStatelyUi<Schema>()
├─ Access API: const filesApi = runtime.plugins.files?.api
├─ Check: if (!filesApi) throw Error
├─ Call: await filesApi.call(filesApi.operations.uploadFile, {...})
└─ Handle: Response with proper error checking
```

**File:** `/packages/files/src/components/fields/edit/relative-path-field.tsx`
- Edit relative path field
- May use file API for validation

**File:** `/packages/files/src/components/fields/edit/versioned-data-field.tsx`
- Edit versioned data field
- May list versions via API

**File:** `/packages/files/src/components/fields/view/relative-path-field.tsx`
- View relative path
- Display file information

**File:** `/packages/files/src/components/views/file-explorer.tsx`
```
EXPLORER VIEW
├─ List files: useEntityData or useQuery
├─ Call: filesApi.call(filesApi.operations.listFiles, {...})
├─ Display: File tree/list structure
└─ Interact: Select, navigate, preview
```

**File:** `/packages/files/src/components/views/file-selector.tsx`
```
SELECTOR VIEW
├─ Similar to explorer
├─ Used for file selection dialogs
└─ Emit: Selected path to parent
```

**File:** `/packages/files/src/components/views/file-manager.tsx`
- Combined upload, list, and navigation

**File:** `/packages/files/src/components/base/file-entry.tsx`
- Individual file/directory item
- Display icon, name, metadata

**File:** `/packages/files/src/components/dialogs/file-browser-dialog.tsx`
- Modal dialog for file browsing
- Wraps file-selector

---

## Type Hierarchy

```
/packages/ui/src/base/
├── context.tsx (StatelyUiContext, Provider, Hook)
├── runtime.ts (StatelyRuntime, StatelyUiBuilder)
├── plugin.ts (PluginRuntime, UiPluginAugment, Augments)
└── operations.ts (HttpBundle, buildOperationIndex, etc.)

/packages/ui/src/
├── context.tsx (createUseStatelyUi - app level)
├── index.ts (Top-level exports)
└── core/ (Core plugin implementation)
    ├── index.ts (useStatelyUi export)
    ├── operations.ts (CORE_OPERATION_IDS)
    ├── plugin.ts (coreUiPlugin factory)
    ├── utils.tsx (Utilities)
    ├── hooks/ (use-entity-data, etc.)
    └── components/ (Field and view components)

/packages/files/src/
├── operations.ts (FILES_OPERATION_IDS)
├── plugin.ts (createFilesUiPlugin factory)
├── hooks/ (use-save-file, use-file-view)
├── components/ (File fields and views)
└── types/api.ts (FileUploadResponse, etc.)
```

---

## Pattern Application Summary

### How to Use Core as Reference

1. **Operation Definition** → Copy from `/packages/ui/src/core/operations.ts`
   - Pattern: Constant map + Type export

2. **Plugin Factory** → Copy from `/packages/ui/src/core/plugin.ts`
   - Pattern: Factory function receiving runtime
   - Returns runtime with plugin added

3. **Hook Usage** → Copy from `/packages/ui/src/core/hooks/use-entity-data.ts`
   - Pattern: `useStatelyUi()` → access `runtime.plugins.NAME.api`

4. **Component Usage** → Copy from `/packages/ui/src/core/components/`
   - Pattern: Same as hooks, access via `useStatelyUi()`

### Concrete Checklist

- [ ] Review `/packages/ui/src/core/plugin.ts` (plugin factory pattern)
- [ ] Review `/packages/ui/src/core/hooks/use-entity-data.ts` (hook pattern)
- [ ] Review `/packages/ui/src/core/components/views/entity/entity-detail-view.tsx` (component pattern)
- [ ] Update `/packages/files/src/hooks/use-save-file.tsx` (follow hook pattern)
- [ ] Update `/packages/files/src/components/fields/edit/upload.tsx` (follow component pattern)
- [ ] Update `/packages/files/src/components/views/file-*.tsx` (follow component pattern)
- [ ] Delete or archive `/packages/files/src/lib/files-api.ts` (old pattern)

---

## Key File Relationships

```
StatelyUiProvider wraps app
    ↓
provides StatelyRuntime (from context.tsx)
    ↓
contains plugins = { core, files, ... }
    ↓
each plugin has { api: HttpBundle, utils: ... }
    ↓
useStatelyUi() hook retrieves runtime
    ↓
Components/Hooks call:
  const api = runtime.plugins.PLUGIN_NAME.api
  await api.call(api.operations.OPERATION, options)
```

---

## Import Patterns

### In Core Components
```typescript
import { useStatelyUi } from '@/core';
// or
import { useStatelyUi } from '@stately/ui';

// Then:
const runtime = useStatelyUi<MySchema>();
const coreApi = runtime.plugins.core?.api;
```

### In Files Components
```typescript
import { useStatelyUi } from '@stately/ui';

// Then:
const runtime = useStatelyUi<MySchema>();
const filesApi = runtime.plugins.files?.api;
```

### In Hooks
```typescript
import { useStatelyUi } from '@stately/ui';
import { useQuery, useMutation } from '@tanstack/react-query';

// Then use in useQuery/useMutation callbacks
```

---

## Complete Minimal Example

```typescript
// In app setup
import { createStatelyUi } from '@stately/ui';
import { coreUiPlugin } from '@stately/ui/core';
import { createFilesUiPlugin } from '@stately/files';

const runtime = createStatelyUi<MySchemas>(schema, client)
  .withPlugin(coreUiPlugin())
  .withPlugin(createFilesUiPlugin());

<StatelyUiProvider value={runtime}>
  <App />
</StatelyUiProvider>

// In any component
export function MyComponent() {
  const runtime = useStatelyUi<MySchemas>();
  
  // Access core API
  const { data } = await runtime.plugins.core?.api?.call(
    runtime.plugins.core.api.operations.getEntityById,
    { params: { path: { entity_id: 'id' } } }
  );
  
  // Access files API
  const { data: file } = await runtime.plugins.files?.api?.call(
    runtime.plugins.files.api.operations.saveFile,
    { body: { content: 'text' } }
  );
  
  return <div>{/* render */}</div>;
}
```

That's the entire pattern!
