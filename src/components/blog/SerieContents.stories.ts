import type { ComponentProps } from "astro/types";
import SerieContents from "./SerieContents.astro";
import { getAllSeries, getPostsFromSerie } from "../../utils/repository";

const series = await getAllSeries();
const serie = series[0];
const posts = await getPostsFromSerie(serie);

export default { component: SerieContents };

export const Default = {
  args: {
    serieTitle: serie.data.title,
    posts,
    currentId: posts[0].id,
  } satisfies ComponentProps<typeof SerieContents>,
};
