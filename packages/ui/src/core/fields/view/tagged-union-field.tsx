import type { AnyRecord } from '@stately/schema/helpers';
import { FieldItem } from '@/base/components/field';
import type { FieldViewProps } from '@/base/form/field-view';
import type { Schemas } from '@/core/schema';
import { EnumFieldView } from './untagged-enum-field';

export type TaggedUnionViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['taggedUnion']
>;

export function TaggedUnionView<Schema extends Schemas = Schemas>({
  value,
  node,
}: TaggedUnionViewProps<Schema>) {
  const unionValue = value as AnyRecord;
  const discriminatorValue = unionValue[node.discriminator];

  // Find the variant by discriminator value
  const activeVariant = node.variants.find(
    (variant: (typeof node.variants)[number]) => variant.tag === discriminatorValue,
  );

  if (!activeVariant) {
    return (
      <FieldItem>
        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </FieldItem>
    );
  }

  return <EnumFieldView node={activeVariant.schema} tag={activeVariant.tag} value={unionValue} />;
}
