import type { ComponentProps } from "astro/types";
import SerieCard from "./SerieCard.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import { getAllSeries } from "../../utils/repository";

const series = await getAllSeries();

export default { component: SerieCard };

export const Default = {
  args: { serie: series[0] } satisfies ComponentProps<typeof SerieCard>,
  decorators: [{ component: StoryContainer }],
};
