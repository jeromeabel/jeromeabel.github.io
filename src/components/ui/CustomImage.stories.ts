import type { ComponentProps } from "astro/types";
import CustomImage from "./CustomImage.astro";
import img from "../../content/work/from-x-to-x/cover.jpg";

export default { component: CustomImage };

export const Default = {
  args: { img, alt: "Sample cover image" } satisfies ComponentProps<
    typeof CustomImage
  >,
};

export const Square = {
  args: {
    img,
    alt: "Sample square image",
    type: "square",
  } satisfies ComponentProps<typeof CustomImage>,
};
