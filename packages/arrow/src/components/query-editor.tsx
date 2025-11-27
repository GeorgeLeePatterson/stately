/**
 * QueryEditor - Pure SQL input component
 *
 * Handles SQL editing and execution triggers. Does NOT own:
 * - Query execution (caller provides onRun)
 * - Results display (separate component)
 * - Card/layout wrapper (caller decides container)
 */

import { Editor } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import { Badge, Button, Spinner } from '@stately/ui/base/ui';
import { Table as TableIcon } from 'lucide-react';

export interface QueryStat {
  label: string;
  value: string;
}

export interface QueryEditorProps {
  /** Current SQL value */
  value: string;
  /** Called when SQL changes */
  onChange: (sql: string) => void;
  /** Called when user clicks Run */
  onRun: () => void;

  /** Unique form ID for the editor */
  formId?: string;
  /** Placeholder text */
  placeholder?: string;

  /** Query is pending (initial fetch) */
  isPending?: boolean;
  /** Query is streaming (receiving data) */
  isStreaming?: boolean;

  /** Stats to display below editor (rows, bytes, duration) */
  stats?: QueryStat[];

  /** Additional content to render in the footer area */
  footerContent?: React.ReactNode;

  /** Editor className override */
  className?: string;
}

export function QueryEditor({
  value,
  onChange,
  onRun,
  formId = 'query-editor',
  placeholder = 'SELECT 1',
  isPending = false,
  isStreaming = false,
  stats = [],
  footerContent,
  className,
}: QueryEditorProps) {
  const isExecuting = isPending || isStreaming;
  const canRun = value.trim().length > 0 && !isExecuting;

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="flex flex-col flex-1">
        <Editor
          className="min-h-full flex-1"
          content={value}
          formId={formId}
          onContent={onChange}
          placeholder={placeholder}
          saveButton={
            <Button
              className="cursor-pointer"
              disabled={!canRun}
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
      {(stats.length > 0 || footerContent) && (
        <div className="flex gap-2 justify-between">
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.map(stat => (
                <Badge
                  className={cn(
                    'flex flex-row items-center justify-center gap-1',
                    'rounded-lg border',
                    'text-xs',
                  )}
                  key={stat.label}
                  variant="secondary"
                >
                  <span className="text-[10px] uppercase text-muted-foreground">{stat.label}</span>
                  <span className="font-semibold text-sm">{stat.value}</span>
                </Badge>
              ))}
            </div>
          )}

          {footerContent}
        </div>
      )}
    </div>
  );
}
