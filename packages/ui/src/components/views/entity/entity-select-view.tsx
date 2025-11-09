import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { ExternalLink, ListRestart, Loader2, Pencil } from 'lucide-react';
import { useId } from 'react';
import { Note } from '@/components/base/note';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStatelyUi } from '@/context';
import { ViewLinkControl } from '@/context/link-explore-context';

interface EntitySelectFormProps<Config extends StatelyConfig = StatelyConfig> {
  /** Whether the form is readonly */
  isReadOnly?: boolean;
  /** Show loading indicator */
  isLoading?: boolean;
  /** The entity type being referenced */
  targetType: StatelySchemas<Config>['StateEntry'];
  /** List of entity refs */
  available: Array<Config['components']['schemas']['Summary']>;
  /** Schema for the inline entity */
  schema: StatelySchemas<Config>['ObjectNode'];
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

export function EntitySelectForm<Config extends StatelyConfig = StatelyConfig>({
  isReadOnly,
  isLoading,
  targetType,
  available,
  schema,
  value,
  onChange,
  onRefresh,
  after,
  onEdit,
}: EntitySelectFormProps<Config>) {
  const { integration } = useStatelyUi();
  const entityDisplayName = integration.entityDisplayNames[targetType];
  const label = integration.helpers.generateFieldLabel(targetType);
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
            {schema && value && (
              <ViewLinkControl entityType={targetType} entityName={value} schema={schema} />
            )}

            {/* Edit the configuration in place as inline */}
            {value && onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-md cursor-pointer text-xs"
                onClick={() => onEdit(value)}
              >
                <Pencil size={16} />
                <span className="hidden lg:inline ">Edit Inline</span>
              </Button>
            )}

            {onRefresh && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="cursor-pointer"
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
            <Select value={value ?? undefined} onValueChange={onChange} disabled={isReadOnly}>
              <SelectTrigger id={fieldId} className="bg-background flex-1">
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
                type="button"
                variant="secondary"
                onClick={(e: any) => e.stopPropagation()}
                asChild
              >
                <a
                  href={`/${integration.stateEntryToUrl[targetType]}/${selected.id}`}
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
          mode="note"
          message={
            <>
              No {label} configurations found. Create one in Configuration →{' '}
              {integration.entityDisplayNames[targetType]}.
            </>
          }
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
