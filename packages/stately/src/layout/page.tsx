import { cn } from '@statelyjs/ui/lib/utils';
import { PageHeader, type PageHeaderProps } from './page-header';

export type PageProps = React.PropsWithChildren<PageHeaderProps>;

/**
 * Generic layout for list views (e.g., History list, Pipeline list, Entity list)
 * Provides consistent page structure with header and content area
 */
export function Page({ children, ...rest }: PageProps) {
  return (
    <div
      className={cn([
        'stately-page',
        'grid grid-rows-[auto_1fr] h-full min-w-0 py-4 gap-4',
        // Small (default)
        'px-2',
        // Medium
        'md:px-6 @md/stately:px-4',
        // Large
        'lg:px-8 @lg/stately-main:px-6',
      ])}
    >
      <PageHeader {...rest} />
      <div
        className={cn([
          'stately-page-content @container/statelycontent',
          'flex flex-col flex-1',
          'w-full h-full min-w-0 min-h-full',
        ])}
      >
        {children}

        {/* Bottom actions - always put actions at top and bottom */}
        {rest?.actions && (
          <div className="flex justify-start gap-2 pt-3 mt-3 border-t">{rest.actions}</div>
        )}
      </div>
    </div>
  );
}
