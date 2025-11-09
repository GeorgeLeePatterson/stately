import { NodeType, type StatelyConfig } from '@stately/schema';
import type { AnyRecord, EmptyRecord } from '@stately/schema/helpers';
import { Braces, Brackets, Cog, SendToBack, Shapes, TextCursorInput } from 'lucide-react';
import { getComponentByPath } from '@/registry';
import type { StatelyRuntime } from '@/runtime';

export function getNodeTypeIcon<
  Config extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  SExt extends AnyRecord = EmptyRecord,
>(nodeType: NodeType, integration?: StatelyRuntime<Config, IExt, SExt>) {
  const { componentRegistry } = integration || {};

  // Look up an icon component for this nodeType
  const iconExt = componentRegistry
    ? getComponentByPath(componentRegistry, nodeType, ['icon'])
    : undefined;

  // If the registry provided a React component for the icon, return it directly.
  // The registry returns a ComponentType, not a callable factory, so don't invoke it.
  if (iconExt) {
    return iconExt as unknown as React.ComponentType<any>;
  }

  switch (nodeType) {
    case NodeType.Object:
      return Braces;
    case NodeType.Tuple:
    case NodeType.Array:
      return Brackets;
    case NodeType.Primitive:
      return TextCursorInput;
    case NodeType.Map:
      return SendToBack;
    case NodeType.Enum:
    case NodeType.TaggedUnion:
    case NodeType.UntaggedEnum:
      return Shapes;
    case NodeType.Link:
      return Cog;
    default:
      return Cog;
  }
}
