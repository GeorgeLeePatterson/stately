# form

Base form components for rendering and editing schema-driven data.

This module provides low-level form primitives that render fields based on
schema node types. These components handle the recursive rendering of complex
nested structures including objects, arrays, unions, and primitives.

## Example

```tsx
import { BaseForm } from '@statelyjs/stately/form';

// Render a read-only view of JSON data
<BaseForm.JsonView data={entity} schema={schema} />

// Render an editable form
<BaseForm.JsonEdit
  data={entity}
  schema={schema}
  onChange={handleChange}
/>
```

## Interfaces

### FormActionsProps

Defined in: [packages/stately/src/form/form-actions.tsx:6](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L6)

#### Properties

##### isDirty?

> `optional` **isDirty**: `boolean`

Defined in: [packages/stately/src/form/form-actions.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L7)

##### isDisabled?

> `optional` **isDisabled**: `boolean`

Defined in: [packages/stately/src/form/form-actions.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L10)

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/stately/src/form/form-actions.tsx:9](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L9)

##### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/stately/src/form/form-actions.tsx:8](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L8)

##### onCancel()

> **onCancel**: () => `void`

Defined in: [packages/stately/src/form/form-actions.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L12)

###### Returns

`void`

##### onSave()

> **onSave**: () => `void`

Defined in: [packages/stately/src/form/form-actions.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/form-actions.tsx#L11)

###### Returns

`void`

***

### JsonEditProps

Defined in: [packages/stately/src/form/json-edit.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-edit.tsx#L11)

#### Properties

##### label?

> `optional` **label**: `string`

Defined in: [packages/stately/src/form/json-edit.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-edit.tsx#L13)

##### onSave()

> **onSave**: (`value`) => `void`

Defined in: [packages/stately/src/form/json-edit.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-edit.tsx#L14)

###### Parameters

###### value

`any`

###### Returns

`void`

##### value

> **value**: `any`

Defined in: [packages/stately/src/form/json-edit.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-edit.tsx#L12)

***

### JsonViewProps

Defined in: [packages/stately/src/form/json-view.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-view.tsx#L10)

#### Properties

##### data

> **data**: `any`

Defined in: [packages/stately/src/form/json-view.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-view.tsx#L11)

##### isOpen?

> `optional` **isOpen**: `boolean`

Defined in: [packages/stately/src/form/json-view.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-view.tsx#L12)

##### setIsOpen()

> **setIsOpen**: (`open`) => `void`

Defined in: [packages/stately/src/form/json-view.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/json-view.tsx#L13)

###### Parameters

###### open

`boolean`

###### Returns

`void`

## Variables

### BaseForm

> `const` **BaseForm**: `object`

Defined in: [packages/stately/src/form/index.ts:36](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/form/index.ts#L36)

#### Type Declaration

##### FieldEdit()

> **FieldEdit**: \<`S`, `N`, `V`\>(`props`) => `Element`

###### Type Parameters

###### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

###### N

`N` *extends* [`BaseNode`](schema.md#basenode) = `S`\[`"plugin"`\]\[`"AnyNode"`\]

###### V

`V` = `unknown`

###### Parameters

###### props

[`FieldEditProps`](../ui/registry.md#fieldeditprops)\<`S`, `N`, `V`\>

###### Returns

`Element`

##### FieldView()

> **FieldView**: \<`S`, `N`, `V`\>(`props`) => `Element` \| `null`

###### Type Parameters

###### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

###### N

`N` *extends* [`BaseNode`](schema.md#basenode) = [`PluginNodeUnion`](schema.md#pluginnodeunion)\<`S`\>

###### V

`V` = `unknown`

###### Parameters

###### props

[`FieldViewProps`](../ui/registry.md#fieldviewprops)\<`S`, `N`, `V`\>

###### Returns

`Element` \| `null`

##### FormActions()

> **FormActions**: (`__namedParameters`) => `Element`

###### Parameters

###### \_\_namedParameters

[`FormActionsProps`](#formactionsprops)

###### Returns

`Element`

##### JsonEdit()

> **JsonEdit**: (`__namedParameters`) => `Element`

Component for editing entity configuration as raw JSON

###### Parameters

###### \_\_namedParameters

[`JsonEditProps`](#jsoneditprops) & `HTMLAttributes`\<`HTMLDivElement`\>

###### Returns

`Element`

##### JsonView()

> **JsonView**: (`__namedParameters`) => `Element`

###### Parameters

###### \_\_namedParameters

[`JsonViewProps`](#jsonviewprops)

###### Returns

`Element`
