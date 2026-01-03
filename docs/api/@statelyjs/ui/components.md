# components

## Interfaces

### BaseEditorProps

Defined in: [packages/ui/src/components/editor.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L17)

#### Properties

##### content?

> `optional` **content**: `string`

Defined in: [packages/ui/src/components/editor.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L19)

##### formId?

> `optional` **formId**: `string`

Defined in: [packages/ui/src/components/editor.tsx:18](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L18)

##### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/components/editor.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L22)

##### onContent()

> **onContent**: (`value`) => `void`

Defined in: [packages/ui/src/components/editor.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L20)

###### Parameters

###### value

`string`

###### Returns

`void`

##### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/components/editor.tsx:21](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L21)

## Type Aliases

### EditorWrapperProps

> **EditorWrapperProps** = `React.PropsWithChildren`\<\{ `inputGroupProps?`: `React.ComponentProps`\<*typeof* [`InputGroup`](components/base/input-group.md#inputgroup)\>; `isLoading?`: `boolean`; `saveButton?`: `React.ReactNode`; `toggleButton?`: `React.ReactNode`; \}\>

Defined in: [packages/ui/src/components/editor.tsx:25](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L25)

## Variables

### modeColors

> `const` **modeColors**: `object`

Defined in: [packages/ui/src/components/note.tsx:4](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/note.tsx#L4)

#### Type Declaration

##### error

> **error**: `string` = `''`

##### info

> **info**: `string` = `'text-blue-600'`

##### note

> **note**: `string` = `''`

##### success

> **success**: `string` = `'text-green-600'`

##### warning

> **warning**: `string` = `'text-orange-600'`

***

### modeIcons

> `const` **modeIcons**: `object`

Defined in: [packages/ui/src/components/note.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/note.tsx#L12)

#### Type Declaration

##### error

> **error**: `ForwardRefExoticComponent`\<`Omit`\<`LucideProps`, `"ref"`\> & `RefAttributes`\<`SVGSVGElement`\>\> = `AlertCircle`

##### info

> **info**: `ForwardRefExoticComponent`\<`Omit`\<`LucideProps`, `"ref"`\> & `RefAttributes`\<`SVGSVGElement`\>\> = `Info`

##### note

> **note**: `ForwardRefExoticComponent`\<`Omit`\<`LucideProps`, `"ref"`\> & `RefAttributes`\<`SVGSVGElement`\>\> = `Info`

##### success

> **success**: `ForwardRefExoticComponent`\<`Omit`\<`LucideProps`, `"ref"`\> & `RefAttributes`\<`SVGSVGElement`\>\> = `CheckCircle`

##### warning

> **warning**: `ForwardRefExoticComponent`\<`Omit`\<`LucideProps`, `"ref"`\> & `RefAttributes`\<`SVGSVGElement`\>\> = `MessageCircleWarning`

## Functions

### ArrayIndex()

> **ArrayIndex**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/array-index.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/array-index.tsx#L3)

#### Parameters

##### \_\_namedParameters

###### index

`number`

#### Returns

`Element`

***

### BaseEditor()

> **BaseEditor**(`props`): `Element`

Defined in: [packages/ui/src/components/editor.tsx:139](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L139)

Implementation of `TextEditor` with `EditorWrapper`

#### Parameters

##### props

[`BaseEditorProps`](#baseeditorprops) & `Omit`\<[`EditorWrapperProps`](#editorwrapperprops), `"children"`\>

BaseEditor props (see [BaseEditorProps](#baseeditorprops) & [EditorWrapperProps](#editorwrapperprops))

#### Returns

`Element`

JSX.Element

***

### CopyButton()

> **CopyButton**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/copy-button.tsx:5](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/copy-button.tsx#L5)

#### Parameters

##### \_\_namedParameters

###### value

`string`

#### Returns

`Element`

***

### DescriptionLabel()

> **DescriptionLabel**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/description-label.tsx:4](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/description-label.tsx#L4)

#### Parameters

##### \_\_namedParameters

`PropsWithChildren`\<`HTMLAttributes`\<`HTMLSpanElement`\>\>

#### Returns

`Element`

***

### EditorWrapper()

> **EditorWrapper**(`props`): `Element`

Defined in: [packages/ui/src/components/editor.tsx:65](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L65)

Wraps an editor with controls allowing for opening into a dialog.

#### Parameters

##### props

[`EditorWrapperProps`](#editorwrapperprops)

EditorWrapper props (see [EditorWrapperProps](#editorwrapperprops) & InputGroupProps)

#### Returns

`Element`

JSX.Element

***

### Explain()

> **Explain**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/explain.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/explain.tsx#L3)

#### Parameters

##### \_\_namedParameters

###### children

`ReactElement`

###### content

`ReactNode`

#### Returns

`Element`

***

### FieldItem()

> **FieldItem**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/field.tsx:4](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/field.tsx#L4)

#### Parameters

##### \_\_namedParameters

`PropsWithChildren`\<`ClassAttributes`\<`HTMLDivElement`\> & `HTMLAttributes`\<`HTMLDivElement`\> & `object` & `VariantProps`\<(`props?`) => `string`\>\>

#### Returns

`Element`

***

### GlowingSave()

> **GlowingSave**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/glowing-save.tsx:25](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/glowing-save.tsx#L25)

#### Parameters

##### \_\_namedParameters

###### disabledExplain?

`string`

###### isDisabled?

`boolean`

###### isLoading?

`boolean`

###### label?

`string`

###### mode?

`"edit"` \| `"view"` = `'view'`

###### onCancel?

() => `void`

###### onSave

() => `void`

###### size?

`"default"` \| `"xs"` \| `"sm"` \| `"lg"` \| `"icon"` \| `"icon-xs"` \| `"icon-sm"` \| `"icon-lg"` \| `null`

#### Returns

`Element`

***

### Note()

> **Note**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/note.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/note.tsx#L20)

#### Parameters

##### \_\_namedParameters

`object` & `ClassAttributes`\<`HTMLDivElement`\> & `HTMLAttributes`\<`HTMLDivElement`\> & `VariantProps`\<(`props?`) => `string`\>

#### Returns

`Element`

***

### NotSet()

> **NotSet**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/not-set.tsx:1](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/not-set.tsx#L1)

#### Parameters

##### \_\_namedParameters

###### override?

`ReactNode`

#### Returns

`Element`

***

### SimpleLabel()

> **SimpleLabel**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/components/simple-label.tsx:3](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/simple-label.tsx#L3)

#### Parameters

##### \_\_namedParameters

`PropsWithChildren`\<`HTMLAttributes`\<`HTMLSpanElement`\>\>

#### Returns

`Element`

***

### TextEditor()

> **TextEditor**(`props`): `Element`

Defined in: [packages/ui/src/components/editor.tsx:38](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/ui/src/components/editor.tsx#L38)

A simple, styled textarea component for editing multiline text

#### Parameters

##### props

[`BaseEditorProps`](#baseeditorprops) & `Omit`\<`ClassAttributes`\<`HTMLTextAreaElement`\> & `TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `"value"` \| `"onChange"` \| `"placeholder"`\>

TextEditor props (see [BaseEditorProps](#baseeditorprops))

#### Returns

`Element`

JSX.Element
