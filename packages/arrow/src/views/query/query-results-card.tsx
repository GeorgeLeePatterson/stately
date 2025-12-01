import { cn } from '@stately/ui/base';
import { Card, CardContent, CardHeader, CardTitle } from '@stately/ui/base/ui';
import { TableIcon } from 'lucide-react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { ArrowTable, type ArrowTableDataView } from '@/components/arrow-table';

export const DEFAULT_RESULTS_HREF_ID = 'query-results';

export interface QueryResultsCardProps {
  data?: ArrowTableDataView;
  title?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  hrefId?: string;
}

export function QueryResultsCard({
  data,
  title,
  isLoading,
  error,
  hrefId,
  ...rest
}: QueryResultsCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  return (
    <Card
      className={cn(['query-results-card gap-4 flex-auto min-w-0 max-h-[80dvh]', rest?.className])}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2" id={hrefId || DEFAULT_RESULTS_HREF_ID}>
            {(!title || typeof title === 'string') && <TableIcon className="h-4 w-4" />}
            {title ?? 'Results'}
          </div>
          <AnyIsLoading isLoading={!!isLoading} loaderOnly />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-auto overflow-hidden">
        {isLoading ? (
          // Loading
          <div
            className={cn([
              'flex h-full items-center justify-center',
              'rounded-lg border bg-muted/30',
              'text-sm text-muted-foreground',
            ])}
          >
            Running query…
          </div>
        ) : error ? (
          // Error
          <div
            className={cn([
              'min-h-[360px]',
              'flex h-full items-center justify-center',
              'rounded-lg border bg-destructive/5',
              'text-sm text-destructive',
            ])}
          >
            {error}
          </div>
        ) : data && data.rowCount > 0 ? (
          // Data table view
          <ArrowTable data={data} />
        ) : (
          // No data
          <div
            className={cn([
              'py-4 h-full',
              'flex flex-col items-center justify-center gap-2 ',
              'rounded-lg border border-dashed',
              'text-center text-sm text-muted-foreground',
            ])}
          >
            <p className="font-medium text-foreground">Run a query to see results</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Large result sets are rendered with virtualization to maintain performance while
              scrolling.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
