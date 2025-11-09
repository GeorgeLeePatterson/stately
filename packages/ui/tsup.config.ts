import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/fields/index': 'src/components/fields/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'context/index': 'src/context/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
