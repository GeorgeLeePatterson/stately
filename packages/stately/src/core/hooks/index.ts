/**
 * Core hooks for entity CRUD operations.
 *
 * These hooks provide React Query-based data fetching and mutations for
 * working with Stately entities. They automatically handle caching,
 * cache invalidation, and error states.
 *
 * @example
 * ```tsx
 * import {
 *   useListEntities,
 *   useEntityData,
 *   useCreateEntity,
 *   useUpdateEntity,
 *   useRemoveEntity,
 * } from '@statelyjs/stately/core/hooks';
 * ```
 *
 * @packageDocumentation
 */

import { useCreateEntity } from './use-create-entity';
import { useEntityData } from './use-entity-data';
import { useEntityDataInline } from './use-entity-data-inline';
import { useEntitySchema } from './use-entity-schema';
import { useEntityUrl } from './use-entity-url';
import { useListEntities } from './use-list-entities';
import { useObjectCompare } from './use-object-compare';
import { useObjectField } from './use-object-field';
import { useRemoveEntity } from './use-remove-entity';
import { useUpdateEntity } from './use-update-entity';

export type { MergedField, ObjectFieldState } from './use-object-field';

export {
  useListEntities,
  useEntityDataInline,
  useEntityData,
  useObjectField,
  useObjectCompare,
  useEntitySchema,
  useEntityUrl,
  useUpdateEntity,
  useCreateEntity,
  useRemoveEntity,
};
