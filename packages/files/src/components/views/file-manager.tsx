import { ArrowLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileView } from "@/hooks/use-file-view";
import type { FileInfo } from "@/types/file";
import { FileView } from "./file-explorer";

const formatTimestamp = (value?: number | string | null, withTime = false) => {
  if (value === undefined || value === null) return null;
  const date =
    typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

interface FileManagerProps {
  initialPath?: string;
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
  } = useFileView({ initialPath });

  const isLoading = queryResults.isLoading;
  const files = queryResults.data?.files || [];

  // Get breadcrumb parts
  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  return (
    <div className="flex flex-col h-full min-h-full flex-1">
      {/* Breadcrumbs */}
      <div className="p-2">
        <div className="flex items-center gap-1 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPath("")}
            className="h-6 px-2 text-xs"
          >
            /
          </Button>
          {breadcrumbs.map((part, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: ''
              key={`${part}-${index}`}
              className="flex items-center gap-1"
            >
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newPath = breadcrumbs.slice(0, index + 1).join("/");
                  setCurrentPath(newPath);
                }}
                className="h-6 px-2"
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
        <FileView
          files={files}
          currentPath={currentPath}
          selectedEntry={selectedEntry}
          onSelectEntry={handleEntryClick}
          navigateUp={navigateUp}
          isLoading={isLoading}
          className={
            selectedEntry && selectedEntry.type !== "directory"
              ? "hidden sm:block"
              : ""
          }
        >
          {/* Details panel - only show when a file or versioned file is selected */}
          {selectedEntry && selectedEntry.type !== "directory" && (
            <FileDetailsPanel
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
            />
          )}
        </FileView>
      </div>
    </div>
  );
}

function FileDetailsPanel({
  entry,
  onClose,
}: {
  entry: FileInfo;
  onClose: () => void;
}) {
  if (entry.type === "versioned_file") {
    return <VersionedFileDetailsPanel entry={entry} onClose={onClose} />;
  }

  return (
    <div className="w-full sm:w-96 p-4 border-l sm:border-l border-t sm:border-t-0">
      <div className="space-y-4">
        {/* Back button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="sm:hidden mb-2"
        >
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
              {typeof entry.size === "number"
                ? `${(entry.size / 1024).toFixed(2)} KB`
                : "—"}
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
    </div>
  );
}

function VersionedFileDetailsPanel({
  entry,
  onClose,
}: {
  entry: FileInfo;
  onClose: () => void;
}) {
  const versions = entry.versions || [];
  const latestVersion = versions[0]; // Versions are sorted newest first

  return (
    <div className="w-full sm:w-96 p-4 border-l sm:border-l border-t sm:border-t-0">
      <div className="space-y-4">
        {/* Back button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="sm:hidden mb-2"
        >
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
              {typeof latestVersion?.size === "number"
                ? `${(latestVersion.size / 1024).toFixed(2)} KB`
                : "N/A"}
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
                  key={version.uuid ?? version.id ?? index}
                  className="flex flex-col items-start justify-between p-2 gap-1 rounded hover:bg-muted/50 text-xs"
                >
                  <div className="flex-1 flex flex-row w-full min-w-0 items-center justify-between">
                    <div className="font-medium">
                      v{versions.length - index}
                    </div>
                    {(() => {
                      const created = formatTimestamp(
                        version.created ?? version.created_at,
                        true,
                      );
                      return created ? (
                        <span className="text-muted-foreground">{created}</span>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1 w-full flex flex-row items-center justify-between">
                    <div className="text-muted-foreground font-mono truncate text-[10px]">
                      {version.uuid ?? version.id ?? "unknown"}
                    </div>
                    <span className="text-muted-foreground">
                      {typeof version.size === "number"
                        ? `${(version.size / 1024).toFixed(1)}kb`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
