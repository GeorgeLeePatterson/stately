import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function DescriptionLabel({
  children,
  ...rest
}: React.PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...rest}
      className={cn(
        'min-w-0 leading-none',
        'overflow-y-visible',
        'text-xs italic font-medium text-muted-foreground',
        rest.className,
      )}
    >
      {children}
    </span>
  );
}
