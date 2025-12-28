import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

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
