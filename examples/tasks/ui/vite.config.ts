import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // TODO: Remove - (dev) Remove when published packages are used
    // Dedupe React to prevent multiple instances when using linked packages
    dedupe: ['react', 'react-dom'],
  },
});
