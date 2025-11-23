import type { AvatarImageProps } from '@radix-ui/react-avatar';
import type { Defined } from '@stately/schema/helpers';
import type { StatelySchemas } from '@stately/schema/schema';
import type { ComponentType } from 'react';
import { useBaseStatelyUi } from '@/base/context';
import { useClickTracking } from '@/base/hooks';
import type { UiNavigationOptions } from '@/base/runtime';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/base/ui/sidebar';
import { PluginSidebar } from './plugin-sidebar';

export type SidebarOptions = UiNavigationOptions['routes'];

export interface SidebarItem {
  icon?: ComponentType<any>;
  label: string;
  to: string;
  badge?: ComponentType<Omit<SidebarItem, 'badge'>> | null;
}

export interface LayoutSidebarBaseProps {
  logo?: AvatarImageProps['src'] | React.ReactNode;
  logoName?: React.ReactNode;
}

export type LayoutSidebarProps = LayoutSidebarBaseProps & React.ComponentProps<typeof Sidebar>;

export function LayoutSidebar<S extends StatelySchemas<any, any> = StatelySchemas<any, any>>({
  logo,
  logoName,
  ...rest
}: LayoutSidebarProps) {
  const currentPath = window.location.pathname;
  const { plugins, options, utils } = useBaseStatelyUi<S, []>();

  const basePath = utils.stripTrailingSlash(options?.navigation?.basePath || '');

  const topLevelRoute = options?.navigation?.routes;
  const sidebarLabel = topLevelRoute?.label || 'Application';
  const sidebarTo = `${basePath}${topLevelRoute?.to}` || '/';
  const sidebarNavItems = topLevelRoute?.items || [];

  const SidebarBadgeComp = topLevelRoute?.badge;
  const sidebarBadge =
    SidebarBadgeComp && topLevelRoute ? <SidebarBadgeComp {...topLevelRoute} /> : null;

  const { trackClick } = useClickTracking();

  const handleNavClick = (path: string, label: string) => {
    // Don't track root clicks - too common
    if (path !== sidebarTo) {
      trackClick(path, label);
    }
  };

  const sidebarLinks = sidebarNavItems.map(item => (
    <SidebarMenuItem key={`app-link-${item.to}`}>
      <SidebarMenuButton asChild isActive={currentPath === `${basePath}${item.to}`}>
        <a
          href={`${basePath}${item.to}`}
          onClick={() => handleNavClick(`${basePath}${item.to}`, item.label)}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>
          {item.badge && <item.badge {...item} />}
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));

  const pluginItems = Object.values(plugins)
    .map(plugin => plugin.routes)
    .filter((sidebar): sidebar is Defined<SidebarOptions> => sidebar !== undefined)
    .map(sidebar => (
      <PluginSidebar
        basePath={basePath}
        currentPath={currentPath}
        handleNavClick={handleNavClick}
        key={`plugin-items-${sidebar.to}`}
        sidebar={sidebar}
      />
    ));

  return (
    <Sidebar collapsible="icon" variant="floating" {...rest}>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
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
    </Sidebar>
  );
}
