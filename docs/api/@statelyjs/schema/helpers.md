# helpers

## Type Aliases

### AnyRecord

> **AnyRecord** = `Record`\<`string`, `unknown`\>

Defined in: [helpers.ts:9](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L9)

A record with string keys and unknown values.

***

### AssertTrue

> **AssertTrue**\<`T`\> = `T`

Defined in: [helpers.ts:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L24)

**`Internal`**

Compile-time assertion that a type is true.

#### Type Parameters

##### T

`T` *extends* `true`

***

### Assume

> **Assume**\<`T`, `U`\> = `T` *extends* `U` ? `T` : `never`

Defined in: [helpers.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L80)

Enforces that a subtype T is assignable to supertype U.

#### Type Parameters

##### T

`T`

##### U

`U`

***

### Defined

> **Defined**\<`T`\> = `T` *extends* `undefined` ? `never` : `T`

Defined in: [helpers.ts:77](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L77)

Enforces that a type is defined (not undefined).

#### Type Parameters

##### T

`T`

***

### EmptyRecord

> **EmptyRecord** = `Record`\<`string`, `never`\>

Defined in: [helpers.ts:15](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L15)

A record that exists but has no properties.

***

### ErrorMessageNarrowType

> **ErrorMessageNarrowType** = `"TYPE ERROR: Expected narrower type"`

Defined in: [helpers.ts:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L21)

**`Internal`**

Error message for types that need to be narrower.

***

### ErrorMessageStringLiteral

> **ErrorMessageStringLiteral** = `"TYPE ERROR: Value must be a string literal"`

Defined in: [helpers.ts:18](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L18)

**`Internal`**

Error message for non-literal string types.

***

### LiteralKeys

> **LiteralKeys**\<`T`\> = [`StringKeys`](#stringkeys)\<`T`\> *extends* infer Keys ? `string` *extends* `Keys` ? `never` : `Keys` : `never`

Defined in: [helpers.ts:57](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L57)

Extracts literal string keys from a type, excluding index signatures.
Returns `never` if the type only has an index signature.

#### Type Parameters

##### T

`T`

***

### NeverRecord

> **NeverRecord** = `Record`\<`never`, `never`\>

Defined in: [helpers.ts:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L12)

An empty record with no valid keys. Used for "no data" scenarios.

***

### RequireLiteral

> **RequireLiteral**\<`T`, `Msg`\> = [`RequireNarrower`](#requirenarrower)\<`T`, `string`, `Msg`\>

Defined in: [helpers.ts:44](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L44)

Enforces that a string type is a literal, not just `string`.
Returns a compile-time error message if given a wide string type.

#### Type Parameters

##### T

`T` *extends* `string`

The string type to check

##### Msg

`Msg` = [`ErrorMessageStringLiteral`](#errormessagestringliteral)

Custom error message if check fails

***

### RequireNarrower

> **RequireNarrower**\<`T`, `Base`, `Msg`\> = `Base` *extends* `T` ? `Msg` *extends* `string` ? `` `TYPE ERROR: ${Msg}` `` : [`ErrorMessageNarrowType`](#errormessagenarrowtype) : `T`

Defined in: [helpers.ts:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L31)

**`Internal`**

Requires that T is narrower than Base, otherwise returns an error message.
Used to enforce literal types at compile time.

#### Type Parameters

##### T

`T`

##### Base

`Base`

##### Msg

`Msg`

***

### StringKeys

> **StringKeys**\<`T`\> = `Extract`\<keyof `T`, `string`\>

Defined in: [helpers.ts:51](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L51)

Extracts only string keys from a type.

#### Type Parameters

##### T

`T`

***

### UnionToIntersection

> **UnionToIntersection**\<`U`\> = `U` *extends* `any` ? (`arg`) => `void` : `never` *extends* (`arg`) => `void` ? `I` : `never`

Defined in: [helpers.ts:67](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L67)

Converts a union type to an intersection type.

#### Type Parameters

##### U

`U`

#### Example

```ts
`UnionToIntersection<A | B>` becomes `A & B`
```

## Functions

### Tuple()

> **Tuple**\<`T`\>(`v`): `T`

Defined in: [helpers.ts:74](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/helpers.ts#L74)

Converts an array of values to a non-readonly tuple.

#### Type Parameters

##### T

`T` *extends* \[`any`, `...any[]`\]

#### Parameters

##### v

`T`

#### Returns

`T`
