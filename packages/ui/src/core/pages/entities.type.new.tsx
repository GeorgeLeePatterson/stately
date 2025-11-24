import type { Schemas } from '@stately/schema';
import { Note } from '@stately/ui/base/components';
import { FormActions } from '@stately/ui/base/form';
import { EntityEditView } from '@stately/ui/core/components/views/entity';
import { useCreateEntity, useEntityData, useEntitySchema } from '@stately/ui/core/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { devLog } from '@/base';
import { Page } from '@/base/layout/page';
import { useStatelyUi } from '@/index';
import type { CoreEntityData, CoreStateEntry } from '..';

// TODO: Move to stately/tanstack
// export const Route = createFileRoute('/entities/$type/new')({
//   component: EntityCreate,
//   staticData: { title: 'New Entity' },
//   validateSearch: (search: Record<string, unknown>): { template?: string } => {
//     return { template: search.template as string | undefined };
//   },
// });

export function EntityCreate<Schema extends Schemas = Schemas>({
  entity,
}: {
  entity: CoreStateEntry<Schema>;
}) {
  const template = new URLSearchParams(window.location.search).get('template') || undefined;

  const { schema, plugins } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType(entity, schema.data) ?? entity;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entity;
  const typeName = schema.data.entityDisplayNames[stateEntry];

  const templateDataLoaded = useRef<boolean>(false);

  const [formData, setFormData] = useState<CoreEntityData<Schema> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const entitySchema = useEntitySchema(stateEntry);
  const createMutation = useCreateEntity({ entity, queryClient });

  const {
    data: templateData,
    isLoading,
    error: templateError,
  } = useEntityData({ disabled: !template, entity: stateEntry, identifier: template });

  // Ready flag to wait for loading template data
  const isReady = template ? templateDataLoaded.current : true;

  useEffect(() => {
    if (!templateDataLoaded.current && templateData?.id) {
      templateDataLoaded.current = true;
      // Copy template data (name will be set when creating)
      setFormData((({ name: _, ...o }) => ({ ...o }))(templateData.entity.data as any));
      setIsDirty(true);
    }
  }, [templateData]);

  const handleSave = () => {
    if (!formData) return;
    createMutation.mutate(formData, {
      onSuccess: data => {
        if (data?.id) {
          window.location.href = `/entities/${entityPath}/${data.id}`;
        } else {
          window.location.href = `/entities/${entityPath}`;
        }
      },
    });
  };

  const onChange = useCallback((newConfig: CoreEntityData<Schema>) => {
    setFormData(newConfig);
    setIsDirty(true);
  }, []);

  const handleCancel = () => {
    window.location.href = `/entities/${entityPath}`;
  };

  if (entitySchema.error || !entitySchema.node) {
    return (
      <div className="text-center py-8 text-destructive">
        {entitySchema.error || 'No entity found'}
      </div>
    );
  }

  const schemaNode = entitySchema.node;
  const requiredFields = new Set(schemaNode.required || []);

  // TODO: Remove - fix 'as any' cast
  const isValid = schema.plugins.core.isEntityValid(formData, entitySchema.node as any);

  devLog.debug('Core', 'Entity new: ', {
    formData,
    isValid,
    requiredFields,
    schema: schemaNode,
    templateData,
  });

  return (
    <Page
      actions={
        <FormActions
          isDirty={isDirty}
          isDisabled={!isValid}
          isPending={createMutation.isPending}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      }
      backLabel="Cancel"
      backTo={`/entities/${entityPath}`}
      breadcrumbs={[
        { href: '/entities', label: 'Configurations' },
        { href: `/entities/${entityPath}`, label: `${typeName}s` },
        { label: 'New' },
      ]}
      description={`Create a new ${typeName.toLowerCase()} configuration`}
      title={`Create ${typeName}`}
    >
      <form className="flex flex-col gap-3">
        <>
          {createMutation.isError && (
            <Note
              message={createMutation.error?.message || 'Failed to create entity'}
              mode="error"
            />
          )}
          {templateError && (
            <Note message={templateError.message || 'Failed to create entity'} mode="error" />
          )}
          {templateData?.id && (
            <Note
              message={`Creating new with data from '${templateData.entity.data && 'name' in templateData.entity.data ? templateData.entity.data.name : 'default'}'`}
              mode="info"
            />
          )}
        </>

        {/* Entity fields */}
        <EntityEditView
          isLoading={isLoading || !isReady}
          isRootEntity
          node={schemaNode}
          onChange={onChange}
          value={formData}
        />
      </form>
    </Page>
  );
}
