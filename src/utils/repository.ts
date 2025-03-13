import { getCollection, getEntries, type CollectionEntry } from "astro:content";

export const getAllPosts = async () =>
  (await getCollection("post"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));

export const getAllSeries = async () =>
  (await getCollection("serie")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const getPostsFromSerie = async (serie: CollectionEntry<"serie">) =>
  (await getEntries(serie.data.posts)).filter((post) =>
    import.meta.env.PROD ? post.data.draft !== true : true,
  );
