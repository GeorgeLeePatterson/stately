import { useQuery } from "@tanstack/react-query";
import { useStatelyUi } from "@/context";
import type {
  CoreEntity,
  CoreEntityId,
  CoreSchemas,
  CoreStateEntry,
} from "@/core";

type EntityResponse<Schema extends CoreSchemas> = {
  id: CoreEntityId<Schema>;
  entity: CoreEntity<Schema>;
};

export function useEntityData<Schema extends CoreSchemas = CoreSchemas>({
  entity,
  identifier,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  identifier?: string;
  disabled?: boolean;
}) {
  const { http } = useStatelyUi();
  const { api } = http;
  const fetchEnabled = !!entity && !disabled && !!identifier;
  return useQuery({
    queryKey: ["entity", entity, identifier],
    queryFn: async () => {
      if (!identifier) {
        console.warn("Identifier is missing, can't fetch entity");
        return;
      }

      if (!entity) {
        console.warn("Entity type is required", { identifier });
        throw new Error(`Unknown entity type: ${entity}`);
      }

      const { data, error } = await api.entity.get({
        id: identifier,
        type: entity,
      });

      if (error) {
        console.error("API Error fetching entity:", error);
        throw new Error("Failed to fetch entity");
      }

      console.debug("Successfully fetched entity", { data });
      return data as EntityResponse<Schema>;
    },
    enabled: fetchEnabled,
  });
}
