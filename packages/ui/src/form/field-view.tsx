/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType::view'
 */

import type { BaseNode } from '@statelyjs/schema/nodes';
import type { PluginNodeUnion } from '@statelyjs/schema/plugin';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import { useBaseStatelyUi } from '@/context';
import { devLog } from '@/lib/logging';
import { getViewComponent } from '@/registry';

export interface FieldViewProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> {
  node: N;
  value: V;
}

export function FieldView<
  S extends StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(props: FieldViewProps<S, N, V>) {
  const { node, value } = props;
  const { registry } = useBaseStatelyUi();

  devLog.debug('FieldView', 'rendering', { node, value });

  if (value === null || value === undefined) return null;
  const View = getViewComponent<S, N, V>(registry.components, node.nodeType);
  if (!View) {
    console.warn('FieldView: No view component found for nodeType:', node.nodeType);
    return null;
  }
  devLog.debug('FieldView', 'found View component for:', node.nodeType);
  return <View {...props} />;
}
