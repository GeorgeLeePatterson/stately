# core/utils

## Interfaces

### CoreUiUtils

Defined in: [packages/stately/src/core/utils.tsx:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L31)

#### Methods

##### generateEntityTypeDisplay()

> **generateEntityTypeDisplay**\<`S`\>(): `object`[]

Defined in: [packages/stately/src/core/utils.tsx:36](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L36)

###### Type Parameters

###### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Returns

`object`[]

##### getDefaultValue()

> **getDefaultValue**(`node`): `any`

Defined in: [packages/stately/src/core/utils.tsx:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L34)

###### Parameters

###### node

[`BaseNode`](../schema.md#basenode)

###### Returns

`any`

##### getEntityIcon()

> **getEntityIcon**\<`S`\>(`entity`): `ComponentType`\<`any`\>

Defined in: [packages/stately/src/core/utils.tsx:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L42)

###### Type Parameters

###### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### entity

`CoreStateEntry`\<`S`\>

###### Returns

`ComponentType`\<`any`\>

##### getNodeTypeIcon()

> **getNodeTypeIcon**(`nodeType`): `ComponentType`\<`any`\> \| `null`

Defined in: [packages/stately/src/core/utils.tsx:33](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L33)

###### Parameters

###### nodeType

`string`

###### Returns

`ComponentType`\<`any`\> \| `null`

##### resolveEntityType()

> **resolveEntityType**\<`S`\>(`entity`): `CoreStateEntry`\<`S`\>

Defined in: [packages/stately/src/core/utils.tsx:43](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L43)

###### Type Parameters

###### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

###### Parameters

###### entity

`string`

###### Returns

`CoreStateEntry`\<`S`\>

##### resolveEntityUrl()

> **resolveEntityUrl**(`entityParts?`, `params?`, `omitBasePath?`): `string`

Defined in: [packages/stately/src/core/utils.tsx:44](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L44)

###### Parameters

###### entityParts?

[`EntityUrlParts`](#entityurlparts)

###### params?

`Record`\<`string`, `string`\>

###### omitBasePath?

`boolean`

###### Returns

`string`

## Type Aliases

### EntityUrlParts

> **EntityUrlParts** = \{ `id?`: `never`; `mode?`: `never`; `type?`: `string`; \} \| \{ `id?`: `string`; `mode?`: `never`; `type`: `string`; \} \| \{ `id?`: `never`; `mode?`: `string`; `type`: `string`; \} \| \{ `id`: `string`; `mode?`: `string`; `type`: `string`; \}

Defined in: [packages/stately/src/core/utils.tsx:25](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L25)

## Functions

### createCoreUtils()

> **createCoreUtils**\<`S`, `A`\>(`runtime`, `options?`): [`CoreUiUtils`](#coreuiutils)

Defined in: [packages/stately/src/core/utils.tsx:51](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L51)

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

##### A

`A` *extends* readonly `AnyUiPlugin`[] = \[\]

#### Parameters

##### runtime

`StatelyUiRuntime`\<`S`, readonly \[`CoreUiPlugin`, `A`\]\>

##### options?

###### api?

\{ `pathPrefix?`: `string`; \}

API configuration for entity endpoints

###### api.pathPrefix?

`string`

Path prefix for entity CRUD endpoints (e.g., '/entity')

###### entities?

`CoreEntityOptions`

Entity display configuration

#### Returns

[`CoreUiUtils`](#coreuiutils)

***

### generateEntityTypeDisplay()

> **generateEntityTypeDisplay**\<`S`\>(`data`): `object`[]

Defined in: [packages/stately/src/core/utils.tsx:166](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L166)

Generate entity types from metadata

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### data

`S`\[`"data"`\]

Stately['data']

#### Returns

`object`[]

[]

***

### getDefaultValue()

> **getDefaultValue**(`node`): `any`

Defined in: [packages/stately/src/core/utils.tsx:106](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L106)

Default value generation

Generates sensible default values for core node types.
Returns null for unknown/plugin node types (graceful degradation).

#### Parameters

##### node

[`BaseNode`](../schema.md#basenode)

#### Returns

`any`

***

### getNodeTypeIcon()

> **getNodeTypeIcon**(`nodeType`): `ComponentType`\<`any`\> \| `null`

Defined in: [packages/stately/src/core/utils.tsx:77](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L77)

Get icon component for a node type

#### Parameters

##### nodeType

`string`

#### Returns

`ComponentType`\<`any`\> \| `null`

***

### resolveEntityType()

> **resolveEntityType**\<`S`\>(`entity`, `data`): `CoreStateEntry`\<`S`\>

Defined in: [packages/stately/src/core/utils.tsx:184](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L184)

Attempts to resolve a string signifying an entity type into a proper `StateEntry`.

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### entity

`string`

A URL path segment or display name to resolve

##### data

`S`\[`"data"`\]

The schema data containing entity mappings

#### Returns

`CoreStateEntry`\<`S`\>

The resolved StateEntry, or the original string cast as StateEntry if not found

***

### resolveEntityUrl()

> **resolveEntityUrl**\<`S`, `A`\>(`runtime`, `entityParts?`, `params?`, `omitBasePath?`): `string`

Defined in: [packages/stately/src/core/utils.tsx:201](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/utils.tsx#L201)

Resolve an entity URL, respecting base path

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

##### A

`A` *extends* readonly `AnyUiPlugin`[] = \[\]

#### Parameters

##### runtime

`StatelyUiRuntime`\<`S`, readonly \[`CoreUiPlugin`, `A`\]\>

##### entityParts?

[`EntityUrlParts`](#entityurlparts)

##### params?

`Record`\<`string`, `string`\>

##### omitBasePath?

`boolean`

#### Returns

`string`
