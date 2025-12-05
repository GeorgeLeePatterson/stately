import { cn } from '@stately/ui/base';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from '@stately/ui/base/ui';
import { Sheet, TableIcon } from 'lucide-react';
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
    <Card className={cn(['query-results-card gap-4 flex-auto min-w-0 max-h-dvh', rest?.className])}>
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
              'flex flex-col h-full items-center justify-center gap-2',
              'text-sm text-muted-foreground',
            ])}
          >
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
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
          <EmptyResults />
        )}
      </CardContent>
    </Card>
  );
}

function LoadingRow() {
  return (
    <div className="flex flex-row flex-nowrap gap-2 w-full h-12 min-w-0">
      <Skeleton className="h-full w-12" />
      <Skeleton className="h-full flex-auto" />
      <Skeleton className="h-full flex-auto" />
      <Skeleton className="h-full flex-auto" />
      <Skeleton className="h-full flex-auto" />
    </div>
  );
}

export function EmptyResults() {
  return (
    <Empty className="border p-6 md:p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sheet />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
      </EmptyHeader>
      {/* TODO: Add a CTA to focus editor */}
      {/*<EmptyContent>Run a query to see results</EmptyContent>*/}
    </Empty>
  );
}
