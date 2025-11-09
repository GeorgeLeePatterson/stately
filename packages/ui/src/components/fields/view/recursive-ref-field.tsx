import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useStatelyUi } from '@/context';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type RecursiveRefViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['RecursiveRefNode']
>;

export function RecursiveRefView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: RecursiveRefViewProps<Config>) {
  const { integration } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema = integration.nodes[node.refName];
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {node.refName}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldView node={referencedSchema} value={value} />;
}
