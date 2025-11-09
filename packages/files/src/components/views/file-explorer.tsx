import { Filter, Folder, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { FileEntry, type FileEntryProps } from '@/components/base/file-entry';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FileInfo } from '@/types/file';

export type FileViewProps = {
  files: FileInfo[];
  currentPath?: string;
  selectedEntry?: FileInfo | null;
  navigateUp: () => void;
  isLoading?: boolean;
  isCompact?: boolean;
} & Pick<FileEntryProps, 'onSelectEntry'>;

export function FileView({
  files,
  currentPath,
  selectedEntry,
  navigateUp,
  isLoading,
  isCompact,
  onSelectEntry,
  children,
  ...rest
}: React.PropsWithChildren<FileViewProps> & React.ComponentProps<typeof ScrollArea>) {
  const [filter, setFilter] = useState('');
  const filteredFiles = (files || []).filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <InputGroup className="h-8">
        <InputGroupAddon>
          <InputGroupText>
            <Filter className="h-3 w-3" />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Filter files..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="h-8"
        />
      </InputGroup>
      <div className="flex-1 flex flex-col sm:flex-row h-full">
        <ScrollArea {...rest} className={cn('flex-1 border border-border', rest?.className)}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Empty className="flex-1 h-full w-full border p-2 md:p-4">
              <EmptyHeader>
                <EmptyTitle>Directory is empty</EmptyTitle>
                <EmptyDescription>
                  {filter ? 'No files match filter' : 'No files uploaded yet'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent></EmptyContent>
            </Empty>
          ) : (
            <div className="p-4 space-y-1">
              {/* Up navigation button */}
              {currentPath && (
                <Button
                  variant="ghost"
                  onClick={navigateUp}
                  className="w-full justify-start gap-2 font-mono text-sm h-auto py-2 px-3 mb-2"
                >
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-left">..</span>
                </Button>
              )}

              {filteredFiles.map(entry => {
                return (
                  <FileEntry
                    key={`file-${isCompact ? 'selector' : 'manager'}-${entry.name}`}
                    isSelected={selectedEntry?.name === entry.name}
                    entry={entry}
                    onSelectEntry={onSelectEntry}
                    isCompact={isCompact}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
        {children}
      </div>
    </div>
  );
}
