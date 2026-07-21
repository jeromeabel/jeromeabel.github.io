import type { ComponentProps } from "astro/types";
import PostListItem from "./PostListItem.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import { getAllStandalonePosts } from "../../utils/repository";

const posts = await getAllStandalonePosts();

export default { component: PostListItem };

export const Default = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostListItem>,
  decorators: [{ component: StoryContainer }],
};
