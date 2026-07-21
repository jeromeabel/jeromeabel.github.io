import type { ComponentProps } from "astro/types";
import SerieListItem from "./SerieListItem.astro";
import { getAllSeries } from "../../utils/repository";

const series = await getAllSeries();

export default { component: SerieListItem, title: "Legacy/SerieListItem" };

export const Default = {
  args: { serie: series[0] } satisfies ComponentProps<typeof SerieListItem>,
};
