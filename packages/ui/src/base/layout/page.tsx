import { PageHeader, type PageHeaderProps } from './page-header';

export type PageProps = React.PropsWithChildren<PageHeaderProps>;

/**
 * Generic layout for list views (e.g., History list, Pipeline list, Entity list)
 * Provides consistent page structure with header and content area
 */
export function Page({ children, ...rest }: PageProps) {
  return (
    <div className="flex-1 px-2 md:px-6 lg:px-8 py-4 min-w-0">
      <div className="h-full flex flex-col space-y-6 min-w-0 wrap-anywhere">
        <PageHeader {...rest} />
        <div className="flex flex-col flex-1 w-full h-full min-w-0">
          {children}

          {/* Bottom actions - always put actions at top and bottom */}
          {rest?.actions && (
            <div className="flex justify-start gap-2 pt-3 mt-3 border-t">{rest.actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
