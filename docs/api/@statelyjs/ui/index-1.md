# index

@statelyjs/ui - UI Infrastructure

Low-level UI infrastructure for Stately applications. This package provides
the foundational components, theming, plugin system, and runtime builder
that power Stately UIs.

## For Most Users

**Use `@statelyjs/stately` instead.** It provides `statelyUi()` which
includes the core plugin automatically:

```typescript
import { statelyUi, StatelyProvider, useStatelyUi } from '@statelyjs/stately';
```

## For Plugin Authors

Use this package directly when building UI plugins:

```typescript
import {
  createOperations,
  type DefineUiPlugin,
  type UiPluginFactory,
} from '@statelyjs/ui';
```

## Key Exports

- **`createStatelyUi`** - Low-level runtime builder (without core plugin)
- **`createUiPlugin`** - Create a UI plugin factory function that users will import
- **`createOperations`** - Create typed API operations from bindings
- **`DefineUiPlugin`** - Helper type for defining UI plugins
- **`ThemeProvider`** - Theme context provider

## Functions

### devAssert()

> **devAssert**(`condition`, `message`, `context?`): `asserts condition`

Defined in: [packages/ui/src/lib/assertions.ts:35](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/lib/assertions.ts#L35)

Assert a condition is true in development mode.

In development: throws an error with a detailed message and logs context.
In production: silently returns (does not throw or log).

Use this for internal library invariants that should never fail if the
library code is correct. E2E tests running in dev mode will catch violations.

#### Parameters

##### condition

`boolean`

The condition that must be true

##### message

`string`

Error message describing what went wrong

##### context?

`Record`\<`string`, `unknown`\>

Optional additional context for debugging

#### Returns

`asserts condition`

#### Example

```ts
devAssert(
  input.type === expectedType,
  `Entity type mismatch: expected "${expectedType}", got "${input.type}"`,
  { input, expectedType }
);
```

## References

### AllUiPlugins

Re-exports [AllUiPlugins](plugin.md#alluiplugins)

***

### AnyUiAugments

Re-exports [AnyUiAugments](plugin.md#anyuiaugments)

***

### AnyUiPlugin

Re-exports [AnyUiPlugin](plugin.md#anyuiplugin)

***

### camelCaseToKebabCase

Re-exports [camelCaseToKebabCase](utils.md#camelcasetokebabcase-2)

***

### cn

Re-exports [cn](lib/utils.md#cn)

***

### ComponentRegistry

Re-exports [ComponentRegistry](registry.md#componentregistry)

***

### createExtensible

Re-exports [createExtensible](extension.md#createextensible)

***

### createFeaturePlugin

Re-exports [createFeaturePlugin](feature-plugin.md#createfeatureplugin)

***

### createOperations

Re-exports [createOperations](api.md#createoperations)

***

### createStatelyUi

Re-exports [createStatelyUi](runtime.md#createstatelyui)

***

### createUiPlugin

Re-exports [createUiPlugin](plugin.md#createuiplugin)

***

### defaultStorageKey

Re-exports [defaultStorageKey](theme.md#defaultstoragekey)

***

### defaultThemeOption

Re-exports [defaultThemeOption](theme.md#defaultthemeoption)

***

### defaultUiOptions

Re-exports [defaultUiOptions](runtime.md#defaultuioptions)

***

### defineExtension

Re-exports [defineExtension](extension.md#defineextension)

***

### DefineOptions

Re-exports [DefineOptions](plugin.md#defineoptions)

***

### DefineRoutes

Re-exports [DefineRoutes](plugin.md#defineroutes)

***

### DefineUiPlugin

Re-exports [DefineUiPlugin](plugin.md#defineuiplugin)

***

### DefineUiUtils

Re-exports [DefineUiUtils](plugin.md#defineuiutils)

***

### devLog

Re-exports [devLog](lib/logging.md#devlog)

***

### devLogger

Re-exports [devLogger](lib/logging.md#devlogger)

***

### ExtendInput

Re-exports [ExtendInput](extension.md#extendinput)

***

### Extensible

Re-exports [Extensible](extension.md#extensible)

***

### ExtensibleConfig

Re-exports [ExtensibleConfig](extension.md#extensibleconfig)

***

### ExtensibleHook

Re-exports [ExtensibleHook](extension.md#extensiblehook)

***

### ExtensionPoint

Re-exports [ExtensionPoint](extension.md#extensionpoint)

***

### ExtensionPointConfig

Re-exports [ExtensionPointConfig](extension.md#extensionpointconfig)

***

### ExtensionState

Re-exports [ExtensionState](extension.md#extensionstate)

***

### FeatureComponent

Re-exports [FeatureComponent](feature-plugin.md#featurecomponent)

***

### FeatureComponentProps

Re-exports [FeatureComponentProps](feature-plugin.md#featurecomponentprops)

***

### FeaturePlugin

Re-exports [FeaturePlugin](feature-plugin.md#featureplugin)

***

### FeaturePluginConfig

Re-exports [FeaturePluginConfig](feature-plugin.md#featurepluginconfig)

***

### FeaturePluginContext

Re-exports [FeaturePluginContext](feature-plugin.md#featureplugincontext)

***

### FieldEditProps

Re-exports [FieldEditProps](registry.md#fieldeditprops)

***

### FieldViewProps

Re-exports [FieldViewProps](registry.md#fieldviewprops)

***

### generateFieldFormId

Re-exports [generateFieldFormId](utils.md#generatefieldformid)

***

### generateFieldLabel

Re-exports [generateFieldLabel](utils.md#generatefieldlabel-2)

***

### mergePathPrefixOptions

Re-exports [mergePathPrefixOptions](utils.md#mergepathprefixoptions-2)

***

### NodeTypeComponent

Re-exports [NodeTypeComponent](registry.md#nodetypecomponent)

***

### PluginFunction

Re-exports [PluginFunction](plugin.md#pluginfunction)

***

### PluginFunctionMap

Re-exports [PluginFunctionMap](plugin.md#pluginfunctionmap)

***

### PluginRuntime

Re-exports [PluginRuntime](plugin.md#pluginruntime)

***

### registry

Re-exports [registry](registry.md)

***

### RegistryKey

Re-exports [RegistryKey](registry.md#registrykey)

***

### RegistryMode

Re-exports [RegistryMode](registry.md#registrymode)

***

### RouteOption

Re-exports [RouteOption](runtime.md#routeoption)

***

### runtimeUtils

Re-exports [runtimeUtils](utils.md#runtimeutils)

***

### StatelyUiBuilder

Re-exports [StatelyUiBuilder](runtime.md#statelyuibuilder)

***

### StatelyUiConfiguration

Re-exports [StatelyUiConfiguration](runtime.md#statelyuiconfiguration)

***

### StatelyUiRuntime

Re-exports [StatelyUiRuntime](runtime.md#statelyuiruntime)

***

### stripLeading

Re-exports [stripLeading](utils.md#stripleading-2)

***

### stripTrailing

Re-exports [stripTrailing](utils.md#striptrailing-2)

***

### Theme

Re-exports [Theme](theme.md#theme)

***

### ThemeProvider

Re-exports [ThemeProvider](theme.md#themeprovider)

***

### ThemeProviderProps

Re-exports [ThemeProviderProps](theme.md#themeproviderprops)

***

### ThemeToggle

Re-exports [ThemeToggle](theme.md#themetoggle)

***

### toKebabCase

Re-exports [toKebabCase](utils.md#tokebabcase-1)

***

### toSpaceCase

Re-exports [toSpaceCase](utils.md#tospacecase-1)

***

### toTitleCase

Re-exports [toTitleCase](utils.md#totitlecase-1)

***

### TypedOperations

Re-exports [TypedOperations](api.md#typedoperations)

***

### UiNavigationOptions

Re-exports [UiNavigationOptions](runtime.md#uinavigationoptions)

***

### UiOptions

Re-exports [UiOptions](runtime.md#uioptions)

***

### UiPluginConfig

Re-exports [UiPluginConfig](plugin.md#uipluginconfig)

***

### UiPluginContext

Re-exports [UiPluginContext](plugin.md#uiplugincontext)

***

### UiPluginFactory

Re-exports [UiPluginFactory](plugin.md#uipluginfactory)

***

### UiPluginFactoryFn

Re-exports [UiPluginFactoryFn](plugin.md#uipluginfactoryfn)

***

### UiPluginResult

Re-exports [UiPluginResult](plugin.md#uipluginresult)

***

### UiPluginRuntime

Re-exports [UiPluginRuntime](runtime.md#uipluginruntime)

***

### UiRegistry

Re-exports [UiRegistry](registry.md#uiregistry)

***

### UiUtils

Re-exports [UiUtils](utils.md#uiutils)

***

### useTheme

Re-exports [useTheme](theme.md#usetheme)
