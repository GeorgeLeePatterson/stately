import { SidebarProvider, SidebarTrigger } from '@/base/ui/sidebar';
import { cn } from '../lib/utils';
import { Toaster } from '../ui/sonner';
import { toTitleCase } from '../utils';
import { Header } from './header';
import { Navigation } from './navigation';

export type RootProps = {
  headerProps?: React.ComponentProps<typeof Header>;
  sidebarProps?: React.ComponentProps<typeof Navigation>;
};

/**
 * Pre-made layout, useful when additional configuration is not required.
 *
 * TODO: Provide examples of usage
 *
 * @param LayoutProps
 * @returns React.ReactNode
 */
export function Root({
  headerProps = {},
  sidebarProps = {},
  children,
  ...rest
}: React.PropsWithChildren<RootProps & React.ComponentProps<typeof SidebarProvider>>) {
  const backupTitle = toTitleCase((window.location.pathname || '').split('/').pop() || 'Home');

  return (
    <SidebarProvider {...rest}>
      <Navigation {...sidebarProps} />
      <main
        className={cn([
          'stately-main @container/stately',
          'bg-background relative overflow-hidden',
          'flex w-full flex-1 flex-col min-w-0',
        ])}
      >
        {/* Top Bar */}
        <Header
          {...headerProps}
          before={headerProps?.before || <SidebarTrigger className="-ml-1" />}
          pageTitle={headerProps?.pageTitle || backupTitle}
        />

        {/* Main Content */}
        <div
          className={cn([
            'stately-content',
            'flex flex-1 flex-col min-w-0 ',
            'overflow-y-auto overflow-x-hidden wrap-anywhere',
          ])}
        >
          {children}
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
