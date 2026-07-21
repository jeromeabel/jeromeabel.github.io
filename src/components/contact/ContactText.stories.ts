import ContactText from "./ContactText.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: ContactText };

export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
