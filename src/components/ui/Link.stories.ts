import type { ComponentProps } from "astro/types";
import Link from "./Link.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import StorySection from "../styleguide/StorySection.astro";

export default { component: Link };

export const Default = {
  args: {
    href: "#",
    variant: "default",
    label: "Default link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const Cta = {
  args: {
    href: "#",
    variant: "cta",
    label: "Get in touch",
  } satisfies ComponentProps<typeof Link>,
};

export const IconButton = {
  args: {
    href: "#",
    variant: "icon",
    icon: "lucide:mail",
    label: "Menu",
    "aria-label": "Menu",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const Secondary = {
  args: {
    href: "#",
    variant: "secondary",
    label: "Secondary link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const External = {
  args: {
    href: "https://example.com",
    variant: "external",
    label: "External link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StorySection }],
};
