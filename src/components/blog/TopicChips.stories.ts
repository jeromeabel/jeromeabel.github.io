import type { ComponentProps } from "astro/types";
import TopicChips from "./TopicChips.astro";

export default { component: TopicChips };

export const Default = {
  args: { topic: "astro,performance" } satisfies ComponentProps<
    typeof TopicChips
  >,
};
