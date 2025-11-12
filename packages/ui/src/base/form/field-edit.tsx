/**
 * Field Renderer - Router for rendering schema nodes in edit mode
 *
 * Uses flat component registry lookup: 'nodeType::edit'
 * All base components are pre-registered in statelyUi()
 */

import { useStatelyUi } from '@/context';
import { getEditComponent } from '@/registry';

export interface EditFieldProps<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
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
