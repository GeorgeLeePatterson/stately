import { devLog } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreEntityData, CoreStateEntry } from '..';

/**
 * Update an existing entity.
 *
 * Returns a React Query mutation that updates an entity and automatically
 * invalidates both the individual entity cache and the entity list cache on success.
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
 *     mutate(formData, {
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
    mutationFn: async (entityData: CoreEntityData<Schema>) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      const body = { data: entityData, type: entity };
      const { data, error } = await coreApi.update_entity({ body, params: { path: { id } } });
      if (error) throw new Error('Failed to update entity');
      devLog.debug('Core', 'Successfully updated entity', { data, entity, id });
      return data;
    },
    onSuccess: data => {
      const updatedId = data?.id || id;
      queryClient?.invalidateQueries({ queryKey: ['entity', entity, updatedId] });
      queryClient?.invalidateQueries({ queryKey: ['entities', entity] });
    },
  });
}
