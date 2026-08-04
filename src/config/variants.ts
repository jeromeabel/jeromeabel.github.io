// Build-time layout variant switches for the v3 redesign.
// Change a value, restart `pnpm dev`, compare on the real site.
// See .specs/01_active/v3-redesign/design.md

export type WorkFeaturedVariant =
  "gallery-2x2-16x9" | "gallery-2x2-1x1" | "gallery-3col-1x1";
export type HomePostsVariant = "calm-rows" | "arrow-rows";
export type WorksStripVariant = "mini-card" | "overlay-card";
export type AboutFactsVariant = "strip" | "grid";

export const VARIANTS: {
  workFeatured: WorkFeaturedVariant;
  homePosts: HomePostsVariant;
  worksStrip: WorksStripVariant;
  aboutFacts: AboutFactsVariant;
} = {
  workFeatured: "gallery-3col-1x1",
  homePosts: "calm-rows",
  worksStrip: "overlay-card",
  aboutFacts: "grid",
};
