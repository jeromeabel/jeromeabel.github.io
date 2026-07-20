import type { ComponentProps } from "astro/types";
import SeriePostCard from "./SeriePostCard.astro";
import { getAllSeriePosts } from "../../utils/repository";

const posts = await getAllSeriePosts();

export default { component: SeriePostCard, title: "Legacy/SeriePostCard" };

export const Default = {
  args: { post: posts[0] } satisfies ComponentProps<typeof SeriePostCard>,
};
