import { StatelyConfig, StatelySchemas } from "@stately/schema";
import { EntityDetailView } from "../entity/entity-detail-view";

export interface LinkInlineViewProps<Config extends StatelyConfig = StatelyConfig> {
  targetType: StatelySchemas<Config>['StateEntry'];
  node: StatelySchemas<Config>['ObjectNode'];
  value: StatelySchemas<Config>['EntityData'];
}

export function LinkInlineView<Config extends StatelyConfig = StatelyConfig>({
  targetType,
  node,
  value,
}: LinkInlineViewProps<Config>) {
  return (
    <div className={'border-l-4 border-primary/20 pl-3 space-y-3'}>
      <EntityDetailView entityType={targetType} node={node} entity={value} disableJsonView />
    </div>
  );
}
