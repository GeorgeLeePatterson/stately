# core/context

React context providers for Stately's core functionality.

This module provides context providers and hooks for managing shared state
across Stately components. The `LinkExplorerProvider` enables a dialog-based
interface for exploring entity relationships with breadcrumb navigation.

## Example

```tsx
import {
  LinkExplorerProvider,
  useLinkExplorer,
  ViewLinkControl,
} from '@statelyjs/stately/core/context';

// Wrap your app to enable link exploration dialogs
<LinkExplorerProvider>
  <App />
</LinkExplorerProvider>

// Use ViewLinkControl to open the explorer for a linked entity
<ViewLinkControl entityType="User" entityName={user.name} entity={user} />

// Or open programmatically via the hook
function MyComponent() {
  const { openLinkExplorer } = useLinkExplorer();
  return (
    <button onClick={() => openLinkExplorer({ entityType: 'User', entity })}>
      Explore
    </button>
  );
}
```

## Interfaces

### LinkExplorerContextValue

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L23)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Properties

##### breadcrumbs

> **breadcrumbs**: [`LinkEntityProps`](dialogs.md#linkentityprops)\<`Schema`\>[]

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:27](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L27)

##### closeLinkExplorer()

> **closeLinkExplorer**: () => `void`

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:25](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L25)

###### Returns

`void`

##### navigateToIndex()

> **navigateToIndex**: (`index`) => `void`

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:26](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L26)

###### Parameters

###### index

`number`

###### Returns

`void`

##### openLinkExplorer()

> **openLinkExplorer**: (`info`) => `void`

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L24)

###### Parameters

###### info

[`LinkEntityProps`](dialogs.md#linkentityprops)\<`Schema`\>

###### Returns

`void`

## Functions

### LinkExplorerProvider()

> **LinkExplorerProvider**(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:32](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L32)

#### Parameters

##### \_\_namedParameters

###### children

`ReactNode`

#### Returns

`Element`

***

### useLinkExplorer()

> **useLinkExplorer**\<`Schema`\>(): [`LinkExplorerContextValue`](#linkexplorercontextvalue)\<`Schema`\>

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:86](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L86)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Returns

[`LinkExplorerContextValue`](#linkexplorercontextvalue)\<`Schema`\>

***

### ViewLinkControl()

> **ViewLinkControl**\<`Schema`\>(`props`): `Element`

Defined in: [packages/stately/src/core/context/link-explore-context.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/context/link-explore-context.tsx#L7)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### props

[`LinkEntityProps`](dialogs.md#linkentityprops)\<`Schema`\>

#### Returns

`Element`
