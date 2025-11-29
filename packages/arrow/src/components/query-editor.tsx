/**
 * QueryEditor - Pure SQL input component with flexible sql input field
 */

import { Editor } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import { Badge, Button, Spinner } from '@stately/ui/base/ui';
import { Table as TableIcon } from 'lucide-react';
import { useId } from 'react';

export interface QueryEditorStat {
  label: React.ComponentType<any> | string;
  value: string;
  title?: string;
}

export function QueryStat({ label: StatLabel, value, title }: QueryEditorStat) {
  const inner =
    typeof StatLabel === 'string' ? (
      <span className="flex flex-row items-center justify-center">
        <span className="text-[10px] leading-4 uppercase text-muted-foreground">{StatLabel}</span>{' '}
        <span className="font-semibold leading-4 text-sm">{value}</span>
      </span>
    ) : (
      <>
        <StatLabel className="" />
        {value}
      </>
    );
  return (
    <Badge className={cn('rounded-lg border', 'text-xs')} title={title} variant="secondary">
      {inner}
    </Badge>
  );
}

export interface QueryEditorProps {
  /** Current SQL value */
  value: string;
  /** Called when SQL changes */
  onChange: (sql: string) => void;
  /** Called when user clicks Run */
  onRun: () => void;

  /** Placeholder text */
  placeholder?: string;

  /** Query is executing  */
  isExecuting?: boolean;

  /** Query has been executed, viewing results */
  isActive?: boolean;

  /** Stats to display below editor (rows, bytes, duration) */
  stats?: QueryEditorStat[];

  /** Optionally provide the id for the results panel */
  resultsHrefId?: string;
}

export function QueryEditor({
  value,
  onChange,
  onRun,
  placeholder = 'SELECT 1',
  isExecuting = false,
  isActive = false,
  stats = [],
  resultsHrefId,
  ...rest
}: QueryEditorProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>) {
  const formId = useId();

  return (
    <div {...rest} className={cn('flex flex-col space-y-2', rest?.className)}>
      <div className="flex flex-col flex-1">
        <Editor
          className="min-h-full flex-1"
          content={value}
          formId={`query-editor-${formId}`}
          onContent={onChange}
          placeholder={placeholder}
          saveButton={
            <Button
              className="cursor-pointer"
              disabled={value.trim().length === 0 || isExecuting}
              onClick={onRun}
              size="sm"
              type="button"
              variant="outline"
            >
              {isExecuting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Running…
                </>
              ) : (
                <>
                  <TableIcon className="h-4 w-4" />
                  Run Query
                </>
              )}
            </Button>
          }
          supportedLanguages={['sql']}
        />
      </div>

      {/* Footer: Stats + custom content */}
      <div className="flex gap-2 justify-between">
        {true && (
          <>
            {stats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stats.map((stat, i) => (
                  <QueryStat
                    // biome-ignore lint/suspicious/noArrayIndexKey: ''
                    key={`${value}-${i}`}
                    {...stat}
                  />
                ))}
              </div>
            )}

            {/* Click to see results */}
            {isActive && resultsHrefId && (
              <Button asChild type="button" variant="link">
                <a href={`#${resultsHrefId}`}>Go to Query Results</a>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
