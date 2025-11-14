import type { CoreMapNode, CoreSchemas } from "@/core";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Variable,
} from "lucide-react";
import { useState } from "react";
import { NotSet } from "@/core/components/base/not-set";
import { Button } from "@/core/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/core/components/ui/item";
import { useViewMore } from "@/base/hooks/use-view-more";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";
import { cn } from "@/base/lib/utils";
import { AnyRecord } from "@stately/schema/helpers";

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
    <Collapsible open={open || isOpen} onOpenChange={setIsOpen}>
      <Item size="sm" variant="outline">
        <ItemContent
          className={cn(
            "flex flex-nowrap flex-1 items-start",
            "w-full",
            "text-xs font-mono",
          )}
        >
          <ItemTitle>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md cursor-pointer"
              >
                {open || isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span
              className={cn(
                "flex gap-2 items-center",
                active && "text-primary animate-pulse",
              )}
            >
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

export type MapViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreMapNode<Schema>, AnyRecord>;

export function MapView<Schema extends CoreSchemas = CoreSchemas>({
  node,
  value,
}: MapViewProps<Schema>) {
  const [entries, viewMore, setViewMore] = useViewMore(value, 3);

  if (typeof value !== "object") {
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
        <KeyValue key={key} itemKey={key}>
          <FieldView node={node} value={val} />
        </KeyValue>
      ))}

      {/* View More */}
      <Item size="sm" variant="muted" className="p-1">
        <ItemContent
          className={cn(
            "flex flex-nowrap flex-1 justify-center w-full",
            "text-xs font-mono",
          )}
        >
          <Button
            type="button"
            variant="link"
            onClick={() => setViewMore((v) => !v)}
            className="cursor-pointer font-mono text-sm"
          >
            {viewMore ? <ChevronsDownUp /> : <ChevronsUpDown />}
            View {viewMore ? "Less" : "More"}
          </Button>
        </ItemContent>
      </Item>
    </ItemGroup>
  );
}
