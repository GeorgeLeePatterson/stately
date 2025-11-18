import {
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  Skeleton,
} from '@stately/ui/base/ui';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, MoreVertical, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFilesStatelyUi } from '@/context';
import { FileSelector } from '@/views/file-selector';

export interface VersionedDataValue {
  dir: 'upload';
  path: string;
}

export interface VersionedDataProps {
  formId: string;
  value?: VersionedDataValue;
  onChange: (value: VersionedDataValue | null) => void;
}

export function VersionedDataField({ value, onChange }: VersionedDataProps) {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;
  const [showBrowseSelector, setShowBrowseSelector] = useState(false);
  const [showUploadSelector, setShowUploadSelector] = useState(false);

  // The path should just be the filename (e.g., "cigna.sh")
  // No need to strip "uploads/" since dir: 'upload' already indicates the uploads directory
  const filename = value?.path || null;

  // Fetch versions for the current file
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    enabled: !!filename && !!filesApi,
    queryFn: async () => {
      if (!filename || !filesApi) return null;
      const { data, error } = await filesApi.list({
        params: { query: { path: `${filename}/__versions__` } },
      });
      if (error || !data) {
        throw new Error('Failed to load file versions');
      }
      return data;
    },
    queryKey: ['files', 'versions', filename],
  });

  const versions = versionsData?.files || [];

  const handleBrowseSelect = (path: string) => {
    onChange({ dir: 'upload', path });
    setShowBrowseSelector(false);
  };

  const handleUploadSelect = (path: string) => {
    onChange({ dir: 'upload', path });
    setShowUploadSelector(false);
  };

  const handleRemove = () => {
    onChange(null);
    toast.success('File removed');
  };

  // When file is selected
  return (
    <>
      <ButtonGroup className="min-w-0 flex flex-1 items-center gap-2 p-0">
        <InputGroup className="bg-background">
          <InputGroupInput
            className="min-w-0 flex-1 bg-transparent resize-y max-h-64 min-h-1 px-3 py-1"
            placeholder={'Select a file to upload...'}
            readOnly
            type="text"
            value={filename || ''}
          />
          <InputGroupAddon align="inline-end">
            {isLoadingVersions ? (
              <Skeleton className="h-3 w-20" />
            ) : versions.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                {versions.length} {versions.length === 1 ? 'version' : 'versions'}
              </div>
            ) : null}
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Menubar className="border-0 bg-transparent p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger asChild>
                  <InputGroupButton
                    className="rounded-full h-8 w-8 p-0 cursor-pointer"
                    size="icon-sm"
                    variant="ghost"
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
                  <MenubarItem className="text-destructive" onClick={handleRemove}>
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
      <Dialog onOpenChange={setShowBrowseSelector} open={showBrowseSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Browse Existing Files</DialogTitle>
            <DialogDescription>Select an existing file to use</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-2">
            <FileSelector
              mode="browse"
              onClose={() => setShowBrowseSelector(false)}
              onSelect={handleBrowseSelect}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload New Dialog */}
      <Dialog onOpenChange={setShowUploadSelector} open={showUploadSelector}>
        <DialogContent>
          <div className="flex justify-center p-2">
            <FileSelector
              mode="upload"
              onClose={() => setShowUploadSelector(false)}
              onSelect={handleUploadSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
