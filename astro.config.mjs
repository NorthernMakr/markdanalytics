import { defineConfig } from 'astro/config';

// Used for canonical URLs. Override with SITE_URL if the address ever changes.
export default defineConfig({
  site: process.env.SITE_URL || 'https://markdanalytics.ca',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
