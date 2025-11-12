import { useQuery } from "@tanstack/react-query";
import { FileSearch, MoreVertical, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSelector } from "@/components/views/file-selector";
import { useFilesApi } from "@/lib/files-api";

interface VersionedDataValue {
  dir: "upload";
  path: string;
}

interface VersionedDataFieldProps {
  formId: string;
  value?: VersionedDataValue;
  onChange: (value: VersionedDataValue | null) => void;
}

export function VersionedDataField({
  value,
  onChange,
}: VersionedDataFieldProps) {
  const filesApi = useFilesApi();
  const [showBrowseSelector, setShowBrowseSelector] = useState(false);
  const [showUploadSelector, setShowUploadSelector] = useState(false);

  // The path should just be the filename (e.g., "cigna.sh")
  // No need to strip "uploads/" since dir: 'upload' already indicates the uploads directory
  const filename = value?.path || null;

  // Fetch versions for the current file
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: filesApi.key.versions(filename ?? undefined),
    queryFn: async () => {
      if (!filename) return null;
      const { data, error } = await filesApi.list({
        path: `${filename}/__versions__`,
      });
      if (error || !data) {
        throw new Error("Failed to load file versions");
      }
      return data;
    },
    enabled: !!filename && !!filesApi.listMeta,
  });

  const versions = versionsData?.files || [];

  const handleBrowseSelect = (path: string) => {
    onChange({ dir: "upload", path });
    setShowBrowseSelector(false);
  };

  const handleUploadSelect = (path: string) => {
    onChange({ dir: "upload", path });
    setShowUploadSelector(false);
  };

  const handleRemove = () => {
    onChange(null);
    toast.success("File removed");
  };

  // When file is selected
  return (
    <>
      <ButtonGroup className="min-w-0 flex flex-1 items-center gap-2 p-0">
        <InputGroup className="bg-background">
          <InputGroupInput
            type="text"
            value={filename || ""}
            placeholder={"Select a file to upload..."}
            className="min-w-0 flex-1 bg-transparent resize-y max-h-64 min-h-1 px-3 py-1"
            readOnly
          />
          <InputGroupAddon align="inline-end">
            {isLoadingVersions ? (
              <Skeleton className="h-3 w-20" />
            ) : versions.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                {versions.length}{" "}
                {versions.length === 1 ? "version" : "versions"}
              </div>
            ) : null}
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Menubar className="border-0 bg-transparent p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger asChild>
                  <InputGroupButton
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full h-8 w-8 p-0 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </InputGroupButton>
                </MenubarTrigger>
                <MenubarContent align="end">
                  <MenubarItem onClick={() => setShowBrowseSelector(true)}>
                    <FileSearch className="h-4 w-4 mr-2" />
                    Browse Existing
                  </MenubarItem>
                  <MenubarItem onClick={() => setShowUploadSelector(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={handleRemove}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>

      {/* Browse Existing Dialog */}
      <Dialog open={showBrowseSelector} onOpenChange={setShowBrowseSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Browse Existing Files</DialogTitle>
            <DialogDescription>
              Select an existing file to use
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-2">
            <FileSelector
              mode="browse"
              onSelect={handleBrowseSelect}
              onClose={() => setShowBrowseSelector(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload New Dialog */}
      <Dialog open={showUploadSelector} onOpenChange={setShowUploadSelector}>
        <DialogContent>
          <div className="flex justify-center p-2">
            <FileSelector
              mode="upload"
              onSelect={handleUploadSelect}
              onClose={() => setShowUploadSelector(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
