import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import { getMinutesFromBody } from "./get-minutes-read";

export const getAllSeriePosts = async () =>
  (await getCollection("seriePost"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));

export const getAllBlogPosts = async () => {
  const posts = await getCollection("post");
  const seriePosts = await getCollection("seriePost");

  return [...posts, ...seriePosts]
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
};

export const getAllSeries = async () =>
  (await getCollection("serie")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const getPostsFromSerie = async (serie: CollectionEntry<"serie">) =>
  (await getEntries(serie.data.posts)).filter((post) =>
    import.meta.env.PROD ? post.data.draft !== true : true,
  );

export const getFeaturedSeries = async () =>
  (await getCollection("serie"))
    .filter((serie) => serie.data.featured !== undefined)
    .sort((a, b) => (a.data.featured ?? 0) - (b.data.featured ?? 0));

export const getFeaturedWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured !== undefined)
    .sort(
      (a, b) =>
        (a.data.featured ?? 0) - (b.data.featured ?? 0) ||
        b.data.date.valueOf() - a.data.date.valueOf(),
    );

export const getArchiveWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured === undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const getSerieStats = async (serie: CollectionEntry<"serie">) => {
  const posts = await getPostsFromSerie(serie);
  const minutes = posts.reduce(
    (total, post) => total + getMinutesFromBody(post.body),
    0,
  );
  return { parts: posts.length, minutes: Math.ceil(minutes) };
};

export type WritingEntry = {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number };
};

export const getLatestWriting = async (
  count: number,
): Promise<WritingEntry[]> => {
  const latest = (await getAllBlogPosts()).slice(0, count);

  const membership = new Map<
    string,
    { title: string; id: string; part: number }
  >();
  for (const serie of await getAllSeries()) {
    const posts = await getPostsFromSerie(serie);
    posts.forEach((post, index) => {
      membership.set(post.id, {
        title: serie.data.title,
        id: serie.id,
        part: index + 1,
      });
    });
  }

  return latest.map((post) => ({ post, serie: membership.get(post.id) }));
};
