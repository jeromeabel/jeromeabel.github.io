import type { ComponentProps } from "astro/types";
import WorkOverlayCard from "./WorkOverlayCard.astro";
import StoryGrid3 from "../styleguide/StoryGrid3.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkOverlayCard };

// WorkOverlayCard is `aspect-square` with no intrinsic width — it's sized by
// its live CSS grid parent (WorksStrip.astro). StoryGrid3 reproduces that
// grid context so the card doesn't stretch to the full container width.
export const OverlayCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkOverlayCard>,
  decorators: [{ component: StoryGrid3 }],
};
