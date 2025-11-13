import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    // Base + Core
    index: "src/index.ts",
    // Core
    "core/index": "src/core/index.ts",
    "core/components/fields/index": "src/core/components/fields/index.ts",
    "core/components/dialogs/index": "src/core/components/dialogs/index.ts",
    "core/components/views/index": "src/core/components/views/index.ts",
    "core/hooks/index": "src/core/hooks/index.ts",
    "core/context/index": "src/core/context/index.ts",
    // Base
    "core/base/index": "src/base/index.ts",
    "core/base/components": "src/base/components/index.ts",
    "core/base/form": "src/base/form/index.ts",
    "core/base/hooks": "src/base/hooks/index.ts",
    "core/base/lib/utils": "src/base/lib/utils.ts",

  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
