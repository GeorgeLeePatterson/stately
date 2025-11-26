import { useMutation } from '@tanstack/react-query';
import type { components } from '@/generated-types';
import { useArrowApi } from './use-arrow-api';

export type ConnectionMetadata = components['schemas']['ConnectionMetadata'];

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
