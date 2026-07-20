import type { ComponentProps } from "astro/types";
import SocialShare from "./SocialShare.astro";

export default { component: SocialShare };

export const Default = {
  args: {
    url: "https://dev.jeromeabel.net/blog/sample-post",
    title: "Sample post title",
    description: "A short description of the sample post.",
  } satisfies ComponentProps<typeof SocialShare>,
};
