import type { UseQueryResult } from '@tanstack/react-query';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import type { ConnectionMetadata } from '@/types/api';
import { useListConnectors } from './use-list-connections';

/**
 * Return type for the {@link useConnectors} hook.
 */
export interface UseConnectors {
  /** List of all available connectors */
  connectors: ConnectionMetadata[];
  /** Currently selected connector, if any */
  currentConnector?: ConnectionMetadata;
  /** The underlying React Query result for the connectors list */
  connectorsQuery: UseQueryResult<ConnectionMetadata[], Error>;
  /** Function to update the selected connector ID */
  setConnectorId: Dispatch<SetStateAction<string | undefined>>;
}

/**
 * Hook for managing connector selection state.
 *
 * Combines connector listing with selection state management, providing
 * a convenient way to implement connector picker UIs.
 *
 * @returns Object containing connectors list, current selection, and setter
 *
 * @example
 * ```typescript
 * function ConnectorPicker() {
 *   const { connectors, currentConnector, setConnectorId } = useConnectors();
 *
 *   return (
 *     <Select
 *       value={currentConnector?.id}
 *       onValueChange={setConnectorId}
 *     >
 *       {connectors.map(c => (
 *         <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
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
