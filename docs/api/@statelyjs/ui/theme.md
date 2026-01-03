# theme

## Type Aliases

### Theme

> **Theme** = `"dark"` \| `"light"` \| `"system"`

Defined in: [packages/ui/src/theme.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L12)

***

### ThemeProviderProps

> **ThemeProviderProps** = `object`

Defined in: [packages/ui/src/theme.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L14)

#### Properties

##### children

> **children**: `React.ReactNode`

Defined in: [packages/ui/src/theme.tsx:15](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L15)

##### defaultTheme?

> `optional` **defaultTheme**: [`Theme`](#theme)

Defined in: [packages/ui/src/theme.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L16)

##### storageKey?

> `optional` **storageKey**: `string`

Defined in: [packages/ui/src/theme.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L17)

## Variables

### defaultStorageKey

> `const` **defaultStorageKey**: `"stately-ui-theme"` = `'stately-ui-theme'`

Defined in: [packages/ui/src/theme.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L21)

***

### defaultThemeOption

> `const` **defaultThemeOption**: [`Theme`](#theme) = `'system'`

Defined in: [packages/ui/src/theme.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L20)

## Functions

### ThemeProvider()

> **ThemeProvider**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/theme.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L23)

#### Parameters

##### \_\_namedParameters

[`ThemeProviderProps`](#themeproviderprops)

#### Returns

`Element`

***

### ThemeToggle()

> **ThemeToggle**(`props`): `Element`

Defined in: [packages/ui/src/theme.tsx:73](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L73)

#### Parameters

##### props

`ButtonProps`

#### Returns

`Element`

***

### useTheme()

> **useTheme**(): `ThemeProviderState`

Defined in: [packages/ui/src/theme.tsx:65](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/theme.tsx#L65)

#### Returns

`ThemeProviderState`
