import type { CorePrimitiveNode, CoreSchemas } from "@/core";
import { NotSet } from "@/core/components/base/not-set";
import type { ViewFieldProps } from "../types";

export type PrimitiveViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CorePrimitiveNode<Schema>>;

export function PrimitiveView<Schema extends CoreSchemas = CoreSchemas>({
  value,
}: PrimitiveViewProps<Schema>) {
  const displayValue =
    typeof value === "boolean" ? value.toString() : `"${String(value)}"`;
  const extraClasses =
    displayValue.length > 256 ? "overflow-y-auto overflow-x-hidden" : "";
  return (
    <div className={`flex flex-1 ${extraClasses}`}>
      {typeof value === "boolean" || !!value ? (
        <span className="text-sm py-1 px-2 rounded flex-1 bg-muted">
          {displayValue}
        </span>
      ) : (
        <NotSet />
      )}
    </div>
  );
}
