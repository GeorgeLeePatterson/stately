# core/views/link

Link view components for displaying and editing entity references.

This module provides React components for rendering links between entities.
Links represent relationships in your schema (e.g., foreign keys, references)
and can be displayed inline, as expandable details, or as editable selectors.

## Example

```tsx
import { LinkRefView, LinkRefEdit } from '@statelyjs/stately/core/views/link';

// Display a link reference (read-only)
<LinkRefView link={entity.authorRef} />

// Edit a link reference with a selector
<LinkRefEdit
  link={entity.authorRef}
  onChange={handleLinkChange}
/>
```

## Interfaces

### LinkInlineEditProps

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L10)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### after?

> `optional` **after**: `ReactNode`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L20)

Render the mode toggle

##### isWizard?

> `optional` **isWizard**: `boolean`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L22)

Whether the form is being used in a wizard

##### node

> **node**: `ObjectNode`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L14)

Schema for the inline entity

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L18)

Called when save is clicked with new inline value

###### Parameters

###### value

[`LinkFor`](#linkfor)\<`Schema`\>

###### Returns

`void`

##### targetType

> **targetType**: `StateEntry`\<`Schema`\[`"config"`\]\>

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L12)

The entity type being configured inline

##### value?

> `optional` **value**: [`LinkFor`](#linkfor)\<`Schema`\> \| `null`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L16)

Current value from parent (either ref or inline)

***

### LinkInlineViewProps

Defined in: [packages/stately/src/core/views/link/link-inline-view.tsx:6](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-view.tsx#L6)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### node

> **node**: `ObjectNode`

Defined in: [packages/stately/src/core/views/link/link-inline-view.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-view.tsx#L7)

##### value

> **value**: `CoreEntityData`\<`Schema`\>

Defined in: [packages/stately/src/core/views/link/link-inline-view.tsx:8](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-view.tsx#L8)

***

### LinkRefEditProps

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:8](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L8)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### after?

> `optional` **after**: `ReactNode`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L26)

Render the mode toggle

##### availableEntities

> **availableEntities**: `Schema`\[`"config"`\]\[`"components"`\]\[`"schemas"`\]\[`"Summary"`\][]

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L16)

List of entity refs

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L12)

Show loading indicator

##### isReadOnly?

> `optional` **isReadOnly**: `boolean`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L10)

Whether the form is readonly

##### node

> **node**: `ObjectNode`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L18)

Schema for the inline entity

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L22)

Called when save is clicked with new ref value

###### Parameters

###### value

[`LinkFor`](#linkfor)\<`Schema`\>

###### Returns

`void`

##### onEditAsInline()?

> `optional` **onEditAsInline**: (`ref`) => `void`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:28](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L28)

Callback to edit as inline

###### Parameters

###### ref

`string`

###### Returns

`void`

##### onRefresh()

> **onRefresh**: () => `void`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L24)

Called when refresh is clicked

###### Returns

`void`

##### targetType

> **targetType**: `StateEntry`\<`Schema`\[`"config"`\]\>

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L14)

The entity type being referenced (e.g., "source_driver", "input")

##### value?

> `optional` **value**: [`LinkFor`](#linkfor)\<`Schema`\> \| `null`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L20)

Current value from parent (either ref or inline)

***

### LinkRefViewProps

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L17)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### entityUrlPath

> **entityUrlPath**: `string`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L20)

##### isRequired?

> `optional` **isRequired**: `boolean`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L23)

##### label?

> `optional` **label**: `ReactNode`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L18)

##### name?

> `optional` **name**: `string`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L19)

##### schema?

> `optional` **schema**: `ObjectNode`\<`never`\>

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L22)

##### value

> **value**: `object`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L21)

###### entity\_type

> **entity\_type**: `CoreStateEntry`\<`Schema`\>

###### ref

> **ref**: `string`

## Type Aliases

### LinkDetailViewProps

> **LinkDetailViewProps**\<`Schema`\> = [`FieldViewProps`](../../../ui/registry.md#fieldviewprops)\<`Schema`, `LinkNode`, [`LinkFor`](#linkfor)\<`Schema`\>\>

Defined in: [packages/stately/src/core/views/link/link-detail-view.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-detail-view.tsx#L12)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

***

### LinkEditViewProps

> **LinkEditViewProps**\<`Schema`\> = [`FieldEditProps`](../../../ui/registry.md#fieldeditprops)\<`Schema`, `LinkNode`, [`LinkFor`](#linkfor)\<`Schema`\> \| `null` \| `undefined`\>

Defined in: [packages/stately/src/core/views/link/link-edit-view.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-edit-view.tsx#L20)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

***

### LinkFor

> **LinkFor**\<`Schema`\> = \{ `entity_type`: `CoreStateEntry`\<`Schema`\>; `ref`: `string`; \} \| \{ `entity_type`: `CoreStateEntry`\<`Schema`\>; `inline`: `CoreEntityData`\<`Schema`\>; \}

Defined in: [packages/stately/src/core/views/link/link-edit-view.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-edit-view.tsx#L16)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

## Functions

### LinkDetailView()

> **LinkDetailView**\<`Schema`\>(`__namedParameters`): `Element` \| `null`

Defined in: [packages/stately/src/core/views/link/link-detail-view.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-detail-view.tsx#L18)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkDetailViewProps`](#linkdetailviewprops)\<`Schema`\>

#### Returns

`Element` \| `null`

***

### LinkEditView()

> **LinkEditView**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/link/link-edit-view.tsx:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-edit-view.tsx#L30)

Component for editing Link<T> fields
Orchestrates mode toggling and delegates save/cancel to child components

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkEditViewProps`](#linkeditviewprops)\<`Schema`\>

#### Returns

`Element`

***

### LinkInlineEdit()

> **LinkInlineEdit**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/link/link-inline-edit.tsx:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-edit.tsx#L34)

Component for editing Link<T> in inline mode

Responsibilities:
- Manage its own formData and isDirty state
- Display nested entity form
- Handle save/cancel with proper validation
- Delegate to EntityEditView for actual field rendering

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkInlineEditProps`](#linkinlineeditprops)\<`Schema`\>

#### Returns

`Element`

***

### LinkInlineView()

> **LinkInlineView**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/link/link-inline-view.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-inline-view.tsx#L11)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkInlineViewProps`](#linkinlineviewprops)\<`Schema`\>

#### Returns

`Element`

***

### LinkRefEdit()

> **LinkRefEdit**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/link/link-ref-edit.tsx:40](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-edit.tsx#L40)

Component for editing Link<T> in reference mode

Responsibilities:
- Manage its own formData and isDirty state
- Fetch available entities for the target type
- Display dropdown selector
- Handle save/cancel with proper validation

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkRefEditProps`](#linkrefeditprops)\<`Schema`\>

#### Returns

`Element`

***

### LinkRefView()

> **LinkRefView**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/link/link-ref-view.tsx:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/link/link-ref-view.tsx#L26)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`LinkRefViewProps`](#linkrefviewprops)\<`Schema`\>

#### Returns

`Element`
