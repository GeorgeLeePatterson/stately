import { ArrayIndex, NotSet } from '@statelyjs/ui/components';
import { Item, ItemContent, ItemGroup } from '@statelyjs/ui/components/base/item';
import type { FieldViewProps } from '@statelyjs/ui/registry';
import { BaseForm } from '@/form';
import { useId } from 'react';
import type { Schemas } from '@/core/schema';

export type ArrayViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['array'],
  unknown[]
>;

export function ArrayView<Schema extends Schemas = Schemas>({
  value,
  node,
}: ArrayViewProps<Schema>) {
  const formId = useId();
  const keyPrefix = `${node.nodeType}-${node.items.nodeType}-array-${formId}`;
  const arrValue = Array.isArray(value)
    ? value
    : typeof value === 'object'
      ? Object.entries(value)
      : [value];

  return (
    <ItemGroup className="flex flex-col flex-1 gap-2">
      {arrValue === undefined ? (
        <NotSet />
      ) : arrValue.length === 0 ? (
        <NotSet override="[Empty]" />
      ) : (
        arrValue.map((item, index) => (
          <Item
            className={['p-0', 'min-w-0 flex-1'].join(' ')}
            // biome-ignore lint/suspicious/noArrayIndexKey: ""
            key={`${keyPrefix}-${index}`}
            size="sm"
          >
            <ArrayIndex index={index + 1} />
            <ItemContent>
              <BaseForm.FieldView<Schema> node={node.items} value={item} />
            </ItemContent>
          </Item>
        ))
      )}
    </ItemGroup>
  );
}
