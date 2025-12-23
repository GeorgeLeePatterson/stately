import { NotSet } from '@statelyjs/ui/components';
import type { FieldViewProps } from '@statelyjs/ui/form';
import type { Schemas } from '@/core/schema';

export type PrimitiveViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['primitive']
>;

export function PrimitiveView<Schema extends Schemas = Schemas>({
  value,
}: PrimitiveViewProps<Schema>) {
  const displayValue = typeof value === 'boolean' ? value.toString() : `"${String(value)}"`;
  const extraClasses = displayValue.length > 256 ? 'overflow-y-auto overflow-x-hidden' : '';
  return (
    <div className={`flex flex-1 ${extraClasses}`}>
      {typeof value === 'boolean' || !!value ? (
        <span className="text-sm py-1 px-2 rounded flex-1 bg-muted">{displayValue}</span>
      ) : (
        <NotSet />
      )}
    </div>
  );
}
