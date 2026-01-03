# core/schema/utils

## Type Aliases

### CoreUtils

> **CoreUtils** = [`DefineUtils`](../../schema.md#defineutils)\<\{ `extractNodeInnerType`: *typeof* [`extractNodeInnerType`](#extractnodeinnertype); `isEntityValid`: *typeof* [`isEntityValid`](#isentityvalid); `isPrimitiveNodeLike`: *typeof* [`isPrimitiveNodeLike`](#isprimitivenodelike); `isSingletonId`: *typeof* [`isSingletonId`](#issingletonid); `sortEntityProperties`: *typeof* `sortEntityProperties`; \}\>

Defined in: [packages/stately/src/core/schema/utils.ts:179](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L179)

## Variables

### coreUtils

> `const` **coreUtils**: [`CoreUtils`](#coreutils)

Defined in: [packages/stately/src/core/schema/utils.ts:171](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L171)

***

### SINGLETON\_ID

> `const` **SINGLETON\_ID**: `"00000000-0000-0000-0000-000000000000"` = `'00000000-0000-0000-0000-000000000000'`

Defined in: [packages/stately/src/core/schema/utils.ts:23](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L23)

ID utilities

## Functions

### extractNodeInnerType()

> **extractNodeInnerType**(`schema`): `string`

Defined in: [packages/stately/src/core/schema/utils.ts:106](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L106)

Extract the inner node type from `NullableNode` or `ArrayNode`.

#### Parameters

##### schema

[`BaseNode`](../../schema.md#basenode)

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`string`

string

***

### isArray()

> **isArray**(`schema`): `schema is ArrayNode<any>`

Defined in: [packages/stately/src/core/schema/utils.ts:54](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L54)

Determine if a node if of type `ArrayNode`.

#### Parameters

##### schema

`any`

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`schema is ArrayNode<any>`

boolean

***

### isEntityValid()

> **isEntityValid**(`entity`, `schema`): `boolean`

Defined in: [packages/stately/src/core/schema/utils.ts:124](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L124)

Entity validation helper. Simpler than object validation with some extra checks.

#### Parameters

##### entity

`any`

##### schema

[`BaseNode`](../../schema.md#basenode) | `undefined`

#### Returns

`boolean`

***

### isNullable()

> **isNullable**(`schema`): `schema is NullableNode<any>`

Defined in: [packages/stately/src/core/schema/utils.ts:41](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L41)

Determine if a node if of type `NullableNode`.

#### Parameters

##### schema

`any`

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`schema is NullableNode<any>`

boolean

***

### isObject()

> **isObject**(`schema`): `schema is ObjectNode<any>`

Defined in: [packages/stately/src/core/schema/utils.ts:65](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L65)

Determine if a node if of type `ObjectNode`.

#### Parameters

##### schema

`any`

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`schema is ObjectNode<any>`

boolean

***

### isPrimitive()

> **isPrimitive**(`schema`): `schema is PrimitiveNode`

Defined in: [packages/stately/src/core/schema/utils.ts:76](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L76)

Determine if a node if of type `PrimitiveNode`.

#### Parameters

##### schema

[`BaseNode`](../../schema.md#basenode)

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`schema is PrimitiveNode`

boolean

***

### isPrimitiveNodeLike()

> **isPrimitiveNodeLike**(`schema`): `boolean`

Defined in: [packages/stately/src/core/schema/utils.ts:92](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L92)

Determine if a node if of a 'primitive-like' type, ie `PrimitiveNode` or `EnumNode`, or either
wrapped in `NullableNode`.

## Note

**Peers through `NullableNode`, associates `EnumNode` as primitive**

#### Parameters

##### schema

[`BaseNode`](../../schema.md#basenode)

Runtime node schema (see [BaseNode](../../schema.md#basenode))

#### Returns

`boolean`

boolean

***

### isSingletonId()

> **isSingletonId**(`id`): `boolean`

Defined in: [packages/stately/src/core/schema/utils.ts:26](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/schema/utils.ts#L26)

Is the ID a singleton ID, ie '00000000-0000-0000-0000-000000000000'

#### Parameters

##### id

`string`

#### Returns

`boolean`
