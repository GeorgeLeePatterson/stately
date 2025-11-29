import type { UseQueryResult } from '@tanstack/react-query';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import type { ConnectionMetadata } from '@/types/api';
import { useListConnectors } from './use-list-connections';

export interface UseConnectors {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  connectorsQuery: UseQueryResult<ConnectionMetadata[], Error>;
  setConnectorId: Dispatch<SetStateAction<string | undefined>>;
}

export function useConnectors(): UseConnectors {
  const connectorsQuery = useListConnectors();
  const connectors = connectorsQuery.data ?? [];

  const [connectorId, setConnectorId] = useState<string>();

  const currentConnector = useMemo(
    () => connectors.find(c => c.id === connectorId),
    [connectors, connectorId],
  );

  return { connectors, connectorsQuery, currentConnector, setConnectorId };
}
