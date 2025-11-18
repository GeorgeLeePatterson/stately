import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    // Plugin
    codegen: "src/codegen.ts",
    // React
    "components/index": "src/components/index.ts",
    "dialogs/index": "src/dialogs/index.ts",
    "fields/edit": "src/fields/edit/index.ts",
    "fields/view": "src/fields/view/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "types/api": "src/types/api.ts",
    "views/index": "src/views/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
