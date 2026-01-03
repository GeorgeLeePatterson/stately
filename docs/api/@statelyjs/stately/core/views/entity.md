# core/views/entity

Entity view components for displaying and editing schema-driven entities.

This module provides React components for rendering entity data in various
modes: detail views for read-only display, edit views for form-based editing,
and wizard views for step-by-step entity creation.

## Example

```tsx
import { EntityDetailView, EntityEditView, EditMode } from '@statelyjs/stately/core/views/entity';

// Display entity details (read-only)
<EntityDetailView entityType="User" entityId={userId} />

// Edit an entity with a form
<EntityEditView
  entityType="User"
  entityId={userId}
  mode={EditMode.Form}
/>
```

## Enumerations

### EditMode

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L11)

#### Enumeration Members

##### FORM

> **FORM**: `"Form"`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L12)

##### JSON

> **JSON**: `"JSON"`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L13)

##### WIZARD

> **WIZARD**: `"Wizard"`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L14)

## Interfaces

### EntityDetailViewProps

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:9](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L9)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### disableJsonView?

> `optional` **disableJsonView**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L13)

##### entity

> **entity**: `CoreEntityData`\<`Schema`\>

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L11)

##### entityId?

> `optional` **entityId**: `string`

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L12)

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L10)

***

### EntityEditViewProps

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L17)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### defaultMode?

> `optional` **defaultMode**: [`EditMode`](#editmode)

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L20)

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:25](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L25)

##### isRootEntity?

> `optional` **isRootEntity**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L23)

##### isSingleton?

> `optional` **isSingleton**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L24)

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L18)

##### onChange()

> **onChange**: (`data`) => `void`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L21)

###### Parameters

###### data

[`AnyRecord`](../../schema.md#anyrecord)

###### Returns

`void`

##### onSave()?

> `optional` **onSave**: () => `void`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L22)

###### Returns

`void`

##### value

> **value**: `any`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L19)

***

### EntityFormEditProps

Defined in: [packages/stately/src/core/views/entity/entity-form-edit.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-form-edit.tsx#L12)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-form-edit.tsx:15](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-form-edit.tsx#L15)

##### isRootEntity?

> `optional` **isRootEntity**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-form-edit.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-form-edit.tsx#L14)

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/entity/entity-form-edit.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-form-edit.tsx#L13)

###### Parameters

###### value

`CoreEntityData`\<`Schema`\>

###### Returns

`void`

***

### EntityFormProps

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L11)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### entity?

> `optional` **entity**: `CoreEntityData`\<`Schema`\>

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L13)

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L12)

***

### EntityPropertyProps

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L16)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### fieldName

> **fieldName**: `ReactNode`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L17)

##### isRequired?

> `optional` **isRequired**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L19)

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"AnyNode"`\]

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L18)

***

### EntitySelectEditProps

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L20)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### after?

> `optional` **after**: `ReactNode`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:36](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L36)

Render the mode toggle

##### available

> **available**: `Schema`\[`"config"`\]\[`"components"`\]\[`"schemas"`\]\[`"Summary"`\][]

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:28](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L28)

List of entity refs

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L24)

Show loading indicator

##### isReadOnly?

> `optional` **isReadOnly**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L22)

Whether the form is readonly

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L30)

Schema for the inline entity

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L34)

Called when save is clicked with new ref value

###### Parameters

###### value

`string` | `null`

###### Returns

`void`

##### onEdit()?

> `optional` **onEdit**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:38](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L38)

Callback to edit as inline

###### Parameters

###### value

`string`

###### Returns

`void`

##### onRefresh()

> **onRefresh**: () => `void`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:40](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L40)

Refresh the entity list

###### Returns

`void`

##### targetType

> **targetType**: `StateEntry`\<`Schema`\[`"config"`\]\>

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L26)

The entity type being referenced

##### value

> **value**: `string` \| `null`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:32](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L32)

Current value from parent (either ref or inline)

***

### EntityWizardEditProps

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:6](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L6)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Properties

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L11)

##### isRootEntity?

> `optional` **isRootEntity**: `boolean`

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L12)

##### node

> **node**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L7)

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:9](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L9)

###### Parameters

###### value

`CoreEntityData`\<`Schema`\>

###### Returns

`void`

##### onComplete()?

> `optional` **onComplete**: () => `void`

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L10)

###### Returns

`void`

##### value?

> `optional` **value**: `CoreEntityData`\<`Schema`\>

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:8](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L8)

## Functions

### EntityDetailView()

> **EntityDetailView**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-detail-view.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-detail-view.tsx#L16)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityDetailViewProps`](#entitydetailviewprops)\<`Schema`\>

#### Returns

`Element`

***

### EntityEditView()

> **EntityEditView**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-edit-view.tsx:32](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-edit-view.tsx#L32)

EntityEditView - coordinator component that maps entity schema to field components
Does not maintain its own state - just passes through to child field components

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityEditViewProps`](#entityeditviewprops)\<`Schema`\>

#### Returns

`Element`

***

### EntityFormEdit()

> **EntityFormEdit**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-form-edit.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-form-edit.tsx#L18)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityFormEditProps`](#entityformeditprops)\<`Schema`\> & [`EntityFormProps`](#entityformprops)\<`Schema`\>

#### Returns

`Element`

***

### EntityJsonView()

> **EntityJsonView**(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L79)

#### Parameters

##### \_\_namedParameters

[`JsonViewProps`](../../form.md#jsonviewprops) & `HTMLAttributes`\<`HTMLDivElement`\>

#### Returns

`Element`

***

### EntityProperty()

> **EntityProperty**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:46](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L46)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityPropertyProps`](#entitypropertyprops)\<`Schema`\> & `object` & `HTMLAttributes`\<`HTMLDivElement`\>

#### Returns

`Element`

***

### EntityPropertyLabel()

> **EntityPropertyLabel**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L22)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityPropertyProps`](#entitypropertyprops)\<`Schema`\>

#### Returns

`Element`

***

### EntityRemove()

> **EntityRemove**(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-remove.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-remove.tsx#L3)

#### Parameters

##### \_\_namedParameters

###### entityName?

`string`

###### isOpen?

`boolean`

###### onConfirm

() => `void`

###### setIsOpen

(`o`) => `void`

###### typeName

`string`

#### Returns

`Element`

***

### EntitySelectEdit()

> **EntitySelectEdit**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-select-edit.tsx:43](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-select-edit.tsx#L43)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntitySelectEditProps`](#entityselecteditprops)\<`Schema`\>

#### Returns

`Element`

***

### EntityWizardEdit()

> **EntityWizardEdit**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/views/entity/entity-wizard-view.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-wizard-view.tsx#L19)

EntityWizardView - Step-by-step wizard for creating/editing entities
Walks through each top-level field one at a time

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityWizardEditProps`](#entitywizardeditprops)\<`Schema`\>

#### Returns

`Element`

***

### useEntityProperties()

> **useEntityProperties**\<`Schema`\>(`__namedParameters`): `object`

Defined in: [packages/stately/src/core/views/entity/entity-properties.tsx:93](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/views/entity/entity-properties.tsx#L93)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../../schema.md#schemas) = [`Schemas`](../../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`EntityFormProps`](#entityformprops)\<`Schema`\>

#### Returns

`object`

##### name

> **name**: \{ `node`: `PrimitiveNode`; `value`: `string` \| `undefined`; \} \| `undefined`

##### required

> **required**: `Set`\<`string`\>

##### sortedProperties

> **sortedProperties**: \[`string`, `CoreNodes`\<[`UnknownNode`](../../../schema/nodes.md#unknownnode)\>\][]
