import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ConnectionMetadata } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

export const LIST_REGISTERED_QUERY_KEY = ['catalogs'] as const;

export interface CatalogRegistration {
  catalogs: string[];
  database: string[];
  object_store: string[];
  other: string[];
}

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
      catalogs: catalogs.filter(c => !allRegistered.some(r => r.catalog === c)),
      database: allRegistered
        .filter(r => r.metadata.kind === 'database')
        .map(r => r.catalog)
        .filter((c): c is string => !!c),
      object_store: allRegistered
        .filter(r => r.metadata.kind === 'object_store')
        .map(r => r.catalog)
        .filter((c): c is string => !!c)
        .map(c => (c.includes('://') ? c.split('://')[1] : c)),
      other: allRegistered
        .filter(r => typeof r.metadata.kind !== 'string')
        .map(r => r.catalog)
        .filter((c): c is string => !!c),
    };
  }, [allRegistered, catalogs]);

  return { allRegistered, query, registeredCatalogs };
}
