# 🏰 @statelyjs/ui

> Base UI components, layout, and plugin infrastructure for Stately applications

[![npm](https://img.shields.io/npm/v/@statelyjs/ui)](https://www.npmjs.com/package/@statelyjs/ui)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/georgeleepatterson/stately/blob/main/LICENSE)

This package provides the foundational UI layer for Stately: React components, theming, layout primitives, and the plugin runtime system. It has no knowledge of Stately's entity system or backend - those concerns live in `@statelyjs/stately`.

## Installation

```bash
pnpm add @statelyjs/ui
```

Most users should install `@statelyjs/stately` instead, which includes this package with the core plugin pre-configured. Use `@statelyjs/ui` directly when:

- Accessing the base components, layouts, or views
- Building a custom plugin
- Want fine-grained control over plugin composition
- Stately's underlying types and logic without core's entity system (would require `schema` also)

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

Dark/light/system mode support with system preference detection:

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
  
  // Form and node type routers
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

This includes Tailwind CSS utilities and component styles. Your app should have Tailwind configured to process these styles. In order for tailwind to pick up all styles, it's recommended to do the following:

```css
/**
 * REQUIRED SETUP for Tailwind CSS v4:
 *
 * In your app's main CSS file, add the following in this exact order:
 *
 * @import "tailwindcss";
 * @import "@statelyjs/ui/styles.css";
 * @source "../node_modules/@statelyjs/ui/dist";
 * @source "../node_modules/@statelyjs/stately/dist";
 *
 * Explicit @source paths are required because node_modules is automatically
 * excluded from Tailwind's class detection. Add additional @source lines
 * for any Stately plugins you use (e.g., @statelyjs/arrow, @statelyjs/files).
 */
```

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

See [`@statelyjs/files`](https://www.npmjs.com/package/@statelyjs/files) and [`@statelyjs/arrow`](https://www.npmjs.com/package/@statelyjs/arrow) for complete plugin examples.

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0
- `lucide-react` ^0.562.0
- `sonner` ^2.0.7
- `openapi-fetch` ^0.15

### Optional

- `@uiw/react-codemirror` ^4.25.3 - Required for the Editor component

## Related Packages

- [`@statelyjs/stately`](https://www.npmjs.com/package/@statelyjs/stately) - Full Stately runtime with core plugin and codegen
- [`@statelyjs/schema`](https://www.npmjs.com/package/@statelyjs/schema) - Schema types and plugin system
- [`@statelyjs/files`](https://www.npmjs.com/package/@statelyjs/files) - File management plugin
- [`@statelyjs/arrow`](https://www.npmjs.com/package/@statelyjs/arrow) - Arrow/connector plugin

## License

Apache-2.0

## Modules

- [api](api.md)
- [components](components.md)
- [components/base/accordion](components/base/accordion.md)
- [components/base/alert](components/base/alert.md)
- [components/base/alert-dialog](components/base/alert-dialog.md)
- [components/base/avatar](components/base/avatar.md)
- [components/base/badge](components/base/badge.md)
- [components/base/breadcrumb](components/base/breadcrumb.md)
- [components/base/button](components/base/button.md)
- [components/base/button-group](components/base/button-group.md)
- [components/base/card](components/base/card.md)
- [components/base/checkbox](components/base/checkbox.md)
- [components/base/collapsible](components/base/collapsible.md)
- [components/base/dialog](components/base/dialog.md)
- [components/base/drawer](components/base/drawer.md)
- [components/base/dropdown-menu](components/base/dropdown-menu.md)
- [components/base/empty](components/base/empty.md)
- [components/base/field](components/base/field.md)
- [components/base/input](components/base/input.md)
- [components/base/input-group](components/base/input-group.md)
- [components/base/item](components/base/item.md)
- [components/base/label](components/base/label.md)
- [components/base/menubar](components/base/menubar.md)
- [components/base/popover](components/base/popover.md)
- [components/base/progress](components/base/progress.md)
- [components/base/scroll-area](components/base/scroll-area.md)
- [components/base/select](components/base/select.md)
- [components/base/separator](components/base/separator.md)
- [components/base/sheet](components/base/sheet.md)
- [components/base/sidebar](components/base/sidebar.md)
- [components/base/skeleton](components/base/skeleton.md)
- [components/base/sonner](components/base/sonner.md)
- [components/base/spinner](components/base/spinner.md)
- [components/base/switch](components/base/switch.md)
- [components/base/table](components/base/table.md)
- [components/base/tabs](components/base/tabs.md)
- [components/base/textarea](components/base/textarea.md)
- [components/base/toggle](components/base/toggle.md)
- [components/base/toggle-group](components/base/toggle-group.md)
- [components/base/tooltip](components/base/tooltip.md)
- [dialogs](dialogs.md)
- [extension](extension.md)
- [feature-plugin](feature-plugin.md)
- [hooks](hooks.md)
- [index](index-1.md)
- [lib/logging](lib/logging.md)
- [lib/utils](lib/utils.md)
- [plugin](plugin.md)
- [registry](registry.md)
- [runtime](runtime.md)
- [theme](theme.md)
- [utils](utils.md)
