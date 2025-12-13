import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';

export type DownloadTarget = 'cache' | 'data' | 'upload';

export interface DownloadParams {
  target: DownloadTarget;
  path: string;
  version?: string;
}

/**
 * Hook for downloading files from the files plugin.
 *
 * Triggers a browser download for files in cache, data, or upload directories.
 * For versioned files in the upload directory, an optional version UUID can be provided.
 */
export const useDownload = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;

  return useMutation({
    mutationFn: async ({ target, path, version }: DownloadParams) => {
      if (!filesApi) throw new Error('Files API is unavailable');

      let response: Response;

      switch (target) {
        case 'cache':
          ({ response } = await filesApi.download_cache({
            params: { path: { path } },
            parseAs: 'stream',
          }));
          break;
        case 'data':
          ({ response } = await filesApi.download_data({
            params: { path: { path } },
            parseAs: 'stream',
          }));
          break;
        case 'upload':
          ({ response } = await filesApi.download_upload({
            params: { path: { path }, query: version ? { version } : undefined },
            parseAs: 'stream',
          }));
          break;
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get filename from path
      const filename = path.split('/').pop() || 'download';

      // Create blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { filename };
    },
    onError: error => {
      console.error('File download error:', error);
      toast.error('Failed to download file');
    },
    onSuccess: ({ filename }) => {
      onSuccess?.();
      toast.success(`Downloaded ${filename}`);
    },
  });
};
