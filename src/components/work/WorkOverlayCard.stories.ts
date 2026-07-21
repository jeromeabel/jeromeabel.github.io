import type { ComponentProps } from "astro/types";
import WorkOverlayCard from "./WorkOverlayCard.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkOverlayCard };

export const OverlayCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkOverlayCard>,
  decorators: [{ component: StoryContainer }],
};
