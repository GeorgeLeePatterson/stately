/**
 * Layout components for building Stately application shells.
 *
 * This module provides the foundational layout components that structure
 * a Stately application. The `Layout.Root` component provides a complete
 * shell with sidebar navigation, optional header, and content area.
 *
 * @example
 * ```tsx
 * import { Layout } from '@statelyjs/stately/layout';
 *
 * function App() {
 *   return (
 *     <Layout.Root headerProps={{ enable: true }}>
 *       <Layout.Page>
 *         <Layout.PageHeader title="Dashboard" />
 *         {/* Page content *\/}
 *       </Layout.Page>
 *     </Layout.Root>
 *   );
 * }
 * ```
 *
 * @module layout
 */

import { Header } from './header';
import { Navigation } from './navigation';
import { Page } from './page';
import { PageHeader } from './page-header';
import { Root } from './root';

export type { HeaderProps } from './header';
export type { NavigationProps } from './navigation';
export type { PageProps } from './page';
export type { PageHeaderProps } from './page-header';
export type { RootProps } from './root';

export const Layout = { Header, Navigation, Page, PageHeader, Root };
