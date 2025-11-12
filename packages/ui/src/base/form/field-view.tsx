/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType::view'
 */

import { useStatelyUi } from '@/context';
import { getViewComponent } from '@/registry';

export interface ViewFieldProps<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
  V = unknown,
> {
  node: N;
  value: V;
}

export function FieldView<Schema extends CoreSchemas = CoreSchemas>(props: ViewFieldProps<Schema>) {
  const { node, value } = props;
  const { registry } = useStatelyUi();

  if (value === null || value === undefined) return null;

  const View = getViewComponent<Schema>(registry.components, node.nodeType);

  if (!View) return null;

  return <View {...props} />;
}
