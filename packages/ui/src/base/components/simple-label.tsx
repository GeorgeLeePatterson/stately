import type { HTMLAttributes } from 'react';

export function SimpleLabel({
  children,
  ...rest
}: React.PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...rest}
      className={`text-sm font-medium text-accent-foreground ${rest.className || ''}`}
    >
      {children}
    </span>
  );
}
