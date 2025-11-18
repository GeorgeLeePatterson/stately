/**
 * Field Renderer - Router for rendering schema nodes in edit mode
 *
 * Uses flat component registry lookup: 'nodeType::edit'
 * All base components are pre-registered in statelyUi()
 */

import type { BaseNode } from '@stately/schema/nodes';
import type { PluginNodeUnion } from '@stately/schema/plugin';
import type { StatelySchemas } from '@stately/schema/schema';
import { getEditComponent } from '@/base/registry';
import { useStatelyUi } from '@/core';

export interface EditFieldProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
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
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(props: EditFieldProps<S, N, V>) {
  const { node } = props;
  const { registry } = useStatelyUi();
  const Edit = getEditComponent<S, N, V>(registry.components, node.nodeType);

  if (!Edit) {
    return <div className="text-destructive text-sm">Unknown node type: {node.nodeType}</div>;
  }

  return <Edit {...props} />;
}
