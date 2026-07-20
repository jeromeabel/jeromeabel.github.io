import type { ComponentProps } from "astro/types";
import LinkNavPost from "./LinkNavPost.astro";

export default { component: LinkNavPost };

export const Previous = {
  args: {
    id: "sample-post",
    title: "A previous post title",
    type: "prev",
  } satisfies ComponentProps<typeof LinkNavPost>,
};

export const Next = {
  args: {
    id: "sample-post",
    title: "A next post title",
    type: "next",
  } satisfies ComponentProps<typeof LinkNavPost>,
};
