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
import { useCallback, useState } from 'react';
import { QueryEditor, type QueryEditorProps } from '@/components/query-editor';

export const DEFAULT_SQL = 'SELECT 1';

export type QueryEditorCardProps = {
  run: (sql: string) => void;
  title?: React.ReactNode;
  editorProps?: Partial<Omit<QueryEditorProps, 'value' | 'onRun' | 'onChange'>>;
  isDisabled?: boolean;
  isActive?: boolean;
  reset?: () => void;
};

export function QueryEditorCard({
  run,
  title,
  editorProps,
  isDisabled,
  isActive,
  reset,
  ...rest
}: QueryEditorCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  const [sql, setSql] = useState(DEFAULT_SQL);

  const handleRun = useCallback(() => run(sql), [run, sql]);

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
            <div>
              <Button
                disabled={isDisabled}
                onClick={() => {
                  reset();
                  setSql(DEFAULT_SQL);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          )}
        </CardTitle>
        <CardDescription>Compose SQL, then stream Arrow results instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryEditor
          {...editorProps}
          isActive={isActive}
          onChange={setSql}
          onRun={handleRun}
          value={sql}
        />
      </CardContent>
    </Card>
  );
}
