# Stately Plugin System Design

## Overview

We've established a two-stage plugin system that allows extending Stately with custom node types and UI components.

## Stage 1: Schema Plugins (`@stately/schema`)

### Plugin Interface

```typescript
interface StatelySchemaPlugin<
  Nodes extends Record<string, BaseSchemaNode>,
  Extensions = {}
> {
  nodes: Nodes;        // Node type definitions (must extend BaseSchemaNode)
  extensions: Extensions;  // Validators, helpers, etc.
}
```

### Usage

```typescript
import { stately } from '@stately/schema';

const filesSchemaPlugin = {
  nodes: {
    relativePath: RelativePathNode,  // Node type definition
  },
  extensions: {
    validateRelativePath: (value: any) => { /* ... */ }
  }
};

const integration = stately(openapi, PARSED_SCHEMAS)
  .withPlugin(filesSchemaPlugin);  // ✅ Type-safe: checks RelativePath exists
  
// Result: Stately<Schemas, { validateRelativePath: Function }>
```

### Type Safety

- `ValidatePlugin` checks that plugin's node types exist in `PARSED_SCHEMAS`
- If backend doesn't have `stately-files`, calling `.withPlugin(filesSchemaPlugin)` errors
- Extensions get merged into `integration.helpers`

---

## Stage 2: UI Plugins (`@stately/ui`)

### Plugin Interface

```typescript
interface StatelyUIPlugin<
  Components extends Record<string, NodeTypeComponents>,
  Extensions = {}
> {
  components: Components;  // nodeType -> { edit, view }
  extensions: Extensions;  // Hooks, utilities, etc.
}
```

### Usage

```typescript
import { statelyUi } from '@stately/ui';

const filesUiPlugin = {
  components: {
    relativePath: {
      edit: RelativePathFieldEdit,
      view: RelativePathFieldView,
    }
  },
  extensions: {
    useSaveFile: () => { /* ... */ }
  }
};

const ui = statelyUi(integration)
  .withPlugin(filesUiPlugin);  // ✅ Type-safe: checks RelativePath exists in integration
  
// Result: StatelyUI<Integration, { useSaveFile: Function }>
```

### Component Registry

- Components are registered in a `Map<nodeType, { edit, view }>`
- Field routers check this registry before falling back to base types
- Allows plugins to provide field components for their custom node types

---

## How It Works Together

### 1. Backend (Rust)

```rust
use stately::State;
use stately_files::RelativePath;  // ← Plugin crate

#[derive(State)]
struct MyState {
    pipelines: Collection<Pipeline>,
}

struct Pipeline {
    script: RelativePath,  // ← Uses plugin type
}
```

### 2. Generated Types (utoipa → codegen)

```typescript
// openapi.json contains RelativePath schema (from stately-files)
// codegen generates:
export const PARSED_SCHEMAS = {
  Pipeline: { nodeType: 'object', ... },
  RelativePath: { nodeType: 'relativePath', ... },  // ← From plugin
};
```

### 3. User's Setup

```typescript
// Schema integration
const integration = stately(openapi, PARSED_SCHEMAS)
  .withPlugin(filesSchemaPlugin);  // Adds validators, helpers

// UI integration
const ui = statelyUi(integration)
  .withPlugin(filesUiPlugin);  // Registers components

// Provide to app
<StatelyUIProvider integration={integration} apiClient={apiClient}>
  <App />
</StatelyUIProvider>
```

### 4. Component Rendering

```typescript
// field-edit.tsx
export function FieldEdit({ node, value, onChange }) {
  const { componentRegistry } = useStatelyUI();
  
  // Check plugin components first
  const pluginComponent = componentRegistry.get(node.nodeType);
  if (pluginComponent?.edit) {
    return <pluginComponent.edit node={node} value={value} onChange={onChange} />;
  }
  
  // Fallback to base types
  switch (node.nodeType) {
    case 'primitive': return <PrimitiveField />;
    case 'object': return <ObjectField />;
    default: return <UnknownField />;
  }
}
```

---

## Type Flow

```
Rust Backend (stately + stately-files)
    ↓
OpenAPI Spec (contains RelativePath)
    ↓
Codegen (generates PARSED_SCHEMAS with RelativePath)
    ↓
StatelySchemas<{ nodes: typeof PARSED_SCHEMAS }>
    ↓
stately(...).withPlugin(filesSchemaPlugin)  ← Type checks node exists
    ↓
statelyUi(...).withPlugin(filesUiPlugin)  ← Type checks node exists
    ↓
Component registry has 'relativePath' → { edit, view }
    ↓
field-edit.tsx renders the right component
```

---

## Key Design Decisions

1. **Plugins declare node types, not strings**
   - Plugin says: "I provide RelativePathNode"
   - TypeScript checks it exists in user's schemas

2. **Two-stage registration**
   - Stage 1 (schema): Validators, helpers, type verification
   - Stage 2 (UI): Components, hooks, functionality

3. **Runtime component registry**
   - Map<nodeType, components>
   - Checked before falling back to base types

4. **Extensions merge pattern**
   - Schema extensions → `integration.helpers.validateFile()`
   - UI extensions → `ui.extensions.useSaveFile()`

5. **Type safety enforced**
   - Can't register plugin without corresponding backend support
   - TypeScript errors if types don't exist

---

## Next Steps

1. ✅ Schema plugin interface designed
2. ✅ UI plugin interface designed
3. ⏳ Update field-edit/field-view to use component registry
4. ⏳ Create example plugin (@stately/files)
5. ⏳ Handle API client injection problem
6. ⏳ Test full flow end-to-end
