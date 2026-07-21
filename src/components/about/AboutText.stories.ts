import AboutText from "./AboutText.astro";
import StorySection from "../styleguide/StorySection.astro";

export default { component: AboutText };

export const Default = {
  args: {},
  decorators: [{ component: StorySection }],
};
