import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@statelyjs/ui/components/base/breadcrumb';
import { Button } from '@statelyjs/ui/components/base/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@statelyjs/ui/components/base/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@statelyjs/ui/components/base/dropdown-menu';
import { useMediaQuery } from '@statelyjs/ui/hooks/use-media-query';
import { cn } from '@statelyjs/ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';

export const ITEMS_TO_DISPLAY = 3;

export interface CrumbItems {
  label: string;
  href?: string;
}

export interface CrumbProps {
  items: CrumbItems[];
}

export function Crumbs({ items, ...rest }: React.ComponentProps<'nav'> & CrumbProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const collapsedItems = useMemo(() => {
    if (!items?.length || items.length <= ITEMS_TO_DISPLAY) return { rest: items ?? [] };
    return {
      collapsed: items.slice(0, -ITEMS_TO_DISPLAY + 1),
      rest: items.slice(-ITEMS_TO_DISPLAY + 1),
    };
  }, [items]);

  return (
    <Breadcrumb className={cn('', rest.className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {items?.length > 0 && <BreadcrumbSeparator />}

        {/* Collapsed breadcrumbs */}
        {collapsedItems.collapsed && (
          <>
            <CollapsibleCrumbs isDesktop={isDesktop} items={collapsedItems.collapsed} />
            <BreadcrumbSeparator />
          </>
        )}

        {/* Remaining breadcrumbs */}
        {collapsedItems.rest.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            <BreadcrumbItem>
              {crumb.href ? (
                <>
                  <BreadcrumbLink className="max-w-20 truncate md:max-w-none" href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                </>
              ) : (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                  {crumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {crumb.href && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CollapsibleCrumbs({
  items,
  isDesktop,
  ...props
}: React.ComponentProps<typeof BreadcrumbItem> &
  Pick<CrumbProps, 'items'> & { isDesktop?: boolean }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <BreadcrumbItem {...props}>
      {isDesktop ? (
        <DropdownMenu onOpenChange={setOpen} open={open}>
          <DropdownMenuTrigger aria-label="Toggle menu" className="flex items-center gap-1">
            <BreadcrumbEllipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {items.map((item, index) => (
              <DropdownMenuItem key={`${item.label}-${index}`}>
                <a
                  className={cn(
                    'text-sm w-full',
                    'flex flex-nowrap items-center justify-between gap-2',
                  )}
                  href={item.href ? item.href : '#'}
                >
                  <span className="max-w-60 md:max-w-none truncate">{item.label}</span>
                  <ChevronRight />
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer direction="top" onOpenChange={setOpen} open={open}>
          <DrawerTrigger aria-label="Toggle Menu">
            <BreadcrumbEllipsis className="h-4 w-4" />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Navigate to</DrawerTitle>
              <DrawerDescription>Select a page to navigate to.</DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-1 px-4 w-full min-w-0">
              {items.map((item, index) => (
                <Button
                  className="cursor-pointer justify-between"
                  key={`${item.label}-${index}`}
                  nativeButton={false}
                  render={
                    <a
                      className={cn('py-1 text-sm w-full min-w-0', 'flex flex-nowrap items-center')}
                      href={item.href ? item.href : '#'}
                    >
                      <span className="flex-auto max-w-60 md:max-w-none truncate">
                        {item.label}
                      </span>
                      <ChevronRight />
                    </a>
                  }
                  variant="ghost"
                />
              ))}
            </div>
            <DrawerFooter className="pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </BreadcrumbItem>
  );
}
