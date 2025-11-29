import { Button, ScrollArea } from '@stately/ui/base/ui';
import { ArrowLeft, History } from 'lucide-react';
import { useFilesStatelyUi } from '@/context';
import type { FileInfo } from '@/types/api';
import { filesUiUtils } from '@/utils';

export interface VersionedFileDetailsProps {
  entry: FileInfo;
  onClose: () => void;
}

export function VersionedFileDetails({ entry, onClose }: VersionedFileDetailsProps) {
  const { plugins } = useFilesStatelyUi();
  const formatTimestamp = plugins.files.utils?.formatTimestamp || filesUiUtils.formatTimestamp;

  const versions = entry.versions || [];
  const latestVersion = versions[0]; // Versions are sorted newest first

  return (
    <div className="versioned-file-details space-y-4">
      {/* Back button for mobile */}
      <Button className="sm:hidden mb-2" onClick={onClose} size="sm" variant="ghost">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to files
      </Button>

      <div>
        <h3 className="text-sm font-medium mb-1">{entry.name}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <History className="h-3 w-3" />
          Versioned file
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Latest version:</span>
          <span className="font-mono">
            {typeof latestVersion?.size === 'number'
              ? `${(latestVersion.size / 1024).toFixed(2)} KB`
              : 'N/A'}
          </span>
        </div>
        {(() => {
          const created = formatTimestamp(entry.created, true);
          return created ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">First uploaded:</span>
              <span>{created}</span>
            </div>
          ) : null;
        })()}
        {(() => {
          const modified = formatTimestamp(entry.modified, true);
          return modified ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated:</span>
              <span>{modified}</span>
            </div>
          ) : null;
        })()}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total versions:</span>
          <span>{versions.length}</span>
        </div>
      </div>

      {/* Version list */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Version History</h4>
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {versions.map((version, index) => (
              <div
                className="flex flex-col items-start justify-between p-2 gap-1 rounded hover:bg-muted/50 text-xs"
                key={version.uuid ?? index}
              >
                <div className="flex-1 flex flex-row w-full min-w-0 items-center justify-between">
                  <div className="font-medium">v{versions.length - index}</div>
                  {(() => {
                    const created = formatTimestamp(version.created, true);
                    return created ? (
                      <span className="text-muted-foreground">{created}</span>
                    ) : null;
                  })()}
                </div>
                <div className="flex-1 w-full flex flex-row items-center justify-between">
                  <div className="text-muted-foreground font-mono truncate text-[10px]">
                    {version.uuid ?? 'unknown'}
                  </div>
                  <span className="text-muted-foreground">
                    {typeof version.size === 'number'
                      ? `${(version.size / 1024).toFixed(1)}kb`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
