import type { Schemas } from '@stately/schema';
import { useId } from 'react';
import { FieldItem } from '@/base/components/field';
import type { FieldViewProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';

export type TupleViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['tuple'],
  unknown[]
>;

export function TupleView<Schema extends Schemas = Schemas>({
  value,
  node,
}: TupleViewProps<Schema>) {
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
        {node.items.map((itemSchema: (typeof node.items)[number], index: number) => (
          <FieldView<Schema>
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
