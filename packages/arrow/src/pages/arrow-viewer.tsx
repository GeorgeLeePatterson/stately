import { Layout } from '@stately/ui';
import { cn, devLog, messageFromError } from '@stately/ui/base/lib/utils';
import { useSidebar } from '@stately/ui/base/ui';
import { Binary, SquareSigma, Timer } from 'lucide-react';
import { type ButtonHTMLAttributes, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { QueryEditorStat } from '@/components/query-editor';
import { useConnectors } from '@/hooks/use-connectors';
import { useStreamingQuery } from '@/hooks/use-streaming-query';
import type { ArrowTableStore } from '@/lib/arrow-table-store';
import { formatBytes, tableToDataView } from '@/lib/utils';
import type { ConnectionMetadata, ListSummary } from '@/types/api';
import { ConnectorMenuCard, ConnectorsRegisterCard } from '@/views/connectors';
import { DEFAULT_RESULTS_HREF_ID, QueryEditorCard, QueryResultsCard } from '@/views/query';

// devLog.debug('Arrow', 'handleSelectConnectorItem: ', { sql, type });

export interface ArrowViewerProps {
  /**
   * Unique identifier if using any arrow viewers or components arrow viewer uses elsewhere in
   * the same UI.
   */
  formId?: string;
  /**
   * Subscribe to streaming query events
   */
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
  const { snapshot, query, execute, isPending, isStreaming, isActive, restart } =
    useStreamingQuery(props);

  const view = useMemo(() => tableToDataView(snapshot.table), [snapshot.table]);

  const isExecuting = useMemo(() => isPending || isStreaming, [isPending, isStreaming]);

  const handleRun = useCallback(
    (
      _?: Parameters<Exclude<ButtonHTMLAttributes<HTMLButtonElement>['onClick'], undefined>>[0],
      s?: string,
    ) => {
      const sqlCommand = s || sql;
      devLog.debug('Arrow', 'handleRun', { id: currentConnector?.id, sqlCommand });
      if (!sqlCommand.trim()) return;
      execute({ connector_id: currentConnector?.id, sql: sqlCommand });
    },
    [sql, execute, currentConnector?.id],
  );

  const handleSelectConnector = useCallback(
    (connector?: ConnectionMetadata) => {
      setConnectorId(id => (connector?.id === id ? id : connector?.id));
    },
    [setConnectorId],
  );

  // Connector + Query
  const handleSelectConnectorItem = useCallback((identifier: string, type: ListSummary['type']) => {
    // TODO (Ext): Allow plugin extension - Plugin can provide transformer

    if (type === 'databases') {
      setSql(
        'SELECT * FROM information_schema.tables ' +
          `WHERE information_schema.tables.table_schema = '${identifier}'`,
      );
    } else {
      setSql(`SELECT * FROM ${identifier} LIMIT 500`);
    }
  }, []);

  const resultsHrefId = (props.formId ? `${props.formId}-` : '') + DEFAULT_RESULTS_HREF_ID;

  const queryStats = useMemo<QueryEditorStat[]>(() => {
    const currentTable = snapshot.table;
    const currentMetrics = snapshot.metrics;
    if (!currentTable) return [];
    return [
      { label: SquareSigma, value: currentTable.numRows.toLocaleString() },
      { label: Binary, value: formatBytes(currentMetrics.bytesReceived) },
      { label: Timer, value: `${currentMetrics.elapsedMs.toFixed(1)} ms` },
    ];
  }, [snapshot]);

  // TODO: Remove
  devLog.debug('====> ArrowViewer: ', {
    queryData: query.data,
    queryError: query.error,
    snapshot,
    view,
  });

  return (
    <Layout.Page breadcrumbs={[{ label: 'Viewer' }]}>
      <div
        className={cn(
          'arrow-viewer @container/arrowviewer',
          'flex flex-col gap-4',
          'h-full w-full min-w-0',
        )}
      >
        {/* Top */}
        <div
          className={cn(
            'gap-4 max-h-[50dvh] min-h-fit',
            // Default (sm) show as 2 columns
            'flex flex-col',
            // Larger show as flex side by side
            '@md/arrowviewer:grid @md/arrowviewer:grid-cols-3',
          )}
        >
          {/* Left */}
          <div className={cn('gap-4', 'flex flex-col')}>
            {/* Catalogs and Registered Connectors */}
            {/*
              TODO:
              1. Object store doesn't appear
              2. Querying doesn't show the connector query is registered
              */}
            <ConnectorsRegisterCard
              catalogKey={isActive ? sql : ''}
              connectors={connectors}
              currentConnector={currentConnector}
              onClickConnector={setConnectorId}
            />

            {/* Connector menu */}
            <ConnectorMenuCard
              className={cn('@md/arrowviewer:flex-auto')}
              connectors={connectors}
              currentConnector={currentConnector}
              error={connectorsError}
              isLoading={connectorsQuery.isLoading}
              onSelect={handleSelectConnector}
              onSelectItem={handleSelectConnectorItem}
            />
          </div>

          {/* Query */}
          {/*
            TODO:
            1. Bug - Clicking on execute after running a query (but not changing it) removes all results
            */}
          <QueryEditorCard
            className={cn('@md/arrowviewer:col-span-2')}
            error={messageFromError(query?.error)}
            isActive={isActive}
            isExecuting={query.isFetching}
            onRun={handleRun}
            onSql={setSql}
            reset={restart}
            resultsHrefId={resultsHrefId}
            sql={sql}
            stats={queryStats}
          />
        </div>

        {/* Results */}
        <QueryResultsCard
          className={cn('w-full min-w-0')}
          data={view}
          error={messageFromError(query.error?.message)}
          hrefId={resultsHrefId}
          isLoading={isExecuting}
        />
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
  useLayoutEffect(() => setOpen(false), [setOpen]);
  return <Root subscribe={subscribe} />;
};

ArrowViewer.Root = Root;
