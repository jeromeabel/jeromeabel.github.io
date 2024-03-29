import { defineCollection, z } from 'astro:content';

const featureCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      img: image()
    }),
});

const workCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      img: image().refine((img) => img.width >= 500, {
        message: 'Cover image must be at least 500 pixels wide!',
      }),
      img_placeholder: image(),
      img_preview: image().refine((img) => img.width >= 500, {
        message: 'Cover image must be at least 500 pixels wide!',
      }),
	  img_preview_placeholder: image().optional(),
      img_social: image().optional(),
      description: z.string(),
      abstract: z.string(),
      type: z.string(),
      git: z.string().optional(),
      website: z.string().optional(),
      live: z.string().optional(),
      video: z.string().optional(),
      stack: z.array(z.string()).optional(),
    }),
});

export const collections = {
  work: workCollection,
  feature: featureCollection,
};
