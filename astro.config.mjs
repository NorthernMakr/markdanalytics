import { defineConfig } from 'astro/config';
import rehypeExternalLinks from './src/lib/rehype-external-links.mjs';

// Used for canonical URLs. Override with SITE_URL if the address ever changes.
export default defineConfig({
  site: process.env.SITE_URL || 'https://markdanalytics.ca',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Links to other websites open in a new window and show where they go.
  markdown: { rehypePlugins: [rehypeExternalLinks] },
});
