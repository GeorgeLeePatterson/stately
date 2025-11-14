import { useQuery } from "@tanstack/react-query";
import type {
  CoreEntity,
  CoreSchemas,
  CoreStateEntry,
} from "@/core";
import { useCoreStatelyUi } from "@/core";

type EntityResponse<Schema extends CoreSchemas> = {
  id: string;
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
  const runtime = useCoreStatelyUi();
  const coreApi = runtime.plugins.core?.api;
  const fetchEnabled = !!entity && !disabled && !!identifier;
  return useQuery({
    queryKey: ["entity", entity, identifier],
    queryFn: async () => {
      if (!coreApi) {
        throw new Error("Core entity API is unavailable.");
      }
      if (!identifier) {
        console.warn("Identifier is missing, can't fetch entity");
        return;
      }

      if (!entity) {
        console.warn("Entity type is required", { identifier });
        throw new Error(`Unknown entity type: ${entity}`);
      }

      const { data, error } = await coreApi.call(
        coreApi.operations.getEntityById,
        {
          params: {
            path: { entity_id: identifier },
            query: { entity_type: entity },
          },
        }
      );

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
