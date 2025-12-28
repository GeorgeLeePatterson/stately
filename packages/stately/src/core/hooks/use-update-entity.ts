import { devAssert } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreEntityWrapped, CoreStateEntry } from '..';
import { log } from '@/utils';

/**
 * Update an existing entity.
 *
 * Returns a React Query mutation that updates an entity and automatically
 * invalidates both the individual entity cache and the entity list cache on success.
 *
 * The mutation expects the full wrapped entity shape `{ type: "entity_type", data: {...} }`.
 * The hook validates that the entity type matches what was configured.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.id - The entity's unique ID to update
 * @param options.queryClient - Optional QueryClient for cache invalidation
 *
 * @returns A React Query mutation with `mutate` and `mutateAsync` functions
 *
 * @example
 * ```tsx
 * function EditPipelineForm({ id, initialData }: Props) {
 *   const queryClient = useQueryClient();
 *   const { mutate, isPending } = useUpdateEntity<MySchemas>({
 *     entity: 'Pipeline',
 *     id,
 *     queryClient,
 *   });
 *
 *   const handleSubmit = (formData: PipelineData) => {
 *     mutate({ type: 'pipeline', data: formData }, {
 *       onSuccess: () => toast.success('Pipeline updated'),
 *     });
 *   };
 *
 *   return <PipelineForm defaultValues={initialData} onSubmit={handleSubmit} disabled={isPending} />;
 * }
 * ```
 */
export function useUpdateEntity<Schema extends Schemas = Schemas>({
  entity,
  id,
  queryClient,
}: {
  entity: CoreStateEntry<Schema>;
  id: string;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  return useMutation({
    mutationFn: async (input: CoreEntityWrapped<Schema>) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');

      // Dev-only: Validate input has the expected { type, data } shape
      devAssert(
        typeof input === 'object' &&
          input !== null &&
          'type' in input &&
          'data' in input &&
          typeof input.type === 'string' &&
          typeof input.data === 'object',
        'Invalid entity shape. Expected { type: string, data: object }, ' +
          `received: ${JSON.stringify(input).slice(0, 100)}`,
        { input },
      );

      // Resolve entity type, since there are various formats, ie '-' vs '_'
      const stateEntry = runtime.plugins.core.utils?.resolveEntityType(entity) ?? entity;

      // Runtime validation: entity type must match hook configuration
      if (input.type !== stateEntry) {
        throw new Error(
          `Entity type mismatch: hook configured for "${String(stateEntry)}" ` +
            `but received "${String(input.type)}"`,
        );
      }

      const { data, error } = await coreApi.update_entity({
        body: input,
        params: { path: { id } },
      });

      if (error) {
        log.error('Core', 'Failed to update entity', { error, id, input });
        throw new Error('Failed to update entity');
      }
      log.debug('Core', 'Successfully updated entity', { data, entity, id });
      return data;
    },
    onSuccess: data => {
      const updatedId = data?.id || id;
      queryClient?.invalidateQueries({ queryKey: ['entity', entity, updatedId] });
      queryClient?.invalidateQueries({ queryKey: ['entities', entity] });
    },
  });
}
