import ThemeToggle from "./ThemeToggle.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: ThemeToggle };

export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
