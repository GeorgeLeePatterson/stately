import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { NotSet } from '@/components/base/not-set';
import type { ViewFieldProps } from '../types';

export type PrimitiveViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['PrimitiveNode']
>;

export function PrimitiveView<Config extends StatelyConfig = StatelyConfig>({
  value,
}: PrimitiveViewProps<Config>) {
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
