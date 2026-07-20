import type { ComponentProps } from "astro/types";
import RelatedWork from "./RelatedWork.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: RelatedWork };

export const Default = {
  args: { works } satisfies ComponentProps<typeof RelatedWork>,
};
