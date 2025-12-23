import { Button } from '@statelyjs/ui/components/base/button';
import { Loader2, Upload as UploadIcon } from 'lucide-react';
import { useCallback, useId } from 'react';
import { toast } from 'sonner';
import { useUpload } from '@/hooks';
import { useFileExplore } from '@/hooks/use-file-explore';
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

  const { queryResults, currentPath, selectedEntry, handleEntryClick, navigateUp } = useFileExplore(
    { isDisabled: mode !== 'browse', onSelectFile },
  );

  const isLoading = queryResults.isLoading;
  const files = queryResults.data?.files || [];

  // Upload mutation
  const uploadMutation = useUpload({
    onSuccess: data => {
      toast.success('File uploaded successfully');
      onSelect(data.path);
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
    <div className="file-selector w-full flex flex-col gap-2">
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
