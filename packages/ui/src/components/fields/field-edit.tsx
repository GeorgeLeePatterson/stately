/**
 * Field Renderer - Router for rendering schema nodes in edit mode
 *
 * Uses flat component registry lookup: 'nodeType:edit'
 * All base components are pre-registered in statelyUi()
 */

import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useStatelyUi } from '@/context';
import { getEditComponent } from '@/registry';
import type { EditFieldProps } from './types';

export function FieldEdit<
  Config extends StatelyConfig = StatelyConfig,
  N extends StatelySchemas<Config>['AnySchemaNode'] = StatelySchemas<Config>['AnySchemaNode'],
  V = unknown,
>(props: EditFieldProps<Config, N, V>) {
  const { node } = props;
  const { componentRegistry } = useStatelyUi();

  const Edit = getEditComponent<Config>(componentRegistry, node.nodeType);

  if (!Edit) {
    return <div className="text-destructive text-sm">Unknown node type: {node.nodeType}</div>;
  }

  return <Edit {...props} />;
}
