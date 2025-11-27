import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConnectionMetadata } from '@/types/api';
import { useArrowApi } from './use-arrow-api';
import { LIST_CATALOGS_QUERY_KEY } from './use-list-catalog';

export function useRegisterConnection() {
  const api = useArrowApi();
  const queryClient = useQueryClient();

  return useMutation<ConnectionMetadata | undefined, Error, string>({
    mutationFn: async connectorId => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.register({
        params: { path: { connector_id: connectorId || '' } },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate catalogs query - registration may have added new catalogs
      queryClient.invalidateQueries({ queryKey: LIST_CATALOGS_QUERY_KEY });
    },
  });
}
