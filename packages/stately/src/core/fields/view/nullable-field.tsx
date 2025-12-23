import { NotSet } from '@statelyjs/ui/components';
import type { FieldViewProps } from '@statelyjs/ui/form';
import { BaseForm } from '@statelyjs/ui/form';
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
  return <BaseForm.FieldView<Schema> node={node.innerSchema} value={value} />;
}
