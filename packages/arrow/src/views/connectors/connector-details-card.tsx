import { cn } from '@stately/ui/base';
import { messageFromError } from '@stately/ui/base/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@stately/ui/base/ui';
import { Funnel } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConnectorDetails } from '@/components';
import { AnyIsLoading } from '@/components/any-is-loading';
import { useConnectionDetails } from '@/hooks/use-connection-details';
import type { ConnectionDetailQuery, ConnectionMetadata, ListSummary } from '@/types/api';

export interface ConnectorDetailsCardProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  onSelect: (identifier: string, type: ListSummary['type']) => void;
  error?: string;
  isLoading?: boolean;
}

export function ConnectorDetailsCard({
  connectors,
  currentConnector,
  error,
  onSelect,
  isLoading,
  ...rest
}: ConnectorDetailsCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const [filters, setFilters] = useState<ConnectionDetailQuery>();

  const filtersDisplay = useMemo(() => {
    if (!filters) return null;
    const display = [];
    if (filters.catalog) display.push(filters.catalog);
    if (filters.database) display.push(filters.database);
    if (filters.schema) display.push(filters.schema);
    return <span className="text-xs text-muted-foreground italic">({display.join('.')}</span>;
  }, [filters]);

  // Database list or Tables/Files list
  const connectionDetailsQuery = useConnectionDetails(currentConnector?.id, filters);

  const connectionDetailsError = connectionDetailsQuery.error
    ? messageFromError(connectionDetailsQuery.error) || 'Failed to load connection details.'
    : undefined;

  const isAnyLoading = isLoading || connectionDetailsQuery.isFetching;

  // TODO: Remove
  console.debug('Connector Select Card: ', {
    connDetailsErrorMessage: `${connectionDetailsQuery.error?.message}`,
    connDetailsErrorName: `${connectionDetailsQuery.error?.name}`,
    connDetailsLoading: connectionDetailsQuery.isFetching,
    connectionDetailsQueryError: connectionDetailsQuery.error,
    isLoading,
  });

  return (
    <Card {...rest} className={cn(['connector-select-card gap-4', rest?.className])}>
      <CardHeader>
        {/* Connector Details */}
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Funnel className="h-3 w-3" />
            Details &amp; Filter
          </span>

          {filtersDisplay}
          <AnyIsLoading isLoading={!!isAnyLoading} loaderOnly />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConnectorDetails
          connectors={connectors}
          currentConnector={currentConnector}
          error={connectionDetailsError}
          filters={filters}
          isLoading={isAnyLoading}
          onSelect={onSelect}
          setFilters={setFilters}
          summary={connectionDetailsQuery.data}
        />
      </CardContent>
    </Card>
  );
}
