import { useQuery } from '@tanstack/react-query';
import { useFilesStatelyUi } from '@/context';

/**
 * Value type for versioned file references.
 */
export interface VersionedDataValue {
  /** Directory type, always 'upload' for versioned files */
  dir: 'upload';
  /** Path to the versioned file */
  path: string;
}

/** Subdirectory name where file versions are stored. */
export const versionSubDir = '__versions__';

/**
 * Hook to list versions of a versioned file.
 *
 * Fetches the version history for a file in the uploads directory.
 * Versions are stored in a `__versions__` subdirectory.
 *
 * @param options - Configuration options
 * @param options.value - The versioned file reference
 * @returns Object with filename and React Query results
 *
 * @example
 * ```typescript
 * function FileVersionHistory({ file }: { file: VersionedDataValue }) {
 *   const { filename, data: versions, isLoading } = useFileVersions({
 *     value: file,
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <h3>Versions of {filename}</h3>
 *       <ul>
 *         {versions?.map(v => (
 *           <li key={v.name}>{v.name} - {v.modified}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFileVersions({ value }: { value?: VersionedDataValue }) {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;

  // The path should just be the filename (e.g., "cigna.sh")
  // No need to strip "uploads/" since dir: 'upload' already indicates the uploads directory
  const filename = value?.path || null;

  // Fetch versions for the current file
  const queryResults = useQuery({
    enabled: !!filename && !!filesApi,
    queryFn: async () => {
      if (!filename || !filesApi) return null;
      const { data, error } = await filesApi.list_files({
        params: { query: { path: `${filename}/${versionSubDir}` } },
      });
      if (error || !data) {
        throw new Error('Failed to load file versions');
      }
      return data;
    },
    queryKey: ['files', 'versions', filename],
  });

  return { filename, ...queryResults };
}
