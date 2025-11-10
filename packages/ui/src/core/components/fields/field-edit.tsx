/**
 * Field Renderer - Router for rendering schema nodes in edit mode
 *
 * Uses flat component registry lookup: 'nodeType::edit'
 * All base components are pre-registered in statelyUi()
 */

import type { CoreSchemas } from '@/core';
import { useStatelyUi } from '@/context';
import { getEditComponent } from '@/registry';
import type { EditFieldProps } from './types';

export function FieldEdit<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
  V = unknown,
>(props: EditFieldProps<Schema, N, V>) {
  const { node } = props;
  const { registry } = useStatelyUi();
  const Edit = getEditComponent<Schema, N, V>(registry.components, node.nodeType);

  if (!Edit) {
    return <div className="text-destructive text-sm">Unknown node type: {node.nodeType}</div>;
  }

  return <Edit {...props} />;
}
