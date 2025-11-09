import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { FieldLegend } from '@/components/ui/field';
import { useStatelyUi } from '@/context';
import { EditMode, EntityEditView } from '../entity/entity-edit-view';
import type { LinkFor } from './link-edit-view';

interface LinkInlineEditProps<Config extends StatelyConfig = StatelyConfig> {
  /** The entity type being configured inline */
  targetType: StatelySchemas<Config>['StateEntry'];
  /** Schema for the inline entity */
  schema: StatelySchemas<Config>['ObjectNode'];
  /** Current value from parent (either ref or inline) */
  value: LinkFor<StatelySchemas<Config>> | null;
  /** Called when save is clicked with new inline value */
  onChange: (value: LinkFor<StatelySchemas<Config>>) => void;
  /** Render the mode toggle */
  after?: React.ReactNode;
  /** Whether the form is being used in a wizard */
  isWizard?: boolean;
}

/**
 * Component for editing Link<T> in inline mode
 *
 * Responsibilities:
 * - Manage its own formData and isDirty state
 * - Display nested entity form
 * - Handle save/cancel with proper validation
 * - Delegate to EntityEditView for actual field rendering
 */
export function LinkInlineEdit<Config extends StatelyConfig = StatelyConfig>({
  targetType,
  schema,
  value,
  onChange,
  after,
  isWizard,
}: LinkInlineEditProps<Config>) {
  const { integration } = useStatelyUi();
  const entityValue: StatelySchemas<Config>['EntityData'] =
    value && 'inline' in value ? value.inline : ({} as StatelySchemas<Config>['EntityData']);

  // Handle changes: wrap the entity back up
  const handleChange = (entity: AnyRecord) => {
    onChange({ entity_type: targetType, inline: entity } as LinkFor<Config>);
  };

  const entityDisplayName = integration.entityDisplayNames[targetType];

  return (
    <>
      <FieldLegend className="flex justify-between flex-1 w-full">
        <div className="text-sm font-medium">Inline {entityDisplayName} Configuration</div>
        {after}
      </FieldLegend>

      <div className={'flex flex-col min-h-0 border-l-4 border-primary/20 pl-3 space-y-3'}>
        <EntityEditView
          schema={schema}
          value={entityValue}
          onChange={handleChange}
          defaultMode={isWizard ? EditMode.WIZARD : undefined}
        />
      </div>
    </>
  );
}
