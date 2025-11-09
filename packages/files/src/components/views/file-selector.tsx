import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload as UploadIcon } from 'lucide-react';
import { useCallback, useId } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFileView } from '@/hooks/use-file-view';
import type { FileInfo } from '../../base/file-entry';
import { FileView } from './file-explorer';

interface FileSelectorProps {
  mode: 'browse' | 'upload';
  onSelect: (path: string) => void;
  onClose?: () => void;
}

/**
 * FileSelector - Simplified file selection for popovers
 *
 * Shows ONLY the requested mode (browse OR upload), not both.
 * Only shows latest version of files (KSUIDs hidden).
 * No delete functionality - just selection.
 */
export function FileSelector({ mode, onSelect, onClose }: FileSelectorProps) {
  const queryClient = useQueryClient();
  const formId = useId();

  const onSelectFile = useCallback(
    (file: FileInfo, currentPath?: string) => {
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      console.debug('Selected file entry: ', { fullPath, currentPath, file });
      onSelect(fullPath);
    },
    [onSelect],
  );

  const { queryResults, currentPath, selectedEntry, handleEntryClick, navigateUp } = useFileView({
    onSelectFile,
    isDisabled: mode !== 'browse',
  });

  const isLoading = queryResults.isLoading;
  const files = queryResults.data?.files || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/v1/files/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: data => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['files', 'list', currentPath] });
      onSelect(data.path);
      onClose?.();
    },
    onError: error => {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    },
  });

  // Browse mode - file list only
  if (mode === 'browse') {
    return (
      <FileView
        files={files}
        currentPath={currentPath}
        selectedEntry={selectedEntry}
        onSelectEntry={handleEntryClick}
        navigateUp={navigateUp}
        isLoading={isLoading}
        isCompact
      />
    );
  }

  // Upload mode - upload dropzone only
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="border-2 border-dashed rounded-md p-8 text-center space-y-3">
        <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Upload a file</p>
          <p className="text-xs text-muted-foreground">Select a file from your computer</p>
        </div>
        <input
          id={`file-upload-${formId}`}
          type="file"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
          }}
          disabled={uploadMutation.isPending}
        />
        <Button
          size="sm"
          onClick={() => document.getElementById(`file-upload-${formId}`)?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            'Choose File'
          )}
        </Button>
      </div>
    </div>
  );
}
