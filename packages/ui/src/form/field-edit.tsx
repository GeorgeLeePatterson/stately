/**
 * Field Renderer - Router for rendering schema nodes in edit mode
 *
 * Uses flat component registry lookup: 'nodeType::edit'
 * All base components are pre-registered in statelyUi()
 */

import type { BaseNode } from '@statelyjs/schema/nodes';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import { useBaseStatelyUi } from '@/context';
import { devLog } from '@/lib/logging';
import { getEditComponent } from '@/registry';

export interface FieldEditProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = S['plugin']['AnyNode'],
  V = unknown,
> {
  formId: string;
  node: N;
  value?: V;
  onChange: (value: V) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  isWizard?: boolean;
}

export function FieldEdit<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = S['plugin']['AnyNode'],
  V = unknown,
>(props: FieldEditProps<S, N, V>) {
  const { node } = props;
  const { registry } = useBaseStatelyUi();

  const Edit = getEditComponent<S, N, V>(registry.components, node.nodeType);

  devLog.debug('FieldEdit', `rendering id=${props?.formId}`, { node, value: props.value });

  if (!Edit) {
    console.warn('FieldEdit: No view component found for nodeType:', node.nodeType);
    return <div className="text-destructive text-sm">Unknown node type: {node.nodeType}</div>;
  }

  devLog.debug('FieldEdit', 'found Edit component for:', node.nodeType);

  return <Edit {...props} />;
}
