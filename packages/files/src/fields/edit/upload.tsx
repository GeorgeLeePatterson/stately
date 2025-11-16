import { InputGroupAddon, InputGroupButton, InputGroupInput, Spinner } from '@stately/ui/base/ui';
import { useMutation } from '@tanstack/react-query';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';

export interface UploadProps {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

function UploadField({ formId, onChange, value, placeholder }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!filesApi) throw new Error('Files API is unavailable');

      const formData = new FormData();
      formData.append('file', file);
      const { data, error } = await filesApi.call(filesApi.operations.uploadFile, {
        body: formData,
      });
      if (!data || error) throw new Error('Upload failed');
      return data;
    },
    onError: error => {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    },
    onSuccess: data => {
      // Store managed path object
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
