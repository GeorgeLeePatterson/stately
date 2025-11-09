import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { FileInfo } from '@/components/base/file-entry';

export function useFileView({
  initialPath,
  onSelectFile,
  isDisabled,
}: {
  initialPath?: string;
  onSelectFile?: (file: FileInfo, currentPath?: string) => void;
  isDisabled?: boolean;
}) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<FileInfo | null>(null);

  // Update path when initialPath changes (e.g., navigation from another page)
  useEffect(() => {
    if (initialPath) {
      setCurrentPath(initialPath);
    }
  }, [initialPath]);

  // Fetch files list for current path
  const queryResults = useQuery({
    queryKey: ['files', 'list', currentPath],
    queryFn: async () => {
      const params = currentPath ? { path: currentPath } : {};
      const { data, error } = await api.GET('/api/v1/files/list', { params: { query: params } });
      if (error || !data) {
        throw new Error('Failed to load files');
      }
      return data;
    },
    enabled: !isDisabled,
  });

  // Handle entry click - navigate into directories or select files
  const handleEntryClick = useCallback(
    (entry: FileInfo) => {
      if (entry.type === 'directory') {
        // Navigate into directory
        const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        setCurrentPath(newPath);
        setSelectedEntry(null);
      } else {
        // Select file or versioned file
        setSelectedEntry(entry);
        onSelectFile?.(entry, currentPath);
      }
    },
    [currentPath, onSelectFile],
  );

  // Navigate up one level
  const navigateUp = useCallback(() => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
    setSelectedEntry(null);
  }, [currentPath]);

  return {
    currentPath,
    setCurrentPath,
    selectedEntry,
    setSelectedEntry,
    handleEntryClick,
    navigateUp,
    queryResults,
  };
}
