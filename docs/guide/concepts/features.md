---
title: Features
description: Optional features you can enable in Stately
---

# Features

Stately provides optional features that you can enable to extend functionality. Features are opt-in, allowing you to keep your bundle size small by only including what you need.

## Enabling Features

Features are enabled at application startup by calling `.enable()`:

```typescript
import { codemirror } from '@statelyjs/stately/features';

// Enable before rendering your app
codemirror.enable();
```

## Available Features

### CodeMirror

Adds syntax-highlighted code editing to string fields.

**What it provides:**
- A "Code" mode option in string field dropdowns
- Syntax highlighting for various languages
- Theme support

**Installation:**

First, install the required peer dependencies:

```bash
pnpm add @uiw/react-codemirror @uiw/codemirror-extensions-basic-setup @uiw/codemirror-extensions-langs
```

For themes:

```bash
pnpm add @uiw/codemirror-theme-github  # Required (default theme)
pnpm add @uiw/codemirror-theme-vscode @uiw/codemirror-theme-gruvbox-dark  # Optional
```

**Usage:**

```typescript
import { codemirror } from '@statelyjs/stately/features';

// Enable with defaults
codemirror.enable();

// Or with configuration
codemirror.enable({
  mode: { label: 'Source Code' },  // Customize the dropdown label
  modeGroup: 'Advanced Editing',   // Which group in the dropdown
});
```

Once enabled, string fields in your forms will have a "Code" option in the input mode dropdown, providing syntax-highlighted editing.

**Direct component access:**

For components that need the CodeMirror editor directly:

```typescript
import { codemirror } from '@statelyjs/stately/features';

function QueryEditor({ value, onChange }) {
  const CodeMirror = codemirror.lazyComponent;

  if (!CodeMirror) {
    return <div>Enable codemirror first</div>;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <CodeMirror value={value} onChange={onChange} />
    </Suspense>
  );
}
```

**Toggled editor:**

The codemirror feature also provides a `ToggledEditor` component that can switch between plain text and code mode:

```typescript
const { ToggledEditor } = codemirror.extras;

<ToggledEditor
  content={value}
  onContent={setValue}
  placeholder="Enter code..."
/>
```

## How Features Work

Features use lazy loading to keep your initial bundle small. The heavy dependencies (like CodeMirror) are only loaded when the feature is actually rendered.

```
┌─────────────────────────────────────────┐
│         Your App Bundle (small)         │
│  - codemirror.enable() registers hook   │
│  - No CodeMirror code loaded yet        │
└─────────────────────────────────────────┘
                    ↓ User selects "Code" mode
┌─────────────────────────────────────────┐
│      CodeMirror Chunk (lazy loaded)     │
│  - @uiw/react-codemirror                │
│  - Language extensions                  │
│  - Themes                               │
└─────────────────────────────────────────┘
```

## Creating Custom Features

If you're building a plugin that provides optional heavy functionality, you can create your own feature plugins. See the [Feature Plugins](/develop/features) development guide.

## See Also

- [Plugin Concepts](/guide/concepts/plugins) - Understanding the plugin system
- [Feature Plugins](/develop/features) - Creating custom features (for developers)
