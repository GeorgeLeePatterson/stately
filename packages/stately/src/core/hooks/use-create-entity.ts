import { devLog } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

/**
 * Create a new entity.
 *
 * Returns a React Query mutation that creates an entity and automatically
 * invalidates the entity list cache on success.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.queryClient - Optional QueryClient for cache invalidation
 *
 * @returns A React Query mutation with `mutate` and `mutateAsync` functions
 *
 * @example
 * ```tsx
 * function CreatePipelineForm() {
 *   const queryClient = useQueryClient();
 *   const { mutate, isPending } = useCreateEntity<MySchemas>({
 *     entity: 'Pipeline',
 *     queryClient,
 *   });
 *
 *   const handleSubmit = (formData: PipelineData) => {
 *     mutate(formData, {
 *       onSuccess: (result) => {
 *         toast.success('Pipeline created');
 *         navigate(`/pipelines/${result.id}`);
 *       },
 *     });
 *   };
 *
 *   return <PipelineForm onSubmit={handleSubmit} disabled={isPending} />;
 * }
 * ```
 */
export function useCreateEntity<Schema extends Schemas = Schemas>({
  entity,
  queryClient,
}: {
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  return useMutation({
    mutationFn: async (formData: any) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      // Set the name in the entity data before creating
      const body = { data: formData, type: entity };
      const { data, error } = await coreApi.create_entity({ body });
      if (error) throw new Error('Failed to create entity');
      devLog.debug('Core', 'Successfully created entity', { data, entity });
      return data;
    },
    onSuccess: _ => queryClient?.invalidateQueries({ queryKey: ['entities', entity] }),
  });
}
