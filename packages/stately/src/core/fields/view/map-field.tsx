import type { AnyRecord } from '@statelyjs/schema/helpers';
import { cn } from '@statelyjs/ui';
import { NotSet } from '@statelyjs/ui/components';
import { Button } from '@statelyjs/ui/components/base/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@statelyjs/ui/components/base/collapsible';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from '@statelyjs/ui/components/base/item';
import type { FieldViewProps } from '@statelyjs/ui/form';
import { BaseForm } from '@statelyjs/ui/form';
import { useViewMore } from '@statelyjs/ui/hooks';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Variable } from 'lucide-react';
import type { Schemas } from '@/core/schema';

export const MAX_ITEMS_VIEW_DEFAULT = 3;

export function KeyValue({
  active,
  itemKey,
  open,
  after,
  children,
  onOpen,
}: React.PropsWithChildren<{
  active?: boolean;
  open?: boolean;
  itemKey: string;
  after?: React.ReactNode;
  onOpen?: (open: boolean) => void;
}>) {
  return (
    <Collapsible onOpenChange={onOpen} open={open}>
      <Item className="px-3 py-2" size="sm" variant="outline">
        <ItemContent
          className={cn('flex flex-nowrap flex-1 items-start', 'w-full', 'text-xs font-mono')}
        >
          <ItemTitle>
            <CollapsibleTrigger
              render={
                <Button className="rounded-md cursor-pointer" size="sm" variant="ghost">
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              }
            />
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

export type MapViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['map'],
  AnyRecord
>;

export function MapView<Schema extends Schemas = Schemas>({ node, value }: MapViewProps<Schema>) {
  const [entries, viewMore, setViewMore] = useViewMore(value, MAX_ITEMS_VIEW_DEFAULT);

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
          <div className="py-3 px-2">
            <BaseForm.FieldView<Schema> node={node.valueSchema} value={val} />
          </div>
        </KeyValue>
      ))}

      {/* View More */}
      {entries.length > MAX_ITEMS_VIEW_DEFAULT && (
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
      )}
    </ItemGroup>
  );
}
