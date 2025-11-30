import { cn } from '@stately/ui/base';
import { Note } from '@stately/ui/base/components';
import { Separator } from '@stately/ui/base/ui';
import { useCallback } from 'react';
import { ConnectorSummary } from '@/components/connector-summary';
import { ConnectorSummaryFilter } from '@/components/connector-summary-filter';
import { sanitizeIdentifier } from '@/lib/utils';
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

export interface ConnectorDetailsProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  filters?: ConnectionDetailQuery;
  setFilters: (filters: ConnectionDetailQuery) => void;
  summary?: ListSummary;
  onSelect: (identifier: string, type: ListSummary['type']) => void;
  error?: string;
  isLoading?: boolean;
}

export function ConnectorDetails({
  connectors,
  currentConnector,
  filters,
  setFilters,
  summary,
  error,
  onSelect,
  isLoading,
  ...rest
}: ConnectorDetailsProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  // TODO: Remove
  console.debug('ConnectorDetails ---> ', { isLoading });

  const onSelectItem = useCallback(
    (type: ListSummary['type'], name: string) => {
      const identifier = createConnectorItemIdentifer({
        connector: currentConnector,
        filters,
        name,
        type,
      });
      onSelect(identifier, type);
    },
    [filters, currentConnector, onSelect],
  );

  return (
    <div className="flex-auto flex flex-col space-y-2">
      {error && <Note message={error} mode="error" />}

      <div
        {...rest}
        className={cn(['h-full max-h-full space-y-2', 'flex flex-col', rest?.className])}
      >
        {/* Database & Table filter */}
        <ConnectorSummaryFilter
          isDisabled={!currentConnector || !!error || isLoading}
          onFilter={setFilters}
        />

        <Separator />

        {/* Database/Table Filter & Select */}
        <ConnectorSummary isLoading={isLoading} onSelectItem={onSelectItem} summary={summary} />
      </div>
    </div>
  );
}
