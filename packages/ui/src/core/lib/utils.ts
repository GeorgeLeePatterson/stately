

export function generateFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Default value generation
 */

export function getDefaultValue<Config extends CoreStatelyConfig>(
  node: AnySchemaNode<Config>,
): any {
  switch (node.nodeType) {
    case CoreNodeType.Primitive:
      switch ((node as any).primitiveType) {
        case 'string':
          return '';
        case 'number':
        case 'integer':
          return 0;
        case 'boolean':
          return false;
      }
      break;

    case CoreNodeType.Enum:
      return (node as any).values[0] || '';

    case CoreNodeType.Array:
      return [];

    case CoreNodeType.Map:
      return {};

    case CoreNodeType.Tuple:
      return (node as any).items.map(getDefaultValue);

    case CoreNodeType.Object: {
      const obj: any = {};
      const requiredFields = new Set((node as any).required || []);
      for (const [name, propNode] of Object.entries((node as any).properties)) {
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode as AnySchemaNode<Config>);
        }
      }
      return obj;
    }

    case CoreNodeType.Link:
      return '';

    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return null;

    case CoreNodeType.Nullable:
      return null;
  }

  return null;
}
