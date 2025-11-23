import { cn } from '@stately/ui/base/lib/utils';
import { Button } from '@stately/ui/base/ui';
import { ArrowLeft } from 'lucide-react';
import { useFilesStatelyUi } from '@/context';
import type { FileInfo } from '@/types/api';
import { filesUiUtils } from '@/utils';
import { VersionedFileDetails } from './versioned-file-details';

export interface FileDetailsProps {
  entry: FileInfo;
  onClose: () => void;
}

export function FileDetails({
  entry,
  onClose,
  ...rest
}: FileDetailsProps & React.HTMLAttributes<HTMLDivElement>) {
  if (!entry) return null;

  return (
    <div {...rest} className={cn(['flex-1 min-w-0', rest?.className])}>
      {entry.type === 'versioned_file' ? (
        <VersionedFileDetails entry={entry} onClose={onClose} />
      ) : entry.type !== 'directory' ? (
        <GenericFileDetails entry={entry} onClose={onClose} />
      ) : null}
    </div>
  );
}

export function GenericFileDetails({ entry, onClose }: FileDetailsProps) {
  const { plugins } = useFilesStatelyUi();
  const formatTimestamp = plugins.files.utils?.formatTimestamp || filesUiUtils.formatTimestamp;
  return (
    <div className="space-y-4">
      {/* Back button for mobile */}
      <Button className="sm:hidden mb-2" onClick={onClose} size="sm" variant="ghost">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to files
      </Button>

      <div>
        <h3 className="text-sm font-medium mb-1">{entry.name}</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Size:</span>
          <span className="font-mono">
            {typeof entry.size === 'number' ? `${(entry.size / 1024).toFixed(2)} KB` : '—'}
          </span>
        </div>
        {(() => {
          const created = formatTimestamp(entry.created);
          return created ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{created}</span>
            </div>
          ) : null;
        })()}
        {(() => {
          const modified = formatTimestamp(entry.modified);
          return modified ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modified:</span>
              <span>{modified}</span>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}
