import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    // Base + Core
    index: "src/index.ts",
    // Base
    "base/index": "src/base/index.ts",
    "base/components/index": "src/base/components/index.ts",
    "base/dialogs/index": "src/base/dialogs/index.ts",
    "base/form/index": "src/base/form/index.ts",
    "base/hooks/index": "src/base/hooks/index.ts",
    "base/lib/utils": "src/base/lib/utils.ts",
    "base/layout/index": "src/base/layout/index.ts",
    "base/ui/index": "src/base/ui/index.ts",
    // Core
    "core/index": "src/core/index.ts",
    "core/components/fields/index": "src/core/components/fields/index.ts",
    "core/components/fields/edit/index": "src/core/components/fields/edit/index.ts",
    "core/components/fields/view/index": "src/core/components/fields/view/index.ts",
    //     TODO: Individual Fields
    "core/components/dialogs/index": "src/core/components/dialogs/index.ts",
    "core/components/views/index": "src/core/components/views/index.ts",
    "core/components/views/entity/index": "src/core/components/views/entity/index.ts",
    "core/components/views/link/index": "src/core/components/views/link/index.ts",
    "core/context/index": "src/core/context/index.ts",
    "core/hooks/index": "src/core/hooks/index.ts",

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
