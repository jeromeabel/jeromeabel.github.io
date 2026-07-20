import type { ComponentProps } from "astro/types";
import WorkCardImage from "./WorkCardImage.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkCardImage, title: "Legacy/WorkCardImage" };

export const Default = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkCardImage>,
};
