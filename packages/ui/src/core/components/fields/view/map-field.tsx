import type { Schemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Variable } from 'lucide-react';
import { useState } from 'react';
import { NotSet } from '@/base/components/not-set';
import type { ViewFieldProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import { useViewMore } from '@/base/hooks/use-view-more';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/base/ui/collapsible';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/base/ui/item';
import type { CoreMapNode } from '@/core';

export function KeyValue({
  active,
  itemKey,
  open,
  after,
  children,
}: React.PropsWithChildren<{
  active?: boolean;
  open?: boolean;
  itemKey: string;
  after?: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible onOpenChange={setIsOpen} open={open || isOpen}>
      <Item size="sm" variant="outline">
        <ItemContent
          className={cn('flex flex-nowrap flex-1 items-start', 'w-full', 'text-xs font-mono')}
        >
          <ItemTitle>
            <CollapsibleTrigger asChild>
              <Button className="rounded-md cursor-pointer" size="sm" variant="ghost">
                {open || isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span className={cn('flex gap-2 items-center', active && 'text-primary animate-pulse')}>
              <Variable className="h-4 w-4 text-muted-foreground" />
              {itemKey}
            </span>
          </ItemTitle>
        </ItemContent>
        {after && <ItemActions>{after}</ItemActions>}
      </Item>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export type MapViewProps<Schema extends Schemas = Schemas> = ViewFieldProps<
  Schema,
  CoreMapNode<Schema>,
  AnyRecord
>;

export function MapView<Schema extends Schemas = Schemas>({ node, value }: MapViewProps<Schema>) {
  const [entries, viewMore, setViewMore] = useViewMore(value, 3);

  if (typeof value !== 'object') {
    return null;
  }

  return entries.length === 0 ? (
    <div className="flex min-w-0 flex-1 border border-border rounded-lg p-3">
      <p className="text-sm text-muted-foreground text-center">
        <NotSet />
      </p>
    </div>
  ) : (
    <ItemGroup className="space-y-3">
      {entries.map(([key, val]) => (
        <KeyValue itemKey={key} key={key}>
          <FieldView node={node} value={val} />
        </KeyValue>
      ))}

      {/* View More */}
      <Item className="p-1" size="sm" variant="muted">
        <ItemContent
          className={cn('flex flex-nowrap flex-1 justify-center w-full', 'text-xs font-mono')}
        >
          <Button
            className="cursor-pointer font-mono text-sm"
            onClick={() => setViewMore(v => !v)}
            type="button"
            variant="link"
          >
            {viewMore ? <ChevronsDownUp /> : <ChevronsUpDown />}
            View {viewMore ? 'Less' : 'More'}
          </Button>
        </ItemContent>
      </Item>
    </ItemGroup>
  );
}
