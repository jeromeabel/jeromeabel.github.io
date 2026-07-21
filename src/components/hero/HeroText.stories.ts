import HeroText from "./HeroText.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
export default { component: HeroText };
export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
