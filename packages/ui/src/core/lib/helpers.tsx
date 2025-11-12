import type { ComponentType } from "react";
import type { StatelyConfig } from "@stately/schema";
import { CoreNodeType } from "@stately/schema/core/nodes";
import type { AnyRecord, EmptyRecord } from "@/core/types";
import {
  Braces,
  Brackets,
  Cog,
  SendToBack,
  Shapes,
  TextCursorInput,
} from "lucide-react";
import { getComponentByPath } from "@/registry";
import type { StatelyRuntime } from "@/runtime";

export function getNodeTypeIcon<
  Config extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  SExt extends AnyRecord = EmptyRecord,
>(nodeType: string, integration?: StatelyRuntime<Config, IExt, SExt>) {
  const components = integration?.registry?.components;

  // Look up an icon component for this nodeType
  const iconExt = components
    ? getComponentByPath(components, nodeType, ["icon"])
    : undefined;

  // If the registry provided a React component for the icon, return it directly.
  // The registry returns a ComponentType, not a callable factory, so don't invoke it.
  if (iconExt) {
    return iconExt as unknown as ComponentType<any>;
  }

  switch (nodeType) {
    case CoreNodeType.Object:
      return Braces;
    case CoreNodeType.Tuple:
    case CoreNodeType.Array:
      return Brackets;
    case CoreNodeType.Primitive:
      return TextCursorInput;
    case CoreNodeType.Map:
      return SendToBack;
    case CoreNodeType.Enum:
    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return Shapes;
    case CoreNodeType.Link:
      return Cog;
    default:
      return Cog;
  }
}
