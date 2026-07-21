import type { ComponentProps } from "astro/types";
import TopicChips from "./TopicChips.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: TopicChips };

export const Default = {
  args: { topic: "astro,performance" } satisfies ComponentProps<
    typeof TopicChips
  >,
  decorators: [{ component: StoryContainer }],
};
