import { defineCollection, z } from 'astro:content';

export const collections = {
  work: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      git: z.string(),
      link: z.string().optional(),
      stack: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      img: z.string(),
      img_gradient: z.string(),
      img_alt: z.string().optional(),
      home: z.boolean().optional()
    }),
  }),
};
