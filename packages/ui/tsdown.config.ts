import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    // Base + Core
    index: "src/index.ts",
    schema: "src/schema.ts",
    // Base
    "base/index": "src/base/index.ts",
    "base/components/index": "src/base/components/index.ts",
    "base/dialogs/index": "src/base/dialogs/index.ts",
    "base/form/index": "src/base/form/index.ts",
    "base/hooks/index": "src/base/hooks/index.ts",
    "base/layout/index": "src/base/layout/index.ts",
    "base/lib/utils": "src/base/lib/utils.ts",
    "base/lib/logging": "src/base/lib/logging.ts",
    "base/ui/index": "src/base/ui/index.ts",
    // Core
    "core/index": "src/core/index.ts",
    "core/context/index": "src/core/context/index.ts",
    "core/dialogs/index": "src/core/dialogs/index.ts",
    "core/fields/index": "src/core/fields/index.ts",
    "core/fields/edit/index": "src/core/fields/edit/index.ts",
    "core/fields/view/index": "src/core/fields/view/index.ts",
    //     TODO: Individual Fields
    "core/hooks/index": "src/core/hooks/index.ts",
    "core/pages/index": "src/core/pages/index.ts",
    "core/schema/index": "src/core/schema/index.ts",
    "core/views/entity/index": "src/core/views/entity/index.ts",
    "core/views/link/index": "src/core/views/link/index.ts",

  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  async onSuccess() {
    // Copy source CSS file to dist (not compiled - consuming app will process it)
    const fs = await import('fs/promises');
    await fs.copyFile('src/base/index.css', 'dist/styles.css');
  },
});
