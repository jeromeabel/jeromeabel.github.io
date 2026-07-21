import PostList from "./PostList.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default {
  component: PostList,
  decorators: [{ component: StoryContainer }],
};

export const Default = { args: {} };
