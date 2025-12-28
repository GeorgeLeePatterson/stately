import { Tuple } from '@statelyjs/schema/helpers';
import { cn } from '@statelyjs/ui';
import { DescriptionLabel, Explain } from '@statelyjs/ui/components';
import { Cog } from 'lucide-react';
import { useMemo } from 'react';
import type { CoreEntityData } from '@/core';
import type { PrimitiveNode, Schemas } from '@/core/schema';
import { BaseForm, type JsonViewProps } from '@/form';
import { useStatelyUi } from '@/index';

export interface EntityFormProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  entity?: CoreEntityData<Schema>;
}

export interface EntityPropertyProps<Schema extends Schemas = Schemas> {
  fieldName: string | React.ReactNode;
  node: Schema['plugin']['AnyNode'];
  isRequired?: boolean;
}

export function EntityPropertyLabel<Schema extends Schemas = Schemas>({
  fieldName,
  node,
  isRequired,
}: EntityPropertyProps<Schema>) {
  const { schema, utils } = useStatelyUi<Schema>();
  const NodeTypeIcon = utils.getNodeTypeIcon(schema.plugins.core.extractNodeInnerType(node)) ?? Cog;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <NodeTypeIcon className="w-4 h-4 text-primary shrink-0" />
      <div className="font-semibold text-sm">
        {typeof fieldName === 'string' ? (
          <>
            {utils?.generateFieldLabel(fieldName)}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </>
        ) : (
          fieldName
        )}
      </div>
    </div>
  );
}

export function EntityProperty<Schema extends Schemas = Schemas>({
  fieldName,
  node,
  isRequired,
  children,
  ...rest
}: React.PropsWithChildren<EntityPropertyProps<Schema>> & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        'flex-1 min-w-0',
        'flex flex-col gap-3',
        'py-6',
        'not-last:border-b border-muted',
        rest?.className,
      )}
    >
      <div className="flex flex-col gap-1">
        <EntityPropertyLabel fieldName={fieldName} isRequired={isRequired} node={node} />
        {node.description && (
          <Explain content={node.description}>
            <DescriptionLabel className="w-full flex-1 min-w-0 truncate max-w-[90%]">
              {node.description}
            </DescriptionLabel>
          </Explain>
        )}
      </div>
      {children}
    </div>
  );
}

export function EntityJsonView({
  data,
  isOpen,
  setIsOpen,
  ...rest
}: JsonViewProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('flex flex-col gap-6 w-full min-w-0', rest.className)}>
      <BaseForm.JsonView data={data} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

// Simple entity form hook
export function useEntityProperties<Schema extends Schemas = Schemas>({
  node,
  entity,
}: EntityFormProps<Schema>) {
  const { schema } = useStatelyUi<Schema>();
  const required = useMemo(() => new Set(node.required || []), [node.required]);

  const name = useMemo(
    () =>
      'name' in node.properties
        ? { node: node.properties.name as PrimitiveNode, value: entity?.name }
        : undefined,
    [node.properties, entity],
  );

  const entityProperties = useMemo(
    () =>
      Object.entries(node.properties)
        .filter(([name]) => name !== 'name')
        .map(([name, schemaNode]) => Tuple([name, schemaNode])),
    [node.properties],
  );

  const sortedProperties = useMemo(
    () => schema.plugins.core.sortEntityProperties(entityProperties, required),
    [entityProperties, required, schema.plugins.core.sortEntityProperties],
  );

  return { name, required, sortedProperties };
}
