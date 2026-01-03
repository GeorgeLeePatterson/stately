# registry

@statelyjs/ui Component Registry

The registry system enables dynamic component resolution based on schema node types.
When rendering a field, the form system looks up the appropriate component from the
registry using the node's type (e.g., 'string', 'object', 'array').

## How It Works

Components are registered with composite keys:
- `{nodeType}::edit::component` - Edit component for a node type
- `{nodeType}::view::component` - View component for a node type

## For Plugin Authors

Register custom components for your plugin's node types:

```typescript

// In your plugin factory
export const myUiPlugin = createUiPlugin<MyUiPlugin>({
 name: PLUGIN_NAME,
 operations: PLUGIN_OPERATIONS,

 setup: (ctx, options) => {
  // Register edit component for custom node type
  ctx.registerComponent('myCustomType', 'edit', MyCustomEditComponent);

  // Register view component
  ctx.registerComponent('myCustomType', 'view', MyCustomViewComponent);

  return {};
});
```

## Interfaces

### FieldEditProps

Defined in: [packages/ui/src/registry.ts:64](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L64)

Common interface for all 'edit' type fields registered

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### N

`N` *extends* [`BaseNode`](../schema/nodes.md#basenode) = `S`\[`"plugin"`\]\[`"AnyNode"`\]

##### V

`V` = `unknown`

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/registry.ts:74](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L74)

##### formId

> **formId**: `string`

Defined in: [packages/ui/src/registry.ts:69](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L69)

##### isRequired?

> `optional` **isRequired**: `boolean`

Defined in: [packages/ui/src/registry.ts:76](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L76)

##### isWizard?

> `optional` **isWizard**: `boolean`

Defined in: [packages/ui/src/registry.ts:77](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L77)

##### label?

> `optional` **label**: `string`

Defined in: [packages/ui/src/registry.ts:73](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L73)

##### node

> **node**: `N`

Defined in: [packages/ui/src/registry.ts:70](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L70)

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/registry.ts:72](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L72)

###### Parameters

###### value

`V`

###### Returns

`void`

##### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/registry.ts:75](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L75)

##### value?

> `optional` **value**: `V`

Defined in: [packages/ui/src/registry.ts:71](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L71)

***

### FieldViewProps

Defined in: [packages/ui/src/registry.ts:52](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L52)

Common interface for all 'view' type fields registered

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### N

`N` *extends* [`BaseNode`](../schema/nodes.md#basenode) = [`PluginNodeUnion`](../schema/plugin.md#pluginnodeunion)\<`S`\>

##### V

`V` = `unknown`

#### Properties

##### node

> **node**: `N`

Defined in: [packages/ui/src/registry.ts:57](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L57)

##### value

> **value**: `V`

Defined in: [packages/ui/src/registry.ts:58](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L58)

***

### UiRegistry

Defined in: [packages/ui/src/registry.ts:88](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L88)

The UI registry containing all registered components, transformers, and functions.

Access via `runtime.registry` to register or retrieve components.

#### Properties

##### components

> **components**: [`ComponentRegistry`](#componentregistry)

Defined in: [packages/ui/src/registry.ts:90](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L90)

Component registry - maps node types to React components

## Type Aliases

### ComponentRegistry

> **ComponentRegistry** = `Map`\<`string`, `ComponentType`\<`any`\>\>

Defined in: [packages/ui/src/registry.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L81)

Map of registry keys to React components.

***

### NodeTypeComponent

> **NodeTypeComponent**\<`S`\> = `ComponentType`\<[`FieldEditProps`](#fieldeditprops)\<`S`\>\> \| `ComponentType`\<[`FieldViewProps`](#fieldviewprops)\<`S`\>\>

Defined in: [packages/ui/src/registry.ts:122](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L122)

Union type of all components that can be registered.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`StatelyConfig`, \[\]\>

***

### RegistryKey

> **RegistryKey** = `` `${string}::${RegistryMode}` `` \| `` `${string}::${RegistryMode}::component` ``

Defined in: [packages/ui/src/registry.ts:115](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L115)

**`Internal`**

A composite key for registry lookup.

Format: `{nodeType}::{mode}::{type}`

#### Example

```ts
- `"string::edit::component"` - String edit component
- `"object::view::component"` - Object view component

@internal
```

***

### RegistryMode

> **RegistryMode** = `"edit"` \| `"view"`

Defined in: [packages/ui/src/registry.ts:102](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L102)

**`Internal`**

The mode for a registry entry: 'edit' for form inputs, 'view' for display.

## Functions

### getComponent()

> **getComponent**(`registry`, `key`): `unknown`

Defined in: [packages/ui/src/registry.ts:154](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L154)

Get a component from the registry by key.

#### Parameters

##### registry

[`ComponentRegistry`](#componentregistry)

The component registry

##### key

`string`

The registry key

#### Returns

`unknown`

The component if found, undefined otherwise

***

### getComponentByPath()

> **getComponentByPath**(`registry`, `node`, `path`): `ComponentType`\<`any`\> \| `undefined`

Defined in: [packages/ui/src/registry.ts:170](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L170)

Get a component by building a key from path segments.

#### Parameters

##### registry

[`ComponentRegistry`](#componentregistry)

The component registry

##### node

`string`

The node type

##### path

`string`[]

Additional path segments to append

#### Returns

`ComponentType`\<`any`\> \| `undefined`

***

### getEditComponent()

> **getEditComponent**\<`S`, `N`, `V`\>(`registry`, `node`): `ComponentType`\<[`FieldEditProps`](#fieldeditprops)\<`S`, `N`, `V`\>\> \| `undefined`

Defined in: [packages/ui/src/registry.ts:194](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L194)

Get the edit component for a node type.

Convenience wrapper around `getComponent` that builds the correct key.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### N

`N` *extends* [`BaseNode`](../schema/nodes.md#basenode) = [`PluginNodeUnion`](../schema/plugin.md#pluginnodeunion)\<`S`\>

##### V

`V` = `unknown`

#### Parameters

##### registry

[`ComponentRegistry`](#componentregistry)

The component registry

##### node

`string`

The node type name

#### Returns

`ComponentType`\<[`FieldEditProps`](#fieldeditprops)\<`S`, `N`, `V`\>\> \| `undefined`

The edit component if found

#### Example

```typescript
const StringEdit = getEditComponent(registry, 'string');
const PasswordEdit = getEditComponent(registry, 'string', 'password');
```

***

### getViewComponent()

> **getViewComponent**\<`S`, `N`, `V`\>(`registry`, `node`): `ComponentType`\<[`FieldViewProps`](#fieldviewprops)\<`S`, `N`, `V`\>\> \| `undefined`

Defined in: [packages/ui/src/registry.ts:214](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L214)

Get the view component for a node type.

Convenience wrapper around `getComponent` that builds the correct key.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### N

`N` *extends* [`BaseNode`](../schema/nodes.md#basenode) = [`PluginNodeUnion`](../schema/plugin.md#pluginnodeunion)\<`S`\>

##### V

`V` = `unknown`

#### Parameters

##### registry

[`ComponentRegistry`](#componentregistry)

The component registry

##### node

`string`

The node type name

#### Returns

`ComponentType`\<[`FieldViewProps`](#fieldviewprops)\<`S`, `N`, `V`\>\> \| `undefined`

The view component if found

***

### makeRegistryKey()

> **makeRegistryKey**(`node`, `mode`): [`RegistryKey`](#registrykey)

Defined in: [packages/ui/src/registry.ts:143](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/registry.ts#L143)

**`Internal`**

Create a registry key for component or transformer lookup.

#### Parameters

##### node

`string`

The node type name (e.g., 'string', 'object', 'myCustomType')

##### mode

[`RegistryMode`](#registrymode)

'edit' for form inputs, 'view' for display

#### Returns

[`RegistryKey`](#registrykey)

A formatted registry key
