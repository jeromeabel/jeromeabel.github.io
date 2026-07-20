import type { ComponentProps } from "astro/types";
import SkillsText from "./SkillsText.astro";
import skillsFlatDesign from "../../assets/images/skills_design_flat.svg";

export default { component: SkillsText };

export const Default = {
  args: {
    title: "Design",
    id: "01",
    image: skillsFlatDesign,
  } satisfies ComponentProps<typeof SkillsText>,
};
