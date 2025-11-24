import type { Schemas } from '@stately/schema';
import { NotSet } from '@/base/components/not-set';
import type { FieldViewProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';

export type NullableViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['nullable']
>;

export function NullableView<Schema extends Schemas = Schemas>({
  value,
  node,
}: NullableViewProps<Schema>) {
  if (!value) return <NotSet />;
  return <FieldView<Schema> node={node.innerSchema} value={value} />;
}
