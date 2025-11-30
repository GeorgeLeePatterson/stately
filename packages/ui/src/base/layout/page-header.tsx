import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/base/ui/breadcrumb';
import { Button } from '../ui/button';

export interface PageHeaderProps {
  title?: React.ReactNode;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backTo,
  backLabel,
}: PageHeaderProps) {
  return (
    <div className="stately-page-header space-y-6">
      {backTo && (
        <div className="mb-2">
          <Button asChild size="sm" variant="ghost">
            <a href={backTo}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </a>
          </Button>
        </div>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <div className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight flex items-center min-w-0">{title}</h2>
          )}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
