import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts live in src/content/blog/*.md. The frontmatter fields below also
// feed each post's dataLayer `content` object (see src/pages/blog/[...slug].astro).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    platform: z.enum(['Adobe', 'Google', 'Both', 'Other']).default('Both'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
