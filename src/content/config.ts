import { defineCollection, z } from 'astro:content';

const worksCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      img_preview: image().refine((img) => img.width >= 500, {
        message: 'Cover image must be at least 500 pixels wide!',
      }),
      img: image().refine((img) => img.width >= 500, {
        message: 'Cover image must be at least 500 pixels wide!',
      }),
      // image: z.object({
      //   url: z.string(),
      //   alt: z.string(),
      // }),
      // img_preview: z.string(),
      description: z.string(),
      abstract: z.string(),
      type: z.string(),
      git: z.string().optional(),
      website: z.string().optional(),
      live: z.string().optional(),
      stack: z.array(z.string()).optional(),
      home: z.boolean().optional(),
    }),
});

export const collections = {
  works: worksCollection,
};
