import type { Schemas } from '@stately/schema';
import type { ObjectNode } from '@stately/schema/core/nodes';
import type { AnyRecord } from '@stately/schema/helpers';
import { FieldLegend } from '@/base/ui/field';
import type { CoreEntity, CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/index';
import { EditMode, EntityEditView } from '../entity/entity-edit-view';
import type { LinkFor } from './link-edit-view';

export interface LinkInlineEditProps<Schema extends Schemas = Schemas> {
  /** The entity type being configured inline */
  targetType: CoreStateEntry<Schema>;
  /** Schema for the inline entity */
  node: ObjectNode;
  /** Current value from parent (either ref or inline) */
  value?: LinkFor<Schema> | null;
  /** Called when save is clicked with new inline value */
  onChange: (value: LinkFor<Schema>) => void;
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
export function LinkInlineEdit<Schema extends Schemas = Schemas>({
  targetType,
  node,
  value,
  onChange,
  after,
  isWizard,
}: LinkInlineEditProps<Schema>) {
  const { schema } = useStatelyUi<Schema>();
  const entityValue: CoreEntity<Schema>['data'] =
    value && 'inline' in value ? value.inline : ({} as CoreEntity<Schema>['data']);

  // Handle changes: wrap the entity back up
  const handleChange = (entity: AnyRecord) => {
    onChange({ entity_type: targetType, inline: entity } as LinkFor<Schema>);
  };

  const entityDisplayName = schema.data.entityDisplayNames?.[targetType] ?? String(targetType);

  return (
    <>
      <FieldLegend className="flex justify-between flex-1 w-full">
        <div className="text-sm font-medium">Inline {entityDisplayName} Configuration</div>
        {after}
      </FieldLegend>

      <div className={'flex flex-col min-h-0 border-l-4 border-primary/20 pl-3 space-y-3'}>
        <EntityEditView
          defaultMode={isWizard ? EditMode.WIZARD : undefined}
          node={node}
          onChange={handleChange}
          value={entityValue}
        />
      </div>
    </>
  );
}
