import { NotSet } from '@/base/components/not-set';
import type { FieldViewProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import type { Schemas } from '@/core/schema';

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
