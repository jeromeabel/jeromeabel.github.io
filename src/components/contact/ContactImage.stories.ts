import ContactImage from "./ContactImage.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default { component: ContactImage };

export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
