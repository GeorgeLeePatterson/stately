import type { StatelySchemas } from '@stately/schema';
import type { ComponentProps } from 'react';
import { FieldDescription, FieldTitle } from '@/components/ui/field';
import { Item, ItemContent } from '@/components/ui/item';
import { useStatelyUi } from '@/context';
import { cn } from '@/lib/utils';

export type EntityPropertyMode = 'edit' | 'view';

interface EntityPropertyProps<Schemas extends StatelySchemas = StatelySchemas> {
  fieldName: string | React.ReactNode;
  schema: Schemas['AnySchemaNode'];
  isRequired?: boolean;
  compact?: boolean;
}

export function EntityPropertyLabel<Schemas extends StatelySchemas = StatelySchemas>({
  fieldName,
  schema,
  isRequired,
}: Omit<EntityPropertyProps<Schemas>, 'compact'>) {
  const { integration, helpers } = useStatelyUi();
  const NodeTypeIcon = helpers.getNodeTypeIcon(integration.helpers.extractNodeType(schema));
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

export function EntityProperty({
  fieldName,
  schema,
  isRequired,
  compact,
  children,
  ...rest
}: React.PropsWithChildren<EntityPropertyProps> & React.ComponentProps<typeof Item>) {
  return (
    <Item
      {...(rest as ComponentProps<typeof Item>)}
      className={cn('flex-1 space-y-3 min-w-0', compact ? 'py-1' : '', rest?.className)}
    >
      <ItemContent className="space-y-3">
        <EntityPropertyLabel fieldName={fieldName} schema={schema} isRequired={isRequired} />
        {schema.description && !compact && (
          <blockquote className="text-xs italic leading-none font-medium text-muted-foreground">
            {schema.description}
          </blockquote>
        )}
        {children}
      </ItemContent>
    </Item>
  );
}

export function EntityPropertyEdit({
  fieldName,
  schema,
  isRequired,
  compact,
  children,
}: React.PropsWithChildren<EntityPropertyProps>) {
  return (
    <>
      <FieldTitle className="flex items-center gap-2">
        <EntityPropertyLabel fieldName={fieldName} schema={schema} isRequired={isRequired} />
      </FieldTitle>
      {schema.description && !compact && (
        <FieldDescription className="text-xs italic leading-none font-medium text-muted-foreground">
          {schema.description}
        </FieldDescription>
      )}
      {children}
    </>
  );
}
