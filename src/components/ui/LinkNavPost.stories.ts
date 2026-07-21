import type { ComponentProps } from "astro/types";
import LinkNavPost from "./LinkNavPost.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: LinkNavPost };

export const Previous = {
  args: {
    id: "sample-post",
    title: "A previous post title",
    type: "prev",
  } satisfies ComponentProps<typeof LinkNavPost>,
  decorators: [{ component: StoryContainer }],
};

export const Next = {
  args: {
    id: "sample-post",
    title: "A next post title",
    type: "next",
  } satisfies ComponentProps<typeof LinkNavPost>,
  decorators: [{ component: StoryContainer }],
};
