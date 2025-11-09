# Stately Monorepo - File Extraction Status

## What We've Done

### ✅ Created `@stately/files` Package
- Package structure: `packages/files/`
- `package.json`, `tsconfig.json`, `tsup.config.ts` configured
- Dependencies: `@stately/schema`, `@stately/ui` (for now)

### ✅ Moved RelativePath Schema
**From `@stately/schema`:**
- Removed `NodeType.RelativePath` from enum
- Removed `RelativePathNodeRaw` interface
- Removed from `AnyNode` union
- Removed from `StatelySchemas` interface

**To `@stately/files`:**
- `src/schema.ts` - Defines `FilesNodeType.RelativePath`
- `src/schema.ts` - Defines `RelativePathNode` interface

### ✅ Moved File Components
**From `@stately/ui` to `@stately/files`:**

**Field Components:**
- `components/fields/edit/relative-path-field.tsx`
- `components/fields/view/relative-path-field.tsx`
- `components/fields/edit/upload.tsx`

**View Components:**
- `components/views/file-manager.tsx`
- `components/views/file-selector.tsx`
- `components/views/file-explorer.tsx`

**Base Components:**
- `components/base/file-entry.tsx`

**Hooks:**
- `hooks/use-save-file.tsx`
- `hooks/use-file-view.tsx`

All moved AS-IS with their xeo4 dependencies intact (errors preserved).

## Current State

### `@stately/schema` ✅
- Builds successfully
- No longer contains RelativePath
- Core types only

### `@stately/ui` ⚠️
- File-related code removed
- Will have broken imports where components referenced the moved files
- Still needs extensibility mechanism

### `@stately/files` ⚠️
- Has all file-related code
- Won't build (has xeo4-specific imports like `@/api/client`, `@/types/api`)
- Needs plugin registration mechanism

## The Core Challenge Ahead

**We've separated the code, but haven't solved the extensibility problem:**

1. **How does `@stately/files` register its `RelativePathNode` type?**
   - `@stately/schema` no longer knows about it
   - But `field-edit.tsx` and `field-view.tsx` need to handle it
   
2. **How do users compose plugins?**
   ```typescript
   // User wants:
   const ui = statelyUi(integration)
     .withPlugin(filesPlugin);
   
   // But how does filesPlugin extend:
   // - The NodeType enum?
   // - The AnyNode union?
   // - The component registry?
   ```

3. **Type safety across plugin boundaries**
   - User's `StatelySchemas` needs to include plugin node types
   - Components need to handle plugin-provided nodes
   - All while maintaining TypeScript type checking

## Next Steps

We need to design the **plugin extensibility mechanism** that allows:

1. **Schema extension** - Plugins can add new node types
2. **Component registration** - Plugins can register field components for their node types
3. **Type merging** - User's types include plugin types
4. **Runtime routing** - Field router checks plugin registry for unknown node types

This is the critical piece that makes the separation worthwhile.

## Files to Review

Key files that need the extensibility design:
- `packages/schema/src/index.ts` - Type system
- `packages/ui/src/stately-ui.ts` - Builder function
- `packages/ui/src/context/stately-ui-context.tsx` - Context
- `packages/ui/src/components/fields/field-edit.tsx` - Field router
- `packages/ui/src/components/fields/field-view.tsx` - Field router

## Notes

- We intentionally left errors in `@stately/files` to see what breaks
- The separation is physical but not yet logical
- The real work is designing how these pieces connect
