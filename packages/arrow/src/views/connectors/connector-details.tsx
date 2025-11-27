import { Note } from '@stately/ui/base/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@stately/ui/base/ui';
import { Database } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useArrowStatelyUi } from '@/context';
import { useConnectionDetails } from '@/hooks/use-connection-details';
import { useConnectors } from '@/hooks/use-connectors';
import { messageFromError, sanitizeIdentifier } from '@/lib/utils';
import type { ConnectionDetailQuery, ConnectionMetadata, ListSummary } from '@/types/api';
import { RegisterConnectors } from './connector-register';
import { ConnectorSummary } from './connector-summary';
import { ConnectorSummaryFilter } from './connector-summary-filter';

const createConnectorItemIdentifer = ({
  connector,
  filters,
  type,
  name,
}: {
  connector?: ConnectionMetadata;
  filters?: ConnectionDetailQuery;
  type: ListSummary['type'];
  name: string;
}): string => {
  let identifiers = '';
  const catalog = filters?.catalog || connector?.catalog;
  const sep = connector?.kind === 'object_store' ? '/' : '.';

  if (catalog) {
    identifiers += `${catalog}${sep}`;
  }

  if (type === 'databases') {
    return sanitizeIdentifier(name);
  }
  if (filters?.database) {
    identifiers += `${filters.database}${sep}`;
  }
  if (filters?.schema) {
    identifiers += `${filters.schema}${sep}`;
  }
  identifiers = `${identifiers}${name}`;
  return sanitizeIdentifier(identifiers);
};

export interface ConnectorDetailsProps {
  onSelectConnectorItem: (identifier: string, type: ListSummary['type']) => void;
}

export function ConnectorDetails({ onSelectConnectorItem }: ConnectorDetailsProps) {
  const { utils } = useArrowStatelyUi();
  const [filters, setFilters] = useState<ConnectionDetailQuery>();

  // Connectors
  const { connectorsQuery, currentConnector, catalogsQuery, registerMutation, setConnectorId } =
    useConnectors();

  const connectors = connectorsQuery.data ?? [];
  const connectorsLoading = connectorsQuery.isLoading;
  const connectorsError = connectorsQuery.error
    ? messageFromError(connectorsQuery.error) || 'Failed to load connectors.'
    : undefined;

  const catalogs = catalogsQuery.data ?? [];

  const registerError = registerMutation.error
    ? messageFromError(registerMutation.error) || 'Failed to register connection.'
    : undefined;

  // Database list or Tables/Files list
  const connectionDetailsQuery = useConnectionDetails(currentConnector?.id, filters);

  const onSelectItem = useCallback(
    (type: ListSummary['type'], name: string) => {
      const identifier = createConnectorItemIdentifer({
        connector: currentConnector,
        filters,
        name,
        type,
      });
      onSelectConnectorItem(identifier, type);
    },
    [filters, currentConnector, onSelectConnectorItem],
  );

  return (
    <>
      <div className="space-y-4">
        {/* Connector Details */}
        <h2 className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Connectors
        </h2>
        <div>
          {connectorsError ? (
            // Connector error
            <Note message={connectorsError} mode="error" />
          ) : (
            // Database & Table filter
            <div className="space-y-2">
              {/* Connector dropdown */}
              <Select onValueChange={setConnectorId} value={currentConnector?.id || ''}>
                <SelectTrigger
                  className="w-full min-w-0 flex-1"
                  disabled={connectorsLoading}
                  id="connector-selector"
                >
                  <SelectValue placeholder="Select connector" />
                </SelectTrigger>
                <SelectContent>
                  {connectors.map(connector => (
                    <SelectItem key={connector.id} value={connector.id}>
                      <div className="flex items-baseline">
                        <span className="items-center font-semi-bold text-sm">
                          {connector.name}
                        </span>
                        <span className="items-center text-xs text-muted-foreground truncate">
                          &nbsp; · {utils.toSpaceCase(connector.kind || 'memory')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {connectionDetailsQuery?.error ? (
            <Note
              message={
                messageFromError(connectionDetailsQuery.error) ||
                'Failed to list items for this connector.'
              }
              mode="error"
            />
          ) : (
            <ConnectorSummaryFilter onFilter={setFilters}>
              <Separator />

              {/* Database/Table Filter & Select */}
              <div className="space-y-1">
                <ConnectorSummary
                  isLoading={connectionDetailsQuery.isLoading}
                  onSelectItem={onSelectItem}
                  summary={connectionDetailsQuery.data}
                />
              </div>
            </ConnectorSummaryFilter>
          )}
        </div>
      </div>

      <RegisterConnectors
        catalogs={catalogs}
        connectors={connectors}
        error={registerError}
        isPending={registerMutation.isPending}
        register={registerMutation.mutateAsync}
      />
    </>
  );
}
