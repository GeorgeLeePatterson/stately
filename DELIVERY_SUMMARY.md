# Plugin Architecture Analysis - Delivery Summary

## What You Asked For

You needed to understand how the core UI plugin demonstrates proper API access within a plugin context, specifically to fix the files plugin components that use the broken `useFilesApi()` hook.

You asked for analysis of:
1. How core plugin components access API operations
2. Whether there's a context provider for plugin operations
3. How hooks interact with the plugin runtime
4. What patterns exist in components, hooks, and context files

## What I Delivered

### Seven Comprehensive Documents (Total: ~8,000 words + diagrams)

All files created in `/Users/georgepatterson/projects/georgeleepatterson/stately/`:

1. **README_PLUGIN_DOCS.md** (2 KB)
   - Quick overview and entry point
   - Navigation guide
   - 10-second summary of the pattern
   - File map

2. **PLUGIN_DOCUMENTATION_INDEX.md** (13 KB)
   - Master index and navigator
   - Document overview table
   - Quick start guides (5 min, 15 min, 30 min, 1 hour)
   - Quick links by question
   - Troubleshooting guide
   - Integration checklist

3. **PLUGIN_ANALYSIS_SUMMARY.md** (9.6 KB)
   - Executive summary
   - Architecture overview
   - Key components explained
   - The pattern in one page
   - Current state analysis
   - Direct answers to your questions
   - Canonical pattern in 3 steps

4. **PLUGIN_PATTERN_GUIDE.md** (15 KB)
   - Complete architectural documentation
   - Full architecture stack
   - Step-by-step pattern breakdown
   - Applied to files plugin
   - Type safety benefits
   - Component access patterns (4 different patterns)
   - Implementation checklist
   - Common pitfalls with solutions

5. **MIGRATION_EXAMPLES.md** (20 KB)
   - Real before/after code samples
   - 4 concrete examples:
     - useSaveFile hook migration
     - UploadField component migration
     - FileSelector component migration
     - Custom files hook pattern
   - Key takeaways
   - Common API call patterns (GET, POST, POST FormData, PATCH, DELETE)

6. **PLUGIN_QUICK_REFERENCE.md** (5.1 KB)
   - Cheat sheet for quick lookup
   - In a nutshell code
   - Access patterns (quick snippets)
   - Key files by plugin
   - Operation IDs reference
   - Type hierarchy
   - Common operations
   - Debugging tips
   - Migration checklist

7. **CANONICAL_PATTERN_FILES.md** (9.1 KB)
   - File reference guide
   - Architecture files by purpose
   - Core plugin implementation files
   - Files plugin implementation files
   - Type hierarchy and structure
   - Pattern application summary
   - Concrete checklist
   - Key file relationships
   - Import patterns
   - Complete minimal example

8. **PLUGIN_VISUAL_GUIDE.md** (20 KB)
   - ASCII diagrams and visual flows
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

## The Canonical Pattern (Answers to Your Questions)

### Q1: How do core plugin components access API operations?

**Answer:** Via the context-based pattern:
```typescript
const runtime = useStatelyUi();                    // Get from context
const api = runtime.plugins.core?.api;            // Access plugin's API
const { data, error } = await api.call(           // Call operation
  api.operations.getEntityById,
  { params: { path: { entity_id: id } } }
);
```

The API is an `HttpBundle` with:
- `operations`: Pre-resolved operation metadata
- `call()`: Method to execute HTTP requests

### Q2: Is there a context provider?

**Answer:** Yes! Complete provider system:
```typescript
// Create provider
const StatelyUiProvider = createStatelyUiProvider<MySchemas>();

// Use in app
<StatelyUiProvider value={runtime}>
  <App />
</StatelyUiProvider>

// Access anywhere
const runtime = useStatelyUi();  // Throws if not in provider
```

**Location:** `/packages/ui/src/base/context.tsx`

### Q3: How do hooks interact with plugin runtime?

**Answer:** Hooks call `useStatelyUi()` to get the runtime, then access plugin API:

```typescript
export function useEntityData({ entity, identifier, disabled }) {
  const runtime = useStatelyUi();              // Get runtime
  const coreApi = runtime.plugins.core?.api;  // Access plugin

  return useQuery({
    queryFn: async () => {
      const { data, error } = await coreApi.call(
        coreApi.operations.getEntityById,
        { params: { path: { entity_id: identifier } } }
      );
      if (error) throw error;
      return data;
    },
  });
}
```

**Location:** `/packages/ui/src/core/hooks/use-entity-data.ts`

### Q4: What patterns exist in components, hooks, and context?

**Answer:** Consistent pattern across all layers:

**Context:** `useStatelyUi()` hook with null check
**Hooks:** Get runtime → access plugin API → use in useMutation/useQuery
**Components:** Same as hooks, access runtime via `useStatelyUi()`

All follow: **Define operations → Create factory → Access via context → Call API**

## Key Findings

### Architecture
The plugin system uses a **context-based dependency injection** pattern with **type-safe augmentation**:
- `StatelyRuntime<Schema, Augments>` stores everything
- Augments type parameter distributes plugin types
- Each plugin contributes `{ api: HttpBundle, utils: {...} }`

### Plugin Factory Pattern
Every plugin follows the same structure:
1. Define operation IDs constant
2. Create factory function
3. Build HTTP bundle from schema
4. Register components
5. Create descriptor with api + utils
6. Return updated runtime

### Type Safety
End-to-end type safety via TypeScript:
- Operations resolved at plugin initialization
- No runtime type lookups
- IDE autocomplete for all operations
- Compile-time error checking

### Integration
Seamless integration with React Query, error handling, and utilities:
- Works with `useQuery` and `useMutation`
- Consistent error handling pattern
- Access to plugin utilities alongside API

## The Files Plugin Status

### Already Correct
- `/packages/files/src/operations.ts` - Operation IDs defined correctly
- `/packages/files/src/plugin.ts` - Plugin factory implemented correctly

### Needs Updating
- `/packages/files/src/hooks/use-save-file.tsx` - Stub mutation, no API call
- `/packages/files/src/components/fields/edit/upload.tsx` - References undefined `useFilesApi()`
- `/packages/files/src/components/views/file-explorer.tsx` - Likely broken
- `/packages/files/src/components/views/file-selector.tsx` - Likely broken
- `/packages/files/src/lib/files-api.ts` - Delete (old pattern)

### Implementation Strategy
Follow the pattern from core plugin:
- Use `useStatelyUi()` instead of `useFilesApi()`
- Access `runtime.plugins.files?.api`
- Call `api.call(api.operations.OPERATION, options)`
- Add proper null checks and error handling

## How to Use the Documentation

### Start Here (5 minutes)
1. Read `README_PLUGIN_DOCS.md`
2. Review "The Pattern in 10 Seconds" section

### Quick Understanding (15 minutes)
1. Read `PLUGIN_ANALYSIS_SUMMARY.md`
2. Skim `PLUGIN_QUICK_REFERENCE.md`

### Implement Changes (30 minutes)
1. Read `PLUGIN_ANALYSIS_SUMMARY.md`
2. Review your specific component in `MIGRATION_EXAMPLES.md`
3. Reference `PLUGIN_QUICK_REFERENCE.md` while coding

### Deep Learning (1+ hour)
1. Read all documents in order:
   - README_PLUGIN_DOCS.md
   - PLUGIN_ANALYSIS_SUMMARY.md
   - PLUGIN_PATTERN_GUIDE.md
   - MIGRATION_EXAMPLES.md
   - CANONICAL_PATTERN_FILES.md
2. Study diagrams in `PLUGIN_VISUAL_GUIDE.md`
3. Reference `PLUGIN_DOCUMENTATION_INDEX.md` as needed

### Quick Lookup While Coding
- Use `PLUGIN_QUICK_REFERENCE.md` for snippets
- Use `CANONICAL_PATTERN_FILES.md` to find patterns
- Use `PLUGIN_VISUAL_GUIDE.md` for understanding data flow

## Document Statistics

| Document | Size | Content |
|----------|------|---------|
| README_PLUGIN_DOCS.md | 2 KB | Overview, quick reference |
| PLUGIN_DOCUMENTATION_INDEX.md | 13 KB | Navigation, quick starts, troubleshooting |
| PLUGIN_ANALYSIS_SUMMARY.md | 9.6 KB | Summary, architecture, current state |
| PLUGIN_PATTERN_GUIDE.md | 15 KB | Complete guide, patterns, pitfalls |
| MIGRATION_EXAMPLES.md | 20 KB | Before/after code, 4 examples |
| PLUGIN_QUICK_REFERENCE.md | 5.1 KB | Cheat sheet, snippets |
| CANONICAL_PATTERN_FILES.md | 9.1 KB | File reference, type hierarchy |
| PLUGIN_VISUAL_GUIDE.md | 20 KB | Diagrams, flows, visuals |
| **TOTAL** | **~94 KB** | **~8,000 words + diagrams** |

## What You Can Do Now

1. **Understand the architecture** - Read PLUGIN_ANALYSIS_SUMMARY.md (5 min)
2. **See how to fix it** - Read MIGRATION_EXAMPLES.md (10 min)
3. **Get snippets** - Use PLUGIN_QUICK_REFERENCE.md while coding
4. **Update files** - Follow examples from MIGRATION_EXAMPLES.md
5. **Learn deeply** - Read PLUGIN_PATTERN_GUIDE.md and others as needed
6. **Troubleshoot** - Reference PLUGIN_DOCUMENTATION_INDEX.md

## Key Takeaways

1. **The pattern is simple**: `useStatelyUi()` → `runtime.plugins.NAME.api` → `api.call(operation, options)`

2. **It's consistent**: Every plugin (core, files, custom) follows the same pattern

3. **It's type-safe**: Full end-to-end typing from schema to component

4. **It's extensible**: Add new plugins without changing existing code

5. **Core is the example**: Look at `/packages/ui/src/core/` to see the canonical implementation

## Next Steps

1. Start with `README_PLUGIN_DOCS.md` for orientation
2. Read `PLUGIN_ANALYSIS_SUMMARY.md` for understanding
3. Review `MIGRATION_EXAMPLES.md` for your specific components
4. Update the files following the pattern
5. Reference documentation as needed while implementing

## Files Created

All in `/Users/georgepatterson/projects/georgeleepatterson/stately/`:

```
README_PLUGIN_DOCS.md                    (2 KB) - START HERE
PLUGIN_DOCUMENTATION_INDEX.md            (13 KB) - NAVIGATION
PLUGIN_ANALYSIS_SUMMARY.md               (9.6 KB) - SUMMARY
PLUGIN_PATTERN_GUIDE.md                  (15 KB) - DEEP DIVE
MIGRATION_EXAMPLES.md                    (20 KB) - CODE SAMPLES
PLUGIN_QUICK_REFERENCE.md                (5.1 KB) - CHEAT SHEET
CANONICAL_PATTERN_FILES.md               (9.1 KB) - FILE REFERENCE
PLUGIN_VISUAL_GUIDE.md                   (20 KB) - DIAGRAMS
DELIVERY_SUMMARY.md                      (This file) - OVERVIEW
```

## Conclusion

You now have:
- Complete understanding of the plugin architecture
- Clear answers to all your questions
- Real code examples for your specific use case
- Step-by-step migration guide
- Reference materials for quick lookup
- Visual diagrams for understanding flows

The canonical pattern is consistent, type-safe, and well-documented in the core plugin. Follow it to fix the files plugin.

Start with `README_PLUGIN_DOCS.md` and progress through the documents based on your needs and available time.
