import type { ComponentProps } from "astro/types";
import WorkCard from "./WorkCard.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkCard, title: "Legacy/WorkCard" };

export const Default = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkCard>,
};
