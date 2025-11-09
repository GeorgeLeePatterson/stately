import type { StatelyConfig } from '@stately/schema';
import { FieldDescription, FieldTitle } from '@/components/ui/field';
import { EntityPropertyLabel, type EntityPropertyProps } from './entity-property-view';

export function EntityPropertyEdit<Config extends StatelyConfig = StatelyConfig>({
  fieldName,
  node,
  isRequired,
  compact,
  children,
}: React.PropsWithChildren<EntityPropertyProps<Config>>) {
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
