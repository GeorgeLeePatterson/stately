import { FieldDescription, FieldTitle } from '@/core/components/ui/field';
import type { CoreSchemas } from '@/core';
import { EntityPropertyLabel, type EntityPropertyProps } from './entity-property-view';

export function EntityPropertyEdit<Schema extends CoreSchemas = CoreSchemas>({
  fieldName,
  node,
  isRequired,
  compact,
  children,
}: React.PropsWithChildren<EntityPropertyProps<Schema>>) {
  return (
    <>
      <FieldTitle className="flex items-center gap-2">
        <EntityPropertyLabel fieldName={fieldName} node={node} isRequired={isRequired} />
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
