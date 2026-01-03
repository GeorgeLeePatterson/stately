# lib/logging

## Variables

### devLog

> `const` **devLog**: `object`

Defined in: [packages/ui/src/lib/logging.ts:38](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/logging.ts#L38)

Logger for statelyjs/ui

#### Type Declaration

##### debug()

> **debug**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### error()

> **error**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### log()

> **log**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### warn()

> **warn**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

***

### NAMESPACE

> `const` **NAMESPACE**: `"@statelyjs/ui"` = `'@statelyjs/ui'`

Defined in: [packages/ui/src/lib/logging.ts:1](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/logging.ts#L1)

## Functions

### devLogger()

> **devLogger**(`namespace`): `object`

Defined in: [packages/ui/src/lib/logging.ts:17](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/logging.ts#L17)

Simple logger, helps ensure more consistent logging

#### Parameters

##### namespace

`string` = `NAMESPACE`

#### Returns

`object`

##### debug()

> **debug**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### error()

> **error**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### log()

> **log**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### warn()

> **warn**: (...`args`) => `void`

###### Parameters

###### args

...`any`[]

###### Returns

`void`
