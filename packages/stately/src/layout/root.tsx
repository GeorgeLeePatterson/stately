import type { StatelySchemas } from '@statelyjs/schema';
import { type AnyUiPlugin, cn } from '@statelyjs/ui';
import { SidebarProvider, useSidebar } from '@statelyjs/ui/components/base/sidebar';
import { Toaster } from '@statelyjs/ui/components/base/sonner';
import { useIsMobile } from '@statelyjs/ui/hooks/use-mobile';
import { useStatelyUi } from '@/index';
import { Header } from './header';
import { Navigation, SidebarToggle } from './navigation';

export type RootProps = {
  headerProps?: React.ComponentProps<typeof Header> & { enable?: boolean };
  sidebarProps?: React.ComponentProps<typeof Navigation>;
  mainProps?: React.ComponentProps<'main'>;
  contentProps?: React.ComponentProps<'div'>;
  /**
   * Controls the mobile sidebar toggle behavior.
   * - `true` (default): Shows a fixed footer toggle on mobile when sidebar is closed
   * - `false`: Disables the mobile toggle (consumer handles it)
   * - `ReactNode`: Custom toggle component to render
   */
  mobileSidebarToggle?: boolean | React.ReactNode;
};

/**
 * Pre-made layout, useful when additional configuration is not required.
 *
 * TODO: Provide examples of usage
 *
 * @param LayoutProps
 * @returns React.ReactNode
 */
export function Root<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  A extends readonly AnyUiPlugin[] = readonly [],
>({
  headerProps = {},
  sidebarProps = {},
  mainProps = {},
  contentProps = {},
  mobileSidebarToggle = true,
  children,
  ...rest
}: React.PropsWithChildren<RootProps & React.ComponentProps<typeof SidebarProvider>>) {
  const { plugins, options } = useStatelyUi<S, A>();
  return (
    <SidebarProvider {...rest}>
      <Navigation {...sidebarProps} options={options} plugins={plugins} />
      <RootContent
        contentProps={contentProps}
        headerProps={headerProps}
        mainProps={mainProps}
        mobileSidebarToggle={mobileSidebarToggle}
        options={options}
      >
        {children}
      </RootContent>
      <Toaster />
    </SidebarProvider>
  );
}

/**
 * Inner content component that can access SidebarProvider context.
 */
function RootContent({
  headerProps = {},
  mainProps = {},
  contentProps = {},
  mobileSidebarToggle,
  options,
  children,
}: React.PropsWithChildren<{
  headerProps: RootProps['headerProps'];
  mainProps: RootProps['mainProps'];
  contentProps: RootProps['contentProps'];
  mobileSidebarToggle: RootProps['mobileSidebarToggle'];
  options: ReturnType<typeof useStatelyUi>['options'];
}>) {
  const isMobile = useIsMobile();
  const { openMobile } = useSidebar();

  // Show mobile toggle when: on mobile, sidebar is closed, and toggle is enabled
  const showMobileToggle = isMobile && !openMobile && mobileSidebarToggle !== false;

  return (
    <main
      {...mainProps}
      className={cn([
        'stately-main @container/stately',
        'bg-background relative overflow-hidden',
        'flex-1 h-full min-h-dvh w-full min-w-0',
        'grid',
        headerProps?.enable ? 'grid-rows-[auto_1fr]' : 'grid-rows-[1fr]',
        // Reserve space for mobile toggle footer
        showMobileToggle && 'pb-14',
        mainProps?.className,
      ])}
    >
      {/* Top Bar */}
      {headerProps?.enable && (
        <Header
          {...headerProps}
          disableThemeToggle={headerProps?.disableThemeToggle ?? options?.theme?.disabled}
        />
      )}

      {/* Main Content */}
      <div
        {...contentProps}
        className={cn([
          'stately-content',
          'flex flex-1 flex-col min-w-0 ',
          'overflow-y-auto overflow-x-hidden wrap-anywhere',
          contentProps?.className,
        ])}
      >
        {children}
      </div>

      {/* Mobile Sidebar Toggle Footer */}
      {showMobileToggle && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-2">
          {typeof mobileSidebarToggle === 'boolean' ? (
            <SidebarToggle className="w-full" variant="outline" />
          ) : (
            mobileSidebarToggle
          )}
        </div>
      )}
    </main>
  );
}
