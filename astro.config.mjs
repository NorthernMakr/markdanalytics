import { defineConfig } from 'astro/config';
import { rename, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import rehypeExternalLinks from './src/lib/rehype-external-links.mjs';

// Astro only writes the root 404 page as 404.html; the French one comes out as
// fr/404/index.html. Cloudflare serves the nearest 404.html up the folder tree,
// so move it to fr/404.html to have missing /fr/ URLs get the French page.
const frenchNotFound = {
  name: 'french-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const out = fileURLToPath(dir);
      await rename(`${out}fr/404/index.html`, `${out}fr/404.html`);
      await rmdir(`${out}fr/404`);
    },
  },
};

// Used for canonical URLs. Override with SITE_URL if the address ever changes.
export default defineConfig({
  site: process.env.SITE_URL || 'https://markdanalytics.ca',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Links to other websites open in a new window and show where they go.
  markdown: { rehypePlugins: [rehypeExternalLinks] },
  integrations: [frenchNotFound],
});
