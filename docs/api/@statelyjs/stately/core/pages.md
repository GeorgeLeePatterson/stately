# core/pages

Pre-built page components for common entity CRUD operations.

This module provides ready-to-use page components that implement standard
entity management patterns: listing all entity types, viewing entities of
a specific type, viewing/editing individual entities, and creating new ones.

These pages are automatically wired up when using the default Stately router,
but can also be used independently in custom routing setups.

## Example

```tsx
import {
  EntityDetailsPage,
  EntityEditPage,
} from '@statelyjs/stately/core/pages';

// In a custom router setup
<Route path="/entities/:type/:id" element={<EntityDetailsPage />} />
<Route path="/entities/:type/:id/edit" element={<EntityEditPage />} />
```

## Functions

### EntitiesIndexPage()

> **EntitiesIndexPage**\<`Schema`\>(`props`): `Element`

Defined in: [packages/stately/src/core/pages/entities.index.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/pages/entities.index.tsx#L13)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### props

`Partial`\<[`PageProps`](../layout.md#pageprops)\>

#### Returns

`Element`

***

### EntityDetailsPage()

> **EntityDetailsPage**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/pages/entities.type.id.tsx:16](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/pages/entities.type.id.tsx#L16)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

`object` & `Partial`\<[`PageProps`](../layout.md#pageprops)\>

#### Returns

`Element`

***

### EntityEditPage()

> **EntityEditPage**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/pages/entities.type.id.edit.tsx:17](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/pages/entities.type.id.edit.tsx#L17)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

`object` & `Partial`\<[`PageProps`](../layout.md#pageprops)\>

#### Returns

`Element`

***

### EntityNewPage()

> **EntityNewPage**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/pages/entities.type.new.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/pages/entities.type.new.tsx#L14)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

`object` & `Partial`\<[`PageProps`](../layout.md#pageprops)\>

#### Returns

`Element`

***

### EntityTypeListPage()

> **EntityTypeListPage**\<`Schema`\>(`__namedParameters`): `Element`

Defined in: [packages/stately/src/core/pages/entities.type.index.tsx:23](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/core/pages/entities.type.index.tsx#L23)

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Parameters

##### \_\_namedParameters

`object` & `Partial`\<[`PageProps`](../layout.md#pageprops)\>

#### Returns

`Element`
