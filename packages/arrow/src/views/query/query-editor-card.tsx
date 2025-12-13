import { Note } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@stately/ui/base/ui';
import { RefreshCw, TextSearch } from 'lucide-react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { QueryEditor, type QueryEditorProps } from '@/components/query-editor';

export const DEFAULT_SQL = 'SELECT 1';

export type QueryEditorCardProps = {
  sql: string;
  onSql: (sql: string) => void;
  title?: React.ReactNode;
  error?: string;
  reset?: () => void;
};

export function QueryEditorCard({
  // Card props
  sql,
  onSql,
  title,
  error,
  reset,
  // Editor props
  placeholder,
  isExecuting,
  isActive,
  stats,
  resultsHrefId,
  onRun,
  ...rest
}: QueryEditorCardProps &
  Omit<QueryEditorProps, 'value' | 'onChange'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  return (
    <Card {...rest} className={cn('query-editor-card gap-4 min-h-fit', rest?.className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            {(!title || typeof title === 'string') && <TextSearch className="h-4 w-4" />}
            {title ?? 'Query'}
          </span>
          {/* TODO: Add a "cancel" button, abort the query */}
          {reset && (
            <AnyIsLoading isLoading={!!isExecuting} loaderOnly>
              <Button
                disabled={!!error || isExecuting || !isActive}
                onClick={() => {
                  reset();
                  onSql('');
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </AnyIsLoading>
          )}
        </CardTitle>
        <CardDescription>Compose SQL, then stream Arrow results instantly.</CardDescription>
      </CardHeader>
      <CardContent className="flex-auto flex flex-col gap-4 max-h-full overflow-hidden">
        {/* Query error */}
        {error && <Note message={error} mode="error" />}

        <QueryEditor
          className="flex-auto max-h-full"
          isActive={isActive}
          isExecuting={isExecuting}
          onChange={onSql}
          onRun={onRun}
          placeholder={placeholder}
          resultsHrefId={resultsHrefId}
          stats={stats}
          value={sql}
        />
      </CardContent>
    </Card>
  );
}
