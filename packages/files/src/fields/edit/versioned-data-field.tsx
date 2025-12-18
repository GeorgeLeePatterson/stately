import { ButtonGroup } from '@statelyjs/ui/components/base/button-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@statelyjs/ui/components/base/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@statelyjs/ui/components/base/input-group';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@statelyjs/ui/components/base/menubar';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import { FileSearch, MoreVertical, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFileVersions, type VersionedDataValue } from '@/hooks/use-file-versions';
import { FileSelector } from '@/views/file-selector';

export interface VersionedDataFieldProps {
  formId: string;
  value?: VersionedDataValue;
  onChange: (value: VersionedDataValue | null) => void;
}

export function VersionedDataField({ value, onChange }: VersionedDataFieldProps) {
  const [showBrowseSelector, setShowBrowseSelector] = useState(false);
  const [showUploadSelector, setShowUploadSelector] = useState(false);

  const { filename, data, error, isLoading } = useFileVersions({ value });

  const versions = data?.files || [];

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

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // When file is selected
  return (
    <>
      <ButtonGroup className="versioned-data-field min-w-0 flex flex-1 items-center gap-2 p-0">
        <InputGroup className="bg-background">
          <InputGroupInput
            className="min-w-0 flex-1 bg-transparent resize-y max-h-64 min-h-1 px-3 py-1"
            placeholder={'Select a file to upload...'}
            readOnly
            type="text"
            value={filename || ''}
          />
          <InputGroupAddon align="inline-end">
            {isLoading ? (
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
                <MenubarTrigger
                  render={
                    <InputGroupButton
                      className="rounded-full h-8 w-8 p-0 cursor-pointer"
                      size="icon-sm"
                      variant="ghost"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </InputGroupButton>
                  }
                />
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
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a file to upload. It will be referenced in the versioned field.
            </DialogDescription>
          </DialogHeader>

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
