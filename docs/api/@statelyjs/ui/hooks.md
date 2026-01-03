# hooks

## Interfaces

### ClickTrack

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:5](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L5)

#### Properties

##### count

> **count**: `number`

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:8](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L8)

##### label

> **label**: `string`

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L7)

##### path

> **path**: `string`

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:6](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L6)

## Type Aliases

### Status

> **Status** = `"checking"` \| `"available"` \| `"unavailable"`

Defined in: [packages/ui/src/hooks/use-optional-peer.ts:4](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-optional-peer.ts#L4)

## Variables

### STORAGE\_KEY

> `const` **STORAGE\_KEY**: `"stately-click-tracking"` = `'stately-click-tracking'`

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L3)

## Functions

### useClickTracking()

> **useClickTracking**(): `object`

Defined in: [packages/ui/src/hooks/use-click-tracking.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-click-tracking.tsx#L11)

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

Defined in: [packages/ui/src/hooks/use-media-query.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-media-query.tsx#L3)

#### Parameters

##### query

`string`

#### Returns

`boolean`

***

### useOptionalPeer()

> **useOptionalPeer**(`moduleId`): [`Status`](#status)

Defined in: [packages/ui/src/hooks/use-optional-peer.ts:6](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-optional-peer.ts#L6)

#### Parameters

##### moduleId

`string`

#### Returns

[`Status`](#status)

***

### useViewMore()

> **useViewMore**(`data`, `limit`): readonly \[\[`string`, `unknown`\][], \[`string`, `unknown`\][], `boolean`, `Dispatch`\<`SetStateAction`\<`boolean`\>\>\]

Defined in: [packages/ui/src/hooks/use-view-more.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/hooks/use-view-more.tsx#L3)

#### Parameters

##### data

`any`

##### limit

`number`

#### Returns

readonly \[\[`string`, `unknown`\][], \[`string`, `unknown`\][], `boolean`, `Dispatch`\<`SetStateAction`\<`boolean`\>\>\]
