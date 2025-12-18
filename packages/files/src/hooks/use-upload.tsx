import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';
import type { FileUploadResponse } from '@/types/api';

/**
 * Hook to upload files to the server.
 *
 * Handles file uploads via FormData, with automatic toast notifications
 * for success and error states.
 *
 * @param options - Configuration options
 * @param options.onSuccess - Callback invoked with the upload response
 * @returns React Query mutation for uploading files
 *
 * @example
 * ```typescript
 * function FileUploader() {
 *   const uploadMutation = useUpload({
 *     onSuccess: (data) => {
 *       console.log('Uploaded to:', data.path);
 *     },
 *   });
 *
 *   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0];
 *     if (file) {
 *       uploadMutation.mutate(file);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         onChange={handleFileChange}
 *         disabled={uploadMutation.isPending}
 *       />
 *       {uploadMutation.isPending && <Spinner />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUpload = ({ onSuccess }: { onSuccess: (data: FileUploadResponse) => void }) => {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;
  return useMutation({
    mutationFn: async (file: File) => {
      if (!filesApi) throw new Error('Files API is unavailable');

      const formData = new FormData();
      formData.append('file', file);
      const { data, error } = await filesApi.upload({ body: formData as any });
      if (!data || error) throw new Error('Upload failed');
      return data;
    },
    onError: error => {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    },
    onSuccess: data => {
      // Store managed path object
      onSuccess(data);
      toast.success('File uploaded successfully');
    },
  });
};
