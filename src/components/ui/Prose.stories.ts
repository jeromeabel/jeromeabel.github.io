import type { ComponentProps } from "astro/types";
import Prose from "./Prose.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: Prose };

export const Default = {
  args: {} satisfies ComponentProps<typeof Prose>,
  decorators: [{ component: StoryContainer }],
};
