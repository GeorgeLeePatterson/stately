import { defineConfig } from "tsdown";

export default defineConfig({
  // entry: 'src/**/*.tsx?',
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  exports: true,
  // entry: [
  //   // Main entry points (barrel exports)
  //   "src/index.ts",
  //   "src/components/index.ts",
  //   "src/dialogs/index.ts",
  //   "src/form/index.ts",
  //   "src/hooks/index.ts",
  //   "src/layout/index.ts",
  //   "src/lib/utils.ts",
  //   "src/lib/logging.ts",
  //   // Granular base components for tree-shaking (no barrel)
  //   "src/components/base/*.tsx",
  //   // Granular top-level components
  //   "src/components/*.tsx",
  //   // Granular form components
  //   "src/form/*.tsx",
  //   // Granular layout components
  //   "src/layout/*.tsx",
  //   // Granular dialog components
  //   "src/dialogs/*.tsx",
  //   // Granular hooks
  //   "src/hooks/*.tsx?",
  // ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  async onSuccess() {
    // Copy source CSS file to dist (not compiled - consuming app will process it)
    const fs = await import('fs/promises');
    await fs.copyFile('src/index.css', 'dist/styles.css');
  },
});
