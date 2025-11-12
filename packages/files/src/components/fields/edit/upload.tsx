import { useMutation } from "@tanstack/react-query";
import { Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useFilesApi } from "@/lib/files-api";

interface UploadFieldProps {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export function UploadField({
  formId,
  onChange,
  value,
  placeholder,
}: UploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesApi = useFilesApi();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data, error } = await filesApi.upload({ body: formData });
      if (!data || error) throw new Error("Upload failed");
      return data;
    },
    onSuccess: (data) => {
      // Store managed path object
      onChange({ dir: "data", path: data.path });
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    },
  });
  return (
    <>
      <InputGroupInput
        id={formId}
        type="text"
        value={
          typeof value === "object" && value?.path
            ? value.path
            : typeof value === "string"
              ? value
              : ""
        }
        readOnly
        placeholder={placeholder}
        className="cursor-default text-sm h-auto"
      />
      <InputGroupAddon align="inline-end" className="px-3 py-1">
        <InputGroupButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          size="xs"
        >
          {uploadMutation.isPending ? (
            <>
              <Spinner />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-3.5 h-3.5" />
              Browse
            </>
          )}
        </InputGroupButton>
      </InputGroupAddon>
      <input
        ref={fileInputRef}
        id={`${formId}-file`}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadMutation.mutate(file);
        }}
        className="hidden"
      />
    </>
  );
}

export const Upload = UploadField;
