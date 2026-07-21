import type { ComponentProps } from "astro/types";
import RelatedWriting from "./RelatedWriting.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import { getAllStandalonePosts } from "../../utils/repository";

const posts = (await getAllStandalonePosts()).slice(0, 3);

export default { component: RelatedWriting };

export const Default = {
  args: { posts } satisfies ComponentProps<typeof RelatedWriting>,
  decorators: [{ component: StoryContainer }],
};
