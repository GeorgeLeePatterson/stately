/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType::view'
 */

import type { CoreSchemas } from '@/core';
import { useStatelyUi } from '@/context';
import { getViewComponent } from '@/registry';
import type { ViewFieldProps } from './types';

export function FieldView<Schema extends CoreSchemas = CoreSchemas>(props: ViewFieldProps<Schema>) {
  const { node, value } = props;
  const { registry } = useStatelyUi();

  if (value === null || value === undefined) return null;

  const View = getViewComponent<Schema>(registry.components, node.nodeType);

  if (!View) return null;

  return <View {...props} />;
}
