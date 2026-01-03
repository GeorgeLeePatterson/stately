# core/dialogs

## Interfaces

### LinkEntityProps

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L21)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Properties

##### entityName

> **entityName**: `string`

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L22)

##### entityType

> **entityType**: `StateEntry`\<`Schema`\[`"config"`\]\>

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L23)

##### schema?

> `optional` **schema**: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L24)

***

### ViewLinkDialogProps

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:27](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L27)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Properties

##### breadcrumbs?

> `optional` **breadcrumbs**: [`LinkEntityProps`](#linkentityprops)\<`Schema`\>[]

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L30)

##### onNavigateToBreadcrumb()?

> `optional` **onNavigateToBreadcrumb**: (`index`) => `void`

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L31)

###### Parameters

###### index

`number`

###### Returns

`void`

##### onOpenChange()

> **onOpenChange**: (`open`) => `void`

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:29](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L29)

###### Parameters

###### open

`boolean`

###### Returns

`void`

##### open?

> `optional` **open**: `boolean`

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:28](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L28)

## Functions

### ViewLinkDialog()

> **ViewLinkDialog**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/dialogs/view-configure-dialog.tsx:38](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/dialogs/view-configure-dialog.tsx#L38)

Dialog to view a Link<T> reference (read-only)
Fetches the entity by name and type, then displays it inline

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

[`ViewLinkDialogProps`](#viewlinkdialogprops)\<`Schema`\> & [`LinkEntityProps`](#linkentityprops)\<`Schema`\>

#### Returns

`Element`
