import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useFilesStatelyUi } from '../context';
import type { FileInfo } from '../types/api';

/**
 * Hook for browsing and navigating the file system.
 *
 * Provides directory navigation, file listing, and selection functionality
 * for building file browser UIs.
 *
 * @param options - Configuration options
 * @param options.initialPath - Starting directory path
 * @param options.onSelectFile - Callback when a file is selected
 * @param options.isDisabled - Whether to disable the query
 * @returns Object with navigation state and controls
 *
 * @example
 * ```typescript
 * function FileBrowser() {
 *   const {
 *     currentPath,
 *     queryResults,
 *     handleEntryClick,
 *     navigateUp,
 *   } = useFileExplore({
 *     onSelectFile: (file, path) => {
 *       console.log(`Selected: ${path}/${file.name}`);
 *     },
 *   });
 *
 *   if (queryResults.isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <Button onClick={navigateUp} disabled={!currentPath}>
 *         Up
 *       </Button>
 *       <ul>
 *         {queryResults.data?.map(entry => (
 *           <li key={entry.name} onClick={() => handleEntryClick(entry)}>
 *             {entry.type === 'directory' ? '📁' : '📄'} {entry.name}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFileExplore({
  initialPath,
  onSelectFile,
  isDisabled,
}: {
  initialPath?: string;
  onSelectFile?: (file: FileInfo, currentPath?: string) => void;
  isDisabled?: boolean;
}) {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;

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
    enabled: !isDisabled && !!filesApi,
    queryFn: async () => {
      if (!filesApi) throw new Error('Files API is unavailable');

      const { data, error } = await filesApi.list_files({
        params: { query: { path: currentPath || undefined } },
      });

      if (error || !data) throw new Error('Failed to load files');
      return data;
    },
    queryKey: ['files', 'list', currentPath],
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
    handleEntryClick,
    navigateUp,
    queryResults,
    selectedEntry,
    setCurrentPath,
    setSelectedEntry,
  };
}
