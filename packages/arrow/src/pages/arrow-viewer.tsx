import { Layout } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import { useSidebar } from '@statelyjs/ui/components/base/sidebar';
import { cn, messageFromError } from '@statelyjs/ui/lib/utils';
import { Binary, PanelLeftOpen, PanelRightOpen, SquareSigma, Timer } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { QueryEditorStat } from '@/components/query-editor';
import { useConnectors } from '@/hooks/use-connectors';
import { useStreamingQuery } from '@/hooks/use-streaming-query';
import type { ArrowTableStore } from '@/lib/arrow-table-store';
import { formatBytes, log, tableToDataView } from '@/lib/utils';
import type { ConnectionMetadata, ListSummary } from '@/types/api';
import { ConnectorMenuCard, ConnectorsRegisterCard } from '@/views/connectors';
import { DEFAULT_RESULTS_HREF_ID, QueryEditorCard, QueryResultsCard } from '@/views/query';

type ButtonClickArg = Parameters<
  Exclude<ButtonHTMLAttributes<HTMLButtonElement>['onClick'], undefined>
>[0];

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

  const [sidebarOpened, setSidebarOpened] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Click-away listener for sidebar overlay
  useEffect(() => {
    if (!sidebarOpened) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpened(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpened]);

  // Connectors
  const { connectors, connectorsQuery, currentConnector, setConnectorId } = useConnectors();

  const connectorsError = connectorsQuery.error
    ? messageFromError(connectorsQuery.error) || 'Failed to load connectors.'
    : undefined;

  // Query
  const { snapshot, query, execute, isPending, isStreaming, isActive, restart } =
    useStreamingQuery(props);

  // UI friendly table view
  const view = useMemo(() => tableToDataView(snapshot.table), [snapshot.table]);

  // Normalize all loading state
  const isExecuting = useMemo(() => isPending || isStreaming, [isPending, isStreaming]);

  const handleRun = useCallback(
    (_?: ButtonClickArg, s?: string) => {
      const sqlCommand = s || sql;
      log.debug('Arrow', 'handleRun', { id: currentConnector?.id, sqlCommand });
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
  // TODO (Ext): Allow plugin extension - Plugin can provide transformer
  const handleSelectConnectorItem = useCallback(
    (connector: ConnectionMetadata, identifier: string, type: ListSummary['type']) => {
      if (connector.id !== currentConnector?.id) {
        handleSelectConnector(connector);
      }

      if (type === 'databases') {
        setSql(
          'SELECT * FROM information_schema.tables ' +
            `WHERE information_schema.tables.table_schema = '${identifier}'`,
        );
      } else {
        setSql(`SELECT * FROM ${identifier} LIMIT 500`);
        setSidebarOpened(false);
      }
    },
    [handleSelectConnector, currentConnector?.id],
  );

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

  return (
    <Layout.Page breadcrumbs={[{ label: 'Viewer' }]}>
      <div
        className={cn(
          'arrow-viewer @container/arrowviewer',
          'flex-[1_0_0] h-full w-full min-w-0 overflow-hidden',
          'flex gap-4',
        )}
      >
        <div
          className={cn(
            'relative h-full shrink-0',
            // Small default width: just enough for button
            'w-12',
            // Medium+ widths
            '@2xl/arrowviewer:w-1/4 @2xl/arrowviewer:min-w-fit',
            '@7xl/arrowviewer:w-1/3',
          )}
          ref={sidebarRef}
        >
          <div
            className={cn(
              // layout
              'flex flex-row flex-nowrap gap-2',
              'h-full',
              'bg-background border-border rounded-lg',
              'transition-all delay-150 duration-200 ease-out',

              // scrolling for the content area
              // NOTE: outer container should NOT clip horizontally so we DON’T put overflow here

              // positioning:
              // - small: overlay
              'absolute top-0 left-0 z-10 p-2 border',
              // - large: inline
              '@2xl/arrowviewer:static @2xl/arrowviewer:p-0 @2xl/arrowviewer:border-0',

              // width behavior:
              sidebarOpened
                ? // small open: full-width overlay
                  'w-[calc(100dvw-1rem)] min-w-fit shadow-lg @2xl/arrowviewer:w-full'
                : // small closed: narrow
                  'w-12 @2xl/arrowviewer:w-full',
            )}
          >
            {/* Toggle button (always visible, but mainly useful on small) */}
            <Button
              className="cursor-pointer shrink-0 @2xl/arrowviewer:hidden"
              onClick={() => setSidebarOpened(!sidebarOpened)}
              size="icon-sm"
              variant="secondary"
            >
              {sidebarOpened ? <PanelRightOpen /> : <PanelLeftOpen />}
            </Button>

            {/* Single instance of the left column content */}
            <div
              className={cn(
                'flex flex-col gap-2 w-full h-full overflow-y-auto',
                // On small screens, hide content when sidebar is closed
                !sidebarOpened && 'hidden @2xl/arrowviewer:flex',
              )}
            >
              <ConnectorsRegisterCard
                catalogKey={isActive ? sql : ''}
                connectors={connectors}
                currentConnector={currentConnector}
                onClickConnector={setConnectorId}
              />

              <ConnectorMenuCard
                className="flex-auto"
                connectors={connectors}
                currentConnector={currentConnector}
                error={connectorsError}
                isLoading={connectorsQuery.isLoading}
                onSelect={handleSelectConnector}
                onSelectItem={handleSelectConnectorItem}
              />
            </div>
          </div>
        </div>

        {/* Right - always takes remaining space */}
        <div className={cn('flex-1 min-w-0 h-full overflow-y-auto', 'flex flex-col gap-4')}>
          {/* Query */}
          <QueryEditorCard
            className={cn('min-h-fit max-h-1/2')}
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

          {/* Results */}
          <QueryResultsCard
            className={cn('flex-auto w-full min-w-0 max-h-full')}
            data={view}
            error={messageFromError(query.error?.message)}
            hrefId={resultsHrefId}
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
 * Note: `ArrowViewer` assumes using `@statelyjs/ui`'s `Layout.Root` component,
 * or more specifically, that a `SidebarProvider` is available. If one is not, use
 * `ArrowViewer.Root` directly.
 *
 * The sidebar is closed by default to maximize real estate.
 *
 * @param ArrowViewerProps
 * @returns
 */
export const ArrowViewer = ({ subscribe }: ArrowViewerProps) => {
  const closed = useRef(false);
  const { setOpen, state } = useSidebar();
  // Close sidebar on initial mount only
  useLayoutEffect(() => {
    if (state === 'expanded' && !closed.current) {
      setOpen(false);
      closed.current = true;
    }
  }, [setOpen, state]);
  return <Root subscribe={subscribe} />;
};

ArrowViewer.Root = Root;
