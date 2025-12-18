import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConnectionMetadata } from '@/types/api';
import { useArrowApi } from './use-arrow-api';
import { LIST_CATALOGS_QUERY_KEY } from './use-list-catalog';

/**
 * Hook to register a connection with the query engine.
 *
 * Registers a connector so its catalogs become available for querying.
 * Automatically invalidates the catalogs query on success to refresh
 * the available catalog list.
 *
 * @returns React Query mutation for registering connections
 *
 * @example
 * ```typescript
 * function RegisterButton({ connectorId }: { connectorId: string }) {
 *   const registerMutation = useRegisterConnection();
 *
 *   const handleRegister = () => {
 *     registerMutation.mutate(connectorId, {
 *       onSuccess: (connections) => {
 *         console.log('Registered:', connections);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <Button
 *       onClick={handleRegister}
 *       disabled={registerMutation.isPending}
 *     >
 *       {registerMutation.isPending ? 'Registering...' : 'Register'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useRegisterConnection() {
  const api = useArrowApi();
  const queryClient = useQueryClient();

  return useMutation<ConnectionMetadata[] | undefined, Error, string>({
    mutationFn: async connectorId => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.register({
        params: { path: { connector_id: connectorId || '' } },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate catalogs and registered query - registration may have added new catalogs
      queryClient.invalidateQueries({ queryKey: LIST_CATALOGS_QUERY_KEY });
    },
  });
}
