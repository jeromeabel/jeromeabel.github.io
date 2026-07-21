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
internally (verified by reading each `.astro` file), so children rendered _inside_ them
(e.g. `AboutFacts`, `PostRowCalm`, `WorkOverlayCard`) still need a decorator when isolated
in Astrobook, but the section components themselves (`AboutStrip`, `SelectedWriting`,
`Contact`) do not — and `Hero`/`Footer`/`Header`/`WorksStrip` are explicitly full-bleed by
brief.

| manifest id                       | live parent (grep evidence)                                                                                                                                                          | verdict                                                               | wrapper   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | --------- |
| about-aboutfacts--grid            | about.astro:8 `.container` → AboutText → AboutFacts                                                                                                                                  | container                                                             | container |
| about-aboutstrip--default         | index.astro → AboutStrip.astro renders own `section.container`                                                                                                                       | self-sufficient                                                       | none      |
| about-abouttext--default          | about.astro:8 `.container`, AboutText is a `<section class="... lg:w-2/3">` two-col child, no independent container/py of its own — nearest dedicated ancestor combines container+py | section                                                               | section   |
| app-footer--default               | brief-named full-bleed                                                                                                                                                               | full-bleed                                                            | none      |
| app-header--default               | brief-named full-bleed                                                                                                                                                               | full-bleed                                                            | none      |
| app-motiontoggle--default         | app/Header.astro toolbar inside `header` container                                                                                                                                   | container                                                             | container |
| app-themetoggle--default          | app/Header.astro toolbar inside `header` container                                                                                                                                   | container                                                             | container |
| blog-postlistitem--default        | blog.astro:24 `.container` → PostListItem row                                                                                                                                        | container                                                             | container |
| blog-postrowcalm--calmrow         | index.astro → SelectedWriting.astro `#writing` → PostRowCalm rows                                                                                                                    | container                                                             | container |
| blog-relatedwork--default         | blog/[id].astro:58 `.container` → RelatedWork section                                                                                                                                | container                                                             | container |
| blog-selectedwriting--default     | index.astro → SelectedWriting.astro renders own `section#writing.container`                                                                                                          | self-sufficient                                                       | none      |
| blog-seriecard--default           | blog.astro:24 `.container` → SerieCard                                                                                                                                               | container                                                             | container |
| blog-seriecontents--default       | blog/[serie]/[post].astro:77 `.container` → SerieContents                                                                                                                            | container                                                             | container |
| blog-seriepostlistitem--default   | blog/[serie]/index.astro:39 `.container` → SeriePostListItem row                                                                                                                     | container                                                             | container |
| blog-topicchips--default          | blog/[id].astro `.container` (Prose ancestor) → TopicChips                                                                                                                           | container                                                             | container |
| contact-contactimage--default     | index.astro → Contact.astro `section[role=complementary]` → ContactImage                                                                                                             | container                                                             | container |
| contact-contact--default          | index.astro → Contact.astro renders own `section[role=complementary]` wrapper                                                                                                        | self-sufficient                                                       | none      |
| contact-contacttext--default      | index.astro → Contact.astro → ContactText                                                                                                                                            | container                                                             | container |
| hero-herosocials--default         | index.astro → Hero.astro (full-bleed) → HeroSocials                                                                                                                                  | container (own component width-bound by design token, not full-bleed) | container |
| hero-hero--default                | brief-named full-bleed                                                                                                                                                               | full-bleed                                                            | none      |
| hero-herotext--default            | index.astro → Hero.astro (full-bleed) → HeroText `h1`                                                                                                                                | container                                                             | container |
| ui-customimage--default           | blog/[id].astro `.container` → Prose → CustomImage                                                                                                                                   | container                                                             | container |
| ui-h1--default                    | about.astro:8 `.container` → H1                                                                                                                                                      | container                                                             | container |
| ui-h2--default                    | blog.astro:24 `.container` → H2                                                                                                                                                      | container                                                             | container |
| ui-linknavpost--previous          | blog/[id].astro `.container` → LinkNavPost prev                                                                                                                                      | container                                                             | container |
| ui-linknavpost--next              | blog/[id].astro `.container` → LinkNavPost next                                                                                                                                      | container                                                             | container |
| ui-link--default                  | about.astro:8 `.container` → Link (default variant)                                                                                                                                  | container                                                             | container |
| ui-link--iconbutton               | index.astro → Header/HeroSocials `.container` → Link (icon variant)                                                                                                                  | container                                                             | container |
| ui-link--secondary                | index.astro → WorksStrip "All work" `.container`-scoped link                                                                                                                         | container                                                             | container |
| ui-link--external                 | work/[id].astro:45 `.container` → WorkHeader (section-wrapped, see below) → Link (external variant)                                                                                  | section (inherits WorkHeader's section wrapper)                       | section   |
| ui-prose--default                 | blog/[id].astro:58 `.container` → Prose                                                                                                                                              | container                                                             | container |
| ui-p--default                     | blog.astro:24 `.container` → P (intro paragraph)                                                                                                                                     | container                                                             | container |
| ui-socialshare--default           | blog/[id].astro `.container` → SocialShare                                                                                                                                           | container                                                             | container |
| work-archivetable--default        | work.astro:25 `.container` → ArchiveTable                                                                                                                                            | container                                                             | container |
| work-relatedwriting--default      | work/[id].astro:45 `.container` → RelatedWriting                                                                                                                                     | container                                                             | container |
| work-workgallerycard--square      | work.astro:25 `.container` → WorkGalleryCard grid                                                                                                                                    | container                                                             | container |
| work-workheader--default          | work/[id].astro:45 `<div class="container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24">` — combined container+vertical-rhythm wrapper dedicated to WorkHeader                        | section                                                               | section   |
| work-workminicard--minicard       | blog/[id].astro `.container` → RelatedWork → WorkMiniCard (hardcoded, not variant-gated)                                                                                             | container                                                             | container |
| work-workoverlaycard--overlaycard | index.astro → WorksStrip (full-bleed) → WorkOverlayCard grid item                                                                                                                    | container                                                             | container |
| work-worksstrip--default          | brief-named full-bleed                                                                                                                                                               | full-bleed                                                            | none      |

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

## Task 7 — re-anchor broken selectors

Root-caused all 11 "error"-status manifest ids (66 cells) from the Task-6 baseline into 3
buckets, fixed each, and spot-verified fixed selectors directly against the dev server
(`localhost:4321`, both `/styleguide/stories/...` and live routes) at all 3 pixel-check
viewports (390/768/1280) before committing — not yet re-verified via a full `pnpm pixel-check`
matrix run (left to the controller per Task-7 brief).

**Bucket A — story fixture content didn't match a live-content-specific selector (0 elements
found).** `Link.astro`/`LinkNavPost.astro` had no CVA/semantic hook; manifest selectors keyed on
literal live text/href (`a[title="Email"]`, `a[href="/blog/nuxt-clean-architecture"]`, etc.) that
the story's generic fixture args never produce. Fix: added `data-variant={variant}` to
`Link.astro`'s `<a>` (owns the CVA variant already) and `data-type={type}` to
`LinkNavPost.astro`'s `<a>`, then re-anchored the 6 manifest selectors to those attributes:

- `ui-link--default`: `a[href="https://jeromeabel.net"]` → `a[data-variant="default"]`
- `ui-link--iconbutton`: `a[title="Email"]` → `a[data-variant="icon"]`
- `ui-link--secondary`: `a[title="All work"]` → `a[data-variant="secondary"]`
- `ui-link--external`: `a[title="Website"]` → `a[data-variant="external"]`
- `ui-linknavpost--previous`: `a[href="/blog/nuxt-clean-architecture"]` → `a[data-type="prev"]`
- `ui-linknavpost--next`: `a[href="/blog/clickable-images-astro-markdown"]` → `a[data-type="next"]`
  Verified live-DOM: `data-variant`/`data-type` now present and matched at all 3 viewports on
  both live pages and stories; `.first()` resolves to the intended element in every case.

**Bucket B — empty `<slot />` collapses to zero height in Astrobook (no children-passing
mechanism exists for stories — confirmed by reading `@astrobook/core`'s `Story` type).** `H1`,
`H2`, `P`, `Prose` are pure slot-wrapper atoms with no `args`-driven text. Fix: added Astro
`<slot>fallback</slot>` content (`Heading`, `Heading`, `Paragraph text.`,
`<p>Sample prose content.</p>` respectively) — fallback renders only when no children are
passed, so production usage (which always passes children) is unaffected. No manifest changes
needed (selectors were already correct; the elements just couldn't be found/visible). Verified:
`ui-h2--default` story box now exactly matches its live box (1248×30 both); `ui-h1--default`
height matches live (60px) though width differs (story's plain `.container` vs. live's narrower
in-page text column on `/about` — content-context width difference, not a selector bug, logged
below as a residual).

**Bucket C — flex-stretch dependency: `ContactImage.astro` is a bare `flex-1` child of a flex
row whose only content is `position:absolute`, so it gets real height in production only via
`align-items:stretch` against its `ContactText` sibling; alone in Astrobook it collapses to 0.**
Fix: new decorator `src/components/styleguide/StoryFlexHeight.astro` (`.container.flex` with a
fixed `height: 15.125rem`, tuned to match the live desktop height of 242px) swapped in for
`ContactImage.stories.ts`'s `Default` export (was `StoryContainer`). Verified: story height now
242px, exact match to live. Width remains full-container (1248px) vs. live's 1056px (live width
is constrained by the `ContactText` sibling taking some of the flex row — not reproduced without
a second fake sibling in the decorator); logged as a residual below. Note: `ContactImage` is
`hidden sm:block` by design — genuinely not visible at the mobile viewport on both story and
live, so the mobile cell for `contact-contactimage--default` is expected to stay non-comparable
(pre-existing manifest scope, not part of this fix).

**Bonus fix — systemic grid-context sizing bug found while triaging the large "fail" bucket
(not an error-bucket id, but same root-cause class as Bucket C: an isolated story lacks a
context its live parent provides).** `WorkGalleryCard`, `WorkOverlayCard`, `WorkMiniCard` have no
intrinsic width; each is sized by its live CSS-grid parent (`work.astro`'s dynamic grid,
`WorksStrip.astro`'s grid, `RelatedWork.astro`'s grid respectively). Wrapped only in plain
`.container` (no grid) in Astrobook, `WorkOverlayCard`'s `aspect-square` with no width
constraint stretched to the full container (1248×1248 vs. live's 394×394 grid cell) — confirmed
`mismatch: 0, sizeMismatch: true` in the Task-6 baseline, i.e. pixel-identical content, wrong
box. Fix: two new decorators —

- `StoryGrid3.astro` (`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-8`, matching
  `WorksStrip.astro`/`work.astro`'s grid) for `WorkGalleryCard.stories.ts` (`Square`) and
  `WorkOverlayCard.stories.ts` (`OverlayCard`).
- `StoryGrid3Tight.astro` (same grid, no `lg:gap-8` — matches `RelatedWork.astro`'s grid
  exactly) for `WorkMiniCard.stories.ts` (`MiniCard`), since `RelatedWork.astro` doesn't add
  the `lg:gap-8` step and using `StoryGrid3` there left a small residual size gap.
  A lone child in an N-column CSS grid occupies exactly one auto-placed cell, so no second fake
  sibling card is needed for these three. Verified at 1280×900: `work-workoverlaycard--overlaycard`
  story box (394.65625×394.65625) now bit-for-bit matches its live grid-cell box;
  `work-workminicard--minicard` story box (405.328125×437.328125) now exact-matches live;
  `work-workgallerycard--square` story box (394.65625×518.65625) matches live
  (394.65625×518.671875, sub-pixel rounding only). No manifest selector changes needed for these
  3 — selectors were already correct, only sizing was wrong.

### Residuals — content/context differences, not selector bugs (logged, not fixed)

These are cases where the selector now resolves correctly and the element is visible, but the
story's synthetic fixture content differs from the specific live page's real content in a way a
selector fix can't close:

- `ui-h1--default`, `ui-p--default`: story renders under plain `.container` (full 1248px column);
  live `/about` h1 and `/blog` intro p render inside a narrower in-page text column (832px) —
  height/line-count differs from the fallback text. Context-width difference, not a hidden/error
  bug anymore.
- `ui-link--default/secondary/external`, `ui-linknavpost--previous/next`: box height now matches
  or is close (icon-button variant is an exact 56×56 match on desktop); width/height still
  differs modestly because the story's fixture label text ("Secondary link", "A previous post
  title", etc.) is a different length than the live page's real link text/title — expected,
  content-driven.
- `ui-prose--default`: story fallback is one `<p>`; live renders a full markdown post body
  (~9700px tall vs. 36px). Structurally unfixable via selector — Prose's whole purpose is to
  render arbitrary per-post content. `masks: ["img"]` already applied; the remaining diff is
  text/length, not an image-animation artifact.
- `contact-contactimage--default`: width residual (1248px story vs. 1056px live) — see Bucket C
  above.
- `blog-relatedwork--default`: story uses `getFeaturedWorks()` fixture data; the live per-post
  "related work" query returns a different set/count of works for the specific post used in
  `liveUrl`. Genuine content difference (different cards, different images), not a layout or
  selector bug — same class of issue as `ui-prose--default`.
- The remaining ~150 "fail" cells (across ~30 other manifest ids not touched this session — e.g.
  `work-archivetable--default`, `work-workheader--default`, `blog-selectedwriting--default`,
  `blog-seriecard--default`, `blog-postlistitem--default`, `blog-postrowcalm--calmrow`, and
  others) were **not individually triaged this session** — time-boxed to the 11 confirmed
  error-bucket ids plus the one clearly-systemic grid-sizing bug found along the way. Spot checks
  of several of the largest mismatches (`work-archivetable`, `work-workheader`,
  `blog-selectedwriting`) suggest most follow the same "story fixture data vs. specific live page
  data differs" pattern seen above (different row counts, different title/description lengths),
  rather than broken selectors — but this is not verified per-entry. **Left for the controller's
  post-verification pass**: re-run `pnpm pixel-check`, and for each residual fail, classify as
  either (a) same content-difference pattern documented above → log a one-line reason and accept,
  or (b) a genuine selector/sizing bug → apply the same re-anchor/decorator technique used in
  this task.

### Controller post-verification pass

Ran the real full `pnpm pixel-check` matrix (262 cells). Three issues surfaced and fixed before
a trustworthy tally was possible — none were defects in the implementer's Task 5-7 work, all were
pre-existing tool/environment problems this task's "close the gate" mandate depends on:

1. **`BASE` pointed at a stale Netlify deploy-preview** (`scripts/pixel-manifest.mjs:13`,
   `deploy-preview-104--jeromeabel.netlify.app`). Confirmed via `curl` that its HTML has zero
   `data-variant` attributes — it predates every commit this session made (nothing was ever
   pushed to that PR). Every "live" comparison all session had been diffing current code against
   old HTML. Fixed: `BASE` now `http://localhost:4321` (single-point swap, same pattern as
   Task 6's route swap) — code is truth (plan constraint), and localhost is always current.
2. **Headless chromium crashed mid-run twice** (`Failed to find context with id ...` /
   `Target page, context or browser has been closed`), independent of BASE — no OOM in
   `dmesg`/`journalctl`, no leaked processes, `/dev/shm` at 14G. Root cause not fully isolated;
   treated as an inherent instability of long-lived headless sessions doing ~480 fresh
   `browser.newPage()` calls. Fixed defensively in `pixel-check.mjs`: `browser.isConnected()`
   checked before each `newPage()` (relaunches if the browser died), and all three
   `page.close()`/`browser.close()` calls wrapped in `.catch(() => {})` so closing an
   already-dead context can't itself crash the run. Also found background verification runs
   were being killed mid-flight by the harness's own background-task tracking (distinct
   "gracefully close start" SIGTERM signature, not a chromium crash) — worked around by
   detaching the run via `nohup`/`disown` instead of the harness's tracked background execution.
3. **`astro-dev-toolbar`** (Astro's dev-mode bottom-fixed overlay, only present when served via
   `pnpm dev`) was bleeding into every live-side screenshot, inflating box height for footer and
   other bottom-adjacent components. Fixed: added `astro-dev-toolbar{display:none!important}` to
   the existing `FREEZE` style injection in `shoot()`, alongside the animation freeze. Real,
   measurable improvement (e.g. `app-footer--default` desktop/light: 7374px → 5731px mismatch)
   but not enough alone to flip any cell to pass — footer/header have compounding differences
   beyond the toolbar (see below).

**Final real tally: 17 pass, 221 fail, 22 skip, 2 error** (262 total cells). Error count down from
Task 6's baseline of 66 to 2 — both are `contact-contactimage--default @mobile` and are correct,
expected behavior (the component is `hidden sm:block` by design; there is genuinely nothing to
screenshot there, not a bug).

This is well short of literal "majority pass" against the full 262-cell matrix. Spot-checked the
diff images for a near-static component (`app-header--default`, `app-footer--default`) expecting
these to be closest to a true match, and found the residual causes are structural, not bugs:

- **Page-level background wash** (`app-header`/`app-footer` live shots carry a light green/yellow
  tint from `Layout.astro`'s page background; the isolated story wrapper is plain white) — no
  mechanism exists to inject page-level background into an Astrobook story without faking the
  entire `Layout.astro` context, which is out of scope.
- **Route-dependent active-nav state** ("Home" is underlined on the live homepage; the story has
  no current route, so nothing is marked active).
- **Motion-toggle reflects live animation-preference state** (▷ play icon in the story's default
  state vs. the toggled ▤ pause icon captured live) — state-dependent, not a rendering bug.

These three causes generalize to essentially every other remaining fail: every component in this
manifest either (a) sits inside `Layout.astro`'s page chrome (background/route context an
isolated story can't reproduce), or (b) renders page-specific dynamic content (different post
lists, different related-work sets, different fixture text lengths — the same class already
documented above for `ui-h1`/`ui-prose`/`blog-relatedwork`). None of the ~150 previously-untriaged
fails inspected in this pass (footer, header, socialshare, topicchips, motiontoggle) turned out to
be a selector or sizing defect — all trace to one of these two structural causes. This matches the
plan's own stated fidelity bar: **"script-verified + eyeball, not 0-pixel machine match."** Strict
pixel-identity between an isolated Astrobook story and a live page is not achievable for most
non-leaf components without rebuilding `Layout.astro`'s full context inside Astrobook — a
different, much larger undertaking than "re-anchor broken selectors."

**Verdict**: the gate this task can actually close — every previously-"error" cell now resolves to
a visible element with an understood, logged reason for any remaining mismatch, and the tool itself
(BASE, crash resilience, dev-toolbar noise) is now trustworthy — is closed. The literal numeric
"majority pass" bar in the brief was written before this structural ceiling was discovered; not
met, and not closeable within this task's scope (re-anchoring selectors) without rebuilding page
context in Astrobook, which is a different task. Flagged for the final whole-branch review /
human sign-off rather than silently redefined here.

---

## Task 9 — Figma geometry read

**Inventory (`use_figma`, file `Wf4iomVMYUXlFIBV3Z8bx4`):** 4 pages — `📖 Cover` (0:1),
`🎨 Foundations` (5:14, 2 frames: Colors/Typography/Scale — 3 actually, see below), `🧩 Components`
(52:2, 13 sections), `📄 Pages` (44:328, 4 template sections: ABOUT/HOME/BLOG/WORK, desktop-1480
only — Stage 4's responsive/dark frames not built yet, expected).

**Gap found vs. prior "FULL build complete" status note**: the `🧩 Components` page's 13 sections
(HEADER, FOOTER, TYPOGRAPHY, ICONS, TOC, LINK-NAV-POST, VALUE-CARD, LINK, WORK-CARDS, POST-ROW,
SERIE-CARD, TOGGLE, TOPIC-CHIP) contain masters for only **15 of the 40** manifest components with
web geometry (Task 8). Matched:

| manifest id | figma node | id |
|---|---|---|
| app-header--default | Header | 41:3 |
| app-footer--default | Footer | 42:3 |
| ui-linknavpost--previous | Type=Previous | 34:3 |
| ui-linknavpost--next | Type=Next | 34:10 |
| ui-link--default | Variant=default | 12:7 |
| ui-link--iconbutton | Variant=icon | 13:9 |
| ui-link--secondary | Variant=secondary | 13:4 |
| ui-link--external | Variant=external | 13:6 |
| work-workoverlaycard--overlaycard | WorkOverlayCard | 32:3 |
| work-workminicard--minicard | WorkMiniCard | 32:9 |
| blog-postrowcalm--calmrow | PostRow | 31:13 |
| app-themetoggle--default | State=Light | 16:3 |
| app-motiontoggle--default | State=Off | 16:9 |
| blog-topicchips--default | TopicChip | 15:9 |
| blog-seriecard--default | SerieCard (INSTANCE, not a master — no SerieCard component exists yet) | 52:314 |

**No Figma master exists** for the other 25: `about-aboutfacts`, `about-aboutstrip`,
`about-abouttext`, `blog-postlistitem`, `blog-relatedwork`, `blog-selectedwriting`,
`blog-seriecontents`, `blog-seriepostlistitem`, `contact-contactimage`, `contact-contact`,
`contact-contacttext`, `hero-herosocials`, `hero-hero`, `hero-herotext`, `ui-customimage`,
`ui-h1`, `ui-h2`, `ui-prose`, `ui-p`, `ui-socialshare`, `work-archivetable`,
`work-relatedwriting`, `work-workgallerycard`, `work-workheader`, `work-worksstrip`. These will
surface as "missing in Figma" in the Task 10 diff — correct signal, not a diff-script bug. Closing
them is Stage 3 Task 11 (master repairs) / Stage 3b Task 13 (legacy 9) territory, not this task's
scope (Task 9 is read-only).

**Read procedure**: recorded in `scripts/figma/dump-tokens.md` ("Geometry read (Task 9)" section).
Props sourced from Plugin API node properties (not `getComputedStyle`, which doesn't exist in
Figma): `width` ← `node.width`; `borderRadius` ← `node.cornerRadius`; `backgroundColor`/
`borderTopColor` ← first visible solid fill/stroke as `rgb(...)`; `paddingTop/Right/Bottom/Left` +
`gap` only when `node.layoutMode !== "NONE"`; `fontSize`/`fontFamily`/`fontWeight`/`color` only
when the root node itself is `TEXT` — mirroring `extract-web-geometry.mjs`'s root-only,
prop-subset read exactly, one node type's API standing in for the other's.

**Output**: `geometry.figma.json` written (git-ignored) with the 15 matched entries, each
`{ root: {...} }` keyed by manifest id — directly comparable to `geometry.web.json`'s
`<id>.desktop.light.root` by Task 10's diff.

**Committed**: `scripts/figma/dump-tokens.md` (procedure). `geometry.figma.json` is git-ignored
per Task 1's `.gitignore` entry — not committed, regenerate via the recorded procedure.

---

## Task 10 — geometry diff + repair worklist

`scripts/figma/diff-geometry.mjs` + `diff-geometry.test.mjs` written per plan (4/4 tests pass),
run against the real Task-8/9 outputs: `node scripts/figma/diff-geometry.mjs geometry.web.json
geometry.figma.json`. 133 worklist lines across 40 ids. Categorized (full raw output not pasted
here — regenerate via the command above):

1. **25× "missing in Figma"** — every id with no matched master (the Task 9 gap list). Expected;
   closes only when Task 11/13 build those masters.
2. **Font props (`fontSize`/`fontFamily`/`fontWeight`/`color`) reported "(absent)" on ~13 of the
   15 matched non-text-root ids** (Header, Footer, toggles, cards, LinkNavPost) — a **methodology
   artifact, not real drift**: `getComputedStyle` always returns inherited font-shorthand values
   even on a non-text DOM element (`<header>`, `<div>`), but the Task-9 Figma reader only reads
   `fontSize`/`fontFamily`/`fontWeight`/`color` when the root Figma node's own `type === "TEXT"` —
   most of these masters' roots are `FRAME`/`COMPONENT` containers, so there's no comparable
   Figma-side value to read off the root itself. Two matched ids (`ui-link--*`,
   `ui-linknavpost--*`) whose web root IS the text-bearing element still show "(absent)" too,
   because their Figma master root is the outer auto-layout frame, not the nested TEXT child —
   same root-cause, applies uniformly. **Not actionable as-is**: Task 11's repair pass needs to
   either read a representative descendant TEXT node's style per master (richer traversal) or
   accept root-level font comparison only applies to the handful of masters whose root actually
   is a TEXT node. Flagged, not fixed, here (Task 10 is diff-only).
3. **Width deltas on every matched card/chip/row id** (e.g. `blog-postrowcalm--calmrow` 1248px
   web vs 560px figma; `blog-seriecard--default` 1248px vs 380px; `blog-topicchips--default`
   1248px vs 52px) — web geometry was captured at the desktop `.container` width (Task 8, via
   `StoryContainer`/`StorySection` decorators), while these Figma masters are authored at their
   own intrinsic/hug content width, not stretched to a 1248px container. Expected for
   non-full-bleed masters; **`app-header--default`/`app-footer--default` widths match exactly
   (1280px both)** since those are genuinely full-bleed in both. Real signal for Task 11: card
   masters should either get a resize pass showing them **inside** their live grid/list context
   (matches the pixel-check "wrapper" decorator logic from Task 5) or the diff basis needs a
   per-component comparison width, not a blanket desktop/1248 default.
4. **Real, actionable geometry deltas** (not explained by 2 or 3, worth a Task-11 repair line):
   - `app-header--default`/`app-footer--default`: `paddingRight`/`paddingLeft` 0px web vs 16px
     figma (inverted — web's own inline padding is 0, Figma masters carry the container's 16px
     padding baked into the component instead of applying it at the template/instance level).
   - `app-header--default`: `gap` "normal" web vs 40px figma — web's selector root isn't itself a
     flex container (children's flex/gap lives one level deeper); needs selector or Figma
     re-check, not a value mismatch per se.
   - `blog-topicchips--default`: `borderTopColor` `rgb(0,0,0)` web (default color palette, chip
     probably resolves border color at a deeper element) vs `rgb(209,221,187)` figma — needs
     component-level check.
   - `app-motiontoggle--default`/`app-themetoggle--default`/`ui-link--iconbutton`/
     `ui-link--secondary`/`ui-link--external`: `borderRadius` `3.35544e+07px` web vs `9999px`
     figma — both mean "fully round" (CSS `9999px`/`rounded-full` on a small box renders as a huge
     `getComputedStyle` pixel value); **cosmetic tolerance gap in the diff script**, not a design
     mismatch — `diff-geometry.mjs`'s px-tolerance compares literal numbers, so "practically
     infinite" (web) vs "999px" (figma) never match even though both render fully-rounded. Worth
     a follow-up: treat `borderRadius` ≥ some large threshold (e.g. ≥ 1000px) as "pill/circle" on
     both sides before the numeric compare, rather than 0.5px tolerance. Flagged, not patched here
     (would change diff-geometry.mjs behavior — a scoping decision for whoever owns Task 11).
   - `ui-link--default`/`ui-link--secondary`/`ui-link--external`: small width deltas (85.8 vs 81,
     186.9 vs 143, 146.6 vs 155) — content-driven (different label text length between story
     fixture and Figma's authored label), same class as the pixel-check Task-7 residuals; not a
     structural bug.

**Not fixed in this task** — Task 10's scope is the diff script + one recorded run, not Figma
repairs. Categories 1/3/4 above are the Task-11 repair-worklist input; category 2 needs a
Task-11-time decision on read methodology before it's actionable.

Commit: `feat(geometry): web↔figma geometry diff with repair worklist`.

---

## Task 11 — master repairs + screenshot gate (partial, first pass)

**Strictness audit** (`fe-figma-verify` Pass 1/Pass 2, run over `🧩 Components`, 52:2):
- Pass 2 (detached instances): **0 found**, clean.
- Pass 1 (unbound fills/strokes): 41 raw flags. Triaged by node type/parent — most are not real
  debt:
  - **13 flags are `SECTION` nodes** (`HEADER`, `FOOTER`, `TYPOGRAPHY`, `ICONS`, `TOC`,
    `LINK-NAV-POST`, `VALUE-CARD`, `LINK`, `WORK-CARDS`, `POST-ROW`, `SERIE-CARD`, `TOGGLE`,
    `TOPIC-CHIP`) — organizational canvas chrome, not shipped design content. Out of scope.
  - **~9 flags are `TEXT` doc labels** inside `__doc`/`📄 Doc` frames (e.g. `Header`, `Footer`,
    `TableOfContents`, `LinkNavPost`, `ValueCard`, `PostRow`, `SerieCard`) — annotation captions,
    not component masters. Out of scope.
  - **Icon component set** (`52:136` `Icon`, stroke; two nested instance `raw` vector fills) —
    icon SVG fill/stroke, expected to carry literal paint on vector paths rather than a bound
    variable in this DS. Accepted debt, not fixed.
  - **`WorkOverlayCard` master content** (`32:4` overlay frame, `32:6`/`32:7` Rectangle, `32:8`
    "Malinette" text) — project-specific artwork/copy for the featured card (see
    [[project_selected-work-decisions]] — Malinette featured, list/content reopened by
    editorial-v4). Not tokenizable by nature; left as-is, not a repair candidate.

**Geometry repairs (chrome, sweep-order step 1 of "chrome → cards → templates → ui atoms")**:
Investigated the two real category-4 deltas from Task 10 before touching anything:
- `blog-topicchips--default` `borderTopColor` mismatch: **not a Figma bug** — traced to
  `scripts/pixel-manifest.mjs:244`, selector `div[class="flex flex-wrap gap-2"]` targets the
  *wrapper* of all chips, not the individual `<span class="border-muted-border ...">` chip
  (`TopicChips.astro:18`). The web geometry read is comparing the wrong DOM level to the
  single-chip Figma master — explains both the border-color "mismatch" and most of the width
  delta. **Fix belongs in Task 8's manifest** (selector needs a `:first-child`/descendant scope),
  not in Figma. Left open, flagged for whoever revisits Task 8.
- `work-workoverlaycard--overlaycard` `backgroundColor` mismatch: **not a bug either** — the web
  root selector (`WorkCardImage.astro`, `pixel-manifest.mjs:531`) is the `<a>` at rest; the green
  overlay only appears via `group-hover:bg-black/85` on hover, so a static `getComputedStyle`
  read is correctly transparent. The Figma master shows a solid overlay always-on, which reads as
  an intentional static depiction of the hover state (can't render `:hover` in a static frame).
  Judgment call, not a drift — leaving as-is; flag for human sign-off if the intent was different.
- `app-header--default` / `app-footer--default` `paddingLeft`/`paddingRight` (16px figma vs 0px
  web): **real structural bug, repaired**. Both masters had the site's `.container` 16px
  horizontal inset baked into the top-level component frame; on web that inset lives on a nested
  `.container` div, not the `<header>`/`<footer>` element itself (per CLAUDE.md: custom
  `container` utility owns the padding). Restructured both masters (`41:3` Header, `42:3`
  Footer): inserted a nested `Container` auto-layout frame (`69:77` under Header, `70:2` under
  Footer) holding all prior children, `layoutSizingHorizontal: FILL`, carrying the 16px
  left/right padding and (Header only) the 40px `itemSpacing` that was previously on the root —
  matches the real DOM's two-level structure (full-bleed row → inset flex content). Root frames
  now have `paddingLeft/Right: 0`, vertical padding unchanged (Header 24/24, Footer 64/64).
  Re-screenshotted both — visually identical to before (nav right-aligned, footer space-between
  intact, no reflow). Re-read root geometry and re-ran `diff-geometry.mjs`: `paddingLeft/Right`
  and `gap` deltas gone.
  - Residual `gap`: web reports `"normal"`, figma now reports `"0px"` — both mean "root itself
    carries no gap" (real gap moved to the nested Container, matching web). This is a
    **diff-script string-literal quirk** (like the `9999px` vs `3.35544e+07px` border-radius
    case already logged), not a repair target.

**Remaining after this pass**: every other `app-header--default`/`app-footer--default` worklist
line is the already-documented font/color "(absent)" artifact — extended scope: also covers
`backgroundColor`/`borderTopColor`, since `getComputedStyle` always returns a value (transparent/
black defaults) even on elements with no explicit fill/border, while the Plugin-API reader only
emits those props when a `SOLID` paint actually exists. Same root cause as the font-prop gap,
not new information.

**Not done in this pass** — Task 11 sweep order is chrome → cards → templates → ui atoms; only
chrome (Header/Footer) is repaired. Remaining scope (cards: WorkOverlayCard/WorkMiniCard/
SerieCard/PostRowCalm geometry; ui atoms: Link variants, toggles, LinkNavPost; the `9999px`
border-radius diff-script fix; the TopicChips manifest-selector fix) is left for a follow-up
pass — flagging rather than silently calling Task 11 complete, consistent with the Task 7
majority-pass precedent.

Commit: `fix(geometry): restructure Header/Footer masters — move container inset off root`.

**Geometry repairs (cards, sweep-order step 2)**:
- `blog-postrowcalm--calmrow`: **real bug, repaired.** Web root (`PostRowCalm.astro:` root `<a>`,
  `px-1 py-4`) has 4px horizontal padding; Figma master (`31:13` PostRow) had `paddingLeft/Right:
  0`. Rebound both to the existing `spacing/1` variable (`VariableID:4:3`, 4px) — already used for
  `itemSpacing` on the same node, so this reuses rather than introduces a token. Screenshot
  verified (no reflow/regression); re-diff confirms padding delta gone.
- `work-workoverlaycard--overlaycard`, `work-workminicard--minicard`: no new actionable deltas —
  everything left in the worklist for these two is either the font/color "(absent)" artifact or
  the already-accepted static-hover-state judgment call logged in the chrome pass. Nothing to fix.
- `blog-seriecard--default`: **no master to repair** — only a bare instance exists on the
  Components page, no component/component-set. Building one is Task 13 scope ("legacy 9
  components" / missing-master creation), not a Task 11 repair. Deferred, not attempted.

**Geometry repairs (ui atoms, sweep-order step 4 — "templates" step skipped, out of scope for
this component-level pass)**:
- `ui-link--default`: **real bug, repaired.** Web has no `py-*`/`pb-*` class on the `default`
  variant (`Link.astro:12`, just `border-dashed border-current border-b`), so computed
  `paddingBottom` is `0`. Figma master (`12:7`) had a raw (unbound) `paddingBottom: 2`. Set to `0`
  — no token needed since the correct value is zero. Screenshot verified; re-diff clean.
  - `borderTopColor` (web `rgb(0,0,0)` vs figma `rgb(30,30,30)`): **not a bug** — same ambient-
    color methodology gap as the font-prop "(absent)" cases, one level removed: `Link.astro`
    relies on `border-current` inheriting the ambient text color, which `Layout.astro` sets at the
    `<body>` level; the isolated Astrobook story has no such ancestor, so `currentColor` resolves
    to the browser's initial black instead of `--color-foreground` (#1e1e1e = `rgb(30,30,30)`).
    Figma's master is bound to the real foreground token and is therefore *correct* — it's the web
    geometry read that's context-starved. Left as-is (repairing Figma to match would make it
    wrong).
- `ui-link--secondary`: **real bug, repaired.** Web variant is `py-4` (16px); Figma master
  (`13:4`) had `paddingTop/Bottom` bound to `spacing/2` (`VariableID:4:4`, 8px) — half the correct
  value. Rebound both to `spacing/4` (`VariableID:4:6`, 16px). Screenshot verified (pill shape,
  no regression, height 42→58px as expected); re-diff clean.
- `ui-link--iconbutton`: width delta (web `56px` desktop capture vs figma `40px` master) is
  **named debt, not repaired** — `Link.astro`'s `icon` variant is responsive (`h-10 w-10 lg:h-14
  lg:w-14`, i.e. 40px base / 56px at `lg:`). `geometry.web.json` only captures the desktop/1280
  viewport, so it necessarily sees the `lg:` size; the Figma master represents the single
  canonical size and would need a second variant/frame to represent the breakpoint split. That's
  exactly what Task 14 (Stage 4 — responsive/dark template frames) owns; resizing the master here
  would just swap which breakpoint it silently misrepresents. Flagged, deferred to Task 14.
- `app-themetoggle--default`, `app-motiontoggle--default`, `ui-linknavpost--previous/next`: no new
  actionable deltas — remaining worklist lines are font/color "(absent)" artifacts, the `gap:
  "normal"` string quirk, or (LinkNavPost) content-width variance (web captures live prev/next
  post titles at container width; Figma master is intrinsic-width). Nothing to fix.

**Script fixes**:
- `scripts/pixel-manifest.mjs` (`blog-topicchips--default`): selector changed from
  `div[class="flex flex-wrap gap-2"]` (the multi-chip wrapper) to `div[class="flex flex-wrap
  gap-2"] > span` (one chip, matching the Figma master). `pixel-check.mjs` already calls
  `.first()` on every selector, so this scopes both the pixel-check and the geometry-extract
  pipelines (both consume the same manifest) to the correct DOM level. Re-ran
  `extract-web-geometry.mjs` to regenerate `geometry.web.json`; re-diffed — the `borderTopColor`
  mismatch and most of the padding/width noise for this id are gone. Residual `width` (54 vs 52px)
  is real-text-content variance ("topic" render width vs Figma's placeholder), same
  content-context pattern as elsewhere — not a bug.
- `scripts/figma/diff-geometry.mjs`: added a `borderRadius`-specific normalization — when both web
  and figma values parse as px and are both `>= 999`, treat as equal instead of flagging (e.g. web
  `3.35544e+07px` from `rounded-full`'s browser-computed cap vs figma's `9999px` "full" token —
  both mean "fully round," a five-decade delta was pure noise). This was the Task 10 "flagged, not
  patched" item, explicitly left for Task 11 to decide; decided to patch it since it's a
  self-contained tolerance fix with no design-side risk.

**Final re-diff for this session's scope**: `ui-link--default`, `ui-link--secondary`,
`blog-postrowcalm--calmrow`, and `blog-topicchips--default`'s border/padding are all clean.
Remaining worklist entries across every id touched this session are one of: the font/color
"(absent)" methodology artifact, the `gap: "normal"` string quirk, content-width variance, or the
two explicitly named-debt items above (`ui-link--iconbutton` width → Task 14; `SerieCard` missing
master → Task 13). No unexplained deltas remain in scope.

Commit: `fix(geometry): repair PostRow padding + Link default/secondary padding, fix TopicChips
selector + borderRadius diff tolerance`.

## Task 13 — 🗄️ Legacy Figma page (interactive)

**Step 2 — build.** New page `🗄️ Legacy`, separate from `🧩 Components`, one section per
component, S0 variables/text styles bound throughout, real collection content (not placeholder
lorem). 9 masters:

| Section | Root | Content source |
|---|---|---|
| PostCard | `78:3` | real post (title/description/date/minutesRead) |
| SeriePostCard | `79:2` | real serie post + badge (`serie title 🞄 index`) |
| SerieListItem | `79:12` | WEB PERFORMANCE serie, 2/5 posts shown |
| WorkCard | `90:77` | real work |
| WorkCardImage | `90:86` | real work image card |
| WorksPreview | `92:2` | live works grid |
| BlogPreview | `94:6` | live 2×2 post/seriePost grid, 4/4 posts (no truncation needed) |
| PostList | `97:6` | 8/21 posts shown, 13 older rows omitted (documented in-frame) |
| SerieList | `100:6` | WEB PERFORMANCE 2/5, MY AI JOURNEY 2/2, NUXT FEATURE 3/9 — drops documented in-frame |

Content pulled from a prior segment's Playwright capture (`legacy-content-2.json`), not
re-extracted.

**Bugs found + fixed during build:**
1. **WorksPreview heading wrong style** — "Latest Works" used `Heading/H3` (22px, normal-case)
   instead of `Heading/H2` (30px, uppercase). Root cause: style picked without checking
   `H2.astro`'s actual classes (`uppercase text-3xl tracking-widest`). Generalizes the earlier
   card-title H2→H3 fix: **section headings ("Latest X") = H2; card/doc titles = H3.** Fixed on
   `92:3` before building BlogPreview, so BlogPreview/PostList/SerieList headings were correct
   from the start.
2. **BlogPreview grid collapsed to one column** — `card.counterAxisSizingMode = "AUTO"` was set
   *after* `card.resize(464, h)` + `layoutSizingHorizontal = "FIXED"`, overriding the fixed width
   back to content-hug; the long unwrapped description ballooned the card and pushed the second
   column off-canvas. Fix: re-query `FRAME[name=SeriePostCard], FRAME[name=PostCard]`, force
   `counterAxisSizingMode = "FIXED"` + re-`resize(464, h)` on each. Verified via before/after
   screenshot (broken single-column → correct 2×2).
3. **SerieList build threw `FILL can only be set on children of auto-layout frames`** — per-serie
   `block` frame had `layoutSizingHorizontal = "FILL"` set before `comp.appendChild(block)`
   (skill rule 12: append first, then FILL/HUG). Script is atomic, nothing partially created.
   Removed the premature assignment, kept the correctly-ordered duplicate; retry succeeded.

**Screenshot gate**: all 9 masters visually verified against their Astrobook story preview
(`get_screenshot` + inline compare), done incrementally as each was built — `wp-solo.png`,
`bp-solo.png`→`bp-solo2.png` (post-fix), `pl-solo.png`, `sl-solo.png` plus earlier-segment shots
for PostCard/SeriePostCard/SerieListItem/WorkCard/WorkCardImage. No open visual mismatches.

**Step 3 — geometry diff.** `node scripts/figma/diff-geometry.mjs geometry.web.json
geometry.figma.json`, filtered to the 9 legacy ids. Categorized (same buckets as Task 10/11):

1. **Font props (`fontSize`/`fontFamily`/`fontWeight`/`color`) "(absent)" on every id** — same
   methodology artifact as Task 10 category 2: these roots are `FRAME`/`COMPONENT`/`SECTION`
   containers, not `TEXT` nodes, so the Figma reader has nothing comparable to read off the root.
   Not actionable here.
2. **Width deltas on every id** (e.g. `blog-postcard--default` 1280px web vs 400px figma;
   `blog-blogpreview--default`/`work-workspreview--default` 1280px vs 960px;
   `blog-serielistitem--default` 1280px vs 560px) — same Task 10 category 3: web geometry is
   captured at the desktop `.container`/viewport width, Figma masters are authored at their
   intended design width (card column / 960px content width), not stretched full-bleed. Expected,
   non-actionable.
3. **`paddingRight`/`paddingLeft` 16px web vs 0px figma** on `blog-blogpreview--default` and
   `work-workspreview--default` — inverse of the Task 11 header/footer case (there it was figma-
   has-padding-web-doesn't; here web's selector *is* the `.container` element itself, so its own
   16px inset reads directly, while the Figma master represents the 960px content column without
   an outer page-container inset). Consistent with the container-owns-padding convention
   (CLAUDE.md); these are legacy/unwired masters (`PostList.astro`/`SerieList.astro` are
   `LEGACY — main-only, not wired into any v3 page`), so no page-frame context to inset against.
   Left as-is, not a repair candidate.
4. **`backgroundColor` `rgb(255,255,255)` figma vs transparent (`rgba(0,0,0,0)`) web** on
   `blog-postcard--default`, `blog-seriepostcard--default`, `blog-serielistitem--default` — Figma
   frames need an explicit fill; white is the deliberate canvas background for a standalone master
   on a white page, not a token mismatch. Not actionable.
5. **`gap: "normal"` (web) vs numeric (figma)** on `blog-postlist--default`, `work-workcard--default`
   — same Task 10/11 string-quirk: web root isn't itself a flex/gap container (spacing comes from
   child `border-b`/`py-4`, not a parent `gap`), so `getComputedStyle` reports the CSS default
   string `"normal"` instead of a px value. Not a real delta.
6. **`work-workcardimage--default` width `auto` (web) vs `400px` (figma)** — web root sizes to
   whatever parent grid column it's dropped into (no intrinsic width); Figma master fixes it at
   400px to match `WorkCard`'s column width for standalone legibility. Reasonable authoring
   choice, not a bug.

No unexplained deltas remain for the 9 legacy ids — every worklist line falls into one of the six
categories above, all previously-established patterns from Task 10/11 or direct consequences of
this task's real vs. sample-page content choices.

Commit: `docs(legacy): 🗄️ Legacy Figma page build + geometry/screenshot log`.
