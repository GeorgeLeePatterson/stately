import type { Schemas } from '@stately/schema';
import { useId } from 'react';
import { ArrayIndex } from '@/base/components/array';
import type { ViewFieldProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import { Item, ItemContent, ItemGroup } from '@/base/ui/item';

export type ArrayViewProps<Schema extends Schemas = Schemas> = ViewFieldProps<
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
      {arrValue.map((item, index) => {
        return (
          <Item
            className={['p-0', 'min-w-0 flex-1'].join(' ')}
            // biome-ignore lint/suspicious/noArrayIndexKey: ""
            key={`${keyPrefix}-${index}`}
            size="sm"
          >
            <ArrayIndex index={index + 1} />
            <ItemContent>
              <FieldView<Schema> node={node} value={item} />
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
