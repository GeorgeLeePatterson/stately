import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/base/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/base/sidebar';
import { devLog } from '@/lib/logging';
import { cn } from '@/lib/utils';
import type { RouteOption } from '@/runtime';
import { stripTrailing, toTitleCase } from '@/utils';
import type { NavigationRoutes } from './navigation';

export interface PluginNavigationProps {
  currentPath: string;
  basePath?: string;
  handleNavClick: (path: string, label: string) => void;
  sidebar: NavigationRoutes;
  routeOverrides?: Record<string, RouteOption>;
}

export function PluginNavigation({
  currentPath,
  basePath,
  handleNavClick,
  sidebar,
  routeOverrides = {},
}: PluginNavigationProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!sidebar) return null;

  const { badge: sidebarBadge, items, ...sidebarItem } = sidebar;
  const { label: sidebarLabel, to: sidebarTo, icon: SidebarGroupIcon } = sidebarItem;

  devLog.debug('Base', `rendering plugin items for ${sidebarTo}:`, {
    basePath,
    currentPath,
    sidebar,
  });

  // Check for group parent override
  const label = routeOverrides[sidebarTo]?.label ?? sidebarLabel;
  const to = routeOverrides[sidebarTo]?.to ?? sidebarTo;
  const GroupIcon = routeOverrides[sidebarTo]?.icon ?? SidebarGroupIcon;
  const GroupBadgeComp = routeOverrides[sidebarTo]?.badge ?? sidebarBadge;

  // Ensure base path is accounted for
  const groupBasePath = stripTrailing(basePath || '');
  const groupTo = `${groupBasePath}${to}`;
  const groupLabel = toTitleCase(label);

  const groupBadge = GroupBadgeComp && sidebarItem ? <GroupBadgeComp {...sidebarItem} /> : null;

  // If the group is only a top level link, render a SidebarMenuItem
  if (!items?.length) {
    return (
      <SidebarMenuItem key={`app-link-${groupTo}`}>
        <SidebarMenuButton
          isActive={currentPath === `${groupBasePath}${to}`}
          render={
            <a href={groupTo} onClick={() => handleNavClick(`${groupBasePath}${to}`, groupLabel)}>
              {GroupIcon && <GroupIcon />}
              <span>{groupLabel}</span>
              {groupBadge}
            </a>
          }
        />
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible className="group/collapsible" onOpenChange={setIsOpen} open={isOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={
            <a href={groupTo} onClick={() => handleNavClick(groupTo, groupLabel)}>
              {GroupIcon && <GroupIcon />}
              <span>{groupLabel}</span>
              {groupBadge}
              <CollapsibleTrigger
                className="ml-auto"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                <ChevronRight
                  className={cn([
                    'transition-transform duration-200',
                    'group-data-open/collapsible:rotate-90',
                    'text-xs w-4 h-4 cursor-pointer',
                  ])}
                />
              </CollapsibleTrigger>
            </a>
          }
          // tooltip={groupLabel}
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {items
              .sort((a, b) => a.label.localeCompare(b.label))
              ?.filter(item => item?.to && item?.label)
              .map(item => routeOverrides[item.to] ?? item)
              .map(({ badge: PluginBadge, ...item }) => (
                <SidebarMenuSubItem key={`plugin-link-${item.to}`}>
                  <SidebarMenuSubButton
                    isActive={currentPath === `${groupBasePath}${item.to}`}
                    render={
                      <a
                        href={`${groupBasePath}${item.to}`}
                        onClick={() => handleNavClick(`${groupBasePath}${item.to}`, item.label)}
                        title={`${item.label} -> ${item.to}`}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                        {PluginBadge && <PluginBadge {...item} />}
                      </a>
                    }
                  />
                </SidebarMenuSubItem>
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
