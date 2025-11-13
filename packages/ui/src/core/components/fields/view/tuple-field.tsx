import type { CoreSchemas, CoreTupleNode } from "@/core";
import { useId } from "react";
import { FieldItem } from "@/core/components/base/field";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";

export type TupleViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreTupleNode<Schema>, unknown[]>;

export function TupleView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: TupleViewProps<Schema>) {
  const formId = useId();
  const keyPrefix = `${node.nodeType}-tuple-${formId}`;
  const arrValue = Array.isArray(value)
    ? value
    : typeof value === "object"
      ? Object.entries(value)
      : [value];

  return (
    <FieldItem>
      <div className="space-y-2 pl-4 border-l-2 border-muted">
        {node.items.map(
          (itemSchema: (typeof node.items)[number], index: number) => (
            <FieldView
              key={`${keyPrefix}-tuple-${
                // biome-ignore lint/suspicious/noArrayIndexKey: Tuples are stable
                index
              }`}
              node={itemSchema}
              value={arrValue[index]}
            />
          ),
        )}
      </div>
    </FieldItem>
  );
}
