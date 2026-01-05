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
      pkg['./tokens.css'] = './dist/tokens.css';
      pkg['./global.css'] = './dist/global.css';
      pkg['./animations.css'] = './dist/animations.css';
      // Provide the theme css directly
      pkg['./theme.css'] = './dist/theme.css';
      return pkg;
    },
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  // Ensure all CSS are shipped in dist/
  copy: [
    { from: "src/styles/animations.css", rename: "animations.css" },
    { from: "src/styles/global.css", rename: "global.css" },
    { from: "src/styles/styles.css", rename: "styles.css" },
    { from: "src/styles/theme.css", rename: "theme.css" },
    { from: "src/styles/tokens.css", rename: "tokens.css" },
  ],
});
