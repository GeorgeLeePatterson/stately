import { devAssert, devLog } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreEntityWrapped, CoreStateEntry } from '..';

/**
 * Create a new entity.
 *
 * Returns a React Query mutation that creates an entity and automatically
 * invalidates the entity list cache on success.
 *
 * The mutation expects the full wrapped entity shape `{ type: "entity_type", data: {...} }`.
 * The hook validates that the entity type matches what was configured.
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
 *     mutate({ type: 'pipeline', data: formData }, {
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

      const { data, error } = await coreApi.create_entity({ body: input });
      if (error) {
        devLog.error('Core', 'Failed to create entity', { error, input });
        throw new Error('Failed to create entity');
      }
      devLog.debug('Core', 'Successfully created entity', { data, entity });
      return data;
    },
    onSuccess: _ => queryClient?.invalidateQueries({ queryKey: ['entities', entity] }),
  });
}
