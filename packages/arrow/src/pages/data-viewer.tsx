import { Layout } from '@stately/ui';
import { Editor } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@stately/ui/base/ui';
import { Database, RefreshCw, SquareStack, Table as TableIcon, TextSearch } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CatalogBadge, ConnectionBadge, ObjectStoreBadge } from '@/components/badges';
import { useArrowStatelyUi } from '@/context';
import {
  useConnectionDetails,
  useListCatalogs,
  useListConnectors,
  useQueryStats,
  useRegisterConnection,
  useStreamingQuery,
} from '@/hooks';
import type { ArrowViewState } from '@/lib/arrow-view';
import { messageFromError, sanitizeIdentifier } from '@/lib/utils';
import type { ConnectionDetailQuery, ConnectionMetadata, ListSummary } from '@/types/api';
import { ConnectorSummary } from '@/views/connector-summary';
import { RegisterConnection } from '@/views/register-connector';
import { ViewerResultsTable } from '@/views/results';

const ConnectionCache = new Set<string>();

// export const Route = createFileRoute('/data')({ component: Viewer });

export function Viewer() {
  const { utils } = useArrowStatelyUi();

  const [connectorId, setConnectorId] = useState<string>();
  const [tableFilters, setTableFilters] = useState<ConnectionDetailQuery>();
  const [sql, setSql] = useState('SELECT 1');
  const [viewState, setViewState] = useState<ArrowViewState | null>(null);

  // Connectors
  const connectorsQuery = useListConnectors();
  const connectors = connectorsQuery.data ?? [];

  const registerMutation = useRegisterConnection();

  const currentConnector = connectors.find(c => c.id === connectorId);
  const isObjectStore = currentConnector?.kind === 'object_store';

  // Catalogs
  const currentCatalog = currentConnector?.catalog || '';
  const catalogsQuery = useListCatalogs(currentCatalog);
  const catalogs = catalogsQuery.data ?? [];

  // Query
  const {
    query,
    view,
    execute: executeQuery,
    isIdle,
    isPending,
    isStreaming,
  } = useStreamingQuery();
  const stats = useQueryStats(viewState);

  // Subscribe to view state changes
  useEffect(() => {
    return view.subscribe(setViewState);
  }, [view]);

  // Tables
  const listQuery = useConnectionDetails(connectorId, tableFilters);
  const listSummary = listQuery.data;

  const updateCache = useCallback(
    (id: string) => {
      if (id) {
        const cached = ConnectionCache.has(id);
        if (!cached) {
          ConnectionCache.add(id);
          catalogsQuery.refetch();
        }
      }
    },
    [catalogsQuery.refetch],
  );

  useEffect(() => {
    if (connectorId) {
      updateCache(connectorId);
    }
  }, [connectorId, updateCache]);

  const handleRun = useCallback(() => {
    if (!sql.trim()) return;
    executeQuery({ connector_id: connectorId, sql });
  }, [connectorId, sql, executeQuery]);

  const handleRegister = useCallback(
    async (connectorId: string): Promise<ConnectionMetadata | undefined> => {
      const registration = await registerMutation.mutateAsync(connectorId);
      if (registration) {
        updateCache(registration.id);
      }
      return registration;
    },
    [registerMutation, updateCache],
  );

  const handleUseTable = useCallback(
    (type: ListSummary['type'], name: string) => {
      let identifiers = '';
      const catalog = tableFilters?.catalog || currentCatalog;
      const sep = isObjectStore ? '/' : '.';

      if (catalog) {
        identifiers += `${catalog}${sep}`;
      }

      if (type === 'databases') {
        setSql(
          'SELECT * FROM information_schema.tables ' +
            'WHERE information_schema.tables.table_schema = ' +
            sanitizeIdentifier(name),
        );
      } else {
        if (tableFilters?.database) {
          identifiers += `${tableFilters.database}${sep}`;
        }
        if (tableFilters?.schema) {
          identifiers += `${tableFilters.schema}${sep}`;
        }
        identifiers = `${identifiers}${name}`;
        setSql(`SELECT * FROM ${sanitizeIdentifier(identifiers)} LIMIT 500`);
      }
    },
    [tableFilters, currentCatalog, isObjectStore],
  );

  // TODO: Remove
  console.debug('Data Viewer: ', {
    catalogs,
    connectorId,
    currentCatalog,
    currentConnector,
    listSummary,
    sqlIsIdle: isIdle(),
    sqlIsPending: isPending() || isStreaming(),
    tableFilters,
  });

  return (
    <Layout.Page
      breadcrumbs={[{ label: 'Viewer' }]}
      description="Fast, streaming access to any registered connector"
      title="Data Viewer"
    >
      <div className="flex flex-col gap-6">
        {/* Register error */}
        {registerMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {messageFromError(registerMutation.error) || 'Failed to register connection.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 grid-cols-6 @container">
          {/* Connector and Tables */}
          <Card
            className={cn(
              'flex-1 col-span-full @4xl:col-span-2',
              'xl:transition-[height] xl:ease-in-out xl:duration-400',
              currentConnector?.id ? '@4xl:row-span-2' : '',
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Connector &amp; Tables
              </CardTitle>
              <CardDescription>Choose a connector, then drill into its catalog.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Connector error */}
                {connectorsQuery.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {messageFromError(connectorsQuery.error) || 'Failed to load connectors.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Connector dropdown */}
                <Select onValueChange={setConnectorId} value={connectorId || ''}>
                  <SelectTrigger
                    className="w-full min-w-0 flex-1"
                    disabled={connectorsQuery.isLoading}
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

              {/* Database & Table filter */}
              {connectorId && listSummary && (
                <ConnectorSummary
                  error={listQuery.error}
                  isLoading={listQuery.isFetching}
                  listSummary={listSummary}
                  onFilter={setTableFilters}
                  onSelectItem={handleUseTable}
                />
              )}
            </CardContent>
          </Card>

          {/* Catalogs */}
          <Card className="py-4 col-span-full @4xl:col-span-4">
            <CardHeader className="">
              <CardTitle className="flex items-center gap-2">
                <SquareStack className="h-4 w-4" />
                Catalogs / Connections
              </CardTitle>
              <CardDescription>Currently registered catalogs</CardDescription>
              <CardAction>
                <RegisterConnection
                  connections={connectors}
                  isPending={registerMutation.isPending}
                  register={handleRegister}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm flex flex-wrap gap-2">
                {catalogs.map(c => (
                  <CatalogBadge catalog={c} key={`catalog-${c}`} />
                ))}

                {/* Special badge for object store */}
                <ObjectStoreBadge connector={currentConnector} />

                {/* Cached connections */}
                {[...ConnectionCache].map(c => (
                  <ConnectionBadge connector={c} key={`connector-${c}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Query */}
          <Card
            className={cn(
              'space-y-0',
              'col-span-full xl:transition-[width] xl:ease-in-out xl:duration-400',
              currentConnector?.id ? '@4xl:col-span-4' : '@4xl:col-span-6',
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TextSearch className="h-4 w-4" />
                Query
              </CardTitle>
              <CardDescription>Compose SQL, then stream Arrow results instantly.</CardDescription>
              <CardAction>
                <Button
                  disabled={!query.data && !query.error}
                  onClick={() => query.refetch()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2 h-full">
              <div className="flex flex-col flex-1">
                <Editor
                  className="min-h-full flex-1"
                  content={sql}
                  formId="viewer-query-editor"
                  onContent={setSql}
                  placeholder={'SELECT 1'}
                  saveButton={
                    <Button
                      className="cursor-pointer"
                      disabled={!sql.trim() || isPending() || isStreaming()}
                      onClick={handleRun}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {isPending() || isStreaming() ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Running…
                        </>
                      ) : (
                        <>
                          <TableIcon className="h-4 w-4" />
                          Run Query
                        </>
                      )}
                    </Button>
                  }
                  supportedLanguages={['sql']}
                />
              </div>

              <div className="flex gap-2 justify-between">
                {/* Query Stats */}
                {stats.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {stats.map(stat => (
                      <Badge
                        className={cn(
                          'flex flex-row items-center justify-center gap-1',
                          'rounded-lg border',
                          'text-xs',
                        )}
                        key={stat.label}
                        variant="secondary"
                      >
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {stat.label}
                        </span>
                        <span className="font-semibold text-sm">{stat.value}</span>
                      </Badge>
                    ))}
                  </div>
                )}

                {viewState?.table && (
                  <Button asChild type="button" variant="link">
                    <a href="#viewer-query-results">Go to Query Results</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card className="min-h-[420px] max-h-screen">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" id="viewer-query-results">
              <CardTitle className="flex items-center gap-2">
                <a href="#viewer-query-results">
                  <TableIcon className="h-4 w-4" />
                </a>
                Results
              </CardTitle>
            </CardTitle>
            <CardDescription>
              Virtualized grid keeps scrolling instant, even when results explode into the billions.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ViewerResultsTable
              error={query.error?.message ?? null}
              isLoading={isPending() || isStreaming()}
              table={viewState?.table ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </Layout.Page>
  );
}
