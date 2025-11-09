import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useId } from 'react';
import { FieldItem } from '@/components/base/array';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type TupleViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['TupleNode'],
  unknown[]
>;

export function TupleView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: TupleViewProps<Config>) {
  const formId = useId();
  const keyPrefix = `${node.nodeType}-tuple-${formId}`;
  const arrValue = Array.isArray(value)
    ? value
    : typeof value === 'object'
      ? Object.entries(value)
      : [value];

  return (
    <FieldItem>
      <div className="space-y-2 pl-4 border-l-2 border-muted">
        {node.items.map((itemSchema, index) => (
          <FieldView
            key={`${keyPrefix}-tuple-${
              // biome-ignore lint/suspicious/noArrayIndexKey: Tuples are stable
              index
            }`}
            node={itemSchema}
            value={arrValue[index]}
          />
        ))}
      </div>
    </FieldItem>
  );
}
