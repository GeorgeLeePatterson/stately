import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/base/button';
import { Separator } from '@/components/base/separator';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/theme';
import { Crumbs } from './crumbs';

export interface PageHeaderProps {
  title?: React.ReactNode;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  backLink?: { href: string; label?: string };
  disableThemeToggle?: boolean;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backLink,
  disableThemeToggle,
}: PageHeaderProps) {
  const resolvedBackLink = backLink?.href
    ? backLink
    : breadcrumbs?.some(b => !!b.href)
      ? [...breadcrumbs].reverse().find(b => !!b.href)
      : undefined;

  return (
    <div className="stately-page-header @container/stately-page-header space-y-6">
      <div
        className={cn(
          'flex flex-nowrap justify-end items-center gap-2',
          'w-full min-w-0 pb-2',
          'border-b border-muted',
        )}
      >
        {resolvedBackLink?.href && (
          <>
            <Button
              nativeButton={false}
              render={
                <a
                  className="flex flex-nowrap gap-2 items-center justify-center"
                  href={resolvedBackLink.href}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {resolvedBackLink.label && (
                    <span className="hidden @3xl/stately-page-header:inline">
                      {resolvedBackLink.label}
                    </span>
                  )}
                </a>
              }
              size="sm"
              variant="ghost"
            />
            <Separator className="self-center mr-2" orientation="vertical" />
          </>
        )}
        <Crumbs className="flex-1" items={breadcrumbs ?? []} />

        {/* Theme Toggle */}
        {!disableThemeToggle && <ThemeToggle className="justify-self-end" />}
      </div>

      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight flex items-center min-w-0">
                {title}
              </h2>
            )}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
    </div>
  );
}
