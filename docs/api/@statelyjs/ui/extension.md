# extension

@statelyjs/ui Extension System

Extensions provide a type-safe, composable way for plugins to modify behavior.
An extension point is a named hook that accepts transformers - functions that
receive state and return (possibly modified) state.

## Core Concepts

- **Extension Point**: A named hook defined by a plugin (e.g., `addStringModes`)
- **Transformer**: A function `(T) => T` that modifies state
- **Composition**: Multiple transformers chain together via `extend()`

## For Plugin Authors

Define extension points to allow customization of your plugin's behavior:

```typescript
// Define the state shape
export interface StringEditState {
  mode: string;
  modeGroups: StringModeGroup[];
  component?: ComponentType<...>;
}

// Create the extension point
export const addStringModes = defineExtension<StringEditState>({
  id: 'core.addStringModes',
  summary: 'Add custom input modes to string fields',
});

// In your component, apply the extension
const state = addStringModes.transform(initialState);
```

## For Users & Plugin Consumers

Extend behavior by registering transformers:

```typescript
import { addStringModes } from '@statelyjs/stately/extensions';

addStringModes.extend(state => ({
  ...state,
  modeGroups: [...state.modeGroups, myCustomModes],
}));
```

## Composition

Transformers compose in registration order. If plugin A and plugin B both
extend the same point:

```typescript
// Plugin A (registered first)
point.extend(s => ({ ...s, value: s.value + 1 }));

// Plugin B (registered second)
point.extend(s => ({ ...s, value: s.value * 2 }));

// Result: initial { value: 0 } → A: { value: 1 } → B: { value: 2 }
point.transform({ value: 0 }); // { value: 2 }
```

## Interfaces

### Extensible

Defined in: [packages/ui/src/extension.tsx:310](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L310)

An extension object for registering transformers.

This is the second element of the tuple returned by `createExtensible`.
Use this at module/plugin initialization time to register extensions.

#### Extends

- [`ExtensionPointConfig`](#extensionpointconfig)

#### Type Parameters

##### TState

`TState`

The state shape that flows through transformers

#### Properties

##### extension

> `readonly` **extension**: [`ExtensionPoint`](#extensionpoint)\<`TState`\>

Defined in: [packages/ui/src/extension.tsx:315](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L315)

The underlying extension point.
Use this for advanced scenarios requiring direct pipeline access.

##### id

> `readonly` **id**: `string`

Defined in: [packages/ui/src/extension.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L80)

Unique identifier for the extension point.

Use the convention `{plugin}.{feature}` to avoid collisions.

###### Examples

```ts
'core.addStringModes'
```

```ts
'files.filePreview'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`id`](#id-3)

##### summary

> `readonly` **summary**: `string`

Defined in: [packages/ui/src/extension.tsx:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L89)

Human-readable summary describing what this extension point does.

This is used for documentation generation and IDE hints.

###### Example

```ts
'Add custom input modes to string fields'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`summary`](#summary-3)

#### Methods

##### extend()

> **extend**(`input`): `void`

Defined in: [packages/ui/src/extension.tsx:339](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L339)

Extend the state with a partial update or transformer function.

Two forms are supported:

1. **Partial object** - Merged into state unconditionally:
   ```typescript
   feature.extend({ label: 'New Label', count: 5 });
   ```

2. **Transformer function** - Receives state, returns partial to merge:
   ```typescript
   feature.extend(state => ({
     component: state.mode === 'code' ? CodeEditor : state.component,
   }));
   ```

In both cases, you never need to spread state - the framework handles
deep merging automatically.

###### Parameters

###### input

[`ExtendInput`](#extendinput)\<`TState`\>

Partial state object or transformer function

###### Returns

`void`

***

### ExtensibleConfig

Defined in: [packages/ui/src/extension.tsx:270](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L270)

Configuration for creating an extensible hook.

#### Extends

- [`ExtensionPointConfig`](#extensionpointconfig)

#### Type Parameters

##### TOptions

`TOptions`

Options passed to the hook

##### TState

`TState`

The state shape that flows through transformers

#### Properties

##### id

> `readonly` **id**: `string`

Defined in: [packages/ui/src/extension.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L80)

Unique identifier for the extension point.

Use the convention `{plugin}.{feature}` to avoid collisions.

###### Examples

```ts
'core.addStringModes'
```

```ts
'files.filePreview'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`id`](#id-3)

##### initial()

> **initial**: (`options`) => `TState`

Defined in: [packages/ui/src/extension.tsx:278](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L278)

Factory function that creates initial state from hook options.
Called each time the hook is used.

###### Parameters

###### options

`TOptions`

Options passed to the hook

###### Returns

`TState`

Initial state before any transformers are applied

##### summary

> `readonly` **summary**: `string`

Defined in: [packages/ui/src/extension.tsx:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L89)

Human-readable summary describing what this extension point does.

This is used for documentation generation and IDE hints.

###### Example

```ts
'Add custom input modes to string fields'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`summary`](#summary-3)

***

### ExtensionPoint

Defined in: [packages/ui/src/extension.tsx:101](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L101)

An extension point that plugins can extend with transformers.

Extension points are the primary mechanism for plugins to allow
customization of their behavior. They follow a simple pattern:
state in, state out (`T => T`).

#### Extends

- [`ExtensionPointConfig`](#extensionpointconfig)

#### Type Parameters

##### T

`T`

The state type that flows through the extension

#### Properties

##### id

> `readonly` **id**: `string`

Defined in: [packages/ui/src/extension.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L80)

Unique identifier for the extension point.

Use the convention `{plugin}.{feature}` to avoid collisions.

###### Examples

```ts
'core.addStringModes'
```

```ts
'files.filePreview'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`id`](#id-3)

##### summary

> `readonly` **summary**: `string`

Defined in: [packages/ui/src/extension.tsx:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L89)

Human-readable summary describing what this extension point does.

This is used for documentation generation and IDE hints.

###### Example

```ts
'Add custom input modes to string fields'
```

###### Inherited from

[`ExtensionPointConfig`](#extensionpointconfig).[`summary`](#summary-3)

#### Methods

##### extend()

> **extend**(`transformer`): `void`

Defined in: [packages/ui/src/extension.tsx:139](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L139)

Register a transformer to this extension point.

Transformers are composed in registration order. Each transformer
receives the output of the previous transformer (or the initial
state for the first transformer).

###### Parameters

###### transformer

(`state`) => `T`

A function that receives state and returns modified state

###### Returns

`void`

###### Example

```typescript
addStringModes.extend(state => ({
  ...state,
  modeGroups: [...state.modeGroups, myModeGroup],
  component: state.mode === 'code' ? CodeEditor : state.component,
}));
```

##### transform()

> **transform**(`state`): `T`

Defined in: [packages/ui/src/extension.tsx:119](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L119)

Apply all registered transformers to the input state.

Transformers are applied in registration order. If no transformers
are registered, returns the input state unchanged.

###### Parameters

###### state

`T`

The initial state

###### Returns

`T`

The transformed state

###### Example

```typescript
const resolved = addStringModes.transform({
  mode: 'text',
  modeGroups: [coreModes],
});
```

***

### ExtensionPointConfig

Defined in: [packages/ui/src/extension.tsx:71](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L71)

Configuration for defining an extension point.

#### Extended by

- [`ExtensionPoint`](#extensionpoint)
- [`ExtensibleConfig`](#extensibleconfig)
- [`Extensible`](#extensible)

#### Properties

##### id

> `readonly` **id**: `string`

Defined in: [packages/ui/src/extension.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L80)

Unique identifier for the extension point.

Use the convention `{plugin}.{feature}` to avoid collisions.

###### Examples

```ts
'core.addStringModes'
```

```ts
'files.filePreview'
```

##### summary

> `readonly` **summary**: `string`

Defined in: [packages/ui/src/extension.tsx:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L89)

Human-readable summary describing what this extension point does.

This is used for documentation generation and IDE hints.

###### Example

```ts
'Add custom input modes to string fields'
```

## Type Aliases

### ExtendInput

> **ExtendInput**\<`T`\> = `Partial`\<`T`\> \| (`state`) => `Partial`\<`T`\>

Defined in: [packages/ui/src/extension.tsx:289](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L289)

Input type for extend() - either a partial state object or a transformer function.

- `Partial<T>`: Merged into state (deep merge)
- `(state: T) => Partial<T>`: Function that receives state and returns partial to merge

In both cases, the framework handles merging. You never need to spread state.

#### Type Parameters

##### T

`T`

***

### ExtensibleHook()

> **ExtensibleHook**\<`TOptions`, `TState`\> = (`options`) => `TState`

Defined in: [packages/ui/src/extension.tsx:300](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L300)

A React hook that returns transformed state from an extensible.

This is the first element of the tuple returned by `createExtensible`.
Use this inside React components.

#### Type Parameters

##### TOptions

`TOptions`

Options passed to the hook

##### TState

`TState`

The state shape that flows through transformers

#### Parameters

##### options

`TOptions`

#### Returns

`TState`

***

### ExtensionState

> **ExtensionState**\<`E`\> = `E` *extends* [`ExtensionPoint`](#extensionpoint)\<infer T\> ? `T` : `never`

Defined in: [packages/ui/src/extension.tsx:205](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L205)

Type helper to extract the state type from an extension point.

#### Type Parameters

##### E

`E`

#### Example

```typescript
type State = ExtensionState<typeof addStringModes>;
// Infers the state type from the extension point
```

## Functions

### createExtensible()

> **createExtensible**\<`TOptions`, `TState`\>(`config`): \[[`ExtensibleHook`](#extensiblehook)\<`TOptions`, `TState`\>, [`Extensible`](#extensible)\<`TState`\>\]

Defined in: [packages/ui/src/extension.tsx:399](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L399)

Create an extensible hook with ergonomic extension API.

This is the primary way for plugin authors to define extension points.
It wraps `defineExtension` with:

- A React hook for use in components
- An `extend()` method that handles deep merging automatically
- No need to spread state in transformers

## Defining an Extension Point

```typescript
export interface MyFeatureState {
  items: string[];
  component?: ComponentType<any>;
}

export const [useMyFeature, myFeature] = createExtensible<
  { formId: string },
  MyFeatureState
>({
  id: 'myPlugin.myFeature',
  summary: 'Customize my feature',
  initial: (opts) => ({
    items: ['default'],
    component: undefined,
  }),
});
```

## Using in Components

```typescript
function MyComponent({ formId }) {
  const { items, component: Component } = useMyFeature({ formId });
  // ...
}
```

## Extending (from other plugins)

```typescript
// Simple partial - always applied
myFeature.extend({ items: ['custom'] });

// Transformer - conditional logic, but still no spreading
myFeature.extend(state => ({
  component: state.mode === 'custom' ? CustomComponent : state.component,
}));
```

#### Type Parameters

##### TOptions

`TOptions`

Options passed to the hook

##### TState

`TState` *extends* `object`

The state shape (must be an object)

#### Parameters

##### config

[`ExtensibleConfig`](#extensibleconfig)\<`TOptions`, `TState`\>

Configuration including id, summary, and initial state factory

#### Returns

\[[`ExtensibleHook`](#extensiblehook)\<`TOptions`, `TState`\>, [`Extensible`](#extensible)\<`TState`\>\]

Tuple of [hook, extension] - hook for components, extension for registration

***

### defineExtension()

> **defineExtension**\<`T`\>(`config`): [`ExtensionPoint`](#extensionpoint)\<`T`\>

Defined in: [packages/ui/src/extension.tsx:180](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/extension.tsx#L180)

Define a new extension point.

Extension points allow plugins to expose hooks that other plugins
or user code can extend. The pattern is simple: transformers are
functions `(T) => T` that receive state and return (possibly modified) state.

#### Type Parameters

##### T

`T`

The state type that flows through the extension

#### Parameters

##### config

[`ExtensionPointConfig`](#extensionpointconfig)

Configuration for the extension point

#### Returns

[`ExtensionPoint`](#extensionpoint)\<`T`\>

A new extension point

#### Example

```typescript
// Define the state shape
export interface MyExtensionState {
  options: string[];
  selectedOption?: string;
}

// Create the extension point
export const myExtension = defineExtension<MyExtensionState>({
  id: 'myPlugin.myExtension',
  summary: 'Customize available options',
});

// Use it in your component
const state = myExtension.transform({
  options: ['default'],
  selectedOption: undefined,
});

// Others can extend it
myExtension.extend(state => ({
  ...state,
  options: [...state.options, 'custom'],
}));
```
