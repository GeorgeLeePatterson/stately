# core/fields

Field rendering components organized by mode (view/edit).

This module provides the field renderer registries that map schema node types
to their corresponding React components. `ViewFields` contains read-only
renderers, while `EditFields` contains form input renderers.

These are used internally by the form system but can be accessed directly
for custom field rendering or to extend with additional node type handlers.

## Example

```tsx
import { EditFields, ViewFields } from '@statelyjs/stately/core/fields';

// Access the array field editor component
const ArrayEditor = EditFields.ArrayField;

// Access the object field viewer component
const ObjectViewer = ViewFields.ObjectField;
```

## Variables

### EditFields

> `const` **EditFields**: `object`

Defined in: [packages/stately/src/core/fields/edit/index.ts:26](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/fields/edit/index.ts#L26)

#### Type Declaration

##### ArrayEdit()

> **ArrayEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Array field component - handles Vec<T> in Rust
Uses explicit save pattern with dirty tracking

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`ArrayEditProps`\<`Schema`\>

###### Returns

`Element`

##### EnumEdit()

> **EnumEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Enum field component - handles string enums with fixed set of values
Calls onChange immediately (primitive-like behavior)

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`EnumEditProps`\<`Schema`\>

###### Returns

`Element`

##### MapEdit()

> **MapEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Map/Dictionary field component - handles HashMap<String, T> in Rust
Uses explicit save pattern with dirty tracking

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`MapEditProps`\<`Schema`\>

###### Returns

`Element`

##### NullableEdit()

> **NullableEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Nullable field component - handles Option<T> in Rust
Checkbox controls visibility; toggling OFF clears the value
Toggling ON initializes with default if currently null

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`NullableEditProps`\<`Schema`\>

###### Returns

`Element`

##### ObjectEdit()

> **ObjectEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Object field component - handles nested object structures
Uses explicit save pattern with dirty tracking

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`ObjectEditProps`\<`Schema`\>

###### Returns

`Element`

##### PrimitiveEdit()

> **PrimitiveEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Primitive field component - handles basic types: string, number, integer, boolean

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`PrimitiveEditProps`\<`Schema`\>

###### Returns

`Element`

##### RecursiveRefEdit()

> **RecursiveRefEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`RecursiveRefEditProps`\<`Schema`\>

###### Returns

`Element`

##### TaggedUnionEdit()

> **TaggedUnionEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Tagged union field component - handles Rust enums with explicit discriminator
Example: #[serde(tag = "type")] produces { type: "foo", ...fields }

Data structure:
- discriminator field (e.g., "type") contains the variant tag
- Additional fields are the variant's data
- Example: { type: "database", host: "localhost", port: 5432 }

Uses inline onChange pattern - the discriminant and value are resolved
through inner field saves, so no additional save button is needed here

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`TaggedUnionEditProps`\<`Schema`\>

###### Returns

`Element`

##### TupleEdit()

> **TupleEdit**: \<`Schema`\>(`__namedParameters`) => `Element` \| `null`

Tuple field component - handles fixed-length heterogeneous arrays
Uses explicit save pattern with dirty tracking

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`TupleEditProps`\<`Schema`\>

###### Returns

`Element` \| `null`

##### UnionEdit()

> **UnionEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Union field component - handles generic oneOf/anyOf unions

Used when the parser couldn't identify a specific tagged/untagged pattern.
User selects which variant shape to use, then fills in that schema.
The value is the raw data for the selected variant - no tag wrapping.

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`UnionEditProps`\<`Schema`\>

###### Returns

`Element`

##### UntaggedEnumEdit()

> **UntaggedEnumEdit**: \<`Schema`\>(`__namedParameters`) => `Element`

Untagged Enum field component - handles Rust untagged enums
Example: { database: {...} } | { shell: {...} }
The tag is inferred from the single property key in the object
Uses explicit save pattern with dirty tracking

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`UntaggedEnumEditProps`\<`Schema`\>

###### Returns

`Element`

***

### ViewFields

> `const` **ViewFields**: `object`

Defined in: [packages/stately/src/core/fields/view/index.ts:23](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/fields/view/index.ts#L23)

#### Type Declaration

##### ArrayView()

> **ArrayView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`ArrayViewProps`\<`Schema`\>

###### Returns

`Element`

##### MapView()

> **MapView**: \<`Schema`\>(`__namedParameters`) => `Element` \| `null`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`MapViewProps`\<`Schema`\>

###### Returns

`Element` \| `null`

##### NullableView()

> **NullableView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`NullableViewProps`\<`Schema`\>

###### Returns

`Element`

##### ObjectView()

> **ObjectView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`ObjectViewProps`\<`Schema`\>

###### Returns

`Element`

##### PrimitiveView()

> **PrimitiveView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`PrimitiveViewProps`\<`Schema`\>

###### Returns

`Element`

##### RecursiveRefView()

> **RecursiveRefView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`RecursiveRefViewProps`\<`Schema`\>

###### Returns

`Element`

##### TaggedUnionView()

> **TaggedUnionView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`TaggedUnionViewProps`\<`Schema`\>

###### Returns

`Element`

##### TupleView()

> **TupleView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`TupleViewProps`\<`Schema`\>

###### Returns

`Element`

##### UnionView()

> **UnionView**: \<`Schema`\>(`__namedParameters`) => `Element`

Union view component - displays a generic oneOf/anyOf value

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`UnionViewProps`\<`Schema`\>

###### Returns

`Element`

##### UntaggedEnumView()

> **UntaggedEnumView**: \<`Schema`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### \_\_namedParameters

`UntaggedEnumViewProps`\<`Schema`\>

###### Returns

`Element`
