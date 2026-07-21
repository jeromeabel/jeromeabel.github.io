import type { ComponentProps } from "astro/types";
import SocialShare from "./SocialShare.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: SocialShare };

export const Default = {
  args: {
    url: "https://dev.jeromeabel.net/blog/sample-post",
    title: "Sample post title",
    description: "A short description of the sample post.",
  } satisfies ComponentProps<typeof SocialShare>,
  decorators: [{ component: StoryContainer }],
};
