# Plugin Architecture Documentation - Complete Index

## Documents Overview

This folder contains a complete analysis of the Stately UI plugin architecture pattern. Five complementary documents provide different perspectives and detail levels.

### 1. **PLUGIN_ANALYSIS_SUMMARY.md** - Start Here!
**Purpose:** Executive overview and quick answers
**Length:** ~1,500 words
**Best for:** Getting oriented, understanding the big picture

**Contains:**
- What was asked and what was found
- Architecture overview
- Key components explanation
- The pattern in one page
- Current state of files plugin
- Questions answered
- Canonical pattern in 3 steps

**Read this first if you want:** Quick understanding of the entire system

---

### 2. **PLUGIN_PATTERN_GUIDE.md** - Deep Dive
**Purpose:** Comprehensive architectural documentation
**Length:** ~2,500 words
**Best for:** Understanding every detail and nuance

**Contains:**
- Full architecture stack breakdown
- All key components explained with code
- The canonical pattern step-by-step
- How to apply to files plugin
- Type safety benefits
- Component access patterns
- Implementation checklist
- Common pitfalls

**Read this if you want:** Complete understanding of how everything works together

---

### 3. **MIGRATION_EXAMPLES.md** - Code Examples
**Purpose:** Real before/after code samples
**Length:** ~600 words
**Best for:** Seeing exactly what changes are needed

**Contains:**
- Example 1: useSaveFile hook migration
- Example 2: UploadField component migration  
- Example 3: FileSelector component migration
- Example 4: Creating custom files hook
- Key takeaways
- Common API call patterns

**Read this if you want:** To see exactly how to update your code

---

### 4. **PLUGIN_QUICK_REFERENCE.md** - Cheat Sheet
**Purpose:** Copy-paste quick reference
**Length:** ~200 words
**Best for:** Quick lookup while coding

**Contains:**
- In a nutshell code
- Access patterns (quick snippets)
- Key files by plugin
- Operation IDs reference
- Type hierarchy
- Common operations
- Debugging tips
- Migration checklist

**Read this if you want:** Quick snippets to copy while implementing

---

### 5. **CANONICAL_PATTERN_FILES.md** - File Reference
**Purpose:** Map of all relevant files in the codebase
**Length:** ~600 words
**Best for:** Finding where things are defined

**Contains:**
- Architecture files by purpose
- Core plugin implementation files
- Files plugin implementation files
- Type hierarchy and structure
- Pattern application summary
- Concrete checklist
- Key file relationships
- Import patterns
- Complete minimal example

**Read this if you want:** To understand where code lives and how files relate

---

### 6. **PLUGIN_VISUAL_GUIDE.md** - Diagrams
**Purpose:** Visual representations of architecture
**Length:** ~300 words + ASCII diagrams
**Best for:** Visual learners, understanding flow

**Contains:**
- Data flow diagram
- Runtime structure diagram
- Component access flow
- Plugin factory pattern diagram
- Type distribution diagram
- Hook pattern diagram
- Component pattern diagram
- Old vs new pattern comparison
- Error handling flow
- State management diagram
- Type safety chain
- Complete usage timeline
- Summary flowchart

**Read this if you want:** Visual understanding of architecture and flows

---

## Quick Start Guide

### If you have 5 minutes:
Read **PLUGIN_ANALYSIS_SUMMARY.md** → Understand the big picture

### If you have 15 minutes:
1. Read **PLUGIN_ANALYSIS_SUMMARY.md**
2. Skim **PLUGIN_QUICK_REFERENCE.md**
3. Look at diagrams in **PLUGIN_VISUAL_GUIDE.md**

### If you have 30 minutes:
1. Read **PLUGIN_ANALYSIS_SUMMARY.md**
2. Read **PLUGIN_PATTERN_GUIDE.md**
3. Review code examples in **MIGRATION_EXAMPLES.md**

### If you have 1 hour (Deep dive):
1. Read **PLUGIN_ANALYSIS_SUMMARY.md**
2. Read **PLUGIN_PATTERN_GUIDE.md**
3. Study **CANONICAL_PATTERN_FILES.md**
4. Review **MIGRATION_EXAMPLES.md**
5. Look at **PLUGIN_VISUAL_GUIDE.md**

### If you're ready to implement:
1. Review **MIGRATION_EXAMPLES.md** for your specific component
2. Reference **PLUGIN_QUICK_REFERENCE.md** for snippets
3. Use **CANONICAL_PATTERN_FILES.md** to find existing patterns
4. Check **PLUGIN_VISUAL_GUIDE.md** if stuck

---

## Document Quick Links

| Question | Document | Section |
|----------|----------|---------|
| What's the pattern? | SUMMARY | Canonical Pattern in 3 Steps |
| How does it work? | GUIDE | The Canonical Pattern |
| Show me code | EXAMPLES | All 4 examples |
| Quick reference | QUICK_REFERENCE | All sections |
| Where's the code? | FILES | Architecture Files by Purpose |
| How does data flow? | VISUAL_GUIDE | Data Flow Diagram |
| Which files do I change? | FILES | Files Plugin Implementation |
| What's broken? | SUMMARY | Current State of Files Plugin |
| How do I fix it? | EXAMPLES | Before/After sections |
| How do I test it? | GUIDE | Common Pitfalls to Avoid |

---

## The One-Page Pattern

If you just need the essence:

```typescript
// 1. DEFINE OPERATIONS
export const FILES_OPERATION_IDS = {
  listFiles: 'list_files',
  saveFile: 'save_file',
  uploadFile: 'upload_file',
} as const satisfies DefineOperationMap;

// 2. CREATE PLUGIN FACTORY
export function createFilesUiPlugin<Schema>(): StatelyUiPluginFactory {
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

// 3. ACCESS IN HOOK/COMPONENT
export function useSaveFile() {
  return useMutation({
    mutationFn: async (data) => {
      const runtime = useStatelyUi();
      const api = runtime.plugins.files?.api;
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

// Done! That's the entire pattern.
```

---

## Files to Update

Based on the analysis, these files need to be updated:

### High Priority
- [ ] `/packages/files/src/hooks/use-save-file.tsx` - Update to new pattern
- [ ] `/packages/files/src/components/fields/edit/upload.tsx` - Update to new pattern

### Medium Priority  
- [ ] `/packages/files/src/components/views/file-explorer.tsx` - Update to new pattern
- [ ] `/packages/files/src/components/views/file-selector.tsx` - Update to new pattern
- [ ] `/packages/files/src/hooks/use-file-view.tsx` - Update if using old pattern

### Low Priority
- [ ] `/packages/files/src/components/fields/edit/relative-path-field.tsx` - Update if needed
- [ ] `/packages/files/src/components/fields/edit/versioned-data-field.tsx` - Update if needed
- [ ] `/packages/files/src/lib/files-api.ts` - Delete (old pattern)

---

## Understanding the Architecture Layers

### Layer 1: Type System (Most Abstract)
- `DefineOperationMap` - Operation ID mapping type
- `UiPluginAugment<Name, Schema, Ops, Utils>` - Plugin augment type
- `PluginRuntime<Schema, Ops, Utils>` - Runtime descriptor type

**Files:** `/packages/ui/src/base/plugin.ts`, `/packages/ui/src/base/operations.ts`

### Layer 2: Runtime System
- `StatelyRuntime<Schema, Augments>` - Complete runtime
- `StatelyUiBuilder` - Builder API
- `createStatelyUi()` - Runtime factory

**Files:** `/packages/ui/src/base/runtime.ts`

### Layer 3: Context System
- `StatelyUiContext` - React context
- `StatelyUiProvider` - Context provider
- `useStatelyUi()` - Hook to access runtime

**Files:** `/packages/ui/src/base/context.tsx`, `/packages/ui/src/context.tsx`

### Layer 4: Plugin Implementation
- Operation IDs constants
- Plugin factory function
- Components registration
- Utils implementation

**Files:** `/packages/ui/src/core/`, `/packages/files/src/`

### Layer 5: Component Usage
- Hooks using `useStatelyUi()`
- Components accessing `runtime.plugins[name].api`
- Making API calls with `api.call()`

**Files:** `/packages/ui/src/core/hooks/`, `/packages/ui/src/core/components/`

---

## Common Questions Answered

### Q: Where do I get the runtime?
**A:** Call `useStatelyUi()` in any component within the provider tree.
See: QUICK_REFERENCE.md → "In a Nutshell"

### Q: How do I call an API operation?
**A:** `await runtime.plugins.PLUGIN_NAME.api.call(api.operations.OPERATION, options)`
See: QUICK_REFERENCE.md → "Call an Operation"

### Q: What if the API is unavailable?
**A:** Check `if (!api) throw Error(...)` before using it.
See: GUIDE.md → "Common Pitfalls to Avoid"

### Q: How do I access plugin utilities?
**A:** `runtime.plugins.PLUGIN_NAME.utils?.functionName()`
See: PATTERN_GUIDE.md → "Component Access Patterns"

### Q: What's the difference from the old useFilesApi()?
**A:** Old pattern duplicated operation lookup; new pattern reuses plugin system.
See: GUIDE.md → "The Canonical Pattern"

### Q: How do I integrate with React Query?
**A:** Use `useQuery` with `queryFn: async () => api.call(...)`
See: EXAMPLES.md → "Pattern 2: Query Hooks for Data Fetching"

### Q: What files do I need to update?
**A:** See "Files to Update" section above or SUMMARY.md → "Current State of Files Plugin"

### Q: Where is operation mapping done?
**A:** In `operations.ts` with `OPERATION_IDS` constant.
See: FILES.md → "Core Plugin Files"

### Q: How are components registered?
**A:** In plugin factory via `registry.components.set(key, Component)`.
See: PATTERN_GUIDE.md → "Step 2: Create UI Plugin Factory"

### Q: Can I create custom API wrappers?
**A:** Yes, wrap `useStatelyUi()` calls in custom hooks.
See: EXAMPLES.md → "Example 4: Creating a Custom Files Hook"

---

## Real-World Examples in Codebase

### Core Plugin Examples
- **Operations:** `/packages/ui/src/core/operations.ts` (CORE_OPERATION_IDS)
- **Factory:** `/packages/ui/src/core/plugin.ts` (coreUiPlugin)
- **Hook:** `/packages/ui/src/core/hooks/use-entity-data.ts`
- **Component:** `/packages/ui/src/core/components/views/entity/entity-detail-view.tsx`
- **Complex Hook:** `/packages/ui/src/core/hooks/use-edit-entity-data.tsx`

### Files Plugin Examples
- **Operations:** `/packages/files/src/operations.ts` (FILES_OPERATION_IDS)
- **Factory:** `/packages/files/src/plugin.ts` (createFilesUiPlugin)
- **Hook:** `/packages/files/src/hooks/use-save-file.tsx` (needs update)
- **Component:** `/packages/files/src/components/fields/edit/upload.tsx` (needs update)

---

## Key Insights from Analysis

1. **The Pattern is Consistent**
   - Every plugin follows the same structure
   - Different operations, same access pattern
   - Type-safe from ground up

2. **Context is Central**
   - Runtime is stored in React context
   - Any component can access it
   - No prop drilling needed

3. **Operations are Pre-resolved**
   - Plugin factory does resolution once
   - Components just use `api.operations.NAME`
   - No runtime lookup needed

4. **Type Safety is End-to-End**
   - Schema types → Runtime types → Plugin types → Component types
   - IDE intellisense at every step
   - Compile-time error checking

5. **Extensibility via Augments**
   - Plugins declared upfront via Augments type
   - Type system automatically distributes plugin types
   - Composition works with type safety

6. **Integration is Seamless**
   - Hooks use same pattern as components
   - React Query integrates naturally
   - Error handling is consistent

---

## Troubleshooting Guide

### Issue: "useStatelyUi must be used within StatelyUiProvider"
**Solution:** Wrap your app with `<StatelyUiProvider value={runtime}>`
See: GUIDE.md → "Common Pitfalls to Avoid"

### Issue: "Cannot read property 'api' of undefined"
**Solution:** Add null check: `const api = runtime.plugins.files?.api; if (!api) throw Error(...)`
See: QUICK_REFERENCE.md → "Verify Plugin Registration"

### Issue: "Cannot find operation 'OPERATION_NAME'"
**Solution:** Check operation ID in `operations.ts` matches OpenAPI document
See: FILES.md → "Operation IDs Reference"

### Issue: "Type error: plugins.nonexistent is not assignable"
**Solution:** Plugin not in Augments array or not applied with .withPlugin()
See: PATTERN_GUIDE.md → "Type Safety Benefits"

### Issue: API calls not working
**Solution:** Check operation metadata, request format, error response
See: QUICK_REFERENCE.md → "Debugging Tips"

### Issue: Components can't access API
**Solution:** Make sure component is within StatelyUiProvider tree
See: GUIDE.md → "Step 3: Access in Hooks"

---

## Integration Checklist

- [ ] Read PLUGIN_ANALYSIS_SUMMARY.md
- [ ] Review MIGRATION_EXAMPLES.md for your components
- [ ] Check CANONICAL_PATTERN_FILES.md for file locations
- [ ] Update use-save-file.tsx
- [ ] Update upload.tsx
- [ ] Update file-explorer.tsx
- [ ] Update file-selector.tsx
- [ ] Delete lib/files-api.ts
- [ ] Run tests
- [ ] Check TypeScript compilation
- [ ] Verify IDE intellisense works
- [ ] Test API calls in browser

---

## Summary

This documentation package provides a complete understanding of the Stately UI plugin architecture:

1. **SUMMARY** - Overview and answers
2. **GUIDE** - Complete explanation
3. **EXAMPLES** - Real code samples
4. **QUICK_REFERENCE** - Fast lookup
5. **FILES** - Codebase map
6. **VISUAL_GUIDE** - Diagrams and flows
7. **INDEX** - This document

Each document complements the others. Start with SUMMARY, then read others as needed.

The canonical pattern is: **Define operations → Create factory → Access via context → Call API**

All five documents support understanding this single, consistent pattern used across the entire codebase.
