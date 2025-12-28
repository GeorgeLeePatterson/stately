import { Alert, AlertDescription } from '@statelyjs/ui/components/base/alert';
import { FieldGroup } from '@statelyjs/ui/components/base/field';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useEntityData, useEntityUrl, useUpdateEntity } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { EntityEditView } from '@/core/views/entity';
import { BaseForm } from '@/form';
import { useStatelyUi } from '@/index';
import { Layout } from '@/layout';
import type { PageProps } from '@/layout/page';
import { log } from '@/utils';
import type { CoreEntityData, CoreStateEntry } from '..';
import { useEntityPage } from '../hooks/use-entity-page';

export function EntityEditPage<Schema extends Schemas = Schemas>({
  id,
  entity: entityType,
  ...rest
}: { id: string; entity: CoreStateEntry<Schema> } & Partial<PageProps>) {
  const { schema, plugins, options } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType<Schema>(entityType) ?? entityType;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entityType;
  const displayName = schema.data.entityDisplayNames[stateEntry];

  const [formData, setFormData] = useState<CoreEntityData<Schema> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const resolveEntityUrl = useEntityUrl();
  const {
    data,
    isLoading,
    isFetched,
    error: queryError,
  } = useEntityData({ entity: stateEntry, identifier: id });

  const entityData = data?.entity?.data;

  const updateMutation = useUpdateEntity<Schema>({ entity: stateEntry, id, queryClient });

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
          log.debug('Core', 'Entity updated successfully', { data });
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

  const {
    noDataDisplay,
    entityName,
    pageLoaderDisplay,
    dataReady,
    pageReady,
    entitySchema,
    errorDisplay,
  } = useEntityPage<Schema>({ entity: data?.entity, isFetched, isLoading, queryError, stateEntry });

  const isValid = schema.plugins.core.isEntityValid(formData, entitySchema.node);

  log.debug('Core', 'Entity edit', { data, entitySchema, formData, isValid, queryError });

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions ||
        (pageReady ? (
          <BaseForm.FormActions
            isDirty={isDirty}
            isDisabled={!isValid}
            isLoading={isLoading}
            isPending={updateMutation.isPending}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : null)
      }
      breadcrumbs={
        rest?.breadcrumbs ??
        (pageReady
          ? [
              { href: resolveEntityUrl({}), label: 'Configurations' },
              { href: resolveEntityUrl({ type: entityPath }), label: displayName },
              {
                href: resolveEntityUrl({ id, type: entityPath }),
                label:
                  (entityData && 'name' in entityData ? entityData.name : 'default') || 'default',
              },
              { label: 'Edit' },
            ]
          : [])
      }
      description={rest?.description ?? `Modify ${displayName.toLowerCase()} configuration`}
      disableThemeToggle={options?.theme?.disabled}
      title={
        rest?.title ?? (
          <>
            <span className="hidden lg:inline text-muted-foreground whitespace-nowrap">
              Editing&nbsp;
            </span>
            {entityName && <span className="truncate">{entityName}</span>}
          </>
        )
      }
    >
      {/* Loading */}
      {pageLoaderDisplay}

      {/* Error fetching or parsing entity schema */}
      {errorDisplay}

      {/* Data fetched, nothing returned */}
      {noDataDisplay}

      {/* Entity form */}
      {dataReady && entitySchema.node && (
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
