# ui

Stately's UI module simply re-exports common components from @statelyjs/ui.

If building a project that requires more customization, these re-exports may not be sufficient,
and in that case, @statelyjs/ui should be installed and imported directly.

## Interfaces

### ClickTrack

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:3

#### Properties

##### count

> **count**: `number`

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:6

##### label

> **label**: `string`

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:5

##### path

> **path**: `string`

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:4

***

### ConfirmDialogProps

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:9

#### Properties

##### actionLabel

> **actionLabel**: `string`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:10

##### description?

> `optional` **description**: `string`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:11

##### mode?

> `optional` **mode**: `"destructive"` \| `"success"` \| `"warning"`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:12

##### onConfirm()

> **onConfirm**: () => `void`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:13

###### Returns

`void`

##### open?

> `optional` **open**: `boolean`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:14

##### setOpen()

> **setOpen**: (`open`) => `void`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:15

###### Parameters

###### open

`boolean`

###### Returns

`void`

## Type Aliases

### Theme

> **Theme** = `"dark"` \| `"light"` \| `"system"`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:9

***

### ThemeProviderProps

> **ThemeProviderProps** = `object`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:10

#### Properties

##### children

> **children**: `React.ReactNode`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:11

##### defaultTheme?

> `optional` **defaultTheme**: [`Theme`](#theme)

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:12

##### storageKey?

> `optional` **storageKey**: `string`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:13

## Variables

### STORAGE\_KEY

> `const` **STORAGE\_KEY**: `"stately-click-tracking"` = `"stately-click-tracking"`

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:2

***

### useTheme()

> `const` **useTheme**: () => `ThemeProviderState`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:23

#### Returns

`ThemeProviderState`

## Functions

### ConfirmDialog()

> **ConfirmDialog**(`__namedParameters`): `Element`

Defined in: packages/ui/dist/dialogs/confirm-dialog.d.mts:17

#### Parameters

##### \_\_namedParameters

[`ConfirmDialogProps`](#confirmdialogprops)

#### Returns

`Element`

***

### ThemeProvider()

> **ThemeProvider**(`__namedParameters`): `Element`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:17

#### Parameters

##### \_\_namedParameters

[`ThemeProviderProps`](#themeproviderprops)

#### Returns

`Element`

***

### ThemeToggle()

> **ThemeToggle**(`props`): `Element`

Defined in: packages/ui/dist/theme-DeQScs6i.d.mts:24

#### Parameters

##### props

`ButtonProps`

#### Returns

`Element`

***

### useClickTracking()

> **useClickTracking**(): `object`

Defined in: packages/ui/dist/hooks/use-click-tracking.d.mts:8

#### Returns

`object`

##### topClicks

> **topClicks**: [`ClickTrack`](#clicktrack)[]

##### trackClick()

> **trackClick**: (`path`, `label`) => `void`

###### Parameters

###### path

`string`

###### label

`string`

###### Returns

`void`

***

### useMediaQuery()

> **useMediaQuery**(`query`): `boolean`

Defined in: packages/ui/dist/hooks/use-media-query.d.mts:2

#### Parameters

##### query

`string`

#### Returns

`boolean`

***

### useViewMore()

> **useViewMore**(`data`, `limit`): readonly \[\[`string`, `unknown`\][], \[`string`, `unknown`\][], `boolean`, `Dispatch`\<`SetStateAction`\<`boolean`\>\>\]

Defined in: packages/ui/dist/hooks/use-view-more.d.mts:4

#### Parameters

##### data

`any`

##### limit

`number`

#### Returns

readonly \[\[`string`, `unknown`\][], \[`string`, `unknown`\][], `boolean`, `Dispatch`\<`SetStateAction`\<`boolean`\>\>\]
