import type { Schemas } from "@stately/schema";
import type { CoreSchemas } from "@/core";

export type FieldProps<S extends CoreSchemas = CoreSchemas> = {
  schema: S;
};
