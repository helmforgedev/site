import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { AUTHORS } from './data/authors';

const AUTHOR_IDS = Object.keys(AUTHORS) as [string, ...string[]];

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    publishDate: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    authorId: z.enum(AUTHOR_IDS),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    coverImage: z.string().min(1),
    coverAlt: z.string().min(24),
    schemaType: z.enum(['Article', 'BlogPosting', 'NewsArticle']).default('BlogPosting'),
  }),
});

export const collections = { blog };
