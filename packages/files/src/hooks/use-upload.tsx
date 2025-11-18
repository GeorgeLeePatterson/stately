import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';
import type { FileUploadResponse } from '@/types/api';

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
