# dialogs

## Interfaces

### ConfirmDialogProps

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L18)

#### Properties

##### actionLabel

> **actionLabel**: `string`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L19)

##### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L20)

##### mode?

> `optional` **mode**: `"destructive"` \| `"warning"` \| `"success"`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L21)

##### onConfirm()

> **onConfirm**: () => `void`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L22)

###### Returns

`void`

##### open?

> `optional` **open**: `boolean`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L23)

##### setOpen()

> **setOpen**: (`open`) => `void`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L24)

###### Parameters

###### open

`boolean`

###### Returns

`void`

## Variables

### modeClasses

> `const` **modeClasses**: `object`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L12)

#### Type Declaration

##### destructive

> **destructive**: `string` = `'bg-destructive text-destructive-foreground hover:bg-destructive/90'`

##### success

> **success**: `string` = `'bg-green-600 text-white hover:bg-green-600/90'`

##### warning

> **warning**: `string` = `'bg-orange-600 text-white hover:bg-orange-600/90'`

## Functions

### ConfirmDialog()

> **ConfirmDialog**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/dialogs/confirm-dialog.tsx:27](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/dialogs/confirm-dialog.tsx#L27)

#### Parameters

##### \_\_namedParameters

[`ConfirmDialogProps`](#confirmdialogprops)

#### Returns

`Element`
