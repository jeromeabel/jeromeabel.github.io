import MotionToggle from "./MotionToggle.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: MotionToggle };

export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
