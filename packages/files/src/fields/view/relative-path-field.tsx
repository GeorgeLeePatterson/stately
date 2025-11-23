import { Explain, NotSet } from '@stately/ui/base/components';
import { Database, ExternalLink, FolderOpen, HardDrive, HardDriveUpload } from 'lucide-react';
import { FileBrowserDialog } from '@/dialogs/file-browser-dialog';
import { RELATIVE_PATH_MODES } from '../edit/relative-path-field';

export function RelativePathFieldView({ value }: { value: any }) {
  if (!value) {
    return <NotSet />;
  }

  // Check if it's a managed path (object with dir/path) or external (string)
  const isManaged = typeof value === 'object' && 'dir' in value && 'path' in value;
  const isExternal = typeof value === 'string';

  const makeLabel = (
    Icon: React.ReactNode,
    pathValue: string,
    title: string,
    prefix?: string,
    after?: React.ReactNode,
  ) => {
    return (
      <Explain content={pathValue}>
        <div className="@container flex flex-1 w-full items-center gap-2 min-w-0">
          <span
            className="w-full text-sm py-1 px-2 rounded bg-muted font-mono flex items-center gap-2"
            title={title}
          >
            {prefix ? (
              <span className="flex flex-nowrap items-center gap-1 whitespace-nowrap">
                {Icon}
                <span className="hidden @md:inline text-xs text-muted-foreground">{prefix}</span>
              </span>
            ) : (
              Icon
            )}
            <span className="text-right truncate border-l pl-2" dir="rtl">
              {pathValue}
            </span>
          </span>
          {after ?? null}
        </div>
      </Explain>
    );
  };

  if (isExternal) {
    const ExtIcon = RELATIVE_PATH_MODES.find(n => n.value === 'external')?.icon ?? ExternalLink;
    const extIcon = <ExtIcon className="h-3 w-3 text-muted-foreground" />;
    return makeLabel(extIcon, value, `Full path: ${value}`, 'External');
  }

  // If not external and not managed, not set
  if (!isManaged) {
    return <NotSet />;
  }

  const pathValue = value as { dir?: string; path: string };

  // Choose icon based on directory
  const Icon =
    pathValue.dir === 'cache'
      ? HardDrive
      : pathValue.dir === 'data'
        ? Database
        : pathValue.dir === 'upload'
          ? HardDriveUpload
          : FolderOpen;

  // Format display text
  const dirLabel =
    pathValue.dir === 'cache'
      ? 'cache'
      : pathValue.dir === 'data'
        ? 'data'
        : pathValue.dir === 'upload'
          ? 'upload'
          : 'path';

  return makeLabel(
    <Icon className="h-3 w-3 text-muted-foreground" />,
    pathValue.path,
    pathValue.path,
    dirLabel,
    pathValue.dir === 'upload' ? (
      <FileBrowserDialog
        initialPath={
          pathValue.path.includes('/') ? pathValue.path.split('/').slice(0, -1).join('/') : ''
        }
      />
    ) : null,
  );
}
