# figma-blog-fit — token dump & drift verdicts (Task 3)

## Pass-0 live inventory (real Figma names, file `Wf4iomVMYUXlFIBV3Z8bx4`)

- Collection `Color` (not `Color/Light`/`Color/Dark` as guessed) — modes `Light`, `Dark`. Variable
  names are `color/background`, `color/foreground`, `color/background-accent`,
  `color/foreground-accent`, `color/muted`, `color/muted-border`, `color/muted-background`,
  `color/muted-background-accent` — i.e. every variable is namespaced under a `color/` prefix
  inside the collection. The provisional token-map.json assumed bare names (`background`,
  `foreground`, ...) with no `color/` prefix. Per-mode dump expansion yields
  `<Mode>/color/<name>` (e.g. `Light/color/background`), so the full diff-index key is
  `Color/Light/color/background`, not `Color/Light/background`.
- Collection `Scale` — single mode `Value`. Contains `spacing/1`..`spacing/24` (px values
  4,8,12,16,20,24,32,40,48,56,64,96) and `radius/none|sm|md|lg|full` (0,4,8,16,9999). No variable
  named or scoped for container max-width or container padding exists.
- Text styles: `Title/Hero` (60/Bubbler One), `Title/H1` (44/Bubbler One), `Heading/H2`
  (30/IBM Plex Sans SemiBold), `Heading/H3` (22/IBM Plex Sans SemiBold), `Body/Large`
  (24/IBM Plex Sans Regular), `Body/Base` (18/IBM Plex Sans Regular), `Body/Small`
  (16/IBM Plex Sans Regular), `Label/Meta` (14/IBM Plex Sans Medium), `Chip/Mono`
  (12/Fira Code Regular), `Code/Base` (14/Fira Code Regular). Not currently consumed by
  token-map.json (no code-side font-size tokens extracted by extract-code-tokens.mjs to
  diff against) — noted for a future task, not actioned here.

## token-map.json correction

Every `map` entry's Figma path was missing the `color/` variable-name segment (e.g.
`Color/Light/background` → corrected to `Color/Light/color/background`). This was a pure
path-naming error in the Task-2 provisional map, not a content/value problem — confirmed by
running the diff with the old provisional map against the same `tokens.figma.json`: it produced
16 "Missing in Figma" + 16 "Orphaned in Figma" findings that all resolved once the path was
corrected (see verdicts below, all `map-update`). No color value differed between code and Figma
at any point.

`container-max-width` / `container-padding-inline`: left in `ignore`. No Figma variable is named
or scoped for either. `Scale/spacing/4 = 16` coincidentally equals the code's
`container-padding-inline` (1rem = 16px), but it's a generic 4px-grid spacing unit, not a
variable dedicated to container padding — mapping it would create a false-positive tie between
an incidental value match and an unrelated design concept. `container-max-width` (1280px) has no
candidate at all — the Scale collection tops out at `spacing/24 = 96`.

## Verdicts

Diff run 1 — provisional (pre-correction) map vs `tokens.figma.json`:

- 16× `Missing in Figma` (all `light/color-*` and `dark/color-*` map entries) → **map-update**:
  provisional path omitted the `color/` variable-name segment. Fixed in token-map.json.
- 16× `Orphaned in Figma` (all `Color/<Mode>/color/*` variables) → **map-update**: same root
  cause, the map simply pointed at the wrong (non-existent) path so nothing consumed the real
  variables. Resolved by the same fix.
- `Value mismatch`: none.
- `Unmapped`: none.

Diff run 2 — corrected map vs `tokens.figma.json` (final, see `pnpm figma:verify` output below):

- `Missing in Figma`: none.
- `Value mismatch`: none — every one of the 16 light/dark color tokens matches exactly between
  `src/styles/global.css` and the Figma `Color` collection.
- `Orphaned in Figma`: none.
- `Unmapped`: none.
- `container-max-width`, `container-padding-inline` (from `ignore`) → **expected-gap**: no
  matching Figma metric variable exists in the `Scale` collection; nothing to map without
  Figma-side authoring work out of scope for this task.
- `font-sans`, `font-title`, `font-mono` (from `ignore`, carried over from Task 2) → **expected-gap**:
  Figma has no `FONT_FAMILY`-typed variables; font stacks aren't modeled as Figma variables in
  this DS (they're implicit via text style `fontName.family`). No change needed.

## Result

No `real-drift` findings — no Figma-side write/repair was necessary this pass. All 16 code
light/dark color tokens already match the Figma `Color` collection's Light/Dark values exactly.
The only "drift" surfaced was in the Task-2 provisional token-map.json's guessed paths, corrected
here (`map-update`), not in the design tokens themselves.

---

# figma-blog-fit — width-decorator verdicts (Task 5)

Per-manifest-entry verdict on whether a story needs `StoryContainer` (`.container` only),
`StorySection` (`.container` + `py-16 md:py-24` vertical rhythm), or no decorator (`none` —
full-bleed component, or component that already renders its own `.container`/section wrapper
in its own markup). Grep evidence for the page-level wrapping classes:

```
about.astro:8:      class="relative container flex flex-col gap-24 overflow-visible! py-8 text-lg..."
blog.astro:24:      <main class="container flex flex-col gap-16 py-8 md:gap-24 lg:py-24">
blog/[id].astro:58: <main class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24">
blog/[serie]/[post].astro:77:  class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24"
blog/[serie]/[post].astro:168: <div class="container mt-16 flex justify-between gap-2 md:gap-8">
blog/[serie]/index.astro:39:   <main class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24">
work.astro:25:      <main class="container flex flex-col gap-16 py-8 md:gap-24 lg:py-24">
work/[id].astro:45: <div class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24">
work/[id].astro:54: <div class="container mt-12 lg:mt-16">
work/[id].astro:59: <div class="container mt-8 flex flex-col gap-4 sm:flex-row lg:mt-12">
```

`index.astro` composes `Hero`, `AboutStrip`, `SelectedWriting`, `WorksStrip`, `Contact` —
each of those top-level section components applies its own `.container`/full-bleed markup
internally (verified by reading each `.astro` file), so children rendered *inside* them
(e.g. `AboutFacts`, `PostRowCalm`, `WorkOverlayCard`) still need a decorator when isolated
in Astrobook, but the section components themselves (`AboutStrip`, `SelectedWriting`,
`Contact`) do not — and `Hero`/`Footer`/`Header`/`WorksStrip` are explicitly full-bleed by
brief.

| manifest id | live parent (grep evidence) | verdict | wrapper |
|---|---|---|---|
| about-aboutfacts--grid | about.astro:8 `.container` → AboutText → AboutFacts | container | container |
| about-aboutstrip--default | index.astro → AboutStrip.astro renders own `section.container` | self-sufficient | none |
| about-abouttext--default | about.astro:8 `.container`, AboutText is a `<section class="... lg:w-2/3">` two-col child, no independent container/py of its own — nearest dedicated ancestor combines container+py | section | section |
| app-footer--default | brief-named full-bleed | full-bleed | none |
| app-header--default | brief-named full-bleed | full-bleed | none |
| app-motiontoggle--default | app/Header.astro toolbar inside `header` container | container | container |
| app-themetoggle--default | app/Header.astro toolbar inside `header` container | container | container |
| blog-postlistitem--default | blog.astro:24 `.container` → PostListItem row | container | container |
| blog-postrowcalm--calmrow | index.astro → SelectedWriting.astro `#writing` → PostRowCalm rows | container | container |
| blog-relatedwork--default | blog/[id].astro:58 `.container` → RelatedWork section | container | container |
| blog-selectedwriting--default | index.astro → SelectedWriting.astro renders own `section#writing.container` | self-sufficient | none |
| blog-seriecard--default | blog.astro:24 `.container` → SerieCard | container | container |
| blog-seriecontents--default | blog/[serie]/[post].astro:77 `.container` → SerieContents | container | container |
| blog-seriepostlistitem--default | blog/[serie]/index.astro:39 `.container` → SeriePostListItem row | container | container |
| blog-topicchips--default | blog/[id].astro `.container` (Prose ancestor) → TopicChips | container | container |
| contact-contactimage--default | index.astro → Contact.astro `section[role=complementary]` → ContactImage | container | container |
| contact-contact--default | index.astro → Contact.astro renders own `section[role=complementary]` wrapper | self-sufficient | none |
| contact-contacttext--default | index.astro → Contact.astro → ContactText | container | container |
| hero-herosocials--default | index.astro → Hero.astro (full-bleed) → HeroSocials | container (own component width-bound by design token, not full-bleed) | container |
| hero-hero--default | brief-named full-bleed | full-bleed | none |
| hero-herotext--default | index.astro → Hero.astro (full-bleed) → HeroText `h1` | container | container |
| ui-customimage--default | blog/[id].astro `.container` → Prose → CustomImage | container | container |
| ui-h1--default | about.astro:8 `.container` → H1 | container | container |
| ui-h2--default | blog.astro:24 `.container` → H2 | container | container |
| ui-linknavpost--previous | blog/[id].astro `.container` → LinkNavPost prev | container | container |
| ui-linknavpost--next | blog/[id].astro `.container` → LinkNavPost next | container | container |
| ui-link--default | about.astro:8 `.container` → Link (default variant) | container | container |
| ui-link--iconbutton | index.astro → Header/HeroSocials `.container` → Link (icon variant) | container | container |
| ui-link--secondary | index.astro → WorksStrip "All work" `.container`-scoped link | container | container |
| ui-link--external | work/[id].astro:45 `.container` → WorkHeader (section-wrapped, see below) → Link (external variant) | section (inherits WorkHeader's section wrapper) | section |
| ui-prose--default | blog/[id].astro:58 `.container` → Prose | container | container |
| ui-p--default | blog.astro:24 `.container` → P (intro paragraph) | container | container |
| ui-socialshare--default | blog/[id].astro `.container` → SocialShare | container | container |
| work-archivetable--default | work.astro:25 `.container` → ArchiveTable | container | container |
| work-relatedwriting--default | work/[id].astro:45 `.container` → RelatedWriting | container | container |
| work-workgallerycard--square | work.astro:25 `.container` → WorkGalleryCard grid | container | container |
| work-workheader--default | work/[id].astro:45 `<div class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24">` — combined container+vertical-rhythm wrapper dedicated to WorkHeader | section | section |
| work-workminicard--minicard | blog/[id].astro `.container` → RelatedWork → WorkMiniCard (hardcoded, not variant-gated) | container | container |
| work-workoverlaycard--overlaycard | index.astro → WorksStrip (full-bleed) → WorkOverlayCard grid item | container | container |
| work-worksstrip--default | brief-named full-bleed | full-bleed | none |

### Judgment calls / deviations (see task-5-report.md for full disclosure)

1. **Decorator placement**: the brief's Step 2 example shows `decorators` on the `.stories.ts`
   file's `export default {...}`. Reading the installed `@astrobook/core@0.13.2` source
   (`node_modules/.pnpm/@astrobook+core@0.13.2.../dist/client.js` `parseStoryDefaultExport()` /
   `parseStoryNamedExport()`, and `dist/index.js` `createVirtualRouteComponent`) shows Astrobook
   only reads `decorators` from each **named** story export, never the default export. Decorators
   were attached to the named export(s) instead — the only placement that actually renders the
   wrapper — which also supports per-variant verdicts within one file (e.g. `Link.stories.ts`:
   `Default`/`IconButton`/`Secondary` → `StoryContainer`, `External` → `StorySection`).
2. **"none" extended beyond the brief's 4 named full-bleed components** (Header, Footer, Hero,
   WorksStrip) to also cover `AboutStrip`, `SelectedWriting`, `Contact` — each renders its own
   `.container`/section wrapper directly in its own template, so nesting a decorator around it
   in Astrobook would double-apply the container class. Manifest `wrapper: "none"` documents this
   as a distinct case from true full-bleed.
3. **`about-abouttext--default` → "section"** is a closer judgment call than the others: AboutText
   itself is a two-column flex child (no own container/py), and its nearest dedicated wrapping
   ancestor (about.astro's `<section class="relative container ... py-8 ...">`) combines
   container+vertical padding. Treated as "section" by the container+py-combo heuristic used
   throughout, but this is a one-hop-removed inference rather than a component-adjacent wrapper
   like `WorkHeader`'s.
4. **`ui-link--external` → "section"** derives its verdict from its live host, `WorkHeader`
   (itself judged "section"), not from a Prose/markdown ancestor — Link's own manifest `liveUrl`
   is `/work/malinette`, inside WorkHeader's dedicated container+py wrapper.

## Task 6 — pixel-check matrix rehab: first run tally

`pnpm pixel-check` rehabbed to the full 3×2 matrix (desktop/tablet/mobile × light/dark) against
Astrobook preview routes (`/styleguide/stories/...`, not the dashboard) with `waitUntil: "load"`.
First full run against the still-unrepaired manifest (selectors not yet re-anchored — that's
Task 7):

```
pixel-check: 8 pass, 166 fail, 22 skip, 66 error
```

Expected at this stage: the majority of fails/errors are pre-existing broken/stale manifest
selectors (dashboard-era selectors that don't resolve at Astrobook's new preview-route DOM, or
components whose live markup shifted since the manifest was authored) — not a pixel-check script
defect. The matrix itself is confirmed working end-to-end: no `networkidle` timeouts observed;
every failure/error carries real `theme`/`vp` (including `tablet`) data in
`.pixel-report/summary.json`. Re-anchoring selectors to close this gate is Task 7's scope.
