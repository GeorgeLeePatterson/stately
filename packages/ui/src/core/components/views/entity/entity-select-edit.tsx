import type { Schemas } from '@stately/schema';
import { ExternalLink, ListRestart, Loader2, Pencil } from 'lucide-react';
import { useId } from 'react';
import { Note } from '@/base/components/note';
import { Button } from '@/base/ui/button';
import { ButtonGroup } from '@/base/ui/button-group';
import { Field, FieldDescription, FieldLabel } from '@/base/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/base/ui/select';
import type { CoreStateEntry } from '@/core';
import { ViewLinkControl } from '@/core/context/link-explore-context';
import { useStatelyUi } from '@/index';

export interface EntitySelectEditProps<Schema extends Schemas = Schemas> {
  /** Whether the form is readonly */
  isReadOnly?: boolean;
  /** Show loading indicator */
  isLoading?: boolean;
  /** The entity type being referenced */
  targetType: CoreStateEntry<Schema>;
  /** List of entity refs */
  available: Array<Schema['config']['components']['schemas']['Summary']>;
  /** Schema for the inline entity */
  node: Schema['plugin']['Nodes']['object'];
  /** Current value from parent (either ref or inline) */
  value: string | null;
  /** Called when save is clicked with new ref value */
  onChange: (value: string | null) => void;
  /** Render the mode toggle */
  after?: React.ReactNode;
  /** Callback to edit as inline */
  onEdit?: (value: string) => void;
  /** Refresh the entity list */
  onRefresh: () => void;
}

export function EntitySelectEdit<Schema extends Schemas = Schemas>({
  targetType,
  available,
  node,
  value,
  onChange,
  onRefresh,
  after,
  onEdit,
  isReadOnly,
  isLoading,
}: EntitySelectEditProps<Schema>) {
  const { schema, plugins } = useStatelyUi<Schema, []>();
  const entityDisplayName = schema.data.entityDisplayNames?.[targetType] ?? String(targetType);
  const label = plugins.core.utils?.generateFieldLabel(targetType);
  const formId = useId();
  const fieldId = `select-${targetType}-${formId}`;
  const selected = value ? available.find(entity => entity.id === value) : null;
  return (
    <Field>
      <FieldLabel className="flex justify-between" htmlFor={fieldId}>
        <h4 className="text-sm flex items-center gap-2">
          <span>
            {isReadOnly ? (
              `Use Default ${entityDisplayName}`
            ) : (
              <>
                <span className="hidden lg:inline ">Select&nbsp;</span>
                <span className="truncate">{entityDisplayName}</span>
              </>
            )}
          </span>

          <span className="flex px-0 md:px-2 gap-1 md:gap-2">
            {/* Convenience button to view configuration */}
            {node && value && (
              <ViewLinkControl entityName={value} entityType={targetType} schema={node} />
            )}

            {/* Edit the configuration in place as inline */}
            {value && onEdit && (
              <Button
                className="rounded-md cursor-pointer text-xs"
                onClick={() => onEdit(value)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Pencil size={16} />
                <span className="hidden lg:inline ">Edit Inline</span>
              </Button>
            )}

            {onRefresh && (
              <Button
                className="cursor-pointer"
                onClick={onRefresh}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ListRestart size={16} />
                <span className="hidden lg:inline ">Refresh</span>
              </Button>
            )}
          </span>
        </h4>

        {after}
      </FieldLabel>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading saved {label}...
        </div>
      ) : available.length > 0 ? (
        <Field>
          <ButtonGroup className="flex flex-1 min-w-0">
            <Select disabled={isReadOnly} onValueChange={onChange} value={value ?? undefined}>
              <SelectTrigger className="bg-background flex-1" id={fieldId}>
                <SelectValue placeholder={`Select a ${label}...`} />
              </SelectTrigger>

              {/* Entity options */}
              <SelectContent>
                {available
                  .sort((a, b) =>
                    typeof a?.name === 'string' && typeof b?.name === 'string'
                      ? a.name.localeCompare(b.name)
                      : 0,
                  )
                  .map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{entity.name}</span>
                        {entity.id && (
                          <span className="text-xs text-muted-foreground truncate">
                            • {entity.id}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Link to details */}
            {selected && (
              <Button
                asChild
                onClick={(e: any) => e.stopPropagation()}
                type="button"
                variant="secondary"
              >
                <a
                  href={`/${schema.data.stateEntryToUrl?.[targetType] ?? targetType}/${selected.id}`}
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </ButtonGroup>
        </Field>
      ) : (
        <Note
          message={
            <>
              No {label} configurations found. Create one in Configuration →{' '}
              {schema.data.entityDisplayNames?.[targetType] ?? targetType}.
            </>
          }
          mode="note"
        />
      )}

      {!isReadOnly && (
        <FieldDescription className="text-xs">
          Choose from existing {entityDisplayName.toLowerCase()} configurations
        </FieldDescription>
      )}
    </Field>
  );
}
