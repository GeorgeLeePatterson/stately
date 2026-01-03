/**
 * Link view components for displaying and editing entity references.
 *
 * This module provides React components for rendering links between entities.
 * Links represent relationships in your schema (e.g., foreign keys, references)
 * and can be displayed inline, as expandable details, or as editable selectors.
 *
 * @example
 * ```tsx
 * import { LinkRefView, LinkRefEdit } from '@statelyjs/stately/core/views/link';
 *
 * // Display a link reference (read-only)
 * <LinkRefView link={entity.authorRef} />
 *
 * // Edit a link reference with a selector
 * <LinkRefEdit
 *   link={entity.authorRef}
 *   onChange={handleLinkChange}
 * />
 * ```
 *
 * @module core/views/link
 */

import { LinkDetailView } from './link-detail-view';
import { LinkEditView } from './link-edit-view';
import { LinkInlineEdit } from './link-inline-edit';
import { LinkInlineView } from './link-inline-view';
import { LinkRefEdit } from './link-ref-edit';
import { LinkRefView } from './link-ref-view';

export type { LinkDetailViewProps } from './link-detail-view';
export type { LinkEditViewProps, LinkFor } from './link-edit-view';
export type { LinkInlineEditProps } from './link-inline-edit';
export type { LinkInlineViewProps } from './link-inline-view';
export type { LinkRefEditProps } from './link-ref-edit';
export type { LinkRefViewProps } from './link-ref-view';

export { LinkEditView, LinkDetailView, LinkRefEdit, LinkInlineEdit, LinkInlineView, LinkRefView };
