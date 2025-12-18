import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  exports: {
    all: true,
    customExports(pkg) {
      // Add CSS export that's copied via the 'copy' option
      pkg['./styles.css'] = './dist/styles.css';
      return pkg;
    },
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  copy: [{ from: 'src/index.css', rename: 'styles.css' }],
});
