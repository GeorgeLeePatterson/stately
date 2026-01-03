/**
 * Pre-built page components for common entity CRUD operations.
 *
 * This module provides ready-to-use page components that implement standard
 * entity management patterns: listing all entity types, viewing entities of
 * a specific type, viewing/editing individual entities, and creating new ones.
 *
 * These pages are automatically wired up when using the default Stately router,
 * but can also be used independently in custom routing setups.
 *
 * @example
 * ```tsx
 * import {
 *   EntityDetailsPage,
 *   EntityEditPage,
 * } from '@statelyjs/stately/core/pages';
 *
 * // In a custom router setup
 * <Route path="/entities/:type/:id" element={<EntityDetailsPage />} />
 * <Route path="/entities/:type/:id/edit" element={<EntityEditPage />} />
 * ```
 *
 * @module core/pages
 */

import { EntitiesIndexPage } from './entities.index';
import { EntityDetailsPage } from './entities.type.id';
import { EntityEditPage } from './entities.type.id.edit';
import { EntityTypeListPage } from './entities.type.index';
import { EntityNewPage } from './entities.type.new';

export { EntitiesIndexPage, EntityDetailsPage, EntityEditPage, EntityTypeListPage, EntityNewPage };
