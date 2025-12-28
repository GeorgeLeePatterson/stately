import type { StatelySchemas } from '@statelyjs/schema';
import { type AnyUiPlugin, cn } from '@statelyjs/ui';
import { SidebarProvider } from '@statelyjs/ui/components/base/sidebar';
import { Toaster } from '@statelyjs/ui/components/base/sonner';
import { useStatelyUi } from '@/index';
import { Header } from './header';
import { Navigation } from './navigation';

export type RootProps = {
  headerProps?: React.ComponentProps<typeof Header> & { enable?: boolean };
  sidebarProps?: React.ComponentProps<typeof Navigation>;
  mainProps?: React.ComponentProps<'main'>;
  contentProps?: React.ComponentProps<'div'>;
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
  children,
  ...rest
}: React.PropsWithChildren<RootProps & React.ComponentProps<typeof SidebarProvider>>) {
  const { plugins, options } = useStatelyUi<S, A>();
  return (
    <SidebarProvider {...rest}>
      <Navigation {...sidebarProps} options={options} plugins={plugins} />
      <main
        {...mainProps}
        className={cn([
          'stately-main @container/stately',
          'bg-background relative overflow-hidden',
          'flex-1 h-full min-h-dvh w-full min-w-0',
          'grid',
          headerProps?.enable ? 'grid-rows-[auto_1fr]' : 'grid-rows-[1fr]',
          mainProps.className,
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
            contentProps.className,
          ])}
        >
          {children}
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
