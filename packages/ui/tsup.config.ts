import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'core/components/base/index': 'src/core/components/base/index.ts',
    'core/components/fields/index': 'src/core/components/fields/index.ts',
    'core/components/dialogs/index': 'src/core/components/dialogs/index.ts',
    'core/components/views/index': 'src/core/components/views/index.ts',
    'core/hooks/index': 'src/core/hooks/index.ts',
    'core/context/index': 'src/core/context/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
