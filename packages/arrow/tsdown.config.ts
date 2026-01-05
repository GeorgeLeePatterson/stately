import { execSync } from "node:child_process";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",

    // Plugin
    "api": "src/api.ts",
    "context": "src/context.tsx",
    "plugin": "src/plugin.ts",
    "schema": "src/schema.ts",

    // React
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.tsx",
    "lib/index": "src/lib/index.ts",
    "pages/index": "src/pages/index.ts",
    "types/api": "src/types/api.ts",
    "views/index": "src/views/index.ts",
    "views/connectors/index": "src/views/connectors/index.ts",
    "views/query/index": "src/views/query/index.ts",
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
  copy: [{ from: "src/styles.css", rename: "styles.css" }],
});
