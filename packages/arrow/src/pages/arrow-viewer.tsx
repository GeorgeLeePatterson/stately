import { Layout } from '@stately/ui';
import { cn } from '@stately/ui/base/lib/utils';
import { useCallback, useMemo } from 'react';
import { useConnectors } from '@/hooks/use-connectors';
import { useStreamingQuery } from '@/hooks/use-streaming-query';
import type { ArrowTableStore } from '@/lib/arrow-table-store';
import { messageFromError } from '@/lib/utils';
import type { ListSummary } from '@/types/api';
import { ConnectorsRegisterCard } from '@/views/connectors';
import { ConnectorSelectCard } from '@/views/connectors/connector-select-card';
import { DEFAULT_RESULTS_HREF_ID, QueryEditorCard, QueryResultsCard } from '@/views/query';

export function ArrowViewer(props: { subscribe?: Parameters<ArrowTableStore['subscribe']>[0] }) {
  // Connectors
  const { connectors, connectorsQuery, currentConnector, setConnectorId } = useConnectors();

  const connectorsError = connectorsQuery.error
    ? messageFromError(connectorsQuery.error) || 'Failed to load connectors.'
    : undefined;

  // Query
  const { createDataView, query, queryStats, execute, isPending, isStreaming, isActive, restart } =
    useStreamingQuery(props);

  const view = useMemo(() => createDataView(), [createDataView]);

  const isExecuting = useMemo(() => isPending || isStreaming, [isPending, isStreaming]);

  const handleRun = useCallback(
    (sql: string) => {
      if (!sql.trim()) return;
      execute({ connector_id: currentConnector?.id, sql });
    },
    [execute, currentConnector?.id],
  );

  // Connector + Query
  const handleSelectConnectorItem = useCallback(
    (identifier: string, type: ListSummary['type']) => {
      let sql = `SELECT * FROM ${identifier} LIMIT 500`;
      if (type === 'databases') {
        sql =
          'SELECT * FROM information_schema.tables ' +
          `WHERE information_schema.tables.table_schema = ${identifier}`;
      }
      handleRun(sql);
    },
    [handleRun],
  );

  return (
    <Layout.Page
      breadcrumbs={[{ label: 'Viewer' }]}
      description="Fast, streaming access to any registered connector"
      title="Data Viewer"
    >
      <div className={cn(['arrow-viewer', 'grid grid-cols-3 gap-4', 'h-full', 'w-full min-w-0'])}>
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Connector and Tables */}
          <ConnectorSelectCard
            className="flex-auto"
            connectors={connectors}
            currentConnector={currentConnector}
            error={connectorsError}
            isLoading={connectorsQuery.isLoading}
            onSelectConnector={c => setConnectorId(c?.id)}
            onSelectConnectorItem={handleSelectConnectorItem}
          />

          {/* Catalogs and Registered Connectors */}
          <ConnectorsRegisterCard connectors={connectors} currentConnector={currentConnector} />
        </div>

        {/* Right */}
        <div className="col-span-2 flex flex-col flex-nowrap gap-4">
          {/* Query */}
          <QueryEditorCard
            editorProps={{ isExecuting, resultsHrefId: DEFAULT_RESULTS_HREF_ID, stats: queryStats }}
            isActive={isActive}
            isDisabled={!isActive || !query.error}
            reset={restart}
            run={handleRun}
          />

          {/* Results */}
          <QueryResultsCard
            data={view}
            error={query.error?.message ?? null}
            hrefId={DEFAULT_RESULTS_HREF_ID}
            isLoading={isExecuting}
          />
        </div>
      </div>
    </Layout.Page>
  );
}
