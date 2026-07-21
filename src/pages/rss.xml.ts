import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllBlogPosts } from "src/utils/repository";

export async function GET(context: APIContext) {
  const posts = await getAllBlogPosts();

  return rss({
    title: "Jérôme Abel — Blog",
    description:
      "Web performance, clean architecture, and the craft of web engineering.",
    site: context.site ?? "https://dev.jeromeabel.net",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
}
