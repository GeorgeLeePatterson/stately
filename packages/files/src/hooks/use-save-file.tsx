import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FileUploadResponse } from "@/types/fs-api";
import { useFilesApi } from "@/lib/files-api";

export const useSaveFile = ({
  onSuccess,
}: {
  onSuccess: (data: FileUploadResponse) => void;
}) => {
  const filesApi = useFilesApi();
  // Mutation for compose mode file save
  return useMutation({
    mutationFn: async ({
      content,
      filename,
    }: {
      content: string;
      filename?: string;
    }) => {
      if (!content) throw new Error("Content cannot be empty");
      const { data, error } = await filesApi.save({ content, name: filename });
      if (!data || error) throw new Error("Save failed");
      return data as FileUploadResponse;
    },
    onSuccess: (data) => {
      toast.success("File saved successfully");
      onSuccess(data);
    },
    onError: (error) => {
      console.error("Compose save error:", error);
      toast.error("Failed to save file");
    },
  });
};

export type { FileUploadResponse };
