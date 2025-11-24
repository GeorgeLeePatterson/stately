import { Layout } from '@stately/ui';
import type { PageProps } from '@stately/ui/base';
import { Button } from '@stately/ui/base/ui';
import { ChevronRight } from 'lucide-react';
import { useFileExplore } from '@/hooks/use-file-explore';
import { FileDetails } from '@/views/file-details';
import { FileExplorer } from '@/views/file-explorer';

export interface FileManagerProps {
  initialPath?: string;
}

/**
 * FileManagerPage - Convenience wrapper for FileManager with @stately/ui Layout.Page
 */
export function FileManagerPage({ initialPath, ...rest }: FileManagerProps & Partial<PageProps>) {
  return (
    <Layout.Page
      {...rest}
      breadcrumbs={rest?.breadcrumbs ?? [{ label: 'Files' }]}
      description={rest?.description ?? 'Manage uploaded files and versions'}
      title={rest?.title ?? 'File Manager'}
    >
      <FileManager initialPath={initialPath} />
    </Layout.Page>
  );
}

/**
 * FileManager - Full-featured file management interface for sidebar/page view
 *
 * Features:
 * - Two-column master-detail view (responsive to single column on mobile)
 * - Browse directories and files
 * - View file versions (automatically detected by backend)
 * - Upload new files
 * - Compose new files inline
 * - Multi-select delete
 * - Preview files
 * - Deep linking via initialPath prop (e.g., ?path=uploads/cigna.sh)
 *
 * File types:
 * - directory: Regular directory
 * - file: Regular file
 * - versioned_file: File with versions (has __versions__ subdirectory)
 *
 * Unlike FileSelector (popover), this is a full-page view for comprehensive file management.
 */
export function FileManager({ initialPath }: FileManagerProps) {
  const {
    queryResults,
    currentPath,
    setCurrentPath,
    selectedEntry,
    setSelectedEntry,
    handleEntryClick,
    navigateUp,
  } = useFileExplore({ initialPath });

  const isLoading = queryResults.isLoading;
  const files = queryResults.data?.files || [];

  // Get breadcrumb parts
  const breadcrumbs = currentPath ? currentPath.split('/') : [];

  return (
    <div className="flex flex-col h-full min-h-full flex-1">
      {/* Breadcrumbs */}
      <div className="p-2">
        <div className="flex items-center gap-1 text-sm">
          <Button
            className="h-6 px-2 text-xs"
            onClick={() => setCurrentPath('')}
            size="sm"
            variant="ghost"
          >
            /
          </Button>
          {breadcrumbs.map((part, index) => (
            <div
              className="flex items-center gap-1"
              // biome-ignore lint/suspicious/noArrayIndexKey: ''
              key={`${part}-${index}`}
            >
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button
                className="h-6 px-2"
                onClick={() => {
                  const newPath = breadcrumbs.slice(0, index + 1).join('/');
                  setCurrentPath(newPath);
                }}
                size="sm"
                variant="ghost"
              >
                {part}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
        {/* File list - full width on mobile, shared width on desktop */}
        <FileExplorer
          className={selectedEntry && selectedEntry.type !== 'directory' ? 'hidden sm:block' : ''}
          currentPath={currentPath}
          files={files}
          isLoading={isLoading}
          navigateUp={navigateUp}
          onSelectEntry={handleEntryClick}
          selectedEntry={selectedEntry}
        >
          {/* Details panel - only show when a file or versioned file is selected */}
          {selectedEntry && (
            <FileDetails
              className="sm:w-96 p-4"
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
            />
          )}
        </FileExplorer>
      </div>
    </div>
  );
}
