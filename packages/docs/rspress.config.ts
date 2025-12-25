import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  // base: '',
  // builderConfig: {
  //   html: { tags: [] },
  // },
  description:
    'A composable state management framework for building full-stack applications with Rust and TypeScript/React',
  icon: '/favicon.ico',
  llms: true,
  logo: '/stately-icon.png',
  logoText: 'Stately',
  markdown: {
    link: {
      checkDeadLinks: {
        excludes: ['/stately-icon.png', '/llms-full.txt'],
      },
    },
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
