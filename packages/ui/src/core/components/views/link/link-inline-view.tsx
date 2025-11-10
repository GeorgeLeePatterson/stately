import type { CoreEntity, CoreObjectNode, CoreSchemas, CoreStateEntry } from '@/core';
import { EntityDetailView } from '../entity/entity-detail-view';

export interface LinkInlineViewProps<Schema extends CoreSchemas = CoreSchemas> {
  targetType: CoreStateEntry<Schema>;
  node: CoreObjectNode<Schema>;
  value: CoreEntity<Schema>['data'];
}

export function LinkInlineView<Schema extends CoreSchemas = CoreSchemas>({
  targetType,
  node,
  value,
}: LinkInlineViewProps<Schema>) {
  return (
    <div className={'border-l-4 border-primary/20 pl-3 space-y-3'}>
      <EntityDetailView entityType={targetType} node={node} entity={value} disableJsonView />
    </div>
  );
}
