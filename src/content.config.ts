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
    authorId: z.enum(AUTHOR_IDS),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
});

export const collections = { blog };
