import type { CoreArrayNode, CoreSchemas } from '@/core';
import { useId } from 'react';
import { ArrayIndex } from '@/core/components/base/array';
import { Item, ItemContent, ItemGroup } from '@/core/components/ui/item';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type ArrayViewProps<Schema extends CoreSchemas = CoreSchemas> = ViewFieldProps<
  Schema,
  CoreArrayNode<Schema>,
  unknown[]
>;

export function ArrayView<Schema extends CoreSchemas = CoreSchemas>({
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
            // biome-ignore lint/suspicious/noArrayIndexKey: ""
            key={`${keyPrefix}-${index}`}
            size="sm"
            className={['p-0', 'min-w-0 flex-1'].join(' ')}
          >
            <ArrayIndex index={index + 1} />
            <ItemContent>
              <FieldView node={node} value={item} />
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
