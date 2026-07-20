// scripts/pixel-manifest.mjs
// Story <-> live-page anchor map for strict pixel diffing (consumed by pixel-check.mjs).
//
// Astrobook story-url format (confirmed by loading /styleguide and cross-checking
// every *.stories.ts export name, NOT the `?story=` format assumed in the task brief seed):
//   /styleguide/dashboard/src/components/<domain>/<component-kebab>/<variant-kebab>
// e.g. src/components/work/WorkGalleryCard.stories.ts export `Square` ->
//   /styleguide/dashboard/src/components/work/work-gallery-card/square
//
// id convention here: <domain>-<component-lowercase>--<variant-kebab>
//
// Base preview URL for all liveUrl entries below (Plan D deploy preview):
const BASE = "https://deploy-preview-104--jeromeabel.netlify.app";

// VARIANTS at the commit this preview was built from (src/config/variants.ts,
// re-derived at impl time, not trusted from the brief or from stale prior context):
//   workFeatured: "gallery-3col-1x1"
//   homePosts:    "calm-rows"
//   worksStrip:   "overlay-card"
//   aboutFacts:   "grid"

export const MANIFEST = [
  // ---------------------------------------------------------------------
  // about/
  // ---------------------------------------------------------------------
  {
    id: "about-aboutfacts--grid",
    storyPath:
      "/styleguide/dashboard/src/components/about/about-facts/grid",
    liveUrl: `${BASE}/about`,
    selector: 'dl[class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"]',
    masks: [],
  },
  {
    id: "about-aboutfactsstrip--strip",
    skip: true,
    reason: "variant not selected on live (aboutFacts=grid)",
  },
  {
    id: "about-aboutstrip--default",
    storyPath:
      "/styleguide/dashboard/src/components/about/about-strip/default",
    liveUrl: `${BASE}/`,
    selector:
      'section[class="reveal reveal-bottom container flex flex-col gap-6 lg:gap-8"]',
    masks: [],
  },
  {
    id: "about-abouttext--default",
    storyPath:
      "/styleguide/dashboard/src/components/about/about-text/default",
    liveUrl: `${BASE}/about`,
    selector: 'section[class="flex w-full flex-col gap-6 sm:gap-8 lg:w-2/3"]',
    masks: [],
  },
  {
    id: "about-aboutvalues--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },
  {
    id: "about-valuecard--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },

  // ---------------------------------------------------------------------
  // app/
  // ---------------------------------------------------------------------
  {
    id: "app-footer--default",
    storyPath: "/styleguide/dashboard/src/components/app/footer/default",
    liveUrl: `${BASE}/`,
    selector: "footer",
    masks: [],
  },
  {
    id: "app-header--default",
    storyPath: "/styleguide/dashboard/src/components/app/header/default",
    liveUrl: `${BASE}/`,
    selector: 'header[class="py-4 lg:py-6"]',
    masks: [],
  },
  {
    id: "app-motiontoggle--default",
    storyPath:
      "/styleguide/dashboard/src/components/app/motion-toggle/default",
    liveUrl: `${BASE}/`,
    selector: "#motion-toggle",
    masks: [],
  },
  {
    id: "app-themetoggle--default",
    storyPath:
      "/styleguide/dashboard/src/components/app/theme-toggle/default",
    liveUrl: `${BASE}/`,
    selector: "#theme-toggle",
    masks: [],
  },

  // ---------------------------------------------------------------------
  // blog/ (legacy Plan C components skipped; live blog/serie components real)
  // ---------------------------------------------------------------------
  {
    id: "blog-blogpreview--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "blog-postcard--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "blog-postlistitem--default",
    storyPath:
      "/styleguide/dashboard/src/components/blog/post-list-item/default",
    liveUrl: `${BASE}/blog`,
    selector:
      'a[class="border-muted-border hover:bg-muted-background group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4"]',
    masks: [],
  },
  {
    id: "blog-postrowcalm--calmrow",
    storyPath:
      "/styleguide/dashboard/src/components/blog/post-row-calm/calm-row",
    liveUrl: `${BASE}/`,
    // "adding-likes-to-a-static-astro-site" is not one of the current 4
    // "Latest" posts (verified live: curl `/` and grep the calm-row hrefs -
    // they are web-performance/05-images-part-2, 04-images-part-1,
    // 03-benchmark-tables, api-endpoints-with-astro). Repointed to a post
    // that is actually rendered live right now.
    selector: 'a[href="/blog/api-endpoints-with-astro"][class*="border-b"]',
    masks: [],
  },
  {
    id: "blog-postrow--arrowrow",
    skip: true,
    reason: "variant not selected on live (homePosts=calm-rows)",
  },
  {
    id: "blog-postrow--withserie",
    skip: true,
    reason: "variant not selected on live (homePosts=calm-rows)",
  },
  {
    id: "blog-relatedwork--default",
    storyPath: "/styleguide/dashboard/src/components/blog/related-work/default",
    liveUrl: `${BASE}/blog/api-endpoints-with-astro`,
    selector: 'section[class="flex flex-col gap-4"]',
    masks: ["img"],
  },
  {
    id: "blog-selectedwriting--default",
    storyPath:
      "/styleguide/dashboard/src/components/blog/selected-writing/default",
    liveUrl: `${BASE}/`,
    selector: "#writing",
    masks: [],
  },
  {
    id: "blog-seriecard--default",
    storyPath: "/styleguide/dashboard/src/components/blog/serie-card/default",
    liveUrl: `${BASE}/blog`,
    selector: 'a[href="/blog/web-performance"]',
    masks: [],
  },
  {
    id: "blog-seriecontents--default",
    storyPath:
      "/styleguide/dashboard/src/components/blog/serie-contents/default",
    liveUrl: `${BASE}/blog/web-performance/03-benchmark-tables`,
    // SerieContents.astro renders a <section aria-label="Series contents">,
    // not a <nav> (confirmed live: curl the page and grep the tag - only
    // <section aria-label="Series contents" ...> appears).
    selector: 'section[aria-label="Series contents"]',
    masks: [],
  },
  {
    id: "blog-serielistitem--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "blog-serielist--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "blog-seriepostcard--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "blog-seriepostlistitem--default",
    storyPath:
      "/styleguide/dashboard/src/components/blog/serie-post-list-item/default",
    liveUrl: `${BASE}/blog/web-performance`,
    selector:
      'a[class="border-muted-border hover:bg-muted-background group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4 text-lg"]',
    masks: [],
  },
  {
    id: "blog-tableofcontents--default",
    skip: true,
    // TableOfContents renders twice per post page ([serie]/[post].astro:136-155):
    // once inside a mobile-only <details class="... md:hidden"> (no `open`
    // attribute) and once inside a desktop-only <aside class="hidden md:block">.
    // `:first-of-type` matches BOTH navs (each is the only nav-type child of its
    // own parent), so a plain `.first()` always grabs the document-order-first
    // (mobile/details) instance regardless of viewport - broken for desktop
    // captures. Live Playwright check at both Task 3 viewports
    // (deploy-preview-104, /blog/web-performance/03-benchmark-tables):
    //   1280px: raw nav count=2, isVisible=[false, true] (aside instance visible;
    //     `nav[aria-label="Table of contents"]:visible` correctly resolves to 1
    //     match and waitFor({state:'visible'}) succeeds)
    //   390px:  raw nav count=2, isVisible=[false, false] - NEITHER instance is
    //     visible, because the mobile <details> has no `open` attribute, so its
    //     content (including the nav) stays collapsed/non-visible without a user
    //     click. `:visible` count=0 and waitFor({state:'visible'}) times out.
    // Since the mobile instance is never visible without interaction, no single
    // selector can satisfy Task 3's single-selector + `.first()` +
    // `waitFor({state:'visible'})` shoot() pattern at both viewports.
    reason:
      "renders twice per page (mobile/desktop); mobile instance lives inside a closed <details> with no `open` attribute, so it is never visible without a user click - a single selector can't target the visible instance at both viewports",
  },
  {
    id: "blog-topicchips--default",
    storyPath: "/styleguide/dashboard/src/components/blog/topic-chips/default",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'div[class="flex flex-wrap gap-2"]',
    masks: [],
  },

  // ---------------------------------------------------------------------
  // contact/
  // ---------------------------------------------------------------------
  {
    id: "contact-contactimage--default",
    storyPath:
      "/styleguide/dashboard/src/components/contact/contact-image/default",
    liveUrl: `${BASE}/`,
    selector: 'div[class="reveal reveal-bottom relative hidden flex-1 sm:block"]',
    masks: ["svg"],
  },
  {
    id: "contact-contactnoise--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },
  {
    id: "contact-contact--default",
    storyPath: "/styleguide/dashboard/src/components/contact/contact/default",
    liveUrl: `${BASE}/`,
    selector: 'section[role="complementary"]',
    // Contact contains an infinite CSS bounce (LinkedIn icon) and a pulsing
    // shadow animation (see concerns in task-2-report.md) - masked defensively.
    masks: ["svg", 'a[class*="animate-"]', ".anim-shadow"],
  },
  {
    id: "contact-contacttext--default",
    storyPath:
      "/styleguide/dashboard/src/components/contact/contact-text/default",
    liveUrl: `${BASE}/`,
    selector: 'div[class="flex flex-col gap-8"]',
    masks: ['a[class*="animate-"]', ".anim-shadow"],
  },

  // ---------------------------------------------------------------------
  // hero/
  // ---------------------------------------------------------------------
  {
    id: "hero-heroanimation--default",
    skip: true,
    reason: "non-deterministic canvas animation",
  },
  {
    id: "hero-heroimage--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },
  {
    id: "hero-herosocials--default",
    storyPath:
      "/styleguide/dashboard/src/components/hero/hero-socials/default",
    liveUrl: `${BASE}/`,
    selector: 'div[class="mt-6 flex items-center gap-3 lg:mt-10 lg:gap-4"]',
    masks: [],
  },
  {
    id: "hero-hero--default",
    storyPath: "/styleguide/dashboard/src/components/hero/hero/default",
    liveUrl: `${BASE}/`,
    selector: "section:has(h1)",
    // HeroAnimation is a child of Hero and is itself skipped (infinite
    // @keyframes float-rotate / shadow-pulse on .shape / .shape-shadow) -
    // masked here so the wrapper story stays diffable.
    masks: [".shape", ".shape-shadow"],
  },
  {
    id: "hero-herotext--default",
    storyPath: "/styleguide/dashboard/src/components/hero/hero-text/default",
    liveUrl: `${BASE}/`,
    selector: "h1",
    masks: [],
  },

  // ---------------------------------------------------------------------
  // skills/ (both orphaned - never imported by any page)
  // ---------------------------------------------------------------------
  {
    id: "skills-skills--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },
  {
    id: "skills-skillstext--default",
    skip: true,
    reason: "orphaned component, not imported by any page",
  },

  // ---------------------------------------------------------------------
  // ui/
  // ---------------------------------------------------------------------
  {
    id: "ui-customimage--default",
    storyPath:
      "/styleguide/dashboard/src/components/ui/custom-image/default",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'div[class="reveal-img relative overflow-hidden shadow-lg dark:shadow-none"]',
    masks: ["img"],
  },
  {
    id: "ui-customimage--square",
    skip: true,
    reason: 'no live caller passes type="square" (all 3 usages default to type="cover")',
  },
  {
    id: "ui-h1--default",
    storyPath: "/styleguide/dashboard/src/components/ui/h1/default",
    liveUrl: `${BASE}/about`,
    selector: "h1",
    masks: [],
  },
  {
    id: "ui-h2--default",
    storyPath: "/styleguide/dashboard/src/components/ui/h2/default",
    liveUrl: `${BASE}/blog`,
    selector: "h2",
    masks: [],
  },
  {
    id: "ui-linknavpost--previous",
    storyPath:
      "/styleguide/dashboard/src/components/ui/link-nav-post/previous",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'a[href="/blog/nuxt-clean-architecture"]',
    masks: [],
  },
  {
    id: "ui-linknavpost--next",
    storyPath: "/styleguide/dashboard/src/components/ui/link-nav-post/next",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'a[href="/blog/clickable-images-astro-markdown"]',
    masks: [],
  },
  {
    id: "ui-link--default",
    storyPath: "/styleguide/dashboard/src/components/ui/link/default",
    liveUrl: `${BASE}/about`,
    selector: 'a[href="https://jeromeabel.net"]',
    masks: [],
  },
  {
    id: "ui-link--cta",
    skip: true,
    reason: "orphaned variant, no live caller passes variant=\"cta\"",
  },
  {
    id: "ui-link--iconbutton",
    storyPath: "/styleguide/dashboard/src/components/ui/link/icon-button",
    liveUrl: `${BASE}/`,
    selector: 'a[title="Email"]',
    masks: [],
  },
  {
    id: "ui-link--secondary",
    storyPath: "/styleguide/dashboard/src/components/ui/link/secondary",
    liveUrl: `${BASE}/`,
    selector: 'a[title="All work"]',
    masks: [],
  },
  {
    id: "ui-link--external",
    storyPath: "/styleguide/dashboard/src/components/ui/link/external",
    liveUrl: `${BASE}/work/malinette`,
    selector: 'a[title="Website"]',
    masks: [],
  },
  {
    id: "ui-prose--default",
    storyPath: "/styleguide/dashboard/src/components/ui/prose/default",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'section[class*="prose-invert"]',
    // Prose renders arbitrary remark-processed markdown body content, which
    // may include inline images.
    masks: ["img"],
  },
  {
    id: "ui-p--default",
    storyPath: "/styleguide/dashboard/src/components/ui/p/default",
    liveUrl: `${BASE}/blog`,
    selector:
      'p[class="text-xl text-pretty md:text-2xl md:tracking-wide xl:text-3xl xl:leading-tight"]',
    masks: [],
  },
  {
    id: "ui-socialshare--default",
    storyPath: "/styleguide/dashboard/src/components/ui/social-share/default",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'div[class="text-muted flex items-center gap-2"]',
    masks: [],
  },

  // ---------------------------------------------------------------------
  // work/ (legacy Plan C components skipped; live work components real)
  // ---------------------------------------------------------------------
  {
    id: "work-archivetable--default",
    storyPath: "/styleguide/dashboard/src/components/work/archive-table/default",
    liveUrl: `${BASE}/work`,
    selector: 'table[class="w-full border-collapse text-sm md:text-base"]',
    masks: [],
  },
  {
    id: "work-relatedwriting--default",
    storyPath:
      "/styleguide/dashboard/src/components/work/related-writing/default",
    liveUrl: `${BASE}/work/leconceptdelapreuve`,
    selector: 'section[class="flex flex-col gap-4"]',
    masks: [],
  },
  {
    id: "work-workcardimage--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "work-workcard--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "work-workgallerycard--square",
    storyPath:
      "/styleguide/dashboard/src/components/work/work-gallery-card/square",
    liveUrl: `${BASE}/work`,
    // 3 equivalent card instances render on /work (workFeatured=gallery-3col-1x1);
    // pixel-check should take the first match.
    selector:
      'a[class="border-muted-border hover:bg-muted-background group flex flex-col border outline-offset-4 outline-black focus:outline-2 dark:outline-white"]',
    masks: ["img"],
  },
  {
    id: "work-workgallerycard--video",
    skip: true,
    reason: "variant not selected on live (workFeatured=gallery-3col-1x1)",
  },
  {
    id: "work-workheader--default",
    storyPath: "/styleguide/dashboard/src/components/work/work-header/default",
    liveUrl: `${BASE}/work/malinette`,
    selector: 'header[class="flex w-full flex-col gap-4 lg:w-2/3 lg:gap-8"]',
    masks: [],
  },
  {
    id: "work-workminicard--minicard",
    // NOT variant-skipped: WorkMiniCard is hardcoded (unconditionally, not
    // VARIANTS-gated) inside blog/RelatedWork.astro, independent of the
    // worksStrip variant selection used by WorksStrip.astro.
    storyPath: "/styleguide/dashboard/src/components/work/work-mini-card/mini-card",
    liveUrl: `${BASE}/blog/api-endpoints-with-astro`,
    selector:
      'a[class="group flex flex-col gap-2 outline-offset-4 outline-black focus:outline-2 dark:outline-white"]',
    masks: ["img"],
  },
  {
    id: "work-workoverlaycard--overlaycard",
    storyPath:
      "/styleguide/dashboard/src/components/work/work-overlay-card/overlay-card",
    liveUrl: `${BASE}/`,
    selector:
      'a[class="group relative block aspect-square overflow-hidden outline-offset-4 outline-black focus:outline-2 dark:outline-white"]',
    masks: ["img"],
  },
  {
    id: "work-workspreview--default",
    skip: true,
    reason: "legacy, not on live site",
  },
  {
    id: "work-worksstrip--default",
    storyPath: "/styleguide/dashboard/src/components/work/works-strip/default",
    liveUrl: `${BASE}/`,
    selector: 'section[class="container flex flex-col gap-4 lg:gap-8"]',
    masks: ["img"],
  },
];
