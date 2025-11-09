import type { PropsWithChildren } from 'react';

export function Empty({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function EmptyHeader({ children }: PropsWithChildren) {
  return <div className="space-y-1 text-center">{children}</div>;
}

export function EmptyTitle({ children }: PropsWithChildren) {
  return <div className="font-semibold text-sm">{children}</div>;
}

export function EmptyDescription({ children }: PropsWithChildren) {
  return <div className="text-xs text-muted-foreground">{children}</div>;
}

export function EmptyContent({ children }: PropsWithChildren) {
  return <div className="mt-4">{children}</div>;
}
