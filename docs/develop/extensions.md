---
title: Extensions
description: Creating extension points for plugin customization
---

# Extensions

Extensions provide a type-safe, composable way for plugins to allow customization of their behavior. An extension point is a named hook that accepts transformers - functions that receive state and return modified state.

## Core Concepts

- **Extension Point**: A named hook defined by a plugin (e.g., `stringModes`)
- **Transformer**: A function `(state) => state` that modifies state
- **Composition**: Multiple transformers chain together via `extend()`

## When to Use Extensions

Use extensions when you want to:

- Allow other plugins to modify your plugin's behavior
- Enable users to add custom modes, options, or components
- Create composable, additive customization points

## Defining an Extension Point

Plugin authors define extension points using `createExtensible` from `@statelyjs/ui`:

```typescript
import { createExtensible } from '@statelyjs/ui';

// 1. Define the state shape
export interface MyFeatureState {
  options: string[];
  selectedOption?: string;
  component?: ComponentType<any>;
}

// 2. Define options passed to the hook
export interface MyFeatureOptions {
  formId: string;
  currentOption: string;
}

// 3. Create the extensible hook and extension object
export const [useMyFeature, myFeature] = createExtensible<MyFeatureOptions, MyFeatureState>({
  id: 'myPlugin.myFeature',
  summary: 'Customize available options for my feature',
  initial: (options) => ({
    options: ['default', 'standard'],
    selectedOption: options.currentOption,
    component: undefined,
  }),
});
```

This returns a tuple:
- `useMyFeature` - A React hook for use in components
- `myFeature` - An extension object for registering transformers

## Using the Extension in Components

In your plugin's components, use the hook to get the transformed state:

```tsx
function MyFeatureComponent({ formId, currentOption }: MyFeatureOptions) {
  const { options, selectedOption, component: CustomComponent } = useMyFeature({
    formId,
    currentOption,
  });

  if (CustomComponent) {
    return <CustomComponent options={options} selected={selectedOption} />;
  }

  return (
    <select value={selectedOption}>
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  );
}
```

## Extending from Other Plugins

Other plugins (or user code) can extend the behavior:

```typescript
import { myFeature } from '@my-org/my-plugin';

// Simple partial - merged into state
myFeature.extend({
  options: ['custom', 'advanced'],
});

// Transformer function - for conditional logic
myFeature.extend(state => ({
  component: state.selectedOption === 'custom' ? CustomEditor : state.component,
  options: [...state.options, 'new-option'],
}));
```

Note: You never need to spread the full state - the framework handles deep merging automatically.

## Real-World Example: String Modes

The core plugin defines `stringModes`, an extension point that allows adding custom input modes to string fields:

### Extension Definition (in core)

```typescript
// packages/stately/src/core/extensions/add-string-modes.ts
import { createExtensible } from '@statelyjs/ui';

export interface StringMode {
  value: string;
  label: string;
  icon: ComponentType<any>;
  description: string;
}

export interface StringModeGroup {
  name: string;
  modes: StringMode[];
}

export interface StringEditState {
  modeState: {
    mode: string;
    modeGroups: StringModeGroup[];
  };
  component?: ComponentType<StringModeComponentProps>;
  // ... other fields
}

export const [useStringModes, stringModes] = createExtensible<StringModeOptions, StringEditState>({
  id: 'core.stringModes',
  summary: 'Add custom input modes to string fields',
  initial: (options) => ({
    modeState: { mode: options.mode, modeGroups: [CORE_STRING_MODES] },
    component: undefined,
    // ...
  }),
});
```

### Extension Usage (in files plugin)

The files plugin adds an "Upload" mode to string fields:

```typescript
// packages/files/src/plugin.tsx
import { stringModes } from '@statelyjs/stately/core/extensions/add-string-modes';
import { filesStringExtension } from './fields/edit/primitive-string';

// In plugin setup
stringModes.extend(filesStringExtension);
```

```typescript
// packages/files/src/fields/edit/primitive-string.tsx
export const UploadMode: StringMode = {
  value: 'upload',
  label: 'Upload',
  icon: Upload,
  description: 'Browse/upload files',
};

export const UploadModeGroup: StringModeGroup = {
  name: 'File Management',
  modes: [UploadMode],
};

export const filesStringExtension = (state: StringEditState): Partial<StringEditState> => ({
  component: state.modeState.mode === 'upload' ? RelativePathEdit : state.component,
  modeState: {
    mode: state.modeState.mode,
    modeGroups: [...state.modeState.modeGroups, UploadModeGroup],
  },
});
```

## Composition Order

Transformers compose in registration order. If Plugin A and Plugin B both extend the same point:

```typescript
// Plugin A (registered first)
myFeature.extend({ count: 1 });

// Plugin B (registered second)  
myFeature.extend(state => ({ count: state.count + 1 }));

// Result: initial { count: 0 } -> A: { count: 1 } -> B: { count: 2 }
```

## Lower-Level API: defineExtension

For advanced use cases, you can use the lower-level `defineExtension` API directly:

```typescript
import { defineExtension } from '@statelyjs/ui';

export const myExtension = defineExtension<MyState>({
  id: 'myPlugin.myExtension',
  summary: 'Low-level extension point',
});

// Register transformers
myExtension.extend(state => ({ ...state, modified: true }));

// Apply transformers
const result = myExtension.transform(initialState);
```

The difference from `createExtensible`:
- No automatic React hook
- No automatic deep merging (you must spread state yourself)
- More control, less convenience

## Best Practices

1. **Use descriptive IDs**: Follow the pattern `{plugin}.{feature}` to avoid collisions
2. **Document your extension points**: Explain what can be customized and how
3. **Provide sensible defaults**: The initial state should work without any extensions
4. **Keep state shapes stable**: Breaking changes to state types affect all extenders
5. **Export types**: Let consumers type their transformers correctly

## See Also

- [Feature Plugins](./features.md) - User-facing plugins that build on extensions
- [Plugin Development](./plugins.md) - Full plugin development guide
