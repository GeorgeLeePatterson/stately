# lib/utils

## Functions

### cn()

> **cn**(...`inputs`): `string`

Defined in: [packages/ui/src/lib/utils.ts:30](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/utils.ts#L30)

Merge class names

#### Parameters

##### inputs

...`ClassValue`[]

#### Returns

`string`

***

### messageFromError()

> **messageFromError**(`err`): `string` \| `undefined`

Defined in: [packages/ui/src/lib/utils.ts:8](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/utils.ts#L8)

Helper type to deal with 'maybe' `ApiError` types and extract error message. Especially helpful
with react-query errors.

#### Parameters

##### err

`unknown`

#### Returns

`string` \| `undefined`

***

### pluralize()

> **pluralize**(`word`): `string`

Defined in: [packages/ui/src/lib/utils.ts:34](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/utils.ts#L34)

#### Parameters

##### word

`string`

#### Returns

`string`
