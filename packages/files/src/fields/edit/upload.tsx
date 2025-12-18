import {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Spinner,
} from 'components/base/input-group';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import { useUpload } from '@/hooks/use-upload';

export interface UploadProps {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

function UploadField({ formId, onChange, value, placeholder }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUpload({
    onSuccess: data => onChange({ dir: 'data', path: data.path }),
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
