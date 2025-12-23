import type { AvatarImageProps } from '@base-ui/react/avatar';
import type { StatelySchemas } from '@statelyjs/schema';
import type { Defined } from '@statelyjs/schema/helpers';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/base/avatar';
import { Button } from '@/components/base/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/base/sidebar';
import { useClickTracking } from '@/hooks';
import type { AnyUiPlugin } from '@/plugin';
import type { StatelyUiRuntime, UiNavigationOptions } from '@/runtime';
import { stripTrailing } from '@/utils';
import { cn } from '../lib/utils';
import { PluginNavigation } from './plugin-navigation';

export type NavigationRoutes = UiNavigationOptions['routes'];

interface NavigationBaseProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  A extends readonly AnyUiPlugin[] = readonly [],
> {
  logo?: AvatarImageProps['src'] | React.ReactNode;
  logoName?: React.ReactNode;
  plugins?: StatelyUiRuntime<S, A>['plugins'];
  options?: StatelyUiRuntime<S, A>['options'];
}

export type NavigationProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  A extends readonly AnyUiPlugin[] = readonly [],
> = NavigationBaseProps<S, A> & React.ComponentProps<typeof Sidebar>;

export function Navigation<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  A extends readonly AnyUiPlugin[] = readonly [],
>({ logo, logoName, plugins, options, ...rest }: NavigationProps<S, A>) {
  const currentPath = window.location.pathname;

  const routeOverrides = options?.navigation?.routeOverrides || {};

  const basePath = stripTrailing(options?.navigation?.basePath || '');

  const topLevelRoute = options?.navigation?.routes;
  const sidebarLabel = topLevelRoute?.label || 'Application';
  const sidebarTo = `${basePath}${topLevelRoute?.to}` || '/';
  const sidebarNavItems = topLevelRoute?.items || [];

  const SidebarBadgeComp = topLevelRoute?.badge;
  const sidebarBadge =
    SidebarBadgeComp && topLevelRoute ? <SidebarBadgeComp {...topLevelRoute} /> : null;

  const { trackClick } = useClickTracking();

  const handleNavClick = useCallback(
    (path: string, label: string) => {
      // Don't track root clicks - too common
      if (path !== sidebarTo) {
        trackClick(path, label);
      }
    },
    [trackClick, sidebarTo],
  );

  const sidebarLinks = useMemo(
    () =>
      sidebarNavItems.map(item => (
        <SidebarMenuItem key={`app-link-${item.to}`}>
          <SidebarMenuButton
            isActive={currentPath === `${basePath}${item.to}`}
            render={
              <a
                href={`${basePath}${item.to}`}
                onClick={() => handleNavClick(`${basePath}${item.to}`, item.label)}
              >
                {item.icon && <item.icon />}
                <span>{item.label}</span>
                {item.badge && <item.badge {...item} />}
              </a>
            }
          />
        </SidebarMenuItem>
      )),
    [sidebarNavItems, currentPath, basePath, handleNavClick],
  );

  const pluginItems = Object.values(plugins ?? {})
    .map(plugin => plugin.routes)
    .filter((sidebar): sidebar is Defined<NavigationRoutes> => sidebar !== undefined)
    .map(sidebar => (
      <PluginNavigation
        basePath={basePath}
        currentPath={currentPath}
        handleNavClick={handleNavClick}
        key={`plugin-items-${sidebar.to}`}
        routeOverrides={routeOverrides}
        sidebar={sidebar}
      />
    ));

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      {...rest}
      className={cn(['stately-nav', rest?.className])}
    >
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          {/* Logo */}
          {!!logo &&
            (typeof logo === 'string' ? (
              <a href={sidebarTo}>
                <Avatar>
                  <AvatarImage src={logo} />
                  <AvatarFallback>X</AvatarFallback>
                </Avatar>
              </a>
            ) : (
              logo
            ))}

          {/* Logo name */}
          {!!logoName &&
            (typeof logoName === 'string' ? (
              <span className="font-bold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                {logoName}
              </span>
            ) : (
              logoName
            ))}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Application Group */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {sidebarLabel}
            {sidebarBadge}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* User provided sidebar links */}
              {sidebarLinks}

              {/* Plugin provided sidebar links */}
              {pluginItems}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarToggle variant="outline" />
      </SidebarFooter>
    </Sidebar>
  );
}

export const SidebarToggle = ({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { toggleSidebar, state } = useSidebar();
  const isOpen = state === 'expanded';

  return (
    <Button
      className={cn(className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={event => {
        onClick?.(event);
        toggleSidebar();
      }}
      variant="ghost"
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {isOpen ? <ChevronsLeft /> : <ChevronsRight />}
          {isOpen && 'Collapse Sidebar'}
        </>
      )}
    </Button>
  );
};
