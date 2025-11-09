import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useStatelyUi } from '@/context';
import { FieldEdit } from '../field-edit';
import type { EditFieldProps } from '../types';

export type RecursiveRefEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['RecursiveRefNode']
>;

export function RecursiveRefEdit<Config extends StatelyConfig = StatelyConfig>(
  props: RecursiveRefEditProps<Config>,
) {
  const { integration } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema = integration.nodes[props.node.refName];
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {props.node.refName}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldEdit {...props} node={referencedSchema} />;
}
