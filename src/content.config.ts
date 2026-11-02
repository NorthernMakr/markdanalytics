import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Frontmatter for every content page. These fields also feed each page's
// dataLayer `content` object (always from the English version).
const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  platform: z.enum(['Adobe', 'Google', 'Both', 'Other']).default('Both'),
  draft: z.boolean().default(false),
  /** Position on the section's hub page (lower first); unordered pages follow by date. */
  order: z.number().optional(),
});

// Every content page: src/content/pages/<section>/<file>.md
//   index.md  → /<section>/          (the section's hub page)
//   other.md  → /<section>/other/
// French versions: src/content/pages/fr/<section>/<same file name>.md
// Sections are defined in src/config/sections.ts.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: articleSchema,
});

export const collections = { pages };
