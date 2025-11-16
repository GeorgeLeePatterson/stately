import type { Schemas } from '@stately/schema';
import type { CoreEntity, CoreObjectNode, CoreStateEntry } from '@/core';
import { EntityDetailView } from '../entity/entity-detail-view';

export interface LinkInlineViewProps<Schema extends Schemas = Schemas> {
  targetType: CoreStateEntry<Schema>;
  node: CoreObjectNode<Schema>;
  value: CoreEntity<Schema>['data'];
}

export function LinkInlineView<Schema extends Schemas = Schemas>({
  targetType,
  node,
  value,
}: LinkInlineViewProps<Schema>) {
  return (
    <div className={'border-l-4 border-primary/20 pl-3 space-y-3'}>
      <EntityDetailView disableJsonView entity={value} entityType={targetType} node={node} />
    </div>
  );
}
