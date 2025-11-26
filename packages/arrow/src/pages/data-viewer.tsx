import { Layout, type Schemas } from '@stately/ui';
import { Editor } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Item,
  ItemActions,
  ItemContent,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
} from '@stately/ui/base/ui';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Database,
  Funnel,
  RefreshCw,
  Search,
  SquareStack,
  Table,
  Table as TableIcon,
  TextSearch,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useArrowStatelyUi } from '@/context';
import {
  type ListFilters,
  type ListSummary,
  useViewerCatalogs,
  useViewerConnectorStat,
  useViewerConnectors,
  useViewerQuery,
  useViewerRegister,
  useViewerStats,
} from '@/hooks';
import { ViewerResultsTable } from '@/views/results';

const ConnectorCache = new Set<string>();

// export const Route = createFileRoute('/data')({ component: Viewer });

export function Viewer<S extends Schemas = Schemas>() {
  const { utils } = useArrowStatelyUi();

  const [connectorId, setConnectorId] = useState<string>();
  const [tableFilters, setTableFilters] = useState<ListFilters>();
  const [sql, setSql] = useState('SELECT 1');

  // Connectors
  const connectorsQuery = useViewerConnectors();
  const connectors = connectorsQuery.data ?? [];

  const registerMutation = useViewerRegister();

  const currentConnector = connectors.find(c => c.id === connectorId);
  const isObjectStore = currentConnector?.kind === 'object_store';

  // Catalogs
  const currentCatalog = currentConnector?.catalog || '';
  const catalogsQuery = useViewerCatalogs(currentCatalog);
  const catalogs = catalogsQuery.data ?? [];

  // Query
  const queryMutation = useViewerQuery();
  const stats = useViewerStats(queryMutation.data ?? null);

  // Tables
  const listQuery = useViewerConnectorStat(connectorId, tableFilters);
  const listSummary = listQuery.data;

  const updateCache = useCallback(
    (id: string) => {
      if (id) {
        const cached = ConnectorCache.has(id);
        if (!cached) {
          ConnectorCache.add(id);
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
    queryMutation.mutate({ connector_id: connectorId, sql });
  }, [connectorId, sql, queryMutation.mutate]);

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
    sqlIsIdle: queryMutation.isIdle,
    sqlIsPending: queryMutation.isPending,
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
                <ConnectorStat
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
                <RegisterConnector
                  connections={connectors}
                  isPending={registerMutation.isPending}
                  register={handleRegister}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm flex flex-wrap gap-2">
                {catalogs.map(c => (
                  <Badge key={`catalog-${c}`} variant="outline">
                    {c}
                  </Badge>
                ))}

                {currentConnector?.kind === 'object_store' && (
                  <Badge key={'catalog-object_store'} variant="outline">
                    object store
                  </Badge>
                )}

                {[...ConnectorCache].map(c => (
                  <Badge key={`connector-${c}`} variant="default">
                    {c}
                  </Badge>
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
                  disabled={!queryMutation.data && !queryMutation.error}
                  onClick={() => queryMutation.reset()}
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
                      disabled={!sql.trim() || queryMutation.isPending}
                      onClick={handleRun}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {queryMutation.isPending ? (
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

                {queryMutation.data?.table && (
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
                  <Table className="h-4 w-4" />
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
              error={queryMutation.error?.message ?? null}
              isLoading={queryMutation.isPending}
              table={queryMutation.data?.table}
            />
          </CardContent>
        </Card>
      </div>
    </Layout.Page>
  );
}

function ConnectorStat({
  listSummary,
  isLoading,
  error,
  onSelectItem,
  onFilter,
}: {
  listSummary: ListSummary;
  isLoading?: boolean;
  error?: Error | null;
  onSelectItem: (type: ListSummary['type'], item: string) => void;
  onFilter: (filter?: ListFilters) => void;
}) {
  const { utils } = useXeo4StatelyUi();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listFilters, setListFilters] = useState<ListFilters>();
  const [search, setSearch] = useState('');

  const summaryType = listSummary.type;
  const filteredItems = useMemo(() => {
    if (!search) return listSummary.summary || [];
    const needle = search.toLowerCase();
    return listSummary.summary.filter(item =>
      (typeof item === 'string' ? item : item.name).toLowerCase().includes(needle),
    );
  }, [listSummary.summary, search]);

  const listFiltersDisplay = useMemo(() => {
    if (!listFilters) return null;
    const display = [];
    if (listFilters.catalog) display.push(listFilters.catalog);
    if (listFilters.database) display.push(listFilters.database);
    if (listFilters.schema) display.push(listFilters.schema);
    return display.join('.');
  }, [listFilters]);

  return (
    <Collapsible onOpenChange={setFiltersOpen} open={filtersOpen}>
      <CollapsibleTrigger asChild>
        <Item
          className="cursor-pointer py-1"
          onClick={() => setFiltersOpen(!filtersOpen)}
          size="sm"
          variant="muted"
        >
          <ItemContent>
            <span className="flex items-center gap-2 font-semibold">
              <Funnel className="h-3 w-3" />
              Filter
              {listFiltersDisplay ? (
                <span className="text-xs text-muted-foreground italic">({listFiltersDisplay})</span>
              ) : null}
            </span>
          </ItemContent>

          <ItemActions>
            <Button size="sm" type="button" variant="ghost">
              {filtersOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </ItemActions>
        </Item>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 py-2 px-3 border-muted border rounded-md">
          <div className="flex gap-2 items-center @container">
            <Input
              aria-label="Database"
              onChange={event => setListFilters(f => ({ ...f, database: event.target.value }))}
              placeholder="Database"
              value={listFilters?.database || ''}
            />
            <Input
              aria-label="Schema"
              onChange={event => setListFilters(f => ({ ...f, schema: event.target.value }))}
              placeholder="Schema"
              value={listFilters?.schema || ''}
            />

            {/* Submit/Cancel */}
            <ButtonGroup>
              <Button
                className="cursor-pointer"
                disabled={!listFilters || !(listFilters.database || listFilters.schema)}
                onClick={() => onFilter(listFilters)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Database />
                <span className="hidden @md:inline">Submit</span>
              </Button>
              <Button
                className="cursor-pointer"
                disabled={!listFilters || !(listFilters.database || listFilters.schema)}
                onClick={() => {
                  setListFilters(undefined);
                  onFilter(undefined);
                }}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <X />
              </Button>
            </ButtonGroup>
          </div>

          <Separator />

          {filteredItems.length === 0 ? (
            <div className="p-2 text-center text-xs text-muted-foreground">No items found.</div>
          ) : (
            <>
              <div className="space-y-1">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {messageFromError(error) || 'Failed to list items for this connector.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Table Filter & Select */}
                <div className="flex flex-col px-2 space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="shrink-0 flex gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      {utils.toTitleCase(summaryType)}
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1 text-xs text-foreground">
                          <Activity className="h-3 w-3 animate-spin" />
                        </span>
                      ) : (
                        <span className="w-4">&nbsp;</span>
                      )}
                    </span>

                    {/* Filter */}
                    <InputGroup className="relative">
                      <InputGroupAddon>
                        <InputGroupText>
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Filter"
                        value={search}
                      />
                    </InputGroup>
                  </div>

                  {/* Item list */}
                  <ScrollArea className="h-28 rounded-lg border">
                    <div className="divide-y">
                      {filteredItems.map(table => {
                        const name = typeof table === 'string' ? table : table.name;
                        const rows = typeof table === 'string' ? undefined : table.rows;
                        const size = typeof table === 'string' ? undefined : table.size_bytes;
                        return (
                          <Button
                            className="w-full text-left px-4 py-3 cursor-pointer rounded-none"
                            key={`filter-items-${name}`}
                            onClick={() => onSelectItem(summaryType, name)}
                            type="button"
                            variant="ghost"
                          >
                            <div className="flex-1 flex items-center justify-between text-xs font-medium text-left">
                              <span className="flex-auto truncate">{name}</span>
                              {rows && (
                                <Badge className="text-[10px] font-normal" variant="outline">
                                  {rows?.toLocaleString() ?? '–'} rows
                                </Badge>
                              )}
                              {size && (
                                <div className="text-[11px] text-muted-foreground">
                                  {formatBytes(size ?? 0)}
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function RegisterConnector({
  connections,
  register,
  isPending,
}: {
  connections: ConnectionMetadata[];
  register: (connectorId: string) => Promise<ConnectionMetadata | undefined>;
  isPending?: boolean;
}) {
  const { utils } = useXeo4StatelyUi();

  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState<ConnectionMetadata[]>([]);
  const registerConnector = useCallback(
    (connectorId: string) => {
      register(connectorId)
        .then(data => {
          if (data) {
            setRegistered(r => [...r, data]);
          }
        })
        .catch((error: { message: string }) => {
          console.error('Failed to register connector: ', { connectorId, error });
        });
    },
    [register],
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending} onClick={() => setOpen(!open)} variant="secondary">
          Register...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {connections.map(connection => (
          <DropdownMenuCheckboxItem
            checked={registered.some(r => r.id === connection.id)}
            disabled={isPending || registered.some(r => r.id === connection.id)}
            key={connection.id}
            onCheckedChange={checked => (checked ? registerConnector(connection.id) : checked)}
          >
            <span className="items-center font-semi-bold text-sm">{connection.name}</span>
            <span className="items-center text-xs text-muted-foreground truncate">
              &nbsp; · {utils.toSpaceCase(connection.kind || 'memory')}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function messageFromError(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return null;
}

function sanitizeIdentifier(name: string) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return `'${name}'`;
  }
  return name.includes('"')
    ? `"${name.replace(/"/g, '""')}"`
    : name.includes('://')
      ? `'${name}'`
      : name;
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
