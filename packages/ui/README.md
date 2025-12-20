# @statelyjs/ui

[![npm](https://img.shields.io/npm/v/@statelyjs/ui)](https://www.npmjs.com/package/@statelyjs/ui)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> Base UI components, layout, and plugin infrastructure for Stately applications

This package provides the foundational UI layer for Stately: React components, theming, layout primitives, and the plugin runtime system. It has no knowledge of Stately's entity system or backend - those concerns live in `@statelyjs/stately`.

## Installation

```bash
pnpm add @statelyjs/ui
```

Most users should install `@statelyjs/stately` instead, which includes this package with the core plugin pre-configured. Use `@statelyjs/ui` directly when:

- Building a custom plugin
- Need only the base components without Stately's entity system
- Want fine-grained control over plugin composition

## What's Included

### Components (`@statelyjs/ui/components`)

Styled, accessible React components built on Radix UI primitives:

- **Base components**: Button, Input, Select, Dialog, Dropdown, Tabs, etc.
- **Form components**: Field wrappers, validation states, form actions
- **Layout components**: Sidebar, Header, Navigation
- **Utility components**: Spinner, Badge, Tooltip, etc.

### Layout (`@statelyjs/ui/layout`)

App shell with responsive sidebar navigation:

```tsx
import { Layout } from '@statelyjs/ui/layout';

function App() {
  return (
    <Layout>
      <YourContent />
    </Layout>
  );
}
```

### Theme (`@statelyjs/ui`)

Dark/light mode support with system preference detection:

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@statelyjs/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeToggle />
      <YourContent />
    </ThemeProvider>
  );
}
```

### Plugin Runtime

Infrastructure for building and composing UI plugins:

```tsx
import { createStatelyUi, createUseStatelyUi, StatelyUiProvider } from '@statelyjs/ui';

// Create a runtime with your schema
const runtime = createStatelyUi({ schema, client, options });

// Add plugins
const runtimeWithPlugins = runtime
  .withPlugin(myPlugin())
  .withPlugin(anotherPlugin());
```

### Registry System

Component and transformer registries for dynamic field rendering:

```tsx
import { registry } from '@statelyjs/ui';

// Register a custom field component
registry.components.register('myNodeType', 'edit', MyEditComponent);
registry.components.register('myNodeType', 'view', MyViewComponent);
```

## Exports

### Main (`@statelyjs/ui`)

```typescript
import {
  // Runtime
  createStatelyUi,
  createStatelyUiProvider,
  createUseStatelyUi,
  StatelyUiProvider,
  
  // Theme
  ThemeProvider,
  ThemeToggle,
  useTheme,
  
  // Layout
  Layout,
  
  // Form
  BaseForm,
  
  // Registry
  registry,
  
  // Utilities
  cn,
  toTitleCase,
  toKebabCase,
  devLog,
} from '@statelyjs/ui';
```

### Components (`@statelyjs/ui/components`)

```typescript
import { Editor, Note, CopyButton, GlowingSave } from '@statelyjs/ui/components';
```

### Base Components (`@statelyjs/ui/components/base`)

All shadcn/ui style components:

```typescript
import {
  Button,
  Input,
  Select,
  Dialog,
  DropdownMenu,
  Tabs,
  Card,
  Badge,
  // ... and many more
} from '@statelyjs/ui/components/base';
```

### Form (`@statelyjs/ui/form`)

```typescript
import { BaseForm, FieldEdit, FieldView, FormActions } from '@statelyjs/ui/form';
```

### Hooks (`@statelyjs/ui/hooks`)

```typescript
import { useCopyToClipboard, useIsMobile, useLocalStorage } from '@statelyjs/ui/hooks';
```

### Layout (`@statelyjs/ui/layout`)

```typescript
import { Layout, Header, PageHeader, Navigation } from '@statelyjs/ui/layout';
```

### Dialogs (`@statelyjs/ui/dialogs`)

```typescript
import { ConfirmationDialog, DeleteDialog } from '@statelyjs/ui/dialogs';
```

### Utilities

```typescript
import { cn } from '@statelyjs/ui/lib/utils';
import { devLog, devLogger } from '@statelyjs/ui/lib/logging';
```

## Styling

Import the CSS in your app's entry point:

```typescript
import '@statelyjs/ui/styles.css';
```

This includes Tailwind CSS utilities and component styles. Your app should have Tailwind configured to process these styles.

## Writing a Plugin

Plugins extend the UI runtime with custom functionality:

```typescript
import type { DefineUiPlugin, UiPluginFactory } from '@statelyjs/ui';

// Define plugin shape
export type MyPlugin = DefineUiPlugin<
  'my-plugin',           // Plugin name
  MyPluginOptions,       // Options type
  MyPluginRoutes,        // Routes type
  MyPluginUtils          // Utils type
>;

// Create plugin factory
export function myPlugin(options: MyPluginOptions): UiPluginFactory<MyPlugin> {
  return (runtime) => ({
    name: 'my-plugin',
    options,
    routes: { /* navigation items */ },
    utils: { /* helper functions */ },
    api: {
      operations: createOperations(runtime.client, options),
    },
  });
}
```

See [`@statelyjs/files`](../files) and [`@statelyjs/arrow`](../arrow) for complete plugin examples.

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0
- `lucide-react` ^0.554.0
- `sonner` ^2.0.7
- `openapi-fetch` ^0.15

### Optional

- `@uiw/react-codemirror` ^4.25.3 - Required for the Editor component

## Related Packages

- [`@statelyjs/stately`](../stately) - Full Stately runtime with core plugin and codegen
- [`@statelyjs/schema`](../schema) - Schema types and plugin system
- [`@statelyjs/files`](../files) - File management plugin
- [`@statelyjs/arrow`](../arrow) - Arrow/connector plugin

## License

Apache-2.0
