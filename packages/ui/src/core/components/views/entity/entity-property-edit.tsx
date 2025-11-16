import type { Schemas } from '@stately/schema';
import { FieldDescription, FieldTitle } from '@/base/ui/field';
import { EntityPropertyLabel, type EntityPropertyProps } from './entity-property-view';

export function EntityPropertyEdit<Schema extends Schemas = Schemas>({
  fieldName,
  node,
  isRequired,
  compact,
  children,
}: React.PropsWithChildren<EntityPropertyProps<Schema>>) {
  return (
    <>
      <FieldTitle className="flex items-center gap-2">
        <EntityPropertyLabel fieldName={fieldName} isRequired={isRequired} node={node} />
      </FieldTitle>
      {node.description && !compact && (
        <FieldDescription className="text-xs italic leading-none font-medium text-muted-foreground">
          {node.description}
        </FieldDescription>
      )}
      {children}
    </>
  );
}
