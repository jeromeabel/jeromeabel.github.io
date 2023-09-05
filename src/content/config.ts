import { defineCollection, z } from 'astro:content';

export const collections = {
  work: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      abstract: z.string(),
      type: z.string(),
      date: z.coerce.date(),
      git: z.string().optional(),
      demo: z.string().optional(),
      website: z.string().optional(),
      stack: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      img: z.string(),
      img_grid: z.string(),
      img_alt: z.string().optional(),
      home: z.boolean().optional(),
      from_g: z.string().optional(),
      to_g: z.string().optional(),
    }),
  }),
};
