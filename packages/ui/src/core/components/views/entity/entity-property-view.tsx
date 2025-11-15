import type { ComponentProps } from "react";
import { Item, ItemContent } from "@/core/components/ui/item";
import { useCoreStatelyUi } from "@/context";
import { cn } from "@/base/lib/utils";
import { Schemas } from "@stately/schema";

export type EntityPropertyMode = "edit" | "view";

export interface EntityPropertyProps<Schema extends Schemas = Schemas> {
  fieldName: string | React.ReactNode;
  node: Schema['plugin']["AnyNode"];
  isRequired?: boolean;
  compact?: boolean;
}

export function EntityPropertyLabel<Schema extends Schemas = Schemas>({
  fieldName,
  node,
  isRequired,
}: Omit<EntityPropertyProps<Schema>, "compact">) {
  const { schema, plugins, utils: runtimeUtils } = useCoreStatelyUi();
  // TODO: Remove - this is wrong
  const NodeTypeIcon = runtimeUtils.getNodeTypeIcon(
    schema.plugins.core.extractNodeType(node),
  );
  return (
    <div className="flex items-center gap-2 min-w-0">
      <NodeTypeIcon className="w-4 h-4 text-primary shrink-0" />
      <div className="font-semibold text-sm">
        {typeof fieldName === "string" ? (
          <>
            {plugins.core.utils?.generateFieldLabel(fieldName)}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </>
        ) : (
          fieldName
        )}
      </div>
    </div>
  );
}

export function EntityPropertyView<Schema extends Schemas = Schemas>({
  fieldName,
  node,
  isRequired,
  compact,
  children,
  ...rest
}: React.PropsWithChildren<EntityPropertyProps<Schema>> &
  React.ComponentProps<typeof Item>) {
  return (
    <Item
      {...(rest as ComponentProps<typeof Item>)}
      className={cn(
        "flex-1 space-y-3 min-w-0",
        compact ? "py-1" : "",
        rest?.className,
      )}
    >
      <ItemContent className="space-y-3">
        <EntityPropertyLabel
          fieldName={fieldName}
          node={node}
          isRequired={isRequired}
        />
        {node.description && !compact && (
          <blockquote className="text-xs italic leading-none font-medium text-muted-foreground">
            {node.description}
          </blockquote>
        )}
        {children}
      </ItemContent>
    </Item>
  );
}
