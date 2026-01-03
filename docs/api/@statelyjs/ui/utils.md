# utils

Utility functions for StatelyUi.

This module provides helper functions for string manipulation, path handling,
and runtime utilities. These are used throughout the UI package and are
available via `runtime.utils`.

## Interfaces

### UiUtils

Defined in: [packages/ui/src/utils.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L24)

Collection of utility functions available on the runtime.

Access via `runtime.utils` in components. Plugins can extend these
utilities by providing their own implementations of `getNodeTypeIcon`
and `getDefaultValue`.

#### Properties

##### toKebabCase()

> **toKebabCase**: (`str`) => `string`

Defined in: [packages/ui/src/utils.tsx:35](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L35)

Convert underscores to hyphens

Convert underscores to hyphens.

###### Parameters

###### str

`string`

The string to convert

###### Returns

`string`

The string with underscores replaced by hyphens

###### Example

```typescript
toKebabCase('user_name'); // 'user-name'
```

##### toSpaceCase()

> **toSpaceCase**: (`str`) => `string`

Defined in: [packages/ui/src/utils.tsx:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L39)

Convert kebab/snake-case to space-separated words

Convert kebab-case or snake_case to space-separated words.

###### Parameters

###### str

`string`

The string to convert

###### Returns

`string`

Space-separated string

###### Example

```typescript
toSpaceCase('user-name'); // 'user name'
toSpaceCase('created_at'); // 'created at'
```

##### toTitleCase()

> **toTitleCase**: (`str`) => `string`

Defined in: [packages/ui/src/utils.tsx:37](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L37)

Convert kebab/snake-case to Title Case

Convert kebab-case or snake_case to Title Case.

###### Parameters

###### str

`string`

The string to convert

###### Returns

`string`

Title case string with spaces

###### Example

```typescript
toTitleCase('user-name'); // 'User Name'
toTitleCase('created_at'); // 'Created At'
```

#### Methods

##### camelCaseToKebabCase()

> **camelCaseToKebabCase**(`field`): `string`

Defined in: [packages/ui/src/utils.tsx:41](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L41)

Convert camelCase to kebab-case

###### Parameters

###### field

`string`

###### Returns

`string`

##### generateFieldLabel()

> **generateFieldLabel**(`field`): `string`

Defined in: [packages/ui/src/utils.tsx:27](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L27)

Generate a human-readable label from a field name

###### Parameters

###### field

`string`

###### Returns

`string`

##### getDefaultValue()

> **getDefaultValue**(`node`): `any`

Defined in: [packages/ui/src/utils.tsx:53](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L53)

Get the default value for a node type.
Delegates to plugins for type-specific defaults.

###### Parameters

###### node

[`BaseNode`](../schema/nodes.md#basenode)

###### Returns

`any`

##### getNodeTypeIcon()

> **getNodeTypeIcon**(`node`): `ComponentType`\<`any`\> \| `null`

Defined in: [packages/ui/src/utils.tsx:48](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L48)

Get an icon component for a node type.
Delegates to plugins; returns Dot icon if no plugin handles it.

###### Parameters

###### node

`string`

###### Returns

`ComponentType`\<`any`\> \| `null`

##### mergePathPrefixOptions()

> **mergePathPrefixOptions**(`base?`, `incoming?`): `string`

Defined in: [packages/ui/src/utils.tsx:33](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L33)

Merge base and incoming path prefixes into a single path

###### Parameters

###### base?

`string`

###### incoming?

`string`

###### Returns

`string`

##### stripLeading()

> **stripLeading**(`path`): `string`

Defined in: [packages/ui/src/utils.tsx:29](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L29)

Remove leading character (default: '/') from a path

###### Parameters

###### path

`string`

###### Returns

`string`

##### stripTrailing()

> **stripTrailing**(`path`): `string`

Defined in: [packages/ui/src/utils.tsx:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L31)

Remove trailing character (default: '/') from a path

###### Parameters

###### path

`string`

###### Returns

`string`

## Functions

### camelCaseToKebabCase()

> **camelCaseToKebabCase**(`field`): `string`

Defined in: [packages/ui/src/utils.tsx:180](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L180)

Convert camelCase or PascalCase to kebab-case.

Handles acronyms correctly (e.g., XMLParser → xml-parser).

#### Parameters

##### field

`string`

The string to convert

#### Returns

`string`

The kebab-case version

#### Example

```typescript
camelCaseToKebabCase('userId'); // 'user-id'
camelCaseToKebabCase('XMLParser'); // 'xml-parser'
camelCaseToKebabCase('getHTTPResponse'); // 'get-http-response'
```

***

### generateFieldFormId()

> **generateFieldFormId**(`fieldType`, `propertyName`, `formId`): `string`

Defined in: [packages/ui/src/utils.tsx:140](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L140)

Generate a unique form ID for field components.

Used internally by field-edit and field-view components for
React key generation and form element IDs.

#### Parameters

##### fieldType

`string`

The type of the field (e.g., 'string', 'number')

##### propertyName

`string`

The property name in the schema

##### formId

`string` = `''`

Optional parent form ID for namespacing

#### Returns

`string`

A unique identifier string

***

### generateFieldLabel()

> **generateFieldLabel**(`field`): `string`

Defined in: [packages/ui/src/utils.tsx:125](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L125)

Generate a human-readable label from a field name.

Converts camelCase or snake_case to space-separated words.

#### Parameters

##### field

`string`

The field name to convert

#### Returns

`string`

A human-readable label

#### Example

```typescript
generateFieldLabel('userName'); // 'user name'
generateFieldLabel('created_at'); // 'created at'
```

***

### mergePathPrefixOptions()

> **mergePathPrefixOptions**(`base?`, `incoming?`): `string`

Defined in: [packages/ui/src/utils.tsx:100](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L100)

Merge base and incoming path prefixes into a normalized path.

#### Parameters

##### base?

`string`

Base path prefix

##### incoming?

`string`

Additional path to append

#### Returns

`string`

Combined path with proper slash handling

#### Example

```typescript
mergePathPrefixOptions('/api', 'v1'); // '/api/v1'
mergePathPrefixOptions('/api/', '/v1/'); // '/api/v1'
```

***

### runtimeUtils()

> **runtimeUtils**\<`Schema`, `Augments`\>(`plugins`): [`UiUtils`](#uiutils)

Defined in: [packages/ui/src/utils.tsx:245](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L245)

**`Internal`**

Create the runtime utilities object with plugin delegation.

 Used by `createStatelyUi` to build the utils object.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](plugin.md#anyuiplugin)[]

#### Parameters

##### plugins

[`AllUiPlugins`](plugin.md#alluiplugins)\<`Schema`, `Augments`\>

#### Returns

[`UiUtils`](#uiutils)

***

### splitWords()

> **splitWords**(`input`): `string`[]

Defined in: [packages/ui/src/utils.tsx:151](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L151)

Split a string into words.

#### Parameters

##### input

`string`

The string to split

#### Returns

`string`[]

An array of words

***

### stripLeading()

> **stripLeading**(`path`, `char`): `string`

Defined in: [packages/ui/src/utils.tsx:69](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L69)

Remove a leading character from a string.

#### Parameters

##### path

`string`

The string to process

##### char

`string` = `'/'`

The character to remove (default: '/')

#### Returns

`string`

The string without the leading character

#### Example

```typescript
stripLeading('/api/users'); // 'api/users'
stripLeading('--flag', '-'); // '-flag'
```

***

### stripTrailing()

> **stripTrailing**(`path`, `char`): `string`

Defined in: [packages/ui/src/utils.tsx:84](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L84)

Remove a trailing character from a string.

#### Parameters

##### path

`string`

The string to process

##### char

`string` = `'/'`

The character to remove (default: '/')

#### Returns

`string`

The string without the trailing character

#### Example

```typescript
stripTrailing('/api/users/'); // '/api/users'
```

***

### toKebabCase()

> **toKebabCase**(`str`): `string`

Defined in: [packages/ui/src/utils.tsx:199](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L199)

Convert underscores to hyphens.

#### Parameters

##### str

`string`

The string to convert

#### Returns

`string`

The string with underscores replaced by hyphens

#### Example

```typescript
toKebabCase('user_name'); // 'user-name'
```

***

### toSpaceCase()

> **toSpaceCase**(`str`): `string`

Defined in: [packages/ui/src/utils.tsx:236](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L236)

Convert kebab-case or snake_case to space-separated words.

#### Parameters

##### str

`string`

The string to convert

#### Returns

`string`

Space-separated string

#### Example

```typescript
toSpaceCase('user-name'); // 'user name'
toSpaceCase('created_at'); // 'created at'
```

***

### toTitleCase()

> **toTitleCase**(`str`): `string`

Defined in: [packages/ui/src/utils.tsx:215](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/utils.tsx#L215)

Convert kebab-case or snake_case to Title Case.

#### Parameters

##### str

`string`

The string to convert

#### Returns

`string`

Title case string with spaces

#### Example

```typescript
toTitleCase('user-name'); // 'User Name'
toTitleCase('created_at'); // 'Created At'
```
