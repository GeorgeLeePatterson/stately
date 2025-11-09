import { ChevronRight, FileText, Folder, FolderOpen, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { components } from '@/types/api';
import { Button } from '../ui/button';

export type FileInfo = components['schemas']['FileInfo'];

export interface FileEntryProps {
  entry: FileInfo;
  isSelected?: boolean;
  onSelectEntry: (entry: FileInfo) => void;
  isCompact?: boolean;
}

export function FileEntry({ entry, isSelected, onSelectEntry, isCompact }: FileEntryProps) {
  // Icon based on entry type
  const icon =
    entry.type === 'directory' ? (
      isSelected ? (
        <FolderOpen className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Folder className="h-4 w-4 flex-shrink-0" />
      )
    ) : entry.type === 'versioned_file' ? (
      <History className="h-4 w-4 flex-shrink-0 text-purple-500" />
    ) : (
      <FileText className="h-4 w-4 flex-shrink-0" />
    );

  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      onClick={() => onSelectEntry(entry)}
      className={cn(
        'w-full h-auto',
        'justify-start items-center gap-2',
        isCompact ? 'px-2 py-1.5' : 'py-2 px-3',
        'font-mono text-sm',
      )}
    >
      {icon}
      <span className="flex-1 truncate text-left">{entry.name}</span>
      {entry.type === 'versioned_file' && entry.versions && (
        <span className="text-xs text-muted-foreground">
          {entry.versions.length} {entry.versions.length === 1 ? 'version' : 'versions'}
        </span>
      )}
      {entry.type === 'file' && entry.size > 0 && (
        <span className="text-xs text-muted-foreground">{(entry.size / 1024).toFixed(1)}kb</span>
      )}
      {entry.type === 'directory' && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
    </Button>
  );
}
