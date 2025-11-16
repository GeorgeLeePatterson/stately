import type { Schemas } from '@stately/schema';
import { NotSet } from '@/base/components/not-set';
import type { ViewFieldProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import type { CoreNullableNode } from '@/core';

export type NullableViewProps<Schema extends Schemas = Schemas> = ViewFieldProps<
  Schema,
  CoreNullableNode<Schema>
>;

export function NullableView<Schema extends Schemas = Schemas>({
  value,
  node,
}: NullableViewProps<Schema>) {
  if (!value) return <NotSet />;
  return <FieldView node={node.innerSchema} value={value} />;
}
