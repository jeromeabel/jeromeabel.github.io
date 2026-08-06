import type { ComponentProps } from "astro/types";
import PostRow from "./PostRow.astro";
import { getAllStandalonePosts } from "../../utils/repository";

const posts = await getAllStandalonePosts();

export default { component: PostRow };

// homePosts: 'arrow-rows' variant
export const ArrowRow = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostRow>,
};

export const WithSerie = {
  args: {
    post: posts[0],
    serie: {
      title: "Web performance",
      id: "web-performance",
      part: 2,
      total: 5,
    },
  } satisfies ComponentProps<typeof PostRow>,
};
