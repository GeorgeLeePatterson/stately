# plugin

## Type Aliases

### AnySchemaAugments

> **AnySchemaAugments** = readonly [`AnySchemaPlugin`](#anyschemaplugin)[]

Defined in: [plugin.ts:94](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L94)

***

### AnySchemaPlugin

> **AnySchemaPlugin** = [`PluginAugment`](#pluginaugment)\<`string`, [`NodeMap`](nodes.md#nodemap), `any`, `any`, `any`\>

Defined in: [plugin.ts:93](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L93)

***

### DefineData

> **DefineData**\<`T`\> = `T`

Defined in: [plugin.ts:62](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L62)

Define runtime data to expose from your plugin.

#### Type Parameters

##### T

`T` *extends* [`AnyRecord`](helpers.md#anyrecord) = [`AnyRecord`](helpers.md#anyrecord)

#### Example

```typescript
type MyData = DefineData<{
  registry: Map<string, string>;
  cache: Record<string, unknown>;
}>;
```

***

### DefineNodeMap

> **DefineNodeMap**\<`T`\> = `{ [K in keyof T]: T[K] }` & `object`

Defined in: [plugin.ts:34](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L34)

Define the node map for your plugin augment.
The type system will automatically add the required index signature.

#### Type Declaration

##### unknown

> **unknown**: [`UnknownNode`](nodes.md#unknownnode)

#### Type Parameters

##### T

`T` *extends* [`NodeMap`](nodes.md#nodemap) = [`NodeMap`](nodes.md#nodemap)

#### Example

```typescript
type MyNodeMap = DefineNodeMap<{
  myCustomNode: MyCustomNodeType;
  anotherNode: AnotherNodeType;
}>;
```

***

### DefineTypes

> **DefineTypes**\<`T`\> = `T`

Defined in: [plugin.ts:49](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L49)

Define additional types to expose from your plugin.

#### Type Parameters

##### T

`T` *extends* [`AnyRecord`](helpers.md#anyrecord) = [`NeverRecord`](helpers.md#neverrecord)

#### Example

```typescript
type MyTypes = DefineTypes<{
  MyHelper: { foo: string };
  MyConfig: { bar: number };
}>;
```

***

### DefineUtils

> **DefineUtils**\<`T`\> = `T` & `object`

Defined in: [plugin.ts:75](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L75)

Define utility functions to expose from your plugin.

#### Type Declaration

##### validate?

> `optional` **validate**: [`ValidateHook`](validation.md#validatehook)

#### Type Parameters

##### T

`T` *extends* [`AnyRecord`](helpers.md#anyrecord) = [`EmptyRecord`](helpers.md#emptyrecord)

#### Example

```typescript
type MyUtils = DefineUtils<{
  parseFile: (path: string) => FileNode;
  validateFile: (file: FileNode) => boolean;
}>;
```

***

### PluginAugment

> **PluginAugment**\<`Name`, `Nodes`, `Types`, `Data`, `Utils`\> = `object`

Defined in: [plugin.ts:85](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L85)

Describes the structural shape of any plugin augment.

IMPORTANT: Prefer `DefinePlugin` if declaring a plugin's augment.

Use this when you need to reference plugins generically (e.g., constraints, schema plumbing)
without enforcing literal-string 'Name' requirements.

#### Type Parameters

##### Name

`Name` *extends* `string`

##### Nodes

`Nodes` *extends* [`NodeMap`](nodes.md#nodemap) = [`NodeMap`](nodes.md#nodemap)

##### Types

`Types` *extends* [`DefineTypes`](#definetypes) = [`NeverRecord`](helpers.md#neverrecord)

##### Data

`Data` *extends* [`DefineData`](#definedata) = [`NeverRecord`](helpers.md#neverrecord)

##### Utils

`Utils` *extends* [`DefineUtils`](#defineutils)\<[`AnyRecord`](helpers.md#anyrecord)\> = [`AnyRecord`](helpers.md#anyrecord)

#### Properties

##### data?

> `optional` **data**: `Data`

Defined in: [plugin.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L91)

##### name

> **name**: `Name`

Defined in: [plugin.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L91)

##### nodes

> **nodes**: `Nodes`

Defined in: [plugin.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L91)

##### types?

> `optional` **types**: `Types`

Defined in: [plugin.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L91)

##### utils?

> `optional` **utils**: `Utils`

Defined in: [plugin.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L91)

***

### PluginNodeUnion

> **PluginNodeUnion**\<`S`\> = `S`\[`"plugin"`\]\[`"AnyNode"`\]

Defined in: [plugin.ts:20](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/schema/src/plugin.ts#L20)

Plugin helper types for nodes

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>
