import PostList from "./PostList.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default {
  component: PostList,
};

export const Default = {
  args: {},
  decorators: [{ component: StoryContainer }],
};
