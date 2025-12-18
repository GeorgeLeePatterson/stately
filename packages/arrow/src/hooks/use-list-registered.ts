import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ConnectionMetadata } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

/** Query key for registered connections queries, used for cache invalidation. */
export const LIST_REGISTERED_QUERY_KEY = ['catalogs'] as const;

/**
 * Categorized catalog registrations by connection type.
 */
export interface CatalogRegistration {
  /** Catalogs that exist but are not yet registered */
  catalogs: Set<string>;
  /** Registered database connections */
  database: Set<string>;
  /** Registered object store connections (S3, GCS, etc.) */
  object_store: Set<string>;
  /** Other registered connection types */
  other: Set<string>;
}

/**
 * Hook to list registered connections with categorization.
 *
 * Fetches all registered connections and categorizes them by type (database,
 * object store, etc.). Also merges in recently registered connections that
 * may not yet be reflected in the API response.
 *
 * @param options - Configuration options
 * @param options.key - Optional additional key segment for query differentiation
 * @param options.recentlyRegistered - Recently registered connections to merge
 * @param options.catalogs - Known catalog names for comparison
 * @param options.disabled - Whether to disable the query
 * @returns Object with all registered connections, query result, and categorized catalogs
 *
 * @example
 * ```typescript
 * function RegistrationStatus() {
 *   const { registeredCatalogs, allRegistered } = useListRegistered({
 *     catalogs: ['sales', 'analytics'],
 *   });
 *
 *   return (
 *     <div>
 *       <h3>Databases: {registeredCatalogs.database.size}</h3>
 *       <h3>Object Stores: {registeredCatalogs.object_store.size}</h3>
 *       <h3>Unregistered: {registeredCatalogs.catalogs.size}</h3>
 *     </div>
 *   );
 * }
 * ```
 */
export function useListRegistered({
  key,
  recentlyRegistered = [],
  catalogs = [],
  disabled,
}: {
  key?: string;
  recentlyRegistered?: ConnectionMetadata[];
  catalogs?: string[];
  disabled?: boolean;
}) {
  const api = useArrowApi();
  const query = useQuery({
    enabled: !disabled,
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_registered();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: [...LIST_REGISTERED_QUERY_KEY, key],
  });

  const registered = query.data ?? [];

  const allRegistered = useMemo(
    () => [
      ...registered,
      ...recentlyRegistered.filter(r => !registered.some(rr => rr.id === r.id)),
    ],
    [registered, recentlyRegistered],
  );

  // Api provided, and current
  const registeredCatalogs = useMemo<CatalogRegistration>(() => {
    return {
      catalogs: new Set(catalogs.filter(c => !allRegistered.some(r => r.catalog === c))),
      database: new Set(
        allRegistered
          .filter(r => r.metadata.kind === 'database')
          .map(r => r.catalog)
          .filter((c): c is string => !!c),
      ),
      object_store: new Set(
        allRegistered
          .filter(r => r.metadata.kind === 'object_store')
          .map(r => r.catalog)
          .filter((c): c is string => !!c)
          .map(c => (c.includes('://') ? c.split('://')[1] : c)),
      ),
      other: new Set(
        allRegistered
          .filter(r => typeof r.metadata.kind !== 'string')
          .map(r => r.catalog)
          .filter((c): c is string => !!c),
      ),
    };
  }, [allRegistered, catalogs]);

  return { allRegistered, query, registeredCatalogs };
}
