import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const PostSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  abstract: z.string(),
  draft: z.boolean().default(true),
});

const post = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/post" }),
  schema: PostSchema,
});

const seriePost = defineCollection({
  loader: glob({ pattern: "*/*/*.md", base: "./src/content/serie" }),
  schema: PostSchema,
});

const serie = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/serie" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    abstract: z.string(),
    posts: z.array(reference("seriePost")),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
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
  work: work,
  post: post,
  seriePost: seriePost,
  serie: serie,
};
