import { useQuery } from '@tanstack/react-query';
import { useArrowApi } from './use-arrow-api';

export function useListConnectors() {
  const api = useArrowApi();
  return useQuery({
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_connectors();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: ['connectors'],
  });
}
