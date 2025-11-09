import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { DescriptionLabel } from '@/components/base/description';
import { NotSet } from '@/components/base/not-set';
import { SimpleLabel } from '@/components/base/simple-label';
import { useStatelyUi } from '@/context';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type ObjectViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['ObjectNode'],
  any
>;

export function ObjectView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: ObjectViewProps<Config>) {
  const { integration } = useStatelyUi();
  const required = new Set(node.required || []);
  const objValue = value as AnyRecord;

  return (
    <div className="flex-1 border-l-2 border-primary/30 rounded-xs pl-4 py-3 space-y-4">
      {Object.entries(node.properties).map(([propName, propSchema]) => {
        const propValue = objValue[propName];
        const valueDefined = propValue !== undefined && propValue !== null;
        const label = `${integration.helpers.generateFieldLabel(propName)}:`;
        const description = propSchema.description;
        const singleLine = !valueDefined || integration.helpers.isPrimitive(propSchema);
        const valueDisplay = valueDefined ? (
          <FieldView node={propSchema} value={propValue} />
        ) : (
          <NotSet />
        );
        const wrappingClass = singleLine ? 'items-center' : 'flex-col space-y-2';

        return (
          <div key={propName} className={`flex flex-1 gap-2 ${wrappingClass}`}>
            <div className="flex flex-col justify-between">
              {label && (
                <SimpleLabel>
                  {label}
                  {required.has(propName) && <span className="text-destructive ml-1">*</span>}
                </SimpleLabel>
              )}
              {description && !singleLine && <DescriptionLabel>{description}</DescriptionLabel>}
            </div>
            <div className="flex-1">{valueDisplay}</div>
          </div>
        );
      })}
    </div>
  );
}
