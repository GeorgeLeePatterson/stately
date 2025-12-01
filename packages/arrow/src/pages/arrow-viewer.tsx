import { Layout } from '@stately/ui';
import { cn, devLog, messageFromError } from '@stately/ui/base/lib/utils';
import { useSidebar } from '@stately/ui/base/ui';
import { type ButtonHTMLAttributes, useCallback, useLayoutEffect, useMemo, useState } from 'react';
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
    (
      _?: Parameters<Exclude<ButtonHTMLAttributes<HTMLButtonElement>['onClick'], undefined>>[0],
      s?: string,
    ) => {
      const sqlCommand = s || sql;

      // TODO: Remove
      devLog.debug('Arrow', 'handleRun', { sqlCommand });

      if (!sqlCommand.trim()) return;
      // TODO: Remove
      devLog.debug('Arrow', 'handleRun', {
        currentConnectorId: currentConnector?.id,
        sql,
        sqlCommand,
      });
      execute({ connector_id: currentConnector?.id, sql: sqlCommand });
      // query.refetch();
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
      setSql(sql);
      handleRun(undefined, sql);
    },
    [handleRun],
  );

  return (
    <Layout.Page breadcrumbs={[{ label: 'Viewer' }]}>
      <div
        className={cn(
          'arrow-viewer @container/arrowviewer',
          'grid grid-cols-3 gap-4',
          'h-full',
          'w-full min-w-0',
        )}
      >
        {/* Left */}
        <div
          className={cn(
            'flex flex-col gap-4',
            // Default (sm) show as 2 columns
            'col-span-3',
            // Larger show as flex side by side
            '@md/arrowviewer:col-span-1',
          )}
        >
          {/* Connector menu */}
          <ConnectorMenuCard
            className={cn('@md/arrowviewer:flex-auto')}
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
        <div
          className={cn([
            'gap-4 flex flex-col',
            // Default (sm) show as 1 column span
            'col-span-3',
            // Larger show as 1 column
            '@md/arrowviewer:col-span-2',
          ])}
        >
          {/* Query */}
          <QueryEditorCard
            error={query?.error ? messageFromError(query.error) || 'Error streaming' : undefined}
            isActive={isActive}
            isExecuting={query.isFetching}
            onRun={handleRun}
            onSql={setSql}
            reset={restart}
            resultsHrefId={DEFAULT_RESULTS_HREF_ID}
            sql={sql}
            stats={queryStats}
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
