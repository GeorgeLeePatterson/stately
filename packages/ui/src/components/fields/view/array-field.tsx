import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useId } from 'react';
import { ArrayIndex } from '@/components/base/array';
import { Item, ItemContent, ItemGroup } from '@/components/ui/item';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type ArrayViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['ArrayNode'],
  unknown[]
>;

export function ArrayView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: ArrayViewProps<Config>) {
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
