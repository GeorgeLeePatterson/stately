import { Button } from '@statelyjs/ui/components/base/button';
import { cn } from '@statelyjs/ui/lib/utils';
import { ArrowLeft, Download } from 'lucide-react';
import { useFilesStatelyUi } from '@/context';
import { useDownload } from '@/hooks/use-download';
import type { FileInfo } from '@/types/api';
import { filesUiUtils } from '@/utils';
import { VersionedFileDetails } from './versioned-file-details';

export interface FileDetailsProps {
  entry: FileInfo;
  currentPath?: string;
  onClose: () => void;
}

export function FileDetails({
  entry,
  currentPath,
  onClose,
  ...rest
}: FileDetailsProps & React.HTMLAttributes<HTMLDivElement>) {
  if (!entry) return null;

  return (
    <div {...rest} className={cn(['file-details', 'flex-1 min-w-0', rest?.className])}>
      {entry.type === 'versioned_file' ? (
        <VersionedFileDetails currentPath={currentPath} entry={entry} onClose={onClose} />
      ) : entry.type !== 'directory' ? (
        <GenericFileDetails currentPath={currentPath} entry={entry} onClose={onClose} />
      ) : null}
    </div>
  );
}

export function GenericFileDetails({ entry, currentPath, onClose }: FileDetailsProps) {
  const { plugins } = useFilesStatelyUi();
  const formatTimestamp = plugins.files.utils?.formatTimestamp || filesUiUtils.formatTimestamp;
  const { mutate: download, isPending: isDownloading } = useDownload();

  const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

  const handleDownload = () => {
    const target =
      fullPath.startsWith('cache/') || currentPath?.startsWith('cache') ? 'cache' : 'data';
    const path = fullPath.replace(/^(cache|data)\//, '');
    download({ path, target });
  };

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

      <Button
        className="w-full"
        disabled={isDownloading}
        onClick={handleDownload}
        size="sm"
        variant="outline"
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>
    </div>
  );
}
