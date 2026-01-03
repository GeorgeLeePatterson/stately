# feature-plugin

Feature Plugin System

Provides a user-friendly facade for enabling optional features that extend
Stately's functionality. Feature plugins wrap extension points with a simple
`.enable()` API and handle lazy loading of heavy dependencies.

For details on the lower level extension apis, refer to the ExtensionPoint interface.

## Remarks

## User-Facing Plugin API

Feature plugins sit above the extension system and provides:
- Simple `.enable()` API for users
- Lazy loading of heavy components
- Dependency management between plugins
- `lazyComponent` for consuming lazy components

## For Users

## Examples

```typescript
import { codemirror } from '@statelyjs/stately/plugins';

// Enable with defaults
codemirror.enable();

// Or with options
codemirror.enable({
  themes: ['github', 'vscode'],
  languages: ['json', 'yaml', 'sql'],
});
```

## For Plugin Authors

```typescript
import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
import { addStringModes } from './extensions';

export const myPlugin = createFeaturePlugin({
  id: 'myPlugin',
  component: () => import('./heavy-component'),
  setup: (ctx, options) => {
    addStringModes.extend(state => ({
      component: state.mode === 'custom' ? ctx.Component : state.component,
    }));
  },
});
```

## Interfaces

### FeatureComponentProps

Defined in: [packages/ui/src/feature-plugin.tsx:343](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L343)

**`Expand`**

Props for the FeatureComponent wrapper.

#### Type Parameters

##### TProps

`TProps` *extends* `JSX.IntrinsicAttributes`

#### Properties

##### fallback?

> `optional` **fallback**: `ReactNode`

Defined in: [packages/ui/src/feature-plugin.tsx:358](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L358)

Fallback to show while the component is loading.

###### Default

```ts
null
```

##### notEnabled?

> `optional` **notEnabled**: `ReactNode`

Defined in: [packages/ui/src/feature-plugin.tsx:364](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L364)

Content to show if the plugin is not enabled.

###### Default

```ts
null
```

##### plugin

> **plugin**: [`FeaturePlugin`](#featureplugin)\<`any`, `TProps`\>

Defined in: [packages/ui/src/feature-plugin.tsx:347](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L347)

The feature plugin to render the component from.

##### props

> **props**: `TProps`

Defined in: [packages/ui/src/feature-plugin.tsx:352](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L352)

Props to pass to the lazy-loaded component.

***

### FeaturePlugin

Defined in: [packages/ui/src/feature-plugin.tsx:147](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L147)

A feature plugin instance with `.enable()`, `.lazyComponent`, and other APIs.

#### Type Parameters

##### TOptions

`TOptions`

Options accepted by `.enable()`

##### TComponentProps

`TComponentProps`

Props type for the lazy-loaded component

##### TExtras

`TExtras` *extends* `object` = `never`

Extras object, initialized via `FeaturePluginConfig.defaultExtras` or `.setup()`.

#### Properties

##### extras

> **extras**: `TExtras`

Defined in: [packages/ui/src/feature-plugin.tsx:211](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L211)

Get the extras from `FeaturePluginConfig.defaultExtras` or `.setup()`.
Returns undefined if not enabled.

##### id

> `readonly` **id**: `string`

Defined in: [packages/ui/src/feature-plugin.tsx:151](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L151)

Unique identifier for this plugin.

##### lazyComponent

> **lazyComponent**: `LazyExoticComponent`\<`ComponentType`\<`TComponentProps`\>\> \| `null`

Defined in: [packages/ui/src/feature-plugin.tsx:199](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L199)

Getter to access the lazy-loaded component.

Returns `null` if the plugin hasn't been enabled.
The component is wrapped with `React.lazy()` for automatic code splitting.

###### Returns

The lazy component or null if not enabled

###### Example

```typescript
function MyEditor(props) {
  const CodeMirror = codemirror.lazyComponent;

  if (!CodeMirror) {
    return <div>CodeMirror not enabled</div>;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <CodeMirror {...props} />
    </Suspense>
  );
}
```

#### Methods

##### enable()

> **enable**(`options?`): `void`

Defined in: [packages/ui/src/feature-plugin.tsx:167](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L167)

Enable the plugin with optional configuration.

This should be called once at application startup, before rendering.
Calling multiple times is safe (subsequent calls are no-ops).

###### Parameters

###### options?

`TOptions`

Plugin-specific configuration options

###### Returns

`void`

###### Example

```typescript
// In your app entry point
codemirror.enable({ themes: ['github'] });
```

##### getOptions()

> **getOptions**(): `TOptions` \| `undefined`

Defined in: [packages/ui/src/feature-plugin.tsx:205](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L205)

Get the options that were passed to `.enable()`.
Returns undefined if not enabled.

###### Returns

`TOptions` \| `undefined`

##### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [packages/ui/src/feature-plugin.tsx:172](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L172)

Check if the plugin has been enabled.

###### Returns

`boolean`

***

### FeaturePluginConfig

Defined in: [packages/ui/src/feature-plugin.tsx:84](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L84)

Configuration for creating a feature plugin.

#### Type Parameters

##### TOptions

`TOptions`

Options accepted by `.enable()`

##### TComponentProps

`TComponentProps`

Props type for the lazy-loaded component

##### TExtras

`TExtras` *extends* `object` = `never`

Additional properties to expose on the plugin object

#### Properties

##### component()?

> `optional` **component**: () => `Promise`\<\{ `default`: `ComponentType`\<`TComponentProps`\>; \}\>

Defined in: [packages/ui/src/feature-plugin.tsx:102](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L102)

Dynamic import for the heavy component.
Only loaded when the plugin is enabled and the component is rendered.

###### Returns

`Promise`\<\{ `default`: `ComponentType`\<`TComponentProps`\>; \}\>

###### Example

```typescript
component: () => import('@uiw/react-codemirror'),
```

##### defaultExtras

> **defaultExtras**: `TExtras`

Defined in: [packages/ui/src/feature-plugin.tsx:137](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L137)

Default extras if `.enable()` is never called.

##### defaults?

> `optional` **defaults**: `Partial`\<`TOptions`\>

Defined in: [packages/ui/src/feature-plugin.tsx:132](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L132)

Default options applied when `.enable()` is called without arguments.

##### id

> **id**: `string`

Defined in: [packages/ui/src/feature-plugin.tsx:91](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L91)

Unique identifier for this plugin.

###### Examples

```ts
'codemirror'
```

```ts
'markdown-editor'
```

##### setup()

> **setup**: (`ctx`, `options`) => `TExtras` \| `undefined`

Defined in: [packages/ui/src/feature-plugin.tsx:127](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L127)

Setup function called once when `.enable()` is invoked.
Use this to register extensions, configure behavior, etc.

Optionally return an object with additional properties (extras) that will
be spread onto the plugin object, making them accessible as `plugin.extraName`.

###### Parameters

###### ctx

[`FeaturePluginContext`](#featureplugincontext)\<`TComponentProps`\>

Plugin context with lazy component and state

###### options

`TOptions`

Options passed to `.enable()`

###### Returns

`TExtras` \| `undefined`

Optional extras object to merge into the plugin

###### Example

```typescript
setup: (ctx, options) => {
  // Register extensions...

  // Return extras that become plugin properties
  return {
    ToggledEditor: (props) => <MyToggled {...options} {...props} />,
  };
},
```

***

### FeaturePluginContext

Defined in: [packages/ui/src/feature-plugin.tsx:64](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L64)

Context passed to the setup function during plugin initialization.

#### Type Parameters

##### TComponentProps

`TComponentProps`

The component type that will be lazy loaded

#### Properties

##### Component

> **Component**: `LazyExoticComponent`\<`ComponentType`\<`TComponentProps`\>\> \| `null`

Defined in: [packages/ui/src/feature-plugin.tsx:69](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L69)

The lazy-wrapped component, ready for use in React.
This is `null` until `.enable()` is called.

##### isEnabled

> **isEnabled**: `boolean`

Defined in: [packages/ui/src/feature-plugin.tsx:74](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L74)

Whether the plugin has been enabled.

## Functions

### createFeaturePlugin()

> **createFeaturePlugin**\<`TOptions`, `TComponentProps`, `TExtras`\>(`config`): [`FeaturePlugin`](#featureplugin)\<`TOptions`, `TComponentProps`, `TExtras`\>

Defined in: [packages/ui/src/feature-plugin.tsx:277](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L277)

#### Type Parameters

##### TOptions

`TOptions` = `void`

##### TComponentProps

`TComponentProps` = `unknown`

##### TExtras

`TExtras` *extends* `object` = `never`

#### Parameters

##### config

[`FeaturePluginConfig`](#featurepluginconfig)\<`TOptions`, `TComponentProps`, `TExtras`\>

#### Returns

[`FeaturePlugin`](#featureplugin)\<`TOptions`, `TComponentProps`, `TExtras`\>

***

### FeatureComponent()

> **FeatureComponent**\<`TProps`\>(`__namedParameters`): `ReactNode`

Defined in: [packages/ui/src/feature-plugin.tsx:380](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/feature-plugin.tsx#L380)

Wrapper component that handles Suspense and enabled checks for feature plugins.

#### Type Parameters

##### TProps

`TProps` *extends* `IntrinsicAttributes`

#### Parameters

##### \_\_namedParameters

[`FeatureComponentProps`](#featurecomponentprops)\<`TProps`\>

#### Returns

`ReactNode`

#### Example

```typescript
<FeatureComponent
  plugin={codemirror}
  props={{ value, onChange }}
  fallback={<Spinner />}
  notEnabled={<div>Enable CodeMirror to use this feature</div>}
/>
```
