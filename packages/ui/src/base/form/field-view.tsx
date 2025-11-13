/**
 * Field value renderer for entity detail view
 * Schema-driven rendering of field values in read-only mode
 * Uses flat component registry lookup: 'nodeType::view'
 */

import { useStatelyUi } from "@/context";
import { getViewComponent } from "@/registry";
import type { AnyBaseSchemas, BaseSchemas } from "..";

export interface ViewFieldProps<
  S extends AnyBaseSchemas = BaseSchemas,
  N extends S['plugin']["AnyNode"] = S['plugin']["AnyNode"],
  V = unknown,
> {
  node: N;
  value: V;
}

export function FieldView<S extends AnyBaseSchemas = BaseSchemas>(
  props: ViewFieldProps<S>,
) {
  const { node, value } = props;
  const { registry } = useStatelyUi();

  if (value === null || value === undefined) return null;

  const View = getViewComponent<S>(registry.components, node.nodeType);

  if (!View) return null;

  return <View {...props} />;
}
