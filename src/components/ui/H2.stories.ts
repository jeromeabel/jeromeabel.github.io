import type { ComponentProps } from "astro/types";
import H2 from "./H2.astro";

export default { component: H2 };

export const Default = { args: {} satisfies ComponentProps<typeof H2> };
