import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const workCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      img: image(),
      img_placeholder: image(),
      img_preview: image(),
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
};
