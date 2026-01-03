# core/extensions/add-string-modes

Extension Point: addStringModes

Allows plugins to add custom input modes to string primitive fields.

## Context

- **Node Type**: Primitive (string)
- **Mode**: Edit
- **Location**: The mode dropdown in string input fields

## What You Can Do

- Add new input modes (like 'upload', 'code', 'markdown')
- Provide a custom component that renders when your mode is selected
- Group your modes under a labeled section in the dropdown

## Example

```typescript
import { stringModes } from '@statelyjs/stately/core/extensions';

// Extend with partial - no need to spread state
stringModes.extend(state => ({
  component: state.modeState.mode === 'code' ? CodeEditor : state.component,
  modeState: {
    mode: state.modeState.mode,
    modeGroups: [...state.modeState.modeGroups, myModeGroup],
  },
}));
```

## Interfaces

### StringEditState

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:97](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L97)

State that flows through the stringModes extension.

Transformers receive this state and return a partial to be merged.

#### Extends

- `Omit`\<[`StringModeOptions`](#stringmodeoptions), `"mode"`\>

#### Properties

##### component?

> `optional` **component**: `ComponentType`\<[`StringModeComponentProps`](#stringmodecomponentprops)\>

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:102](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L102)

Custom component to render (set when your mode is active)

##### formId

> **formId**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:78](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L78)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`formId`](#formid-1)

##### modeState

> **modeState**: [`StringModeState`](#stringmodestate)

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:99](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L99)

String mode state

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L80)

###### Parameters

###### value

`string` | `number` | `null` | `undefined`

###### Returns

`void`

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`onChange`](#onchange-1)

##### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L81)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`placeholder`](#placeholder-1)

##### value

> **value**: `string` \| `number` \| `null` \| `undefined`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L79)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`value`](#value-2)

***

### StringMode

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:43](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L43)

Configuration for a single input mode option.

#### Properties

##### description

> **description**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:51](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L51)

Brief description shown in the dropdown

##### icon

> **icon**: `ComponentType`\<`any`\>

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:49](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L49)

Icon component shown in the dropdown and trigger

##### label

> **label**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:47](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L47)

Display label in the dropdown

##### value

> **value**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:45](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L45)

Unique value for this mode

***

### StringModeComponentProps

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:77](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L77)

Props passed to custom mode components.

#### Extended by

- [`StringModeOptions`](#stringmodeoptions)

#### Properties

##### formId

> **formId**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:78](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L78)

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L80)

###### Parameters

###### value

`string` | `number` | `null` | `undefined`

###### Returns

`void`

##### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L81)

##### value

> **value**: `string` \| `number` \| `null` \| `undefined`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L79)

***

### StringModeGroup

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:57](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L57)

A group of related modes shown together in the dropdown.

#### Properties

##### modes

> **modes**: [`StringMode`](#stringmode)[]

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:61](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L61)

Modes in this group

##### name

> **name**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:59](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L59)

Group label shown as a section header

***

### StringModeOptions

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:87](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L87)

Options passed to the useStringModes hook.

#### Extends

- [`StringModeComponentProps`](#stringmodecomponentprops)

#### Properties

##### formId

> **formId**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:78](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L78)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`formId`](#formid-1)

##### mode

> **mode**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L89)

Currently selected mode

##### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L80)

###### Parameters

###### value

`string` | `number` | `null` | `undefined`

###### Returns

`void`

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`onChange`](#onchange-1)

##### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L81)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`placeholder`](#placeholder-1)

##### value

> **value**: `string` \| `number` \| `null` \| `undefined`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L79)

###### Inherited from

[`StringModeComponentProps`](#stringmodecomponentprops).[`value`](#value-2)

***

### StringModeState

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:67](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L67)

State of components currently active mode and current mode groups

#### Properties

##### mode

> **mode**: `string`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:69](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L69)

Currently selected mode

##### modeGroups

> **modeGroups**: [`StringModeGroup`](#stringmodegroup)[]

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:71](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L71)

All available mode groups (additive - add yours to this array)

## Variables

### CORE\_STRING\_MODE\_GROUP

> `const` **CORE\_STRING\_MODE\_GROUP**: `"Text Entry"` = `'Text Entry'`

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:108](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L108)

Core string mode group

***

### CORE\_STRING\_MODES

> `const` **CORE\_STRING\_MODES**: [`StringModeGroup`](#stringmodegroup)

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:115](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L115)

Core string input modes available by default.

These are always included. Plugins add additional modes via `stringModes.extend()`.

***

### stringModes

> **stringModes**: [`Extensible`](../../../ui/extension.md#extensible)\<[`StringEditState`](#stringeditstate)\>

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:162](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L162)

***

### useStringModes

> **useStringModes**: [`ExtensibleHook`](../../../ui/extension.md#extensiblehook)\<[`StringModeOptions`](#stringmodeoptions), [`StringEditState`](#stringeditstate)\>

Defined in: [packages/stately/src/core/extensions/add-string-modes.ts:162](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/extensions/add-string-modes.ts#L162)
