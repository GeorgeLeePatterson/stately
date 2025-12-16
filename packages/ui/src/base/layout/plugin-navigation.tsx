import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useBaseStatelyUi } from '../context';
import { devLog } from '../lib/logging';
import { cn } from '../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../ui/sidebar';
import type { NavigationRoutes } from './navigation';

export interface PluginNavigationProps {
  currentPath: string;
  basePath?: string;
  handleNavClick: (path: string, label: string) => void;
  sidebar: NavigationRoutes;
}

export function PluginNavigation({
  currentPath,
  basePath,
  handleNavClick,
  sidebar,
}: PluginNavigationProps) {
  const { options, utils } = useBaseStatelyUi();

  const [isOpen, setIsOpen] = useState(true);

  if (!sidebar) return null;

  const routeOverrides = options?.navigation?.routeOverrides || {};

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
  const groupBasePath = utils.stripTrailing(basePath || '');
  const groupTo = `${groupBasePath}${to}`;
  const groupLabel = utils.toTitleCase(label);

  const groupBadge = GroupBadgeComp && sidebarItem ? <GroupBadgeComp {...sidebarItem} /> : null;

  // If the group is only a top level link, render a SidebarMenuItem
  if (!items?.length) {
    return (
      <SidebarMenuItem key={`app-link-${groupTo}`}>
        <SidebarMenuButton asChild isActive={currentPath === `${groupBasePath}${to}`}>
          <a href={groupTo} onClick={() => handleNavClick(`${groupBasePath}${to}`, groupLabel)}>
            {GroupIcon && <GroupIcon />}
            <span>{groupLabel}</span>
            {groupBadge}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild className="group/collapsible" onOpenChange={setIsOpen} open={isOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={groupLabel}>
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
                  'group-data-[state=open]/collapsible:rotate-90',
                  'text-xs w-4 x-4 cursor-pointer',
                ])}
              />
            </CollapsibleTrigger>
          </a>
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items
              .sort((a, b) => a.label.localeCompare(b.label))
              ?.filter(item => item?.to && item?.label)
              .map(item => routeOverrides[item.to] ?? item)
              .map(({ badge: PluginBadge, ...item }) => (
                <SidebarMenuSubItem key={`plugin-link-${item.to}`}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={currentPath === `${groupBasePath}${item.to}`}
                  >
                    <a
                      href={`${groupBasePath}${item.to}`}
                      onClick={() => handleNavClick(`${groupBasePath}${item.to}`, item.label)}
                      title={`${item.label} -> ${item.to}`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                      {PluginBadge && <PluginBadge {...item} />}
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
