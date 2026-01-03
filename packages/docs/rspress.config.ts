import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';
import { Application } from 'typedoc';

export default defineConfig({
  // Set base path for GitHub Pages deployment (https://georgeleepatterson.github.io/stately/)
  base: '/stately/',
  description:
    'A composable state management framework for building full-stack applications with Rust and TypeScript/React',
  icon: '/favicon.ico',
  llms: true,
  // Note: logo path must include base path for GitHub Pages deployment
  logo: { dark: '/stately/stately-icon.png', light: '/stately/stately-icon.png' },
  logoText: 'Stately',
  markdown: {
    link: { checkDeadLinks: { excludes: ['/stately/stately-icon.png', '/llms-full.txt'] } },
    showLineNumbers: true,
  },
  plugins: [
    pluginTypeDoc({
      // Provide a valid entry point so the plugin's initial bootstrap doesn't fail
      // We'll replace the app entirely in setup anyway
      entryPoints: ['../../packages/schema/src/index.ts'],
      setup: async () => {
        // Bootstrap a fresh TypeDoc application with our root config
        // This bypasses the plugin's default bootstrap which doesn't support packages strategy
        const monorepoRoot = path.resolve(__dirname, '../..');
        const originalCwd = process.cwd();
        try {
          // Change to monorepo root so typedoc resolves "packages/*" correctly
          process.chdir(monorepoRoot);
          // Dynamic import to avoid type issues with typedoc-plugin-markdown
          // @ts-expect-error - typedoc-plugin-markdown types not available
          const { load: loadPluginMarkdown } = await import('typedoc-plugin-markdown');
          const app = await Application.bootstrapWithPlugins({
            alwaysCreateEntryPointModule: true,
            cleanOutputDir: false,
            entryFileName: 'index',
            hideBreadcrumbs: true,
            // rspress-friendly settings (from typedoc-plugin-markdown)
            hidePageHeader: true,
            options: path.join(monorepoRoot, 'typedoc.json'),
            plugin: [loadPluginMarkdown],
            readme: 'none',
            // Use 'module' router to avoid duplicate nested index entries
            router: 'module',
          } as Parameters<typeof Application.bootstrapWithPlugins>[0]);
          return app;
        } finally {
          process.chdir(originalCwd);
        }
      },
    }),
  ],
  root: path.join(__dirname, '../../docs'),
  // route: { exclude: ['**/fragments/**'] },
  themeConfig: {
    enableAppearanceAnimation: true,
    enableContentAnimation: true,
    enableScrollToTop: true,
    footer: { message: 'Released under the Apache 2.0 License.' },
    lastUpdated: process.env.NODE_ENV === 'production',
    socialLinks: [
      { content: 'https://www.npmjs.com/package/@statelyjs/stately', icon: 'npm', mode: 'link' },
      { content: 'https://github.com/GeorgeLeePatterson/stately', icon: 'github', mode: 'link' },
    ],
  },
  title: 'Stately',
});
