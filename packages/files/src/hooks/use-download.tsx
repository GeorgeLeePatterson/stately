import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';

/**
 * Target directory for file downloads.
 *
 * - `cache`: Temporary cached files
 * - `data`: Persistent data files
 * - `upload`: User-uploaded files (supports versioning)
 */
export type DownloadTarget = 'cache' | 'data' | 'upload';

/**
 * Parameters for the download mutation.
 */
export interface DownloadParams {
  /** The target directory to download from */
  target: DownloadTarget;
  /** Path to the file within the target directory */
  path: string;
  /** Optional version UUID for versioned files (upload target only) */
  version?: string;
}

/**
 * Hook for downloading files from the files plugin.
 *
 * Triggers a browser download for files in cache, data, or upload directories.
 * For versioned files in the upload directory, an optional version UUID can be provided.
 *
 * @param options - Configuration options
 * @param options.onSuccess - Callback invoked after successful download
 * @returns React Query mutation for triggering downloads
 *
 * @example
 * ```typescript
 * function DownloadButton({ path }: { path: string }) {
 *   const download = useDownload({
 *     onSuccess: () => console.log('Download complete'),
 *   });
 *
 *   return (
 *     <Button
 *       onClick={() => download.mutate({ target: 'upload', path })}
 *       disabled={download.isPending}
 *     >
 *       {download.isPending ? 'Downloading...' : 'Download'}
 *     </Button>
 *   );
 * }
 * ```
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
