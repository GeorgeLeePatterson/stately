import { SidebarProvider, SidebarTrigger } from '@/base/ui/sidebar';
import { Toaster } from '../ui/sonner';
import { toTitleCase } from '../utils';
import { Header } from './header';
import { LayoutSidebar } from './layout-sidebar';

export type LayoutProps = {
  headerProps?: React.ComponentProps<typeof Header>;
  sidebarProps?: React.ComponentProps<typeof LayoutSidebar>;
};

/**
 * Pre-made layout, useful when additional configuration is not required.
 *
 * TODO: Provide examples of usage
 *
 * @param LayoutProps
 * @returns React.ReactNode
 */
export function Layout({
  headerProps = {},
  sidebarProps = {},
  children,
  ...rest
}: React.PropsWithChildren<LayoutProps & React.ComponentProps<typeof SidebarProvider>>) {
  const backupTitle = toTitleCase((window.location.pathname || '').split('/').pop() || 'Home');

  return (
    <SidebarProvider {...rest}>
      <LayoutSidebar {...sidebarProps} />
      <main className="bg-background relative flex w-full flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <Header
          {...headerProps}
          before={headerProps?.before || <SidebarTrigger className="-ml-1" />}
          pageTitle={headerProps?.pageTitle || backupTitle}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0 wrap-anywhere">
          {children}
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
