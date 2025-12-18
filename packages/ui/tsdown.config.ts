import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx', 'src/*.css'],
  exports: { all: true },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  copy: [{ from: 'src/index.css', rename: 'styles.css' }],
  // async onSuccess() {
  //   // Copy source CSS file to dist (not compiled - consuming app will process it)
  //   const fs = await import('fs/promises');
  //   await fs.copyFile('src/index.css', 'dist/styles.css');
  // },
});
