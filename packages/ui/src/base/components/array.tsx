import { cn } from '@/base/lib/utils';

export const ArrayIndex = ({ index }: { index: number }) => (
  <div
    className={cn(
      'bg-muted text-muted-foreground rounded-full px-2 border-border border',
      'w-7 min-w-0 max-w-7 h-7',
      'flex flex-col shrink-0 items-center justify-center',
      'font-mono text-[11px] whitespace-nowrap',
    )}
  >
    <span>{index}</span>
  </div>
);
