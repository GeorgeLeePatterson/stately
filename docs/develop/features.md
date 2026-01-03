---
title: Feature Plugins
description: Creating user-facing opt-in features
---

# Feature Plugins

Feature plugins provide a user-friendly facade for enabling optional features that extend Stately's functionality. They wrap extension points with a simple `.enable()` API and handle lazy loading of heavy dependencies.

## When to Use Feature Plugins

Use feature plugins when you want to:

- Provide optional functionality that users explicitly opt into
- Lazy load heavy dependencies (like CodeMirror, Monaco, etc.)
- Expose a simple API: `myFeature.enable()`
- Build on top of [extension points](./extensions.md)

## Creating a Feature Plugin

Use `createFeaturePlugin` from `@statelyjs/ui/feature-plugin`:

```typescript
import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
import { stringModes } from '@statelyjs/stately/core/extensions/add-string-modes';

export interface MyEditorOptions {
  theme?: 'light' | 'dark';
  language?: string;
}

export const myEditor = createFeaturePlugin<MyEditorOptions, EditorComponentProps>({
  id: 'myEditor',

  // Lazy load the heavy component
  component: () => import('./MyHeavyEditor'),

  // Default options
  defaults: {
    theme: 'light',
    language: 'text',
  },

  // Setup runs once on .enable()
  setup: (ctx, options) => {
    // Register with extension points
    stringModes.extend(state => ({
      component: state.modeState.mode === 'code' ? ctx.Component : state.component,
      modeState: {
        mode: state.modeState.mode,
        modeGroups: [...state.modeState.modeGroups, myModeGroup],
      },
    }));
  },
});
```

## Configuration Options

### `id`

Unique identifier for the plugin:

```typescript
id: 'myEditor',
```

### `component`

Dynamic import for lazy loading. Only loaded when the plugin is enabled and rendered:

```typescript
component: () => import('@my-org/heavy-editor'),
```

### `defaults`

Default options applied when `.enable()` is called:

```typescript
defaults: {
  theme: 'light',
  language: 'text',
},
```

### `setup`

Called once when `.enable()` is invoked. Use this to register extensions:

```typescript
setup: (ctx, options) => {
  // ctx.Component is the lazy-wrapped component
  // options are the merged defaults + user options
  
  stringModes.extend(state => ({
    component: state.modeState.mode === 'myMode' ? ctx.Component : state.component,
  }));
},
```

### `defaultExtras`

Additional properties to expose on the plugin object. Combined with the return value from `setup`:

```typescript
defaultExtras: {
  ToggledEditor: MyToggledEditorComponent,
},
```

## User API

### Enabling the Plugin

Users call `.enable()` at application startup:

```typescript
import { myEditor } from '@my-org/my-editor';

// Enable with defaults
myEditor.enable();

// Or with options
myEditor.enable({
  theme: 'dark',
  language: 'sql',
});
```

### Checking Status

```typescript
if (myEditor.isEnabled()) {
  // Plugin is ready
}
```

### Accessing the Component

```typescript
function MyComponent() {
  const EditorComponent = myEditor.lazyComponent;

  if (!EditorComponent) {
    return <div>Enable myEditor to use this feature</div>;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <EditorComponent value={value} onChange={onChange} />
    </Suspense>
  );
}
```

### Using FeatureComponent Helper

For convenience, use the `FeatureComponent` wrapper:

```typescript
import { FeatureComponent } from '@statelyjs/ui/feature-plugin';

<FeatureComponent
  plugin={myEditor}
  props={{ value, onChange }}
  fallback={<Spinner />}
  notEnabled={<div>Enable myEditor first</div>}
/>
```

### Accessing Options and Extras

```typescript
// Get the options passed to .enable()
const options = myEditor.getOptions();

// Access extras defined by the plugin
const { ToggledEditor } = myEditor.extras;
```

## Real-World Example: CodeMirror

The `codemirror` feature plugin in `@statelyjs/stately/features` provides syntax-highlighted code editing:

### Plugin Definition

```typescript
// packages/stately/src/features/codemirror/plugin.tsx
import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
import { stringModes, CORE_STRING_MODE_GROUP } from '@/core/extensions/add-string-modes';

export interface CodemirrorPluginOptions {
  mode?: Partial<StringMode>;
  modeGroup?: string;
  codemirrorProps?: Partial<CodemirrorEditorBaseProps>;
}

export const codemirror = createFeaturePlugin<
  CodemirrorPluginOptions,
  ReactCodeMirrorProps,
  CodeMirrorExtras
>({
  id: 'codemirror',
  
  // Lazy load CodeMirror (it's heavy!)
  component: () => import('@uiw/react-codemirror'),
  
  defaults: {
    modeGroup: CORE_STRING_MODE_GROUP,
  },
  
  defaultExtras: {
    ToggledEditor: CodemirrorEditorToggle,
  },

  setup: (ctx, options) => {
    const stringMode: StringMode = {
      value: 'code',
      label: 'Code',
      icon: Code,
      description: 'Syntax highlighted',
      ...options?.mode,
    };

    // Extend string modes to add "Code" option
    stringModes.extend(state => ({
      component: state.modeState.mode === stringMode.value 
        ? CodemirrorComponent 
        : state.component,
      modeState: {
        mode: state.modeState.mode,
        modeGroups: addModeToGroups(state.modeState.modeGroups, stringMode, options?.modeGroup),
      },
    }));

    return {
      ToggledEditor: (props) => (
        <CodemirrorEditorToggle {...options?.codemirrorProps} {...props} Codemirror={ctx.Component} />
      ),
    };
  },
});
```

### User Usage

```typescript
// At app startup
import { codemirror } from '@statelyjs/stately/features';

codemirror.enable({
  mode: { label: 'Source Code' },
});

// In a component - string fields now have a "Code" mode option
// Or use the component directly:
function QueryEditor() {
  const CodeMirror = codemirror.lazyComponent;
  // ...
}
```

## Returning Extras from Setup

The `setup` function can return an object that gets merged into `plugin.extras`:

```typescript
setup: (ctx, options) => {
  // ... register extensions ...

  // Return extras - these become accessible as plugin.extras
  return {
    ToggledEditor: (props) => <MyToggled {...options} {...props} />,
    formatCode: (code: string) => prettier.format(code),
  };
},
```

Users access extras via:

```typescript
const { ToggledEditor, formatCode } = myPlugin.extras;
```

## Best Practices

1. **Keep heavy deps lazy**: Use the `component` option to defer loading
2. **Provide good defaults**: Users should be able to call `.enable()` with no arguments
3. **Document peer dependencies**: If your plugin requires packages users must install, document them
4. **Use idempotent setup**: `.enable()` can be called multiple times safely (only first call runs setup)
5. **Build on extensions**: Feature plugins are most powerful when they extend existing extension points

## Relationship to Extensions

Feature plugins and extensions work together:

```
┌─────────────────────────────────────────────────────────┐
│                    User Code                            │
│  codemirror.enable({ theme: 'dark' })                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Feature Plugin (codemirror)                │
│  - Lazy loads @uiw/react-codemirror                     │
│  - Calls stringModes.extend() in setup                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Extension Point (stringModes)              │
│  - Defined by core plugin                               │
│  - Collects transformers from all extenders             │
│  - Applied when rendering string fields                 │
└─────────────────────────────────────────────────────────┘
```

## See Also

- [Extensions](./extensions.md) - Lower-level extension point API
- [Plugin Development](./plugins.md) - Full plugin development guide
- [Available Features](/guide/concepts/features.md) - User guide to built-in features
