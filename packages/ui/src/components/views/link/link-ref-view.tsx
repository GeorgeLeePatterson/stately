import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { ViewLinkControl } from "@/context/link-explore-context";
import { cn } from "@/lib/utils";
import { StatelyConfig, StatelySchemas } from "@stately/schema";
import { ExternalLink } from "lucide-react";

export interface LinkRefViewProps<Config extends StatelyConfig = StatelyConfig> {
  label?: React.ReactNode;
  name?: string;
  urlType: string;
  value: { entity_type: StatelySchemas<Config>['StateEntry']; ref: string };
  schema?: StatelySchemas<Config>['ObjectNode'];
  isRequired?: boolean;
}

export function LinkRefView<Config extends StatelyConfig = StatelyConfig>({
  label,
  name,
  urlType,
  value,
  schema,
  isRequired,
}: LinkRefViewProps<Config>) {
  return (
    <>
      <Item
        className={cn('flex-1 bg-muted', isRequired && !value?.ref ? 'border-red-500' : '')}
        size="sm"
      >
        <ItemContent>
          <ItemTitle>
            Name:{' '}
            {name ||
              value.ref ||
              (isRequired ? <span className="text-red-500">Invalid, missing ref</span> : 'Unknown')}
          </ItemTitle>
          {label && <ItemDescription>{label} Configuration</ItemDescription>}
        </ItemContent>
        <ItemActions>
          {/* Convenience button to view configuration */}
          {schema && value?.ref && (
            <ViewLinkControl
              entityType={value.entity_type}
              entityName={value.ref}
              schema={schema}
            />
          )}

          {value?.ref && (
            <Button
              variant="default"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              asChild
            >
              <a href={`/entities/${urlType}/${value.ref}`} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </ItemActions>
      </Item>
    </>
  );
}
