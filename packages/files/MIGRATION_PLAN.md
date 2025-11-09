# @stately/files Migration Plan

## Files Identified for Extraction

### From @stately/schema
- `RelativePathNode` type definition
- `NodeType.RelativePath` enum value

### From @stately/ui

#### Field Components
1. `components/fields/edit/relative-path-field.tsx` - **COMPLEX, xeo4-specific**
2. `components/fields/view/relative-path-field.tsx` - Simple view
3. `components/fields/edit/upload.tsx` - Upload widget

#### File Management Views
4. `components/views/files/file-manager.tsx` - Full file manager UI
5. `components/views/files/file-selector.tsx` - File picker
6. `components/views/files/file-explorer.tsx` - File browser

#### Base Components
7. `components/base/file-entry.tsx` - Single file display

#### Hooks
8. `hooks/use-file-view.tsx` - File viewing
9. `hooks/use-save-file.tsx` - File upload/save

## Dependency Analysis

### `relative-path-field.tsx` Dependencies:
- `@/api/client` - Uses `api.POST('/api/v1/files/save')` ❌ xeo4-specific
- `@/types/api` - Uses `FileUploadResponse` type ❌ xeo4-specific
- `@/components/ui/*` - Uses shadcn components ✅ Can depend on
- `@/hooks/use-save-file` - Uses file save hook ❌ Also xeo4-specific
- `VersionedDataField` - xeo4-specific versioned data handling ❌ xeo4-specific

### `use-save-file.tsx` Dependencies:
- `@/api/client` - Hardcoded API client ❌ xeo4-specific
- `@/types/api` - Hardcoded types ❌ xeo4-specific
- `sonner` - Toast library ✅ Can depend on

## Critical Realization

**These components are HEAVILY xeo4-specific!** They depend on:
1. xeo4's API endpoints (`/api/v1/files/*`)
2. xeo4's type definitions (`FileUploadResponse`)
3. xeo4's `VersionedDataField` component

## Decision Point

### Option A: Extract Generic Parts Only
Only move the truly generic pieces to `@stately/files`:
- `RelativePathNode` type definition (schema extension)
- Basic `RelativePathField` view component (read-only display)
- Plugin registration pattern

**Leave in xeo4:**
- Complex edit functionality with file upload
- File manager/explorer views
- API-dependent hooks

### Option B: Make Components Generic via Context
Make the components accept API client via context:
```typescript
export function RelativePathField<TPaths>({
  formId, value, onChange
}) {
  const { apiClient } = useStatelyUI<any, TPaths>();
  // Use apiClient instead of hardcoded api
}
```

But this requires the user to have file upload endpoints!

### Option C: Provide Base + User Extends
`@stately/files` provides:
- Type definitions
- Base field component (just text input for path)
- Plugin registration

User (xeo4) provides:
- Enhanced field with upload/compose/versioned features
- File manager UI
- API-specific hooks

## Recommendation

**Option C** - Minimal extraction for now:
1. Move `RelativePathNode` type to demonstrate plugin extensibility
2. Create simple base `RelativePathField` (just display/edit path string)
3. Leave complex xeo4-specific file management in xeo4
4. Once extensibility is working, xeo4 can override with its enhanced version

This keeps us focused on **solving the extensibility problem** without getting bogged down in xeo4-specific features.

## Next Steps

1. Design the plugin extensibility mechanism first
2. Move only `RelativePathNode` type definition
3. Create minimal base component
4. Test the plugin pattern works
5. Later: xeo4 can provide enhanced file features as an override
