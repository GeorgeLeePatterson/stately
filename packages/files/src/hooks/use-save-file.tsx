import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';
import type { FileUploadResponse } from '@/types/api';

export const useSaveFile = ({ onSuccess }: { onSuccess: (data: FileUploadResponse) => void }) => {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;

  return useMutation({
    mutationFn: async ({ content, filename }: { content: string; filename?: string }) => {
      if (!content) throw new Error('Content cannot be empty');
      if (!filesApi) throw new Error('Files API is unavailable');

      const { data, error } = await filesApi.save_file({ body: { content, name: filename } });

      if (error || !data) throw new Error('Save failed');
      return data as FileUploadResponse;
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
