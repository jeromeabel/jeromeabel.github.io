import type { ComponentProps } from "astro/types";
import SeriePostListItem from "./SeriePostListItem.astro";
import { getAllSeriePosts } from "../../utils/repository";

const posts = await getAllSeriePosts();

export default { component: SeriePostListItem };

export const Default = {
  args: {
    post: posts[0],
    index: 0,
  } satisfies ComponentProps<typeof SeriePostListItem>,
};
