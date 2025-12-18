import { Loader2Icon, type LucideProps } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: LucideProps) {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
