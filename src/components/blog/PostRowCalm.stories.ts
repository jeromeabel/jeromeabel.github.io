import type { ComponentProps } from "astro/types";
import PostRowCalm from "./PostRowCalm.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import { getAllStandalonePosts } from "../../utils/repository";

const posts = await getAllStandalonePosts();

export default { component: PostRowCalm };

// homePosts: 'calm-rows' variant (current default)
export const CalmRow = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostRowCalm>,
  decorators: [{ component: StoryContainer }],
};
