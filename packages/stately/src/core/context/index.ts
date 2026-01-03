/**
 * React context providers for Stately's core functionality.
 *
 * This module provides context providers and hooks for managing shared state
 * across Stately components. The `LinkExplorerProvider` enables a dialog-based
 * interface for exploring entity relationships with breadcrumb navigation.
 *
 * @example
 * ```tsx
 * import {
 *   LinkExplorerProvider,
 *   useLinkExplorer,
 *   ViewLinkControl,
 * } from '@statelyjs/stately/core/context';
 *
 * // Wrap your app to enable link exploration dialogs
 * <LinkExplorerProvider>
 *   <App />
 * </LinkExplorerProvider>
 *
 * // Use ViewLinkControl to open the explorer for a linked entity
 * <ViewLinkControl entityType="User" entityName={user.name} entity={user} />
 *
 * // Or open programmatically via the hook
 * function MyComponent() {
 *   const { openLinkExplorer } = useLinkExplorer();
 *   return (
 *     <button onClick={() => openLinkExplorer({ entityType: 'User', entity })}>
 *       Explore
 *     </button>
 *   );
 * }
 * ```
 *
 * @module core/context
 */

import { LinkExplorerProvider, useLinkExplorer, ViewLinkControl } from './link-explore-context';

export type { LinkExplorerContextValue } from './link-explore-context';
export { LinkExplorerProvider, useLinkExplorer, ViewLinkControl };
