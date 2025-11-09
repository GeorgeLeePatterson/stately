import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { NotSet } from '@/components/base/not-set';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type NullableViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['NullableNode']
>;

export function NullableView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: NullableViewProps<Config>) {
  if (!value) return <NotSet />;
  return <FieldView node={node.innerSchema} value={value} />;
}
