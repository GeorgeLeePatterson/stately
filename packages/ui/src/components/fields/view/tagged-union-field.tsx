import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { FieldItem } from '@/components/base/array';
import type { ViewFieldProps } from '../types';
import { EnumFieldView } from './untagged-enum-field';

export type TaggedUnionViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['TaggedUnionNode']
>;

export function TaggedUnionView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: TaggedUnionViewProps<Config>) {
  const unionValue = value as AnyRecord;
  const discriminatorValue = unionValue[node.discriminator];

  // Find the variant by discriminator value
  const activeVariant = node.variants.find(variant => variant.tag === discriminatorValue);

  if (!activeVariant) {
    return (
      <FieldItem>
        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </FieldItem>
    );
  }

  return <EnumFieldView tag={activeVariant.tag} node={activeVariant.schema} value={unionValue} />;
}
