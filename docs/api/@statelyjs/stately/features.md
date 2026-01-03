# features

Optional feature plugins that extend Stately's capabilities.

This module provides opt-in features that enhance the Stately UI with
additional functionality. Features are implemented as plugins that can
be selectively enabled based on your application's needs.

## Example

```tsx
import { codemirror } from '@statelyjs/stately/features';

// Enable CodeMirror for syntax-highlighted string editing
codemirror.enable();

// Or with configuration
codemirror.enable({
  mode: { label: 'Source Code' },
  modeGroup: 'Advanced Editing',
});

// Access the component directly
function QueryEditor() {
  const CodeMirror = codemirror.useComponent();
  // ...
}
```

## References

### codemirror

Re-exports [codemirror](features/codemirror/plugin.md#codemirror)

***

### CodemirrorPluginOptions

Re-exports [CodemirrorPluginOptions](features/codemirror/plugin.md#codemirrorpluginoptions)

***

### defaultCodemirrorStringMode

Re-exports [defaultCodemirrorStringMode](features/codemirror/plugin.md#defaultcodemirrorstringmode)
