import { SimpleLabel } from '@statelyjs/ui/components';
import { useState } from 'react';
import type { CoreEntityData } from '@/core';
import type { Schemas } from '@/core/schema';
import { SINGLETON_ID } from '@/core/schema';
import { EntityFormView } from './entity-form-view';
import { EntityJsonView } from './entity-properties';

export interface EntityDetailViewProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  entity: CoreEntityData<Schema>;
  entityId?: string;
  disableJsonView?: boolean;
}

export function EntityDetailView<Schema extends Schemas = Schemas>({
  node,
  entity,
  entityId,
  disableJsonView,
}: EntityDetailViewProps<Schema>) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  return (
    <div className="">
      {/* Entity ID  */}
      {entityId && entityId !== SINGLETON_ID && (
        <div className="text-xs text-muted-foreground font-mono">
          <SimpleLabel>ID:</SimpleLabel> {entityId}
        </div>
      )}

      {/* Entity form data */}
      <EntityFormView entity={entity} node={node} />

      {/* Json view */}
      {!disableJsonView && (
        <EntityJsonView data={entity} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />
      )}
    </div>
  );
}
