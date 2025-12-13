import { useQuery } from '@tanstack/react-query';
import { useArrowApi } from './use-arrow-api';

export const LIST_CATALOGS_QUERY_KEY = ['catalogs'] as const;

export function useListCatalogs(key?: string, disabled?: boolean) {
  const api = useArrowApi();
  return useQuery({
    enabled: !disabled,
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_catalogs();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: [...LIST_CATALOGS_QUERY_KEY, key],
  });
}
