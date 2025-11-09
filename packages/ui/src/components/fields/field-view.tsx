/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType:view'
 */

import type { StatelyConfig } from '@stately/schema';
import { useStatelyUi } from '@/context';
import { getViewComponent } from '@/registry';
import type { ViewFieldProps } from './types';

export function FieldView<S extends StatelyConfig = StatelyConfig>(props: ViewFieldProps<S>) {
  const { node, value } = props;
  const { componentRegistry } = useStatelyUi();

  if (value === null || value === undefined) return null;

  const View = getViewComponent<S>(componentRegistry, node.nodeType);

  if (!View) return null;

  return <View {...props} />;
}
