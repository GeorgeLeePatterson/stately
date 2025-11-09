import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { FieldItem } from '@/components/base/array';
import { SimpleLabel } from '@/components/base/simple-label';
import { FieldView } from '../field-view';
import type { ViewFieldProps } from '../types';

export type UntaggedEnumViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['UntaggedEnumNode']
>;

export function UntaggedEnumView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: UntaggedEnumViewProps<Config>) {
  const unionValue = value as Record<string, unknown>;

  // Find the active variant by looking for which tag key exists in the value
  const activeVariant = node.variants.find(variant => variant.tag in unionValue);

  if (!activeVariant) {
    return (
      <FieldItem>
        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </FieldItem>
    );
  }

  // Extract the inner value for this variant
  const innerValue = unionValue[activeVariant.tag];

  return <EnumFieldView tag={activeVariant.tag} node={activeVariant.schema} value={innerValue} />;
}

export function EnumFieldView<Config extends StatelyConfig = StatelyConfig>({
  tag,
  node,
  value,
}: {
  tag: string;
  node: StatelySchemas<Config>['AnySchemaNode'];
  value: unknown;
}) {
  return (
    <div className="min-w-0 flex flex-col px-3 gap-3">
      <div className="text-base font-semibold flex gap-2 items-baseline">
        <SimpleLabel>Selected:</SimpleLabel>
        <span className="uppercase">{tag}</span>
      </div>
      <div className="flex flex-col gap-2">
        <SimpleLabel>Configuration:</SimpleLabel>
        <FieldView node={node} value={value} />
      </div>
    </div>
  );
}
