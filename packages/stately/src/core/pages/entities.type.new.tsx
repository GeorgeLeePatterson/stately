import { devLog, Layout } from '@statelyjs/ui';
import { Note } from '@statelyjs/ui/components';
import { BaseForm } from '@statelyjs/ui/form';
import type { PageProps } from '@statelyjs/ui/layout';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateEntity, useEntityData, useEntitySchema, useEntityUrl } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { EntityEditView } from '@/core/views/entity';
import { useStatelyUi } from '@/index';
import type { CoreEntityData, CoreStateEntry } from '..';

export function EntityNewPage<Schema extends Schemas = Schemas>({
  entity,
  templateId,
  ...rest
}: { entity: CoreStateEntry<Schema>; templateId?: string } & Partial<PageProps>) {
  const template =
    templateId || new URLSearchParams(window.location.search).get('template') || undefined;

  const { schema, plugins } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType(entity) ?? entity;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entity;
  const typeName = schema.data.entityDisplayNames[stateEntry];

  const templateDataLoaded = useRef<boolean>(false);

  const [formData, setFormData] = useState<CoreEntityData<Schema> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const resolveEntityUrl = useEntityUrl();
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

  const handleSave = useCallback(() => {
    if (!formData) return;
    createMutation.mutate(formData, {
      onSuccess: data => {
        const parts = { type: entityPath };
        if (data?.id) {
          window.location.href = resolveEntityUrl({ ...parts, id: data.id });
        } else {
          window.location.href = resolveEntityUrl(parts);
        }
      },
    });
  }, [createMutation, entityPath, formData, resolveEntityUrl]);

  const onChange = useCallback((newConfig: CoreEntityData<Schema>) => {
    setFormData(newConfig);
    setIsDirty(true);
  }, []);

  const handleCancel = () => {
    window.location.href = resolveEntityUrl({ type: entityPath });
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

  const isValid = schema.plugins.core.isEntityValid(formData, entitySchema.node);

  devLog.debug('Core', 'Entity new: ', {
    formData,
    isValid,
    requiredFields,
    schema: schemaNode,
    templateData,
  });

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions ?? (
          <BaseForm.FormActions
            isDirty={isDirty}
            isDisabled={!isValid}
            isPending={createMutation.isPending}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )
      }
      breadcrumbs={
        rest?.breadcrumbs ?? [
          { href: resolveEntityUrl({}), label: 'Configurations' },
          { href: resolveEntityUrl({ type: entityPath }), label: `${typeName}s` },
          { label: 'New' },
        ]
      }
      description={rest?.description ?? `Create a new ${typeName.toLowerCase()} configuration`}
      title={rest?.title ?? `Create ${typeName}`}
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
    </Layout.Page>
  );
}
