import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    // Main entry points
    index: "src/index.ts",
    schema: "src/schema.ts",
    // CLI
    "cli/index": "src/cli/index.ts",
    // Codegen (types for plugin authors + generator)
    "codegen/index": "src/codegen/index.ts",
    "codegen/generate": "src/codegen/generate.ts",
    // Core plugin
    "core/index": "src/core/index.ts",
    "core/context/index": "src/core/context/index.ts",
    "core/dialogs/index": "src/core/dialogs/index.ts",
    "core/fields/index": "src/core/fields/index.ts",
    "core/fields/edit/index": "src/core/fields/edit/index.ts",
    "core/fields/view/index": "src/core/fields/view/index.ts",
    "core/hooks/index": "src/core/hooks/index.ts",
    "core/pages/index": "src/core/pages/index.ts",
    "core/schema/index": "src/core/schema/index.ts",
    "core/schema/utils": "src/core/schema/utils.ts",
    "core/utils": "src/core/utils.tsx",
    "core/views/entity/index": "src/core/views/entity/index.ts",
    "core/views/link/index": "src/core/views/link/index.ts",
  },
  exports: true,
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
