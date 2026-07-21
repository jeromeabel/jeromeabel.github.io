import type { ComponentProps } from "astro/types";
import ValueCard from "./ValueCard.astro";
import userImage from "../../assets/images/values/user.svg?url";

export default { component: ValueCard };

export const Default = {
  args: { title: "User", imgUrl: userImage } satisfies ComponentProps<
    typeof ValueCard
  >,
};
