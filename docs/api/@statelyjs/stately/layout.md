# layout

Layout components for building Stately application shells.

This module provides the foundational layout components that structure
a Stately application. The `Layout.Root` component provides a complete
shell with sidebar navigation, optional header, and content area.

## Example

```tsx
import { Layout } from '@statelyjs/stately/layout';

function App() {
  return (
    <Layout.Root headerProps={{ enable: true }}>
      <Layout.Page>
        <Layout.PageHeader title="Dashboard" />
        {/* Page content */}
      </Layout.Page>
    </Layout.Root>
  );
}
```

## Interfaces

### HeaderProps

Defined in: [packages/stately/src/layout/header.tsx:4](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/header.tsx#L4)

#### Properties

##### before?

> `optional` **before**: `ReactNode`

Defined in: [packages/stately/src/layout/header.tsx:5](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/header.tsx#L5)

##### disableThemeToggle?

> `optional` **disableThemeToggle**: `boolean`

Defined in: [packages/stately/src/layout/header.tsx:7](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/header.tsx#L7)

##### pageTitle?

> `optional` **pageTitle**: `string`

Defined in: [packages/stately/src/layout/header.tsx:6](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/header.tsx#L6)

***

### PageHeaderProps

Defined in: [packages/stately/src/layout/page-header.tsx:9](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L9)

#### Properties

##### actions?

> `optional` **actions**: `ReactNode`

Defined in: [packages/stately/src/layout/page-header.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L13)

##### backLink?

> `optional` **backLink**: `object`

Defined in: [packages/stately/src/layout/page-header.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L14)

###### href

> **href**: `string`

###### label?

> `optional` **label**: `string`

##### breadcrumbs?

> `optional` **breadcrumbs**: `object`[]

Defined in: [packages/stately/src/layout/page-header.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L12)

###### href?

> `optional` **href**: `string`

###### label

> **label**: `string`

##### description?

> `optional` **description**: `string`

Defined in: [packages/stately/src/layout/page-header.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L11)

##### disableThemeToggle?

> `optional` **disableThemeToggle**: `boolean`

Defined in: [packages/stately/src/layout/page-header.tsx:15](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L15)

##### title?

> `optional` **title**: `ReactNode`

Defined in: [packages/stately/src/layout/page-header.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page-header.tsx#L10)

## Type Aliases

### NavigationProps

> **NavigationProps**\<`S`, `A`\> = `NavigationBaseProps`\<`S`, `A`\> & `React.ComponentProps`\<*typeof* [`Sidebar`](../ui/components/base/sidebar.md#sidebar)\>

Defined in: [packages/stately/src/layout/navigation.tsx:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/navigation.tsx#L39)

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### A

`A` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

***

### PageProps

> **PageProps** = `React.PropsWithChildren`\<[`PageHeaderProps`](#pageheaderprops)\>

Defined in: [packages/stately/src/layout/page.tsx:4](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/page.tsx#L4)

***

### RootProps

> **RootProps** = `object`

Defined in: [packages/stately/src/layout/root.tsx:9](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/root.tsx#L9)

#### Properties

##### contentProps?

> `optional` **contentProps**: `React.ComponentProps`\<`"div"`\>

Defined in: [packages/stately/src/layout/root.tsx:13](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/root.tsx#L13)

##### headerProps?

> `optional` **headerProps**: `React.ComponentProps`\<*typeof* `Header`\> & `object`

Defined in: [packages/stately/src/layout/root.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/root.tsx#L10)

###### Type Declaration

###### enable?

> `optional` **enable**: `boolean`

##### mainProps?

> `optional` **mainProps**: `React.ComponentProps`\<`"main"`\>

Defined in: [packages/stately/src/layout/root.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/root.tsx#L12)

##### sidebarProps?

> `optional` **sidebarProps**: `React.ComponentProps`\<*typeof* `Navigation`\>

Defined in: [packages/stately/src/layout/root.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/root.tsx#L11)

## Variables

### Layout

> `const` **Layout**: `object`

Defined in: [packages/stately/src/layout/index.ts:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/layout/index.ts#L39)

#### Type Declaration

##### Header()

> **Header**: (`__namedParameters`) => `Element`

Simple Header component.

NOTE: Not currently used, provided as convenience.

###### Parameters

###### \_\_namedParameters

`PropsWithChildren`\<[`HeaderProps`](#headerprops)\>

###### Returns

`Element`

##### Navigation()

> **Navigation**: \<`S`, `A`\>(`__namedParameters`) => `Element`

###### Type Parameters

###### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

###### A

`A` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

###### Parameters

###### \_\_namedParameters

[`NavigationProps`](#navigationprops)\<`S`, `A`\>

###### Returns

`Element`

##### Page()

> **Page**: (`__namedParameters`) => `Element`

Generic layout for list views (e.g., History list, Pipeline list, Entity list)
Provides consistent page structure with header and content area

###### Parameters

###### \_\_namedParameters

[`PageProps`](#pageprops)

###### Returns

`Element`

##### PageHeader()

> **PageHeader**: (`__namedParameters`) => `Element`

###### Parameters

###### \_\_namedParameters

[`PageHeaderProps`](#pageheaderprops)

###### Returns

`Element`

##### Root()

> **Root**: \<`S`, `A`\>(`LayoutProps`) => `Element`

Pre-made layout, useful when additional configuration is not required.

TODO: Provide examples of usage

###### Type Parameters

###### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

###### A

`A` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

###### Parameters

###### LayoutProps

`PropsWithChildren`\<[`RootProps`](#rootprops) & `ClassAttributes`\<`HTMLDivElement`\> & `HTMLAttributes`\<`HTMLDivElement`\> & `object`\>

###### Returns

`Element`

React.ReactNode
