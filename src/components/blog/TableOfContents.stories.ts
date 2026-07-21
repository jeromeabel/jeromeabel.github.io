import type { ComponentProps } from "astro/types";
import type { MarkdownHeading } from "astro";
import TableOfContents from "./TableOfContents.astro";

const headings: MarkdownHeading[] = [
  { depth: 2, slug: "introduction", text: "Introduction" },
  { depth: 3, slug: "setup", text: "Setup" },
  { depth: 2, slug: "conclusion", text: "Conclusion" },
];

export default { component: TableOfContents };

export const Default = {
  args: { headings } satisfies ComponentProps<typeof TableOfContents>,
};
