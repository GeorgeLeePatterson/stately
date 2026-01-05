import { execSync } from "node:child_process";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  exports: {
    all: true,
    customExports(pkg) {
      // Delete wildcard exports
      delete pkg['./*'];
      // Add CSS exports that are copied/generated via hooks
      pkg['./styles.css'] = './dist/styles.css';
      return pkg;
    },
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    // CodeMirror/Lezer - must be external to avoid duplicate instances breaking instanceof checks
    /^@codemirror\//,
    /^@lezer\//,
    /^@uiw\//,
  ],
  copy: [{ from: "src/styles.css", rename: "styles.css" }],
});
