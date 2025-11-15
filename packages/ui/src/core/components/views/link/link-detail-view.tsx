import { useStatelyUi } from "@/context";
import { Skeleton } from "@/core/components/ui/skeleton";
import type { CoreLinkNode } from "@/core";
import { useEntityData } from "@/core/hooks/use-entity-data";
import type { LinkFor } from "./link-edit-view";
import { LinkInlineView } from "./link-inline-view";
import { LinkRefView } from "./link-ref-view";
import { ViewFieldProps } from "@/base/form/field-view";
import { useCoreStatelyUi } from "@/context";
import { Schemas } from "@stately/schema";

export type LinkViewProps<Schema extends Schemas = Schemas> =
  ViewFieldProps<Schema, CoreLinkNode<Schema>, LinkFor<Schema>>;

export function LinkView<Schema extends Schemas = Schemas>({
  value,
  node,
}: LinkViewProps<Schema>) {
  const { schema } = useCoreStatelyUi();
  const inlineSchema = (node as CoreLinkNode<Schema>).inlineSchema;

  // Extract entity_type and actual value
  const entityType = node?.targetType;
  const stateEntry = entityType || value?.entity_type;

  const identifier = value && "ref" in value ? value.ref : undefined;

  const { data, isLoading } = useEntityData<Schema>({
    entity: stateEntry,
    identifier,
    disabled: !identifier,
  });

  if (!value || typeof value !== "object") {
    console.warn(
      "LinkView: value must be an object with entity_type and ref/inline",
    );
    return null;
  }

  if (!stateEntry) {
    console.warn("LinkView: entity_type is required");
    return null;
  }

  // Convert StateEntry to URL-friendly format for routing
  const urlType = schema.data.stateEntryToUrl?.[stateEntry];
  if (!urlType) {
    console.warn(`LinkView: unknown entity type ${stateEntry}`);
    return null;
  }

  if (identifier && isLoading) {
    return <Skeleton className="w-full flex-1 min-w-0" />;
  }

  // Render as a reference with a link
  if ("ref" in value) {
    const entity = data?.entity?.data;
    return (
      <LinkRefView
        name={entity && "name" in entity ? entity?.name : undefined}
        urlType={urlType}
        value={value}
        schema={inlineSchema}
      />
    );
  }

  // Render inline configuration
  if ("inline" in value) {
    return (
      <LinkInlineView
        targetType={value.entity_type}
        node={inlineSchema}
        value={value.inline}
      />
    );
  }

  console.warn("LinkView: value must have either ref or inline field");
  return null;
}
