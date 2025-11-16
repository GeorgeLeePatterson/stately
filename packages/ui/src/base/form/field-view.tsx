/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType::view'
 */

import type { StatelySchemas } from '@stately/schema/schema';
import { getViewComponent } from '@/base/registry';
import { useStatelyUi } from '@/core';

export interface ViewFieldProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends S['plugin']['AnyNode'] = S['plugin']['AnyNode'],
  V = unknown,
> {
  node: N;
  value: V;
}

export function FieldView<S extends StatelySchemas<any, any> = StatelySchemas<any, any>>(
  props: ViewFieldProps<S>,
) {
  const { node, value } = props;
  const { registry } = useStatelyUi();

  if (value === null || value === undefined) return null;
  const View = getViewComponent<S>(registry.components, node.nodeType);
  if (!View) return null;
  return <View {...props} />;
}
