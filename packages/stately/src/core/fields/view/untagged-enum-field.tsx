import { FieldItem, SimpleLabel } from '@statelyjs/ui/components';
import type { FieldViewProps } from '@statelyjs/ui/form';
import { BaseForm } from '@statelyjs/ui/form';
import type { CoreNodeUnion } from '@/core';
import type { Schemas } from '@/core/schema';

export type UntaggedEnumViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['untaggedEnum']
>;

export function UntaggedEnumView<Schema extends Schemas = Schemas>({
  value,
  node,
}: UntaggedEnumViewProps<Schema>) {
  const unionValue = value as Record<string, unknown>;

  // Find the active variant by looking for which tag key exists in the value
  const activeVariant = node.variants.find(
    (variant: (typeof node.variants)[number]) => variant.tag in unionValue,
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

  // Extract the inner value for this variant
  const innerValue = unionValue[activeVariant.tag];

  return <EnumFieldView node={activeVariant.schema} tag={activeVariant.tag} value={innerValue} />;
}

export function EnumFieldView<Schema extends Schemas = Schemas>({
  tag,
  node,
  value,
}: {
  tag: string;
  node: CoreNodeUnion<Schema> | null;
  value: unknown;
}) {
  return (
    <div className="min-w-0 flex flex-col px-3 gap-3">
      <div className="text-base font-semibold flex gap-2 items-baseline">
        <SimpleLabel>Selected:</SimpleLabel>
        <span className="uppercase">{tag}</span>
      </div>
      {node && (
        <div className="flex flex-col gap-2">
          <SimpleLabel>Configuration:</SimpleLabel>
          <BaseForm.FieldView node={node} value={value} />
        </div>
      )}
    </div>
  );
}
