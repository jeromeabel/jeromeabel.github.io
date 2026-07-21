import ContactImage from "./ContactImage.astro";
import StoryFlexHeight from "../styleguide/StoryFlexHeight.astro";

export default { component: ContactImage };

// ContactImage is a `flex-1` child of a flex row in Contact.astro and relies
// on `align-items: stretch` from its ContactText sibling for real height.
// StoryFlexHeight reproduces a fixed-height flex row so it doesn't collapse.
export const Default = {
  args: {},
  decorators: [{ component: StoryFlexHeight }],
};
