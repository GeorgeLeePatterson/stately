import { cn } from '@stately/ui/base';
import { Note } from '@stately/ui/base/components';
import { messageFromError } from '@stately/ui/base/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
  Spinner,
} from '@stately/ui/base/ui';
import { ChevronDown, ChevronUp, Database, FileStack, Layers2, RefreshCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { ConnectorDetails } from '@/components/connector-details';
import { useMultiConnectionDetails } from '@/hooks/use-connection-details';
import type {
  ConnectionDetailQuery,
  ConnectionDetailsRequest,
  ConnectionKind,
  ConnectionMetadata,
  ListSummary,
} from '@/types/api';

export interface ConnectorMenuCardProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  onSelect: (connector?: ConnectionMetadata) => void;
  onSelectItem: (identifier: string, type: ListSummary['type']) => void;
  error?: string;
  isLoading?: boolean;
}

export function ConnectorMenuCard({
  connectors,
  currentConnector,
  error,
  onSelect,
  onSelectItem,
  isLoading,
  ...rest
}: ConnectorMenuCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const [filters, setFilters] = useState<ConnectionDetailsRequest['connectors']>({});

  // Database list or Tables/Files list
  const detailsRequest = useMemo(() => ({ connectors: filters }), [filters]);
  const connectionDetails = useMultiConnectionDetails(detailsRequest);

  const connectionDetailsError = connectionDetails.error
    ? messageFromError(connectionDetails.error) || 'Failed to load connection details.'
    : undefined;

  const isAnyLoading = isLoading || connectionDetails.isFetching;

  const handleSelect = useCallback(
    (id: string) => {
      const connector = connectors.find(connector => connector.id === id);
      connector && setFilters(prev => ({ ...prev, [connector.id]: {} }));
      onSelect(connector);
    },
    [connectors, onSelect],
  );

  const handleConnectorFilter = useCallback(
    (connectorId: string, filter?: ConnectionDetailQuery) => {
      setFilters(prev => ({ ...prev, [connectorId]: filter ?? {} }));
    },
    [],
  );

  const sortedConnectors = connectors.sort((a, b) => {
    if (a.kind !== b.kind) return (a.kind || '').localeCompare(b.kind || '');
    if (a.catalog !== b.catalog) return (a.catalog || '').localeCompare(b.catalog || '');
    return a.id.localeCompare(b.id);
  });

  // TODO: Remove
  console.debug('ConnectorMenuCard: ', {
    data: connectionDetails.data,
    detailsLoading: connectionDetails.isFetching,
    isAnyLoading,
    isLoading,
  });

  return (
    <Card {...rest} className={cn(['connector-select-card gap-4', rest?.className])}>
      <CardHeader>
        {/* Connector Details */}
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connectors
          </span>

          <AnyIsLoading isLoading={!!isLoading} loaderOnly>
            {Object.keys(connectionDetails?.data ?? {}).length > 0 ? (
              <Button
                className="cursor-pointer"
                onClick={() => connectionDetails.refetch()}
                size="icon-sm"
                variant="ghost"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </AnyIsLoading>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-auto flex flex-col space-y-2">
        {/* Connector error */}
        {error && <Note message={error} mode="error" />}

        {/* Connector dropdown */}
        <div className="flex flex-col">
          <Accordion
            className="w-full"
            collapsible
            defaultValue={currentConnector?.id}
            onValueChange={handleSelect}
            type="single"
          >
            {sortedConnectors.map(connector => (
              <ConnectorRow
                connector={connector}
                currentConnector={currentConnector}
                isLoading={
                  !!connectionDetails?.data?.[connector.id] && connectionDetails.isFetching
                }
                key={connector.id}
              >
                <div className={cn(['px-2 py-3', 'inset-shadow-sm/20'])}>
                  <ConnectorDetails
                    connectors={connectors}
                    currentConnector={currentConnector}
                    error={connectionDetailsError}
                    filters={filters}
                    isLoading={connectionDetails?.isFetching}
                    onSelect={onSelectItem}
                    setFilters={f => handleConnectorFilter(connector.id, f)}
                    summary={connectionDetails.data?.[connector.id]}
                  />
                </div>
              </ConnectorRow>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

const sharedClasses = 'px-3 border-0 hover:bg-muted rounded-none cursor-pointer';

const connectorKindClasses: { [key in ConnectionKind]: string } = {
  database: 'border-l-2 border-primary',
  object_store: 'border-l-2 border-blue-500',
  other: 'border-l-2 border-gray-500',
};

const connectorKindIcons: { [key in ConnectionKind]: React.ReactNode } = {
  database: <Database className="w-4 h-4" />,
  object_store: <FileStack className="w-4 h-4" />,
  other: <Layers2 className="w-4 h-4" />,
};

function ConnectorRow({
  currentConnector: c,
  connector,
  isLoading,
  children,
}: React.PropsWithChildren<{
  currentConnector?: ConnectionMetadata;
  connector: ConnectionMetadata;
  isLoading?: boolean;
}>) {
  const kindClasses = connectorKindClasses[connector.kind ?? 'other'] ?? connectorKindClasses.other;
  const kindIcon = connectorKindIcons[connector.kind ?? 'other'] ?? connectorKindIcons.other;

  const isSelected = c?.id === connector.id;

  return (
    <AccordionItem value={connector.id}>
      <AccordionTrigger asChild headerProps={{ asChild: true }}>
        <Item
          className={cn([sharedClasses, kindClasses])}
          size="sm"
          variant={isSelected ? 'muted' : 'default'}
        >
          <ItemMedia>{isLoading ? <Spinner className="w-4 h-4" /> : kindIcon}</ItemMedia>
          <ItemContent>
            <ItemTitle className="text-ellipsis">{connector.id}</ItemTitle>
          </ItemContent>
          <ItemActions>
            {isSelected ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </ItemActions>
        </Item>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}
