import type { StatelySchemas } from '@statelyjs/schema';
import { SidebarProvider, SidebarTrigger } from '@/components/base/sidebar';
import { Toaster } from '@/components/base/sonner';
import { useBaseStatelyUi } from '@/context';
import type { AnyUiPlugin } from '@/plugin';
import { toTitleCase } from '@/utils';
import { cn } from '../lib/utils';
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
export function Root<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  A extends readonly AnyUiPlugin[] = readonly [],
>({
  headerProps = {},
  sidebarProps = {},
  children,
  ...rest
}: React.PropsWithChildren<RootProps & React.ComponentProps<typeof SidebarProvider>>) {
  const { plugins, options } = useBaseStatelyUi<S, A>();

  const backupTitle = toTitleCase((window.location.pathname || '').split('/').pop() || 'Home');

  return (
    <SidebarProvider {...rest}>
      <Navigation {...sidebarProps} options={options} plugins={plugins} />
      <main
        className={cn([
          'stately-main @container/stately',
          'bg-background relative overflow-hidden',
          'flex-1 h-full min-h-dvh w-full min-w-0',
          'grid grid-rows-[auto_1fr]',
        ])}
      >
        {/* Top Bar */}
        <Header
          {...headerProps}
          before={headerProps?.before || <SidebarTrigger className="-ml-1" />}
          disableThemeToggle={headerProps?.disableThemeToggle ?? options?.theme?.disabled}
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
