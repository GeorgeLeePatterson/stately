import { Layout } from '@stately/ui';
import { Button, CardDescription } from '@stately/ui/base/ui';
import { RefreshCw, Table as TableIcon, TextSearch } from 'lucide-react';
import { useCallback, useState } from 'react';
import { QueryEditor } from '@/components';
import { useStreamingQuery } from '@/hooks/use-streaming-query';
import type { ArrowTableViewState } from '@/lib/arrow-table-view';
import type { ListSummary } from '@/types/api';
import { ConnectorDetails } from '@/views/connectors/connector-details';
import { QueryResults } from '@/views/query/results';

// export const Route = createFileRoute('/data')({ component: Viewer });

export function ArrowViewer() {
  const [sql, setSql] = useState('SELECT 1');
  const [viewState, setViewState] = useState<ArrowTableViewState | null>(null);

  // Query
  const {
    query,
    queryStats,
    execute: executeQuery,
    isIdle,
    isPending,
    isStreaming,
  } = useStreamingQuery({ subscribe: setViewState });

  const handleRun = useCallback(
    (connector_id?: string) => {
      if (!sql.trim()) return;
      executeQuery({ connector_id, sql });
    },
    [sql, executeQuery],
  );

  const handleSelectConnector = useCallback((identifier: string, type: ListSummary['type']) => {
    if (type === 'databases') {
      setSql(
        'SELECT * FROM information_schema.tables ' +
          `WHERE information_schema.tables.table_schema = ${identifier}`,
      );
    } else {
      setSql(`SELECT * FROM ${identifier} LIMIT 500`);
    }
  }, []);

  // TODO: Remove
  console.debug('Data Viewer: ', {
    sqlIsIdle: isIdle(),
    sqlIsPending: isPending() || isStreaming(),
  });

  return (
    <Layout.Page
      breadcrumbs={[{ label: 'Viewer' }]}
      description="Fast, streaming access to any registered connector"
      title="Data Viewer"
    >
      <div className="flex flex-row flex-nowrap gap-6">
        {/* Left */}
        <div className="grid @container">
          {/* Connector and Tables */}

          <ConnectorDetails onSelectConnectorItem={handleSelectConnector} />
        </div>

        {/* Right */}
        <div className="flex flex-col flex-nowrap gap-6">
          {/* Query */}
          <div className="flex flex-col space-y-2 h-1/3">
            <h2 className="flex items-center gap-2 justify-between">
              <TextSearch className="h-4 w-4" />
              Query
              <div>
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
              </div>
            </h2>
            <CardDescription>Compose SQL, then stream Arrow results instantly.</CardDescription>
            <QueryEditor
              footerContent={
                viewState?.table ? (
                  <Button asChild type="button" variant="link">
                    <a href="#viewer-query-results">Go to Query Results</a>
                  </Button>
                ) : null
              }
              formId="viewer-query-editor"
              isPending={isPending()}
              isStreaming={isStreaming()}
              onChange={setSql}
              onRun={handleRun}
              stats={queryStats}
              value={sql}
            />
          </div>

          {/* Results */}
          <div className="flex flex-col space-y-2 flex-auto">
            <h2 className="flex items-center gap-2">
              <a href="#viewer-query-results">
                <TableIcon className="h-4 w-4" />
              </a>
              Results
            </h2>
            <div className="overflow-hidden">
              <QueryResults
                error={query.error?.message ?? null}
                isLoading={isPending() || isStreaming()}
                table={viewState?.table ?? null}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout.Page>
  );
}
