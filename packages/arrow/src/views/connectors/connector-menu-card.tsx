import { cn } from '@statelyjs/ui/base';
import { Note } from '@statelyjs/ui/base/components';
import { messageFromError } from '@statelyjs/ui/base/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
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
} from '@statelyjs/ui/base/ui';
import { ChevronDown, ChevronUp, Database, FileStack, Layers2, RefreshCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { useMultiConnectionDetails } from '@/hooks/use-connection-details';
import { createConnectionItemIdentifier } from '@/lib/utils';
import type {
  ConnectionDetailsRequest,
  ConnectionMetadata,
  ConnectionSearchQuery,
  ListSummary,
} from '@/types/api';
import { ConnectorSummary } from './connector-summary';

export const connectorKindClasses = {
  database: { border: 'border-primary' },
  object_store: { border: 'border-blue-500' },
  other: { border: 'border-gray-500' },
};

export const connectorKindIcons = {
  database: <Database className="w-4 h-4" />,
  object_store: <FileStack className="w-4 h-4" />,
  other: <Layers2 className="w-4 h-4" />,
};

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
  const [opened, setOpened] = useState<string[]>([]);

  // Database/Files list or Tables list
  const detailsRequest = useMemo(() => ({ connectors: filters, fail_on_error: false }), [filters]);
  const connectionDetails = useMultiConnectionDetails(detailsRequest);

  const connectionDetailsError = connectionDetails.error
    ? messageFromError(connectionDetails.error) || 'Failed to load connection details.'
    : undefined;

  const isAnyLoading = isLoading || connectionDetails.isFetching;

  // Clicking on a connector
  const handleSelect = useCallback(
    (id: string) => {
      const connector = connectors.find(connector => connector.id === id);
      connector &&
        setFilters(prev => (connector.id in prev ? prev : { ...prev, [connector.id]: {} }));
      onSelect(connector);
    },
    [connectors, onSelect],
  );

  // Search button in summary
  const handleConnectorSearch = useCallback(
    (connectorId: string, search?: ConnectionSearchQuery) =>
      setFilters(prev => ({ ...prev, [connectorId]: search ?? {} })),
    [],
  );

  // Clicking on an item in the summary
  const connectorFilter = currentConnector?.id ? filters?.[currentConnector.id] : undefined;
  const handleSelectItem = useCallback(
    (type: ListSummary['type'], name: string) => {
      if (type === 'databases') {
        onSelectItem(name, type);
        return;
      }
      const catalog = currentConnector?.catalog ?? undefined;
      const database = connectorFilter?.search ?? '';
      const sep = currentConnector?.metadata.kind === 'object_store' ? '/' : '.';
      const identifier = createConnectionItemIdentifier({ catalog, database, name, sep });
      onSelectItem(identifier, type);
    },
    [connectorFilter, currentConnector, onSelectItem],
  );

  // Sort connectors
  const sortedConnectors = useMemo(
    () =>
      connectors.sort((a, b) => {
        const akind = a.metadata.kind;
        const bkind = b.metadata.kind;
        if (typeof akind === 'string' && typeof bkind === 'string') {
          if (akind !== bkind) return (akind || '').localeCompare(bkind || '');
        } else if (typeof akind === 'string') {
          return -1;
        } else if (typeof bkind === 'string') {
          return 1;
        } else {
          if (akind.other !== bkind.other) return akind.other.localeCompare(bkind.other);
        }
        if (a.catalog !== b.catalog) return (a.catalog || '').localeCompare(b.catalog || '');
        return a.id.localeCompare(b.id);
      }),
    [connectors],
  );

  return (
    <Card {...rest} className={cn(['connector-select-card gap-4', rest?.className])}>
      <CardHeader>
        {/* Connector Details */}
        <CardTitle className="flex items-center justify-between gap-2 h-full h-8">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connections
          </div>
          <AnyIsLoading className="h-3.5 w-3.5" isLoading={!!isAnyLoading} loaderOnly>
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
          <Accordion className="w-full" onValueChange={setOpened} type="multiple" value={opened}>
            {sortedConnectors.map(connector => (
              <ConnectorRow
                connector={connector}
                isLoading={
                  !!connectionDetails?.data?.[connector.id] && connectionDetails.isFetching
                }
                isSelected={currentConnector?.id === connector.id}
                key={connector.id}
                onSelect={handleSelect}
              >
                <div
                  className={cn(
                    'flex-auto flex flex-col space-y-2',
                    'p-2 min-h-[94px]',
                    'border-border border-x bg-muted/40',
                    'inset-shadow-sm/10',
                  )}
                >
                  {currentConnector?.id === connector.id && connectionDetailsError && (
                    <Note message={connectionDetailsError} mode="error" />
                  )}

                  {/* Database/Table Filter & Select */}
                  <ConnectorSummary
                    connectorKind={connector.metadata.kind}
                    isLoading={connectionDetails.isFetching}
                    onSearch={f => handleConnectorSearch(connector.id, f)}
                    onSelectItem={handleSelectItem}
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

function ConnectorRow({
  connector,
  onSelect,
  isLoading,
  isSelected,
  children,
}: React.PropsWithChildren<{
  connector: ConnectionMetadata;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}>) {
  const connectorKind =
    typeof connector.metadata.kind === 'string' ? connector.metadata.kind : 'other';
  const kindClasses = (connectorKindClasses[connectorKind] ?? connectorKindClasses.other).border;
  const kindIcon = connectorKindIcons[connectorKind] ?? connectorKindIcons.other;

  return (
    <AccordionItem value={connector.id}>
      <AccordionTrigger asChild className="hover:no-underline" headerProps={{ asChild: true }}>
        <Item
          className={cn([
            'px-4 py-3 hover:bg-muted cursor-pointer',
            'rounded-none border-0 border-l-2 ',
            kindClasses,
          ])}
          onClick={() => onSelect(connector.id)}
          size="sm"
          variant={isSelected ? 'muted' : 'default'}
        >
          <ItemMedia className="self-center">
            {isLoading ? <Spinner className="w-4 h-4" /> : kindIcon}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <span className="text-ellipsis">{connector.name}</span>
              {isSelected && (
                <>
                  &nbsp;
                  <Badge className="p-1 rounded-full" variant="default" />
                </>
              )}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            {isSelected ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </ItemActions>
        </Item>
      </AccordionTrigger>
      <AccordionContent className="p-0">{children}</AccordionContent>
    </AccordionItem>
  );
}
