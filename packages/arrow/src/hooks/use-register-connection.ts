import { useMutation } from '@tanstack/react-query';
import type { ConnectionMetadata } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

export function useRegisterConnection() {
  const api = useArrowApi();
  return useMutation<ConnectionMetadata | undefined, Error, string>({
    mutationFn: async connectorId => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.register({
        params: { path: { connector_id: connectorId || '' } },
      });

      if (error) throw error;
      return data;
    },
  });
}
