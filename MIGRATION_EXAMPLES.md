# Files Plugin Migration Examples

This document shows concrete before/after code for migrating files plugin components to the canonical plugin pattern.

## Example 1: useSaveFile Hook

### Before (Old Pattern - Broken)

**File:** `/packages/files/src/hooks/use-save-file.tsx`

```typescript
// ✗ BROKEN - useFilesApi() is commented out
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
// import { useFilesApi } from '@/lib/files-api';
import type { FileUploadResponse } from '@/types/api';

export const useSaveFile = ({ onSuccess }: { onSuccess: (data: FileUploadResponse) => void }) => {
  // const filesApi = useFilesApi();
  
  return useMutation({
    mutationFn: async ({ content, filename: _ }: { content: string; filename?: string }) => {
      if (!content) throw new Error('Content cannot be empty');
      // const { data, error } = await filesApi.save({ content, name: filename });
      // if (!data || error) throw new Error('Save failed');
      // return data as FileUploadResponse;
      return {} as FileUploadResponse;  // EMPTY STUB!
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

export type { FileUploadResponse };
```

**Problems:**
- `useFilesApi()` is commented out - doesn't work
- Mutation just returns empty object - no actual API call
- No plugin integration
- Can't access plugin utilities

### After (New Pattern - Works)

```typescript
import type { Schemas } from '@stately/schema';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStatelyUi } from '@stately/ui';
import type { FileUploadResponse } from '@/types/api';

export const useSaveFile = <Schema extends Schemas = Schemas>({
  onSuccess,
}: {
  onSuccess: (data: FileUploadResponse) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      content,
      filename,
    }: {
      content: string;
      filename?: string;
    }): Promise<FileUploadResponse> => {
      if (!content) {
        throw new Error('Content cannot be empty');
      }

      // Get runtime and files API
      const runtime = useStatelyUi<Schema>();
      const api = runtime.plugins.files?.api;

      if (!api) {
        throw new Error('Files API is unavailable');
      }

      // Call saveFile operation
      const { data, error } = await api.call(api.operations.saveFile, {
        body: {
          content,
          name: filename,
        },
      });

      if (error || !data) {
        throw new Error('Failed to save file');
      }

      return data as FileUploadResponse;
    },
    onError: (error) => {
      console.error('File save error:', error);
      toast.error('Failed to save file');
    },
    onSuccess: (data) => {
      toast.success('File saved successfully');
      onSuccess(data);
    },
  });
};

export type { FileUploadResponse };
```

**Improvements:**
- Uses `useStatelyUi()` to get runtime
- Accesses `runtime.plugins.files.api` directly
- Calls `api.call(api.operations.saveFile, ...)` with proper options
- Type-safe: knows about FileUploadResponse
- Proper error handling
- Fully integrated with plugin system

## Example 2: UploadField Component

### Before (Old Pattern - Broken)

**File:** `/packages/files/src/components/fields/edit/upload.tsx`

```typescript
import { InputGroupAddon, InputGroupButton, InputGroupInput, Spinner } from '@stately/ui/base/ui';
import { useMutation } from '@tanstack/react-query';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

interface UploadFieldProps {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export function UploadField({ formId, onChange, value, placeholder }: UploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesApi = useFilesApi();  // ✗ This doesn't exist!

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data, error } = await filesApi.upload({ body: formData });  // ✗ filesApi is undefined
      if (!data || error) throw new Error('Upload failed');
      return data;
    },
    onError: error => {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    },
    onSuccess: data => {
      onChange({ dir: 'data', path: data.path });
      toast.success('File uploaded successfully');
    },
  });

  return (
    <>
      <InputGroupInput
        className="cursor-default text-sm h-auto"
        id={formId}
        placeholder={placeholder}
        readOnly
        type="text"
        value={
          typeof value === 'object' && value?.path
            ? value.path
            : typeof value === 'string'
              ? value
              : ''
        }
      />
      <InputGroupAddon align="inline-end" className="px-3 py-1">
        <InputGroupButton
          disabled={uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
          size="xs"
        >
          {uploadMutation.isPending ? (
            <>
              <Spinner />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-3.5 h-3.5" />
              Browse
            </>
          )}
        </InputGroupButton>
      </InputGroupAddon>
      <input
        className="hidden"
        id={`${formId}-file`}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) uploadMutation.mutate(file);
        }}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
}

export const Upload = UploadField;
```

**Problems:**
- `useFilesApi()` is undefined - component will crash
- No actual file upload implementation
- No plugin integration
- No proper error handling

### After (New Pattern - Works)

```typescript
import type { Schemas } from '@stately/schema';
import {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Spinner,
} from '@stately/ui/base/ui';
import { useStatelyUi } from '@stately/ui';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UploadFieldProps<Schema extends Schemas = Schemas> {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export function UploadField<Schema extends Schemas = Schemas>({
  formId,
  onChange,
  value,
  placeholder,
}: UploadFieldProps<Schema>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  const runtime = useStatelyUi<Schema>();
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
        {
          body: formData,
        }
      );

      if (!data || error) {
        throw new Error('Upload failed');
      }

      // Update parent with file path
      onChange({ dir: 'data', path: data.path });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <InputGroupInput
        className="cursor-default text-sm h-auto"
        id={formId}
        placeholder={placeholder}
        readOnly
        type="text"
        value={
          typeof value === 'object' && value?.path
            ? value.path
            : typeof value === 'string'
              ? value
              : ''
        }
      />
      <InputGroupAddon align="inline-end" className="px-3 py-1">
        <InputGroupButton
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          size="xs"
        >
          {isPending ? (
            <>
              <Spinner />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-3.5 h-3.5" />
              Browse
            </>
          )}
        </InputGroupButton>
      </InputGroupAddon>
      <input
        className="hidden"
        id={`${formId}-file`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
}

export const Upload = UploadField;
```

**Improvements:**
- Gets runtime via `useStatelyUi()`
- Accesses API via `runtime.plugins.files.api`
- Proper null checks before using API
- Real implementation with actual API call
- Proper error handling and user feedback
- Clean state management with `isPending`
- Type-safe with generic Schema parameter

## Example 3: FileSelector Component

### Before (Old Pattern)

**File:** `/packages/files/src/components/views/file-selector.tsx`

```typescript
// Assuming this uses useFilesApi() somewhere...
export function FileSelector() {
  const filesApi = useFilesApi();  // ✗ Undefined
  
  // List files from API
  const { data, isLoading } = useQuery({
    queryKey: filesApi.key.list(path),
    queryFn: () => filesApi.list({ path }),
  });
  
  // Render...
}
```

### After (New Pattern)

```typescript
import type { Schemas } from '@stately/schema';
import { useQuery } from '@tanstack/react-query';
import { useStatelyUi } from '@stately/ui';
import { useState } from 'react';

interface FileSelectorProps<Schema extends Schemas = Schemas> {
  onSelect: (path: string) => void;
}

export function FileSelector<Schema extends Schemas = Schemas>({
  onSelect,
}: FileSelectorProps<Schema>) {
  const [path, setPath] = useState<string | undefined>();
  const runtime = useStatelyUi<Schema>();
  const filesApi = runtime.plugins.files?.api;

  const { data, isLoading, error } = useQuery({
    enabled: !!filesApi && !!path,
    queryKey: ['files', 'list', path],
    queryFn: async () => {
      if (!filesApi) {
        throw new Error('Files API is unavailable');
      }

      const { data, error } = await filesApi.call(
        filesApi.operations.listFiles,
        {
          params: {
            query: path ? { path } : {},
          },
        }
      );

      if (error || !data) {
        throw new Error('Failed to list files');
      }

      return data;
    },
  });

  if (!filesApi) {
    return <div className="text-red-500">Files API is unavailable</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading files: {error.message}</div>;
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {data?.files?.map((file) => (
        <div
          key={file.path}
          onClick={() => onSelect(file.path)}
          className="cursor-pointer p-2 hover:bg-gray-100"
        >
          {file.path}
        </div>
      ))}
    </div>
  );
}
```

**Improvements:**
- Gets runtime and API properly
- Uses `useQuery` with proper cache keys
- Proper error handling and loading states
- Type-safe integration
- Clear availability checks

## Example 4: Creating a Custom Files Hook

If you need a reusable hook for file operations:

```typescript
import type { Schemas } from '@stately/schema';
import { useCallback } from 'react';
import { useStatelyUi } from '@stately/ui';
import { toast } from 'sonner';

/**
 * Custom hook for files plugin operations
 * Provides convenient methods for common file operations
 */
export function useFilesOperations<Schema extends Schemas = Schemas>() {
  const runtime = useStatelyUi<Schema>();
  const api = runtime.plugins.files?.api;

  const listFiles = useCallback(
    async (path?: string) => {
      if (!api) throw new Error('Files API is unavailable');

      const { data, error } = await api.call(
        api.operations.listFiles,
        {
          params: {
            query: path ? { path } : {},
          },
        }
      );

      if (error) throw error;
      return data;
    },
    [api]
  );

  const saveFile = useCallback(
    async (content: string, filename?: string) => {
      if (!api) throw new Error('Files API is unavailable');

      const { data, error } = await api.call(
        api.operations.saveFile,
        {
          body: {
            content,
            name: filename,
          },
        }
      );

      if (error) throw error;
      return data;
    },
    [api]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!api) throw new Error('Files API is unavailable');

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await api.call(
        api.operations.uploadFile,
        {
          body: formData,
        }
      );

      if (error) throw error;
      return data;
    },
    [api]
  );

  return {
    available: !!api,
    listFiles,
    saveFile,
    uploadFile,
  };
}

// Usage in components:
export function MyComponent() {
  const { available, listFiles, uploadFile } = useFilesOperations();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadFile(file);
      console.log('Uploaded:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (!available) return <div>Files API unavailable</div>;

  return <button onClick={() => handleUpload(file)}>Upload</button>;
}
```

## Key Takeaways

1. **Always use `useStatelyUi()`** - Not custom hooks like `useFilesApi()`
2. **Access via `runtime.plugins.PLUGIN_NAME.api`** - Not from separate utilities
3. **Use `api.operations.OPERATION_NAME`** - Pre-resolved operation metadata
4. **Call with `api.call(operation, options)`** - Consistent API calling
5. **Check for availability** - `if (!api) throw new Error(...)`
6. **Use React Query** - For caching and state management
7. **Proper error handling** - Always check `error` from response
8. **Type safety** - Use generic `Schema` parameter throughout

## Common API Call Patterns

### GET Request (List)
```typescript
const { data, error } = await api.call(
  api.operations.listFiles,
  {
    params: {
      query: { path: '/some/path' },
    },
  }
);
```

### POST Request (Create)
```typescript
const { data, error } = await api.call(
  api.operations.saveFile,
  {
    body: {
      content: 'file content',
      name: 'filename.txt',
    },
  }
);
```

### POST with FormData (Upload)
```typescript
const formData = new FormData();
formData.append('file', file);

const { data, error } = await api.call(
  api.operations.uploadFile,
  {
    body: formData,
  }
);
```

### PATCH Request (Update)
```typescript
const { data, error } = await api.call(
  api.operations.updateEntity,
  {
    params: {
      path: { entity_id: 'id123' },
    },
    body: { field: 'new value' },
  }
);
```

### DELETE Request
```typescript
const { data, error } = await api.call(
  api.operations.deleteEntity,
  {
    params: {
      path: { entity_id: 'id123' },
    },
  }
);
```
