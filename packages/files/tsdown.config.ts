import { execSync } from "node:child_process";
import { defineConfig } from "tsdown";

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
    "pages/index": "src/pages/index.ts",
    "types/api": "src/types/api.ts",
    "views/index": "src/views/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    // Peer dependencies - don't bundle, let consumers provide these
    "@statelyjs/stately",
    "@statelyjs/ui",
    /^@statelyjs\/stately\//,
    /^@statelyjs\/ui\//,
  ],
  onSuccess() {
    // Generate pre-built Tailwind utilities CSS
    execSync('pnpm exec tailwindcss -i src/styles.css -o dist/styles.css --minify', {
      stdio: 'inherit',
    });
  },
});
