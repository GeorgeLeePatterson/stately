import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/api/client';
import type { components } from '@/types/api';

export type FileUploadResponse = components['schemas']['FileUploadResponse'];

export const useSaveFile = ({ onSuccess }: { onSuccess: (data: FileUploadResponse) => void }) => {
  // Mutation for compose mode file save
  return useMutation({
    mutationFn: async ({ content, filename }: { content: string; filename?: string }) => {
      if (!content) throw new Error('Content cannot be empty');
      const { data, error } = await api.POST('/api/v1/files/save', {
        body: { content, name: filename || undefined },
      });
      if (!data || error) throw new Error('Save failed');
      return data;
    },
    onSuccess: data => {
      toast.success('File saved successfully');
      onSuccess(data);
    },
    onError: error => {
      console.error('Compose save error:', error);
      toast.error('Failed to save file');
    },
  });
};
