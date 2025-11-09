import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { ComponentProps } from 'react';
import { Item, ItemContent } from '@/components/ui/item';
import { useStatelyUi } from '@/context';
import { cn } from '@/lib/utils';

export type EntityPropertyMode = 'edit' | 'view';

export interface EntityPropertyProps<Config extends StatelyConfig = StatelyConfig> {
  fieldName: string | React.ReactNode;
  node: StatelySchemas<Config>['AnySchemaNode'];
  isRequired?: boolean;
  compact?: boolean;
}

export function EntityPropertyLabel<Config extends StatelyConfig = StatelyConfig>({
  fieldName,
  node,
  isRequired,
}: Omit<EntityPropertyProps<Config>, 'compact'>) {
  const { integration, helpers } = useStatelyUi();
  const NodeTypeIcon = helpers.getNodeTypeIcon(integration.helpers.extractNodeType(node));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <NodeTypeIcon className="w-4 h-4 text-primary shrink-0" />
      <div className="font-semibold text-sm">
        {typeof fieldName === 'string' ? (
          <>
            {integration.helpers.generateFieldLabel(fieldName)}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </>
        ) : (
          fieldName
        )}
      </div>
    </div>
  );
}

export function EntityPropertyView<Config extends StatelyConfig = StatelyConfig>({
  fieldName,
  node,
  isRequired,
  compact,
  children,
  ...rest
}: React.PropsWithChildren<EntityPropertyProps<Config>> & React.ComponentProps<typeof Item>) {
  return (
    <Item
      {...(rest as ComponentProps<typeof Item>)}
      className={cn('flex-1 space-y-3 min-w-0', compact ? 'py-1' : '', rest?.className)}
    >
      <ItemContent className="space-y-3">
        <EntityPropertyLabel fieldName={fieldName} node={node} isRequired={isRequired} />
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
