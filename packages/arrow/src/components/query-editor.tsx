/**
 * QueryEditor - Pure SQL input component with flexible sql input field
 */

import { codemirror } from '@statelyjs/stately/features';
import { Badge } from '@statelyjs/ui/components/base/badge';
import { Button } from '@statelyjs/ui/components/base/button';
import { Spinner } from '@statelyjs/ui/components/base/spinner';
import { cn } from '@statelyjs/ui/lib/utils';
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
  onRun: Exclude<React.ComponentProps<typeof Button>['onClick'], undefined>;

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
  const { ToggledEditor } = codemirror.extras ?? {};

  const formId = useId();

  return (
    <div {...rest} className={cn('flex flex-col space-y-2', rest?.className)}>
      <div className="@container/queryeditor flex flex-col flex-1 overflow-hidden">
        <ToggledEditor
          content={value}
          editorWrapperProps={{
            inputGroupProps: { className: 'min-h-full flex-1' },
            saveButton: (
              <Button
                className="cursor-pointer"
                disabled={value.trim().length === 0 || isExecuting}
                onClick={onRun}
                size="sm"
                type="button"
                variant="outline"
              >
                {isExecuting ? <Spinner className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
                Run&nbsp;<span className="hidden @sm/queryeditor:inline">Query</span>
              </Button>
            ),
          }}
          formId={`query-editor-${formId}`}
          onContent={onChange}
          placeholder={placeholder}
          supportedLanguages={['sql']}
        />
      </div>

      {/* Footer: Stats + custom content */}
      <div className="flex gap-2 justify-between">
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
          <Button
            nativeButton={false}
            render={<a href={`#${resultsHrefId}`}>Go to Query Results</a>}
            variant="link"
          />
        )}
      </div>
    </div>
  );
}
