import { Layout } from '@stately/ui';
import { cn, devLog, messageFromError } from '@stately/ui/base/lib/utils';
import { useSidebar } from '@stately/ui/base/ui';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useConnectors } from '@/hooks/use-connectors';
import { useStreamingQuery } from '@/hooks/use-streaming-query';
import type { ArrowTableStore } from '@/lib/arrow-table-store';
import type { ListSummary } from '@/types/api';
import { ConnectorMenuCard, ConnectorsRegisterCard } from '@/views/connectors';
import { DEFAULT_RESULTS_HREF_ID, QueryEditorCard, QueryResultsCard } from '@/views/query';

export interface ArrowViewerProps {
  subscribe?: Parameters<ArrowTableStore['subscribe']>[0];
}

/**
 * Visualize stately arrow data.
 */
function Root(props: ArrowViewerProps) {
  const [sql, setSql] = useState('');

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
    (s?: string) => {
      const sqlCommand = s || sql;
      if (!sqlCommand.trim()) return;
      // TODO: Remove
      devLog.debug('Arrow', 'handleRun', {
        currentConnectorId: currentConnector?.id,
        sql,
        sqlCommand,
      });
      execute({ connector_id: currentConnector?.id, sql: sqlCommand });
    },
    [sql, execute, currentConnector?.id],
  );

  // Connector + Query
  const handleSelectConnectorItem = useCallback(
    (identifier: string, type: ListSummary['type']) => {
      // TODO: Remove
      let sql = `SELECT * FROM ${identifier} LIMIT 500`;
      console.debug('handleSelectConnectorItem: ', { identifier, sql, type });
      if (type === 'databases') {
        sql =
          'SELECT * FROM information_schema.tables ' +
          `WHERE information_schema.tables.table_schema = ${identifier}`;
      }
      console.debug('handleSelectConnectorItem AFTER: ', { identifier, sql, type });
      handleRun(sql);
    },
    [handleRun],
  );

  return (
    <Layout.Page breadcrumbs={[{ label: 'Viewer' }]}>
      <div className={cn(['arrow-viewer', 'grid grid-cols-3 gap-4', 'h-full', 'w-full min-w-0'])}>
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Connector and Tables */}
          {/*<ConnectorSelectCard
            connectors={connectors}
            currentConnector={currentConnector}
            error={connectorsError}
            isLoading={connectorsQuery.isLoading}
            onSelect={c => setConnectorId(c?.id)}
          />
*/}
          {/* Connector Details */}
          {/*<ConnectorDetailsCard
            className="flex-auto"
            connectors={connectors}
            currentConnector={currentConnector}
            error={connectorsError}
            isLoading={connectorsQuery.isLoading}
            onSelect={handleSelectConnectorItem}
          />
*/}

          {/* Connector menu */}
          <ConnectorMenuCard
            className="flex-auto"
            connectors={connectors}
            currentConnector={currentConnector}
            error={connectorsError}
            isLoading={connectorsQuery.isLoading}
            onSelect={c => setConnectorId(c?.id)}
            onSelectItem={handleSelectConnectorItem}
          />

          {/* Catalogs and Registered Connectors */}
          <ConnectorsRegisterCard
            connectors={connectors}
            currentConnector={currentConnector}
            onClickConnector={setConnectorId}
          />
        </div>

        {/* Right */}
        <div className="col-span-2 flex flex-col flex-nowrap gap-4">
          {/* Query */}
          <QueryEditorCard
            editorProps={{ isExecuting, resultsHrefId: DEFAULT_RESULTS_HREF_ID, stats: queryStats }}
            isActive={isActive}
            isDisabled={!isActive || !query.error}
            isLoading={query.isFetching}
            onRun={handleRun}
            onSql={setSql}
            reset={restart}
            sql={sql}
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

/**
 * Visualize stately arrow data.
 *
 * Note: `ArrowViewer` assumes using `@stately/ui/core`'s `Layout.Root` component,
 * or more specifically, that a `SidebarProvider` is available. If one is not, use
 * `ArrowViewer.Root` directly.
 *
 * The sidebar is closed by default to maximize real estate.
 *
 * @param ArrowViewerProps
 * @returns
 */
export const ArrowViewer = ({ subscribe }: ArrowViewerProps) => {
  const { setOpen } = useSidebar();
  useLayoutEffect(() => {
    setOpen(false);
  }, [setOpen]);
  return <Root subscribe={subscribe} />;
};

ArrowViewer.Root = Root;
