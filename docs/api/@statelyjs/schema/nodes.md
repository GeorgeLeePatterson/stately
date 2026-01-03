# nodes

## Interfaces

### BaseNode

Defined in: [nodes.ts:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L30)

Base interface for all schema nodes.

Every node in the schema system extends this interface. The `nodeType` discriminator
enables TypeScript's discriminated union narrowing for type-safe node handling.

Codegen emits `nodeType: 'unknown'` for schemas it cannot parse, allowing graceful
degradation - the UI will render a fallback for these.

#### Remarks

No index signature is used - this allows TypeScript's discriminated union narrowing
to work correctly. All node properties must be explicitly defined in their respective
node type interfaces.

#### Extended by

- [`UnknownNode`](#unknownnode)
- [`ArrowConnectionNode`](../arrow/schema.md#arrowconnectionnode)
- [`RelativePathNode`](../files/schema.md#relativepathnode)

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: [nodes.ts:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L34)

Optional description from the OpenAPI schema.

##### nodeType

> **nodeType**: `string`

Defined in: [nodes.ts:32](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L32)

Discriminator identifying the node type (e.g., 'object', 'string', 'array').

***

### UnknownNode

Defined in: [nodes.ts:41](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L41)

Fallback node for schemas that couldn't be parsed.
Used when codegen encounters an unsupported or malformed schema.

#### Extends

- [`BaseNode`](#basenode)

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: [nodes.ts:43](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L43)

Optional description from the OpenAPI schema.

###### Overrides

[`BaseNode`](#basenode).[`description`](#description)

##### nodeType

> **nodeType**: `"unknown"`

Defined in: [nodes.ts:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L42)

Discriminator identifying the node type (e.g., 'object', 'string', 'array').

###### Overrides

[`BaseNode`](#basenode).[`nodeType`](#nodetype)

## Type Aliases

### NodeInformation

> **NodeInformation**\<`Nodes`\> = `object`

Defined in: [nodes.ts:69](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L69)

Derived type information from a node map.
Provides convenient access to node types, unions, and discriminators.

#### Type Parameters

##### Nodes

`Nodes`

The node map to derive information from

#### Properties

##### AnyNode

> **AnyNode**: [`NodeValuesWithUnknown`](#nodevalueswithunknown)\<`Nodes`\>

Defined in: [nodes.ts:73](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L73)

Union of all node types (for discriminated union patterns).

##### NodeNames

> **NodeNames**: [`LiteralKeys`](helpers.md#literalkeys)\<`Nodes` & `object`\>

Defined in: [nodes.ts:75](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L75)

Union of all node name strings.

##### Nodes

> **Nodes**: `Nodes` & `object`

Defined in: [nodes.ts:71](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L71)

The node map with UnknownNode included.

###### Type Declaration

###### unknown

> **unknown**: [`UnknownNode`](#unknownnode)

##### NodeTypes

> **NodeTypes**: [`NodeValuesWithUnknown`](#nodevalueswithunknown)\<`Nodes`\> *extends* `object` ? `Extract`\<`T`, `string`\> : `string`

Defined in: [nodes.ts:77](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L77)

Union of all nodeType discriminator values.

***

### NodeMap

> **NodeMap** = `Record`\<`string`, [`BaseNode`](#basenode)\>

Defined in: [nodes.ts:47](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L47)

A map of node names to their node definitions.

***

### NodeTypeUnion

> **NodeTypeUnion**\<`N`\> = [`NodeValues`](#nodevalues)\<`N`\> *extends* `object` ? `Extract`\<`T`, `string`\> : `string`

Defined in: [nodes.ts:59](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L59)

Extracts the union of nodeType strings from a node map.

#### Type Parameters

##### N

`N`

***

### NodeValues

> **NodeValues**\<`N`\> = \[[`LiteralKeys`](helpers.md#literalkeys)\<`N`\>\] *extends* \[`never`\] ? [`UnknownNode`](#unknownnode) : `N`\[[`LiteralKeys`](helpers.md#literalkeys)\<`N`\>\]

Defined in: [nodes.ts:53](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L53)

Extracts the union of node values from a node map.
Returns `UnknownNode` if the map has no literal keys.

#### Type Parameters

##### N

`N`

***

### NodeValuesWithUnknown

> **NodeValuesWithUnknown**\<`N`\> = [`NodeValues`](#nodevalues)\<`N` & `object`\>

Defined in: [nodes.ts:56](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L56)

Node values union that always includes UnknownNode.

#### Type Parameters

##### N

`N`

***

### TUnknownNodeType

> **TUnknownNodeType** = *typeof* [`UnknownNodeType`](#unknownnodetype)

Defined in: [nodes.ts:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L14)

Type alias for the unknown node type string literal.

## Variables

### UnknownNodeType

> `const` **UnknownNodeType**: `"unknown"` = `'unknown'`

Defined in: [nodes.ts:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/nodes.ts#L11)

Constant for the unknown node type discriminator.
