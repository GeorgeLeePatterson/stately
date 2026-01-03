# features/codemirror/plugin

CodeMirror Plugin

Enables CodeMirror as a string input mode in Stately forms. This plugin
provides syntax-highlighted code editing for string fields.

## Usage

```typescript
import { codemirror } from '@statelyjs/stately/plugins';

// Enable with defaults
codemirror.enable();

// Or with configuration
codemirror.enable({
  themes: { includeDefaults: true },
  languages: ['yaml', 'json', 'bash'],
  mode: { label: 'Source Code' },
});
```

## Peer Dependencies

You must install CodeMirror packages in your project:

```bash
pnpm add @uiw/react-codemirror @uiw/codemirror-extensions-basic-setup @uiw/codemirror-extensions-langs
```

For themes, install the theme packages you want:

```bash
pnpm add @uiw/codemirror-theme-github  # Required (default theme)
pnpm add @uiw/codemirror-theme-vscode @uiw/codemirror-theme-gruvbox-dark  # Optional
```

## Direct Component Access

For components that need CodeMirror directly (not through string field modes):

```typescript
import { codemirror } from '@statelyjs/stately/plugins';

function MyEditor() {
  const CodeMirror = codemirror.useComponent();
  if (!CodeMirror) return <div>Enable codemirror first</div>;
  return <CodeMirror value={value} onChange={onChange} />;
}
```

## Interfaces

### CodeMirrorExtras

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:110](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L110)

Extras provided by the CodeMirror plugin.

#### Properties

##### ToggledEditor

> **ToggledEditor**: `ComponentType`\<`CodemirrorEditorToggleProps`\>

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:111](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L111)

***

### CodemirrorPluginOptions

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L80)

Configuration options for the CodeMirror plugin.

#### Properties

##### codemirrorProps?

> `optional` **codemirrorProps**: `Partial`\<`CodemirrorEditorBaseProps`\>

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:84](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L84)

Override props for the CodeMirror editor component.

##### editorWrapperProps?

> `optional` **editorWrapperProps**: [`EditorWrapperProps`](../../../ui/components.md#editorwrapperprops)

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:89](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L89)

Provide props for the editor wrapping component.

##### mode?

> `optional` **mode**: `Partial`\<[`StringMode`](../../core/extensions/add-string-modes.md#stringmode)\>

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:96](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L96)

Customize or override how the mode appears in the string field dropdown.

###### Default

[defaultCodemirrorStringMode](#defaultcodemirrorstringmode)

##### modeGroup?

> `optional` **modeGroup**: `string`

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:104](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L104)

Set a custom mode group for the editor. If any existing mode groups are provided,
the editor will appear in that mode group's list.

###### Default

```ts
'Text Entry'
```

## Variables

### codemirror

> `const` **codemirror**: [`FeaturePlugin`](../../../ui/feature-plugin.md#featureplugin)\<[`CodemirrorPluginOptions`](#codemirrorpluginoptions), `ReactCodeMirrorProps`, [`CodeMirrorExtras`](#codemirrorextras)\>

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:143](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L143)

CodeMirror feature plugin.

Provides syntax-highlighted code editing for string fields.

#### Examples

```typescript
import { codemirror } from '@statelyjs/stately/plugins';

// Enable at app startup
codemirror.enable();
```

```typescript
codemirror.enable({
  mode: { label: 'Source Code' },
  modeGroup: 'Advanced Editing',
});
```

```typescript
function QueryEditor() {
  const CodeMirror = codemirror.useComponent();
  // ...
}
```

***

### defaultCodemirrorStringMode

> `const` **defaultCodemirrorStringMode**: [`StringMode`](../../core/extensions/add-string-modes.md#stringmode)

Defined in: [packages/stately/src/features/codemirror/plugin.tsx:70](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/features/codemirror/plugin.tsx#L70)

Default string mode configuration
