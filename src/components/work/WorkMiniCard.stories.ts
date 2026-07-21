import type { ComponentProps } from "astro/types";
import WorkMiniCard from "./WorkMiniCard.astro";
import StoryGrid3Tight from "../styleguide/StoryGrid3Tight.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkMiniCard };

// WorkMiniCard is sized by its live CSS grid parent in RelatedWork.astro.
// StoryGrid3Tight reproduces that exact grid context (2/3 col, gap-4, no
// lg:gap-8) so the card is sized to a grid-cell fraction instead of
// stretching to the full container width.
export const MiniCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkMiniCard>,
  decorators: [{ component: StoryGrid3Tight }],
};
