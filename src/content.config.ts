import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const draft = z.boolean().optional().default(false);
const tags = z.array(z.string()).optional().default([]);
const precision = z.enum(['approximate', 'exact', 'hidden']).optional().default('approximate');

const essays = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    series: z.enum(['china', 'standalone']).optional().default('china'),
    summary: z.string().optional().default(''),
    tags,
    heroImage: z.string().nullish(),
    heroAlt: z.string().optional().default(''),
    legacyHeroImage: z.string().nullish(),
    draft,
  }),
});

const cyber = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/cyber' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags,
    region: z.string().optional().default('Australia – Japan – Asia'),
    summary: z.string().optional().default(''),
    draft,
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags,
    location: z.string().optional().default(''),
    locationPrecision: precision,
    summary: z.string().optional().default(''),
    cover: z.string().nullish(),
    coverAlt: z.string().optional().default(''),
    draft,
  }),
});

const photography = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/photography' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags,
    location: z.string().optional().default(''),
    locationPrecision: precision,
    photos: z
      .array(z.object({ image: z.string(), alt: z.string(), caption: z.string().optional().default(''), tags }))
      .optional()
      .default([]),
    draft,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    image: z.string().optional().default(''),
    imageAlt: z.string().optional().default(''),
  }),
});

export const collections = { essays, cyber, journal, photography, pages };
