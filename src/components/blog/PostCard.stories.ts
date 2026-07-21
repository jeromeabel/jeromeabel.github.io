import type { ComponentProps } from "astro/types";
import PostCard from "./PostCard.astro";
import { getAllStandalonePosts } from "../../utils/repository";

const posts = await getAllStandalonePosts();

export default { component: PostCard, title: "Legacy/PostCard" };

export const Default = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostCard>,
};
