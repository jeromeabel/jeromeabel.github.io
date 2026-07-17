import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import { getMinutesFromBody } from "./get-minutes-read";

export const getAllPosts = async () =>
  (await getCollection("post"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));

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

export const getFeaturedPosts = async (count: number) => {
  const posts = await getAllPosts();
  const featured = posts
    .filter((post) => post.data.featured !== undefined)
    .sort((a, b) => (a.data.featured ?? 0) - (b.data.featured ?? 0));
  const rest = posts.filter((post) => post.data.featured === undefined);
  return [...featured, ...rest].slice(0, count);
};

export const getFeaturedWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured !== undefined)
    .sort(
      (a, b) =>
        (a.data.featured ?? 0) - (b.data.featured ?? 0) ||
        b.data.date.valueOf() - a.data.date.valueOf(),
    );

const WORK_ERAS = [
  { label: "Training & first web projects (2022–2024)", from: 2022, to: 2100 },
  { label: "Interactive art & research (2012–2021)", from: 1900, to: 2021 },
];

export const getEarlierWorksByEra = async () => {
  const earlier = (await getCollection("work"))
    .filter((work) => work.data.featured === undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return WORK_ERAS.map((era) => ({
    label: era.label,
    works: earlier.filter((work) => {
      const year = work.data.date.getFullYear();
      return year >= era.from && year <= era.to;
    }),
  })).filter((era) => era.works.length > 0);
};

export const getSerieStats = async (serie: CollectionEntry<"serie">) => {
  const posts = await getPostsFromSerie(serie);
  const minutes = posts.reduce(
    (total, post) => total + getMinutesFromBody(post.body),
    0,
  );
  return { parts: posts.length, minutes: Math.ceil(minutes) };
};
