import { useState } from 'react';
import { useListCatalogs } from './use-list-catalog';
import { useListConnectors } from './use-list-connections';
import { useRegisterConnection } from './use-register-connection';

export function useConnectors() {
  const connectorsQuery = useListConnectors();
  const connectors = connectorsQuery.data ?? [];

  const [connectorId, setConnectorId] = useState<string>();

  const currentConnector = connectors.find(c => c.id === connectorId);
  const catalogsQuery = useListCatalogs(currentConnector?.catalog ?? undefined);

  const registerMutation = useRegisterConnection();

  return { catalogsQuery, connectorsQuery, currentConnector, registerMutation, setConnectorId };
}
