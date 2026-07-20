import type { ComponentProps } from "astro/types";
import WorkHeader from "./WorkHeader.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

if (works.length === 0) {
  throw new Error(
    "WorkHeader.stories: getFeaturedWorks() returned no entries — cannot build a story without real data.",
  );
}

export default { component: WorkHeader };

export const Default = {
  args: { data: works[0].data } satisfies ComponentProps<typeof WorkHeader>,
};
