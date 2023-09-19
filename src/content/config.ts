import { defineCollection, z } from 'astro:content';

export const collections = {
  work: defineCollection({
    schema: z.object({
      title: z.string(),
      date: z.coerce.date(),
      img: z.string(),
	  img_preview: z.string(),
      description: z.string(),
      abstract: z.string(),
      type: z.string(),
      git: z.string().optional(),
      website: z.string().optional(),
	  live: z.string().optional(),
      stack: z.array(z.string()).optional(),
      home: z.boolean().optional(),
    }),
  }),
};
