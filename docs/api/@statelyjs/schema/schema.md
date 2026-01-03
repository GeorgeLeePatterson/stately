# schema

## Type Aliases

### DerivedPluginNodes

> **DerivedPluginNodes**\<`Augments`\> = `AugmentPluginNodes`\<`Augments`\>

Defined in: [schema.ts:60](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L60)

#### Type Parameters

##### Augments

`Augments`

***

### PluginAnyNode

> **PluginAnyNode**\<`Augments`\> = [`DerivedPluginNodes`](#derivedpluginnodes)\<`Augments`\>

Defined in: [schema.ts:61](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L61)

#### Type Parameters

##### Augments

`Augments` *extends* [`AnySchemaAugments`](plugin.md#anyschemaaugments)

***

### StatelySchemaConfig

> **StatelySchemaConfig**\<`S`\> = `S` *extends* [`StatelySchemas`](#statelyschemas)\<infer Config, `any`\> ? `Config` : `never`

Defined in: [schema.ts:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L34)

#### Type Parameters

##### S

`S`

***

### StatelySchemas

> **StatelySchemas**\<`Config`, `Augments`\> = `object`

Defined in: [schema.ts:23](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L23)

Base schema builder – derives shared surface area without core additions.

This type helper is the core type helper, without any assumptions baked in, not even "core".
Prefer the exported `Schemas` in the entrypoint of the package.

Variance annotation enforces that Config can only be used covariantly, preventing
invariant-causing patterns like `keyof Config['nodes']` from being introduced.

#### Type Parameters

##### Config

`Config` *extends* `StatelyConfig`

##### Augments

`Augments` *extends* [`AnySchemaAugments`](plugin.md#anyschemaaugments)

#### Properties

##### augments

> **augments**: `Augments`

Defined in: [schema.ts:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L26)

##### config

> **config**: `Config`

Defined in: [schema.ts:25](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L25)

Store raw configuration and plugin augmentations

##### data

> **data**: `AugmentPluginData`\<`Augments`\>

Defined in: [schema.ts:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L30)

##### generated

> **generated**: [`NodeInformation`](nodes.md#nodeinformation)\<[`GeneratedNodeMap`](../stately/schema.md#generatednodemap)\<`Config`\>\>

Defined in: [schema.ts:27](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L27)

##### plugin

> **plugin**: [`NodeInformation`](nodes.md#nodeinformation)\<`AugmentPluginNodes`\<`Augments`\>\>

Defined in: [schema.ts:28](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L28)

##### types

> **types**: `AugmentPluginTypes`\<`Augments`\>

Defined in: [schema.ts:29](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L29)

##### utils

> **utils**: `AugmentPluginUtils`\<`Augments`\>

Defined in: [schema.ts:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L31)

## Functions

### isNodeOfType()

> **isNodeOfType**\<`N`\>(`schema`, `nodeType`): `schema is N`

Defined in: [schema.ts:53](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/schema.ts#L53)

Type guard for narrowing plugin node unions by nodeType.

Use this helper when you need to narrow a `PluginNodeUnion<S>` to a specific node type
based on its `nodeType` discriminator. This is particularly useful in validation functions
and other plugin code that needs to handle different node types.

#### Type Parameters

##### N

`N` *extends* [`BaseNode`](nodes.md#basenode)

#### Parameters

##### schema

[`BaseNode`](nodes.md#basenode)

##### nodeType

`N`\[`"nodeType"`\]

#### Returns

`schema is N`

#### Example

```typescript
function processNode(schema: PluginNodeUnion<MySchemas>) {
  if (isNodeOfType<ObjectNode>(schema, 'object')) {
    // schema is now narrowed to ObjectNode
    console.log(schema.properties);
  }
}
```
