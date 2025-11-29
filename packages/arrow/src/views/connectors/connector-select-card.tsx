import { cn } from '@stately/ui/base';
import { Note } from '@stately/ui/base/components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@stately/ui/base/ui';
import { Database } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ConnectorSummary } from '@/components/connector-summary';
import { ConnectorSummaryFilter } from '@/components/connector-summary-filter';
import { useArrowStatelyUi } from '@/context';
import { useConnectionDetails } from '@/hooks/use-connection-details';
import { messageFromError, sanitizeIdentifier } from '@/lib/utils';
import type { ConnectionDetailQuery, ConnectionMetadata, ListSummary } from '@/types/api';

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

export interface ConnectorSelectCardProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  onSelectConnector: (connector?: ConnectionMetadata) => void;
  onSelectConnectorItem: (identifier: string, type: ListSummary['type']) => void;
  error?: string;
  isLoading?: boolean;
}

export function ConnectorSelectCard({
  connectors,
  currentConnector,
  error,
  onSelectConnector,
  onSelectConnectorItem,
  isLoading,
  ...rest
}: ConnectorSelectCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const { utils } = useArrowStatelyUi();
  const [filters, setFilters] = useState<ConnectionDetailQuery>();

  // Database list or Tables/Files list
  const connectionDetailsQuery = useConnectionDetails(currentConnector?.id, filters);

  const onSelect = useCallback(
    (id: string) => onSelectConnector(connectors.find(connector => connector.id === id)),
    [connectors, onSelectConnector],
  );

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
    <Card {...rest} className={cn(['connector-select-card gap-4', rest?.className])}>
      <CardHeader>
        {/* Connector Details */}
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Connectors
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-auto flex flex-col space-y-2 overflow-y-hidden">
        {/* Connector error */}
        {error && <Note message={error} mode="error" />}

        {/* Database & Table filter */}
        {/* Connector dropdown */}
        <Select onValueChange={onSelect} value={currentConnector?.id || ''}>
          <SelectTrigger
            className="w-full min-w-0 flex-1"
            disabled={isLoading}
            id="connector-selector"
          >
            <SelectValue placeholder="Select connector" />
          </SelectTrigger>
          <SelectContent>
            {connectors.map(connector => (
              <SelectItem key={connector.id} value={connector.id}>
                <div className="flex items-baseline">
                  <span className="items-center font-semi-bold text-sm">{connector.name}</span>
                  <span className="items-center text-xs text-muted-foreground truncate">
                    &nbsp; · {utils.toSpaceCase(connector.kind || 'memory')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {connectionDetailsQuery?.error ? (
          <Note
            message={
              messageFromError(connectionDetailsQuery.error) ||
              'Failed to list items for this connector.'
            }
            mode="error"
          />
        ) : (
          <ConnectorSummaryFilter
            isDisabled={
              connectionDetailsQuery.isLoading ||
              connectionDetailsQuery.isError ||
              connectionDetailsQuery.isFetching ||
              !currentConnector
            }
            onFilter={setFilters}
          >
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
      </CardContent>
    </Card>
  );
}
