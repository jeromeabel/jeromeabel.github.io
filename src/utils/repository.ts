import { getCollection, getEntries, type CollectionEntry } from "astro:content";

export const getAllPosts = async () =>
  (await getCollection("post"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));

export const getAllSeriePosts = async () =>
  (await getCollection("seriePost"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));

export const getAllBlogPosts = async (nb: number) => {
  const posts = await getCollection("post");
  const seriePosts = await getCollection("seriePost");

  return [...posts, ...seriePosts]
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, nb);
};

export const getAllSeries = async () =>
  (await getCollection("serie")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const getPostsFromSerie = async (serie: CollectionEntry<"serie">) =>
  (await getEntries(serie.data.posts)).filter((post) =>
    import.meta.env.PROD ? post.data.draft !== true : true,
  );

// export const getPostsFromSerie = async (serie: CollectionEntry<"serie">) =>
//   (await getEntries(serie.data.posts)).filter((post) => !post.data.draft);
