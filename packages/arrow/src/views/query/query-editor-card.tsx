import { cn } from '@stately/ui/base/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from '@stately/ui/base/ui';
import { RefreshCw, TextSearch } from 'lucide-react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { QueryEditor, type QueryEditorProps } from '@/components/query-editor';

export const DEFAULT_SQL = 'SELECT 1';

export type QueryEditorCardProps = {
  sql: string;
  onSql: (sql: string) => void;
  onRun: () => void;
  title?: React.ReactNode;
  editorProps?: Partial<Omit<QueryEditorProps, 'value' | 'onChange' | 'onRun' | 'isActive'>>;
  isDisabled?: boolean;
  isLoading?: boolean;
  isActive?: boolean;
  reset?: () => void;
};

export function QueryEditorCard({
  sql,
  onSql,
  onRun,
  title,
  editorProps,
  isDisabled,
  isLoading,
  isActive,
  reset,
  ...rest
}: QueryEditorCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  return (
    <Card {...rest} className={cn(['query-editor-card gap-4', rest?.className])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            {(!title || typeof title === 'string') && <TextSearch className="h-4 w-4" />}
            {title ?? 'Query'}
          </span>
          {/* TODO: Add a "cancel" button, abort the query */}
          {reset && (
            <AnyIsLoading isLoading={!!isLoading}>
              <Button
                disabled={isDisabled || isLoading}
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
          {isLoading && <Spinner />}
        </CardTitle>
        <CardDescription>Compose SQL, then stream Arrow results instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryEditor
          {...editorProps}
          isActive={isActive}
          onChange={onSql}
          onRun={onRun}
          value={sql}
        />
      </CardContent>
    </Card>
  );
}
