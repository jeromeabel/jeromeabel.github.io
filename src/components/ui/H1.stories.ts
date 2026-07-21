import type { ComponentProps } from "astro/types";
import H1 from "./H1.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: H1 };

export const Default = {
  args: {} satisfies ComponentProps<typeof H1>,
  decorators: [{ component: StoryContainer }],
};
