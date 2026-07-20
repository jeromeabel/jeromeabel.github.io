import type { ComponentProps } from "astro/types";
import P from "./P.astro";

export default { component: P };

export const Default = { args: {} satisfies ComponentProps<typeof P> };
