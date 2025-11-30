import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { devLog } from '@/base';
import { BaseForm } from '@/base/form';
import { Layout, type PageProps } from '@/base/layout';
import { Alert, AlertDescription } from '@/base/ui/alert';
import { FieldGroup } from '@/base/ui/field';
import { Skeleton } from '@/base/ui/skeleton';
import { useEntityData, useEntitySchema, useEntityUrl, useUpdateEntity } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { EntityEditView } from '@/core/views/entity';
import { useStatelyUi } from '@/index';
import type { CoreEntityData, CoreStateEntry } from '..';

// TODO: Move to stately/tanstack
// export const Route = createFileRoute('/entities/$type/$id_/edit')({
//   component: EntityEdit,
//   staticData: { title: 'Edit' },
// });

export function EntityEditPage<Schema extends Schemas = Schemas>({
  id,
  entity: entityType,
  ...rest
}: { id: string; entity: CoreStateEntry<Schema> } & Partial<PageProps>) {
  const { schema, plugins } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType(entityType) ?? entityType;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entityType;
  const displayName = schema.data.entityDisplayNames[stateEntry];

  const [formData, setFormData] = useState<CoreEntityData<Schema> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const entitySchema = useEntitySchema(stateEntry);
  const resolveEntityUrl = useEntityUrl();
  const {
    data,
    isLoading,
    error: queryError,
  } = useEntityData({ entity: stateEntry, identifier: id });

  const entityData = data?.entity?.data;
  const entityName = !entityData || !('name' in entityData) ? 'configuration' : entityData.name;

  const updateMutation = useUpdateEntity({ entity: stateEntry, id, queryClient });

  // Initialize formData when entity loads
  useEffect(() => {
    if (entityData && formData === null) {
      setFormData(entityData);
    }
  }, [entityData, formData]);

  const handleSave = useCallback(() => {
    if (!formData) return;
    updateMutation.mutate(
      { data: formData, type: stateEntry },
      {
        onSuccess: data => {
          window.location.href = resolveEntityUrl({ id: data?.id ?? id, type: entityPath });
        },
      },
    );
  }, [updateMutation, stateEntry, formData, entityPath, id, resolveEntityUrl]);

  const onChange = useCallback((newConfig: CoreEntityData<Schema>) => {
    setFormData(newConfig);
    setIsDirty(true);
  }, []);

  const handleCancel = () => {
    window.location.href = resolveEntityUrl({ id, type: entityPath });
  };

  const isValid = schema.plugins.core.isEntityValid(formData, entitySchema.node);

  devLog.debug('Core', 'Entity edit', { data, entitySchema, formData, isValid });

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions || (
          <BaseForm.FormActions
            isDirty={isDirty}
            isDisabled={!isValid}
            isLoading={isLoading}
            isPending={updateMutation.isPending}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )
      }
      breadcrumbs={
        rest?.breadcrumbs ?? [
          { href: resolveEntityUrl({}), label: 'Configurations' },
          { href: resolveEntityUrl({ type: entityPath }), label: displayName },
          {
            href: resolveEntityUrl({ id, type: entityPath }),
            label: (entityData && 'name' in entityData ? entityData.name : 'default') || 'default',
          },
          { label: 'Edit' },
        ]
      }
      description={rest?.description ?? `Modify ${displayName.toLowerCase()} configuration`}
      title={
        rest?.title ?? (
          <>
            <span className="hidden lg:inline text-muted-foreground whitespace-nowrap">
              Editing&nbsp;
            </span>
            <span className="truncate">{entityName}</span>
          </>
        )
      }
    >
      {isLoading || !formData ? (
        // Loading
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : queryError ? (
        // Entity fetch error
        <div className="text-center py-8">
          <p className="text-destructive mb-2">Error loading entity</p>
          <p className="text-sm text-muted-foreground">{queryError.message}</p>
        </div>
      ) : !data?.entity ? (
        // No entity
        <p className="text-muted-foreground text-center py-8">Entity not found</p>
      ) : !entitySchema.node ? (
        // Entity schema error
        <div className="text-center py-8 text-destructive">
          {entitySchema.error || 'No entity found'}
        </div>
      ) : (
        // Entity edit view
        <form className="flex flex-col gap-3">
          {/* Error Display - at the top */}
          {updateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {updateMutation.error?.message || 'Failed to save entity'}
              </AlertDescription>
            </Alert>
          )}

          {/*Entity*/}
          <FieldGroup>
            <EntityEditView
              isRootEntity
              node={entitySchema.node}
              onChange={onChange}
              onSave={handleSave}
              value={formData}
            />
          </FieldGroup>
        </form>
      )}
    </Layout.Page>
  );
}
