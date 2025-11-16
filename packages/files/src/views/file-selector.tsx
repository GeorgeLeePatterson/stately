import { Button } from '@stately/ui/base/ui';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Upload as UploadIcon } from 'lucide-react';
import { useCallback, useId } from 'react';
import { toast } from 'sonner';
import { useFileView } from '@/hooks/use-file-view';
import type { FileInfo } from '@/types/api';
import { FileExplorer } from './file-explorer';

export interface FileSelectorProps {
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
  const formId = useId();

  const onSelectFile = useCallback(
    (file: FileInfo, currentPath?: string) => {
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      console.debug('Selected file entry: ', { currentPath, file, fullPath });
      onSelect(fullPath);
    },
    [onSelect],
  );

  const { queryResults, currentPath, selectedEntry, handleEntryClick, navigateUp } = useFileView({
    isDisabled: mode !== 'browse',
    onSelectFile,
  });

  const isLoading = queryResults.isLoading;
  const files = queryResults.data?.files || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // const { data, error } = await filesApi.upload({ body: formData });
      // if (!data || error) throw new Error('Upload failed');
      // return data;
      return {};
    },
    onError: error => {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    },
    onSuccess: _data => {
      toast.success('File uploaded successfully');
      // queryClient.invalidateQueries({ queryKey: filesApi.key.list(currentPath) });
      // onSelect(data.path);
      onClose?.();
    },
  });

  // Browse mode - file list only
  if (mode === 'browse') {
    return (
      <FileExplorer
        currentPath={currentPath}
        files={files}
        isCompact
        isLoading={isLoading}
        navigateUp={navigateUp}
        onSelectEntry={handleEntryClick}
        selectedEntry={selectedEntry}
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
          className="hidden"
          disabled={uploadMutation.isPending}
          id={`file-upload-${formId}`}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
          }}
          type="file"
        />
        <Button
          disabled={uploadMutation.isPending}
          onClick={() => document.getElementById(`file-upload-${formId}`)?.click()}
          size="sm"
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
