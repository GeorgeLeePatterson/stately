import { cn } from '../lib/utils';
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
        'grid grid-rows-[auto_1fr] h-full gap-4 min-w-0 py-4',
        '@md/stately:px-4 @lg/stately-main:px-6',
        'px-2 md:px-6 lg:px-8 py-4',
      ])}
    >
      <PageHeader {...rest} />
      <div className="stately-page-content flex flex-col flex-1 w-full h-full min-w-0">
        {children}

        {/* Bottom actions - always put actions at top and bottom */}
        {rest?.actions && (
          <div className="flex justify-start gap-2 pt-3 mt-3 border-t">{rest.actions}</div>
        )}
      </div>
    </div>
  );
}
