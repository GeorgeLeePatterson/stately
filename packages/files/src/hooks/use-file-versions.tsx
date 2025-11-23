import { useQuery } from '@tanstack/react-query';
import { useFilesStatelyUi } from '@/context';

export interface VersionedDataValue {
  dir: 'upload';
  path: string;
}

export const versionSubDir = '__versions__';

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
      const { data, error } = await filesApi.list({
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
