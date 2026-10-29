import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Shared frontmatter for blog posts and practice pages. These fields also feed
// each page's dataLayer `content` object.
const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  platform: z.enum(['Adobe', 'Google', 'Both', 'Other']).default('Both'),
  draft: z.boolean().default(false),
});

// Blog posts: src/content/blog/*.md → /blog/<file-name>/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: articleSchema,
});

// Analytics practice section: src/content/practice/*.md
// index.md → /practice/, any other file → /practice/<file-name>/
const practice = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/practice' }),
  schema: articleSchema,
});

export const collections = { blog, practice };
