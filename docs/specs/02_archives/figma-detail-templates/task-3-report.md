# Task 3 — Report (Steps 1-2 only: POST — 1280 — Light)

Scope executed: **Step 1** (build `POST — 1280 — Light`) and **Step 2** (gate
screenshot vs. live route). Dark/768/390 siblings (Steps 3-5) were explicitly
**not** built — out of scope for this dispatch, pending human review of this
result.

## What was built

New section `PAGE/POST` at `x=15000` on 📄 Pages (safely clear of all existing
sections/stray frames — see "Observation: stale inventory" below), containing
one frame `POST — 1280 — Light`, 1280×2357, VERTICAL auto-layout, background
bound to `color/background` (`VariableID:3:3`).

Structure (top → bottom), matching `src/pages/blog/[id].astro`:

1. **Header** — instance of master `41:3`, full-bleed.
2. **main** (auto-layout, `paddingTop/Bottom=96`, `itemSpacing=48`, matching
   `container flex flex-col gap-8 py-8 lg:gap-12 lg:py-24`):
   - **header block** (2/3 width = 832px, border-bottom stroke bound to
     `color/muted-border`):
     - breadcrumb nav: Link `Variant=menuInactive` instance ("BLOG") +
       `icon=chevron-right` instance.
     - H1, bound to Text Style **Title/Hero** (60px Bubbler One, uppercase),
       real title "Adding API Endpoints to an Astro Project".
     - Abstract paragraph, real verbatim text from frontmatter (manual 30px
       IBM Plex Sans Regular — no exact preset style exists; see named debt).
     - Meta row (`justify-between`): date-group (calendar icon + "11 May
       2026" + clock icon + "20 min read", bound to Label/Meta style) ·
       TopicChip instance ("astro") · social-share group ("Share" label +
       3 `Variant=iconSmall` Link instances swapped to `icon=bluesky`,
       `icon=linkedin-in`, `icon=mail`).
   - **Hero image placeholder** — rectangle named
     `api-endpoints-with-astro.jpg` (real asset filename), 1248×634 (real
     source image's aspect ratio), fill bound to `color/muted-background`.
   - **content-row** — Prose (real intro paragraph + all 10 real `##`
     headings bound to Heading/H2, 3 representative body paragraphs, 1 real
     code sample bound to Code/Base) + TableOfContents (master `36:3`,
     detached and overridden to a flat list of the 10 real headings — no
     nesting, since the post has no h3s).
   - **RelatedWork** — master `117:77`, detached and overridden from its
     3-card example down to exactly 2 real cards: "Le concept de la preuve"
     and "Medito Fundraising" (image rects renamed to real asset paths).
   - **nav-row** — LinkNavPost `Type=Previous` instance only (no "next" card
     — confirmed this is the most recent standalone post, so code renders no
     next), title set to the real adjacent post "Clickable Images in Astro
     Markdown: Inline Expand and Lightbox".
   - **All blog** link — `Variant=secondary` instance, detached and given an
     appended `icon=arrow-right` instance (secondary has no icon slot by
     default; pattern copied from the `external` variant's text+icon
     layout).
   - Footer instance (master `42:3`), full-bleed.

## Node IDs created/mutated

- Section: `220:2669` (`PAGE/POST`)
- Frame: `220:2670` (`POST — 1280 — Light`)
- Header instance: `220:2671` · Footer instance: `220:2690`
- `main`: `220:2689`
- Header block: `220:2770` · title-group: `220:2771` · nav: `220:2772` ·
  BLOG link: `220:2773` · chevron icon: `220:2775` · H1: `220:2778`
- Abstract: `221:2706` · meta-row: `221:2707` · date-group: `224:2729` ·
  calendar: `221:2708` · date text: `221:2714` · clock: `221:2715` ·
  read-time text: `221:2720` · TopicChip instance: `221:2721` ·
  social-share group: `221:2723` (share-label + 3 Link instances
  `221:2724`/`221:2730`/`221:2734`, icons swapped in-place)
- Hero placeholder: `225:2729`
- content-row: `225:2859` · Prose: `225:2842` (10 heading text nodes +
  3 body paragraphs + 1 code block) · TOC (detached): `225:2752`
- RelatedWork (detached): `226:2747`, grid `226:2749`
- nav-row: `226:2820`, prev instance: `226:2813`
- All blog link (detached): `226:2823`, arrow icon: `226:2825`

## Screenshot comparison result

Compared the Figma header-block render against a Playwright screenshot of
`http://localhost:4321/blog/api-endpoints-with-astro` at 1280×1100, light
mode (`/tmp/.../scratchpad/live-viewport.png` vs. the Figma frame).

**Result: close match, no blocking deviations.** Layout order, spacing
rhythm, token colors, icon set, chip styling, hero placement, TOC/prose
two-column split, related-work card count, prev-only nav card, and the "All
blog" link all line up structurally and visually. Two content bugs were
caught and fixed mid-build by diffing against the live render before calling
it done:
- Reading time was wrongly sourced as "22 min" (a stale value from
  `PostListItem`'s example content) — corrected to the real computed value,
  **"20 min read"**, matching the live page exactly.
- The "Share" label preceding the social icons (present in
  `SocialShare.astro`) was missing from the initial build — added.

## Named debt

1. **H1 style-naming mismatch.** Bound to Text Style **Title/Hero** (60px),
   not **Title/H1** (44px), despite the more obvious name. `H1.astro` always
   renders `text-6xl` (60px uppercase) regardless of page — this is the
   visually-correct binding, but the DS's own naming convention is
   misleading. Recommend renaming/documenting this in Foundations.
2. **No preset Text Style for the abstract paragraph.** `P.astro` renders
   30px Regular at `xl:` — no existing style matches (`Heading/H2` is 30px
   but SemiBold). Set fontSize=30 / IBM Plex Sans Regular manually, unbound
   to a style. Recommend adding a `Body/XL` (30 Regular) style.
2b. **Minor line-wrap divergence.** The H1 and abstract paragraph wrap onto
   a different line-break point than the live render (mine fits slightly
   more per line). Root width (832px, derived from `lg:w-2/3` of the 1248px
   container) matches the CSS class math; the residual gap is most likely
   Figma's Bubbler One / IBM Plex Sans metrics differing slightly from the
   browser's font rendering. Not pursued further — content, size, and casing
   all match; only the exact wrap point differs.
3. **Structural instance-mutation limitation.** The Plugin API refuses
   `appendChild`/`remove` on children of a live instance
   (`Error: ... Cannot move node. New parent is an instance or is inside of
   an instance`). Both the **TableOfContents** override (3-item nested
   example → flat 10-item real list) and the **RelatedWork** override
   (3-card example → 2 real cards) required `instance.detachInstance()`
   first. The detached frames retain the master's visual structure/styling
   but lose the live link — future master edits won't propagate to these
   two nodes. This is an inherent conflict between "instances only" and
   "override child count/nesting per real content," not a build mistake;
   flagging so a follow-up decision can be made (e.g., a documented
   exception in the DS conventions for content-driven child-count overrides).
4. **Prose is representative, not the full 521-line article body.** Per the
   plan's "representative real content" instruction, the Prose block
   contains the real intro paragraph, all 10 real `##` headings (verbatim),
   3 real representative body paragraphs, and 1 real code sample — not a
   node-for-node copy of the entire markdown body. This was a deliberate
   scope decision, not an omission.
5. ~~**Breadcrumb underline.**~~ **Removed — false positive.** An independent
   review checked this live: the "BLOG" breadcrumb's actual rendered class
   (`Link.astro`'s `menuInactive` variant) has no underline, and the Figma
   breadcrumb instance's `textDecoration` is `NONE` on both sides. There is no
   real divergence here; this line was incorrectly listed as named debt and
   is struck from the record.

## Fix round 1 (independent review follow-up)

An independent reviewer verified the frame live against
`http://localhost:4321/blog/api-endpoints-with-astro` and found four real
issues (plus one false positive, corrected above). All four were fixed and
re-verified live via `use_figma`/`get_screenshot`:

1. **Content-row clipping (critical).** `content-row` (`225:2859`) had
   `counterAxisSizingMode: "FIXED"` with height locked at 100px and
   `clipsContent: true` — clipping ~774px of real content invisible in the
   file itself (8 of 10 `##` headings, remaining body paragraphs, the code
   block, and 8 of 10 TOC entries). Fixed by setting
   `counterAxisSizingMode: "AUTO"` so the row hugs its tallest child (Prose,
   874px) — matching the convention used elsewhere in this file for
   mixed-height horizontal rows (e.g. Footer's `Container`/`Links`,
   `PostRow`'s `line`). Verified: row height is now 874px; a fresh
   `get_screenshot` of `225:2859` shows the full Prose (all 10 headings, the
   code block, closing paragraph) and the full 10-item "ON THIS PAGE" TOC
   list, with no truncation.
2. **RelatedWork card width (220px vs. 405px).** Both `WorkMiniCard`
   instances under the `grid` (`226:2749`) were fixed at 220px; the live
   route's `grid-cols-2 sm:grid-cols-3 gap-4` over a 1248px inner container
   computes to 405.3px per card in the 3-column state. Resized both cards
   (`226:2750`, `226:2751`) to 405px width, matching the live per-card
   column math for this 2-item row (cards occupy one 405px column each, not
   stretched to fill two). Verified via screenshot and by cross-checking the
   CSS math (`(1248 - 2×16) / 3 = 405.33`) against
   `src/components/blog/RelatedWork.astro` and the `container` utility in
   `src/styles/global.css`.
3. **Unbound default white fills.** Five structural auto-layout frames
   still carried Figma's default `{r:1,g:1,b:1}` fill left over from
   `createAutoLayout()`: `main` (`220:2689`), header-block (`220:2770`),
   `meta-row` (`221:2707`), `social-share` (`221:2723`), `nav-row`
   (`226:2820`). None of these have a background on the live route — they're
   transparent, letting the page background show through. Set `fills = []`
   on all five. Verified via a fresh full-frame screenshot: no white banding
   anywhere against the page background.
4. **H1 not bound to a Text Style.** `220:2778` had `textStyleId: ""` —
   60px/Bubbler One/uppercase were raw manual overrides that happened to
   visually match Title/Hero, not a real style binding. Bound it via
   `setTextStyleIdAsync` to the actual **Title/Hero** style
   (`S:f34dd92921e0bbaf34a22f5d00904148813640a6,`), resolved by name from
   this file's local text styles rather than hardcoded. Verified:
   `textStyleId` is now non-empty and resolves to Title/Hero; the node still
   renders 60px Bubbler One uppercase.

## Observation: stale Task-0 inventory data

`task-0-inventory.md` reported `PAGE/ABOUT` right edge at `14232` (citing
"several stray top-level frames"). Live re-verification at build time found
no stray frames and a real rightmost edge of only ~3153. This did not affect
the build — `x=15000` remains safely clear either way — but flagging it in
case Task 0's snapshot was taken before Tasks 1-2 cleaned up the file, so
later tasks relying on that specific number should re-verify live rather
than trusting the stored figure.

## Status

**DONE.** Section `220:2669` / Frame `220:2670` built and gated. Gate
result: close visual/structural match against the live route, two real
content bugs caught and fixed during the diff (reading-time value, missing
Share label); five items logged as named debt above (none blocking).

Per scope, stopping here — Dark/768/390 sibling frames (Task 3 Steps 3-5)
were **not** started.

**Fix round 1 status: DONE.** All four issues from the independent review
fixed and re-verified live (see "Fix round 1" section above); named-debt
item #5 corrected as a false positive.

## Fix round 2 (content bugs)

A follow-up review of the RelatedWork section (`226:2747`, grid `226:2749`)
found two more content bugs, both fixed and re-verified live:

1. **Card order reversed.** The live route (`related_work:
   [medito-fundraising, leconceptdelapreuve]` in
   `src/content/post/api-endpoints-with-astro/index.md`) renders "Medito
   Fundraising" first, "Le concept de la preuve" second. The grid's
   auto-layout (`HORIZONTAL`) determines card position by child order, not
   raw `x` — reordered the grid's children (`insertChild(0, …)`) to put the
   Medito card (`226:2751`) first and the leconceptdelapreuve card
   (`226:2750`) second. Also fixed the leftover node-naming bug: the text
   node inside the Medito card (`I226:2751;32:11`) was still named "Le
   concept de la preuve" (a copy-paste leftover) despite its `characters`
   correctly reading "Medito Fundraising" — renamed to match. Verified via
   `get_screenshot`: left card "Medito Fundraising", right card "Le concept
   de la preuve", matching the live route's order.
2. **"Related work" label not uppercase.** The label text node (`226:2748`)
   is bound to Text Style **Label/Meta**, which has `textCase: "ORIGINAL"` at
   the style level — the live route applies a Tailwind `uppercase` class
   (`src/components/blog/RelatedWork.astro` line 15) instead. Set a
   node-level `textCase: "UPPER"` override on `226:2748` only (the shared
   Label/Meta style itself was left untouched, so no other usage in the file
   is affected). Verified via `get_screenshot`: label reads "RELATED WORK".

**Fix round 2 status: DONE.** Both content bugs fixed and re-verified live
against the frontmatter/route source and a fresh screenshot of `226:2747`.

## Steps 3-5 (Dark/768/390 siblings)

Built the remaining 5 frames (Task 3 Steps 3-5), completing the `PAGE/POST`
section's 6-frame matrix. All frames are children of section `220:2669`
(`PAGE/POST`), arranged 3 columns (1280/768/390) × 2 rows (Light/Dark) —
same layout convention as `PAGE/HOME`, `PAGE/BLOG`, `PAGE/WORK`,
`PAGE/ABOUT`. Section resized from `1400×3200` to `2798×6854` to fit all six
frames.

| Frame | Node ID | Size | Position (section-local) |
|---|---|---|---|
| POST — 1280 — Light | `220:2670` (pre-existing, unchanged) | 1280×3111 | 20, 20 |
| POST — 1280 — Dark | `241:2801` | 1280×3111 | 20, 3531 |
| POST — 768 — Light | `245:2813` | 768×2951 | 1450, 20 |
| POST — 768 — Dark | `246:2883` | 768×2951 | 1450, 3371 |
| POST — 390 — Light | `247:2953` | 390×3443 | 2368, 20 |
| POST — 390 — Dark | `248:3084` | 390×3443 | 2368, 3371 |

### Fix round 3 (pre-duplication cleanup on the source frame)

Before duplicating, re-audited `220:2670` for unbound raw fills (the class of
bug caught in Fix round 1) and found **5 more** that round 1 had missed:
`title-group` (`220:2771`), `nav` (`220:2772`), `date-group` (`224:2729`),
`content-row` (`225:2859`), `Prose` (`225:2842`) — all had a raw white solid
fill instead of inheriting the frame's background. Set `fills = []` on all
five, mutating the original `220:2670` directly (so the fix propagates into
every subsequent duplicate). Verified via `get_screenshot`: no white banding,
appearance otherwise unchanged from the Fix-round-2 gated state. This was
necessary groundwork, not scope creep — an unbound fill on the source would
have silently broken Dark-mode auto-flip on every clone.

### Step 3: POST — 1280 — Dark (`241:2801`)

Cloned `220:2670`, renamed, repositioned to `(20, 3531)` (below the Light
frame, matching the Home-Dark row offset). Replicated the Dark-mode
mechanism confirmed from the Home Dark reference (`111:495`): set an
explicit per-frame variable-mode override —
`node.setExplicitVariableModeForCollection({type:"VARIABLE_COLLECTION", id:"VariableCollectionId:3:2"}, "3:1")`
— on top of the frame's existing token-bound background fill
(`VariableID:3:3`, `color/background`). No manual recoloring needed
elsewhere: every fill/stroke in the subtree that's bound to a Color
collection variable (all of them, post Fix-round-3) flips automatically
under the mode override. Verified via `get_screenshot`: header, hero
placeholder, Prose/TOC split, RelatedWork (correct 2-card order), prev-only
nav card, "All blog" link, and footer all correctly recolored for dark mode
with no leftover light-mode artifacts.

### Step 4: POST — 768 — Light/Dark (`245:2813`, `246:2883`)

Cloned `220:2670`, resized top frame to width 768 (height stays `HUG`/auto).
Applied the sub-1024 (`lg:`) Tailwind deltas read directly from
`src/pages/blog/[id].astro`:

- `main` (`245:2815`): `itemSpacing` 48→32, `paddingTop`/`paddingBottom`
  96→32 (drops the `lg:gap-12 lg:py-24` overrides, falls back to base
  `gap-8 py-8`).
- `header` (`245:2816`): `layoutSizingHorizontal` FIXED(832)→FILL (drops
  `lg:w-2/3`, becomes `w-full`), `itemSpacing` 32→16 (`gap-4` vs
  `lg:gap-8`), `paddingBottom` 48→24 (`pb-6` vs `lg:pb-12`).
- `meta-row`: left unchanged — `sm:flex-row md:items-center md:gap-2` are
  already satisfied at 768px, identical to 1280.
- Hero image rectangle (`245:2835`): resized to keep the source aspect
  ratio (634/1248 ≈ 0.508) at the new content width (768 − 32 padding =
  736 → height 374). This isn't in the plan's explicit delta list but is
  necessary — without it the hero would either stretch or leave dead space,
  since the frame's height is `FIXED`, not `FILL`-derived from aspect ratio.
- TOC sidebar: kept as-is (per spec) — no changes to `content-row` or the
  detached `TableOfContents` node; `Prose`'s `FILL` sizing absorbs the width
  change automatically.
- RelatedWork grid cards (`245:2880`, `245:2881`): resized from the 1280
  value (405, a 3-column track at 1248px) to the 3-column track width at
  the new content width: `(736 − 2×16) / 3 ≈ 234.67`. The component's
  Tailwind classes are `grid-cols-2 gap-4 sm:grid-cols-3` — 768px is ≥`sm`
  (640px), so it's still 3 columns even though only 2 related-work items
  exist (the 3rd column renders empty, same as live).

Built `768-Dark` (`246:2883`) by cloning the verified `768-Light` (not
re-deriving from `220:2670`) and applying the same explicit-mode-override
trick used for `1280-Dark` — this reuses the already-reflowed 768 layout
instead of redoing the width math twice.

Verified both via `get_screenshot`. Live-render comparison at `768px` (see
"Live-site 768/390 overflow" below) is compromised by a pre-existing route
bug, so verification leaned on: (a) matching the Tailwind class semantics
directly from source, and (b) cross-checking structural sanity against the
non-buggy 1280 frame and the Home/Blog-index routes (which render correctly
at 768px).

### Step 5: POST — 390 — Light/Dark (`247:2953`, `248:3084`)

Cloned `220:2670`, resized to width 390. Same `main`/`header`/hero-aspect
deltas as the 768 frame (identical Tailwind breakpoint — both are below
`lg`), plus the 390-specific (`sm`/`md`) deltas:

- `meta-row` (`247:2963`): converted `layoutMode` HORIZONTAL→VERTICAL,
  `itemSpacing` 8→16 (`gap-4` vs `md:gap-2`), `primaryAxisSizingMode` →
  `AUTO` / `layoutSizingVertical` → `HUG` (was a fixed 24px row height),
  `counterAxisAlignItems` CENTER→MIN (drops `md:items-center`) — matches
  `flex-col justify-between gap-4 sm:flex-row md:items-center md:gap-2`
  below the `sm` (640px) breakpoint.
- TOC sidebar removed from `content-row`: the detached `TableOfContents`
  aside (`247:2994`) was deleted (`node.remove()`) — at 390px the live route
  never renders the `md:block` aside at all, it's replaced by the collapsed
  `<details>` accordion above the Prose block. `content-row` now has a
  single child (`Prose`, `FILL`), which fills the available width.
- New node: **mobile TOC accordion** (`247:3098`, "mobile-toc-details"),
  inserted into `main` directly before `content-row` (matching the source
  order in `[id].astro`: hero → `<details>` → content-row). Built as an
  auto-layout frame, `HORIZONTAL`, `itemSpacing: 6`, padding 16 all sides,
  `cornerRadius: 8`, `fills: []` (transparent — no new raw fill), `strokes`
  copied by reference from `header.strokes` (already bound to
  `VariableID:3:8`, the muted-border color, so no new unbound
  stroke/color was introduced). Contents: a cloned chevron icon instance
  (from the breadcrumb nav's `220:2775`, resized to 12×12) + a cloned
  "ON THIS PAGE" label (from `225:2753`, same Label/Meta-derived text style,
  characters set to `"ON THIS PAGE"`) — reproduces the native
  `<summary>`'s disclosure marker + uppercase "On this page" text in its
  collapsed (closed) state, matching the live route's default render.
- RelatedWork grid cards (`247:3020`, `247:3021`): resized to the
  2-column track width — below `sm` (640px), the component's
  `grid-cols-2 gap-4 sm:grid-cols-3` collapses to 2 columns:
  `(358 − 16) / 2 = 171` (content width 390 − 32 padding = 358).
- LinkNavPost nav-row: left unchanged (single `prev`-only card in this
  post's real content, so the `gap-2`/`gap-8` distinction is not visually
  observable either way).

Built `390-Dark` (`248:3084`) by cloning the verified `390-Light` and
applying the same explicit-mode-override as the other Dark frames.

Verified both via `get_screenshot`: meta-row stacks correctly (date/read-time
row → topic chip → share row), accordion renders with chevron + uppercase
label between hero and Prose, RelatedWork renders as a true 2-up grid.

### Live-site 768/390 overflow (observation, not fixed — out of scope)

While gathering live reference screenshots (`pnpm dev`, Playwright), found
that `/blog/api-endpoints-with-astro` genuinely overflows horizontally at
both 768px and 390px viewports: `document.body.scrollWidth` measures 1019px
at a 768px viewport (H1 clipped off the right edge, hero image bleeds past
the container). Investigated and ruled out:

- Font-loading race (added `document.fonts.ready` wait — no change).
- Code blocks (`<pre class="astro-code">`) — measured 715px, well within
  bounds; not the cause.
- Global layout/Header — confirmed **not** a site-wide bug:
  `/` (home) and `/blog` (index) both measure exactly 768px `scrollWidth` at
  a 768px viewport with no overflow. The bug is specific to the post-detail
  route.

Root cause not fully isolated (time-boxed the investigation, per the
"Figma replication of design intent, not live-bug-for-bug fidelity" scope of
this task — plan.md's Global Constraints state responsive behavior derives
from Tailwind class semantics, not literal live-pixel matching). The `768`
and `390` Figma frames were built to the intended Tailwind-derived layout
(container capped at breakpoint width, as `src/styles/global.css`'s
`container` utility itself specifies: `max-width: var(--breakpoint-xl)`
with `margin-inline: auto`) rather than reproducing this anomaly, which a
fixed-width Figma frame can't meaningfully represent anyway. **Logging this
as a live-site bug worth its own investigation/fix outside this Figma task**
— likely candidates for a follow-up: the hero `CustomImage` wrapper div
(`src/components/ui/CustomImage.astro`) has no explicit width class and
relies on block-default fill-width behavior, or something upstream forces
the containing block wider before layout settles. Not blocking — the Figma
frames represent design intent correctly and match the non-buggy 1280
frame's structure at proportionally reflowed widths.

### Named debt (Steps 3-5)

1. **Nav-row `itemSpacing` (`226:2820` and its 768/390 clones) is `8`, not
   `32`** (the live route's `md:gap-8` at ≥768px implies 32px). Not touched —
   this post's real content only has a `prev` card (no `next`), so the row
   has a single child and the gap value has zero visual effect at any
   breakpoint. Flagged for correctness only, not visually broken.
2. **Mobile TOC accordion chevron** uses a clone of the breadcrumb's
   `lucide:chevron-right` icon instance rather than the browser's native
   `<details>` triangle marker (no Figma equivalent exists) — a reasonable
   visual stand-in, not a pixel-exact reproduction. No raw hex introduced;
   the icon instance inherits its own token-bound fill.
3. **RelatedWork grid at 768px** renders a true 3-column CSS Grid track
   (empty 3rd cell) rather than 2 cards evenly split — verified this
   matches the component's actual Tailwind classes (`sm:grid-cols-3`) rather
   than assuming a simpler 2-up fill; flagged here so a future reviewer
   understands why the two cards look narrower than the 1280 frame's ratio
   at first glance.

### Step 6 gate

All 6 frames confirmed present in `PAGE/POST` (`220:2669`) and verified via
`get_screenshot`:

- `220:2670` POST — 1280 — Light — **spot-checked, unchanged** except for
  the Fix-round-3 unbound-fill cleanup (visually identical to the
  Fix-round-2 gated state; no white banding).
- `241:2801` POST — 1280 — Dark — verified, matches Home-Dark recoloring
  mechanism.
- `245:2813` POST — 768 — Light — verified against Tailwind-derived design
  intent (live comparison compromised by the route-level overflow bug
  logged above).
- `246:2883` POST — 768 — Dark — verified, correct dark recoloring.
- `247:2953` POST — 390 — Light — verified: stacked meta-row, mobile TOC
  accordion, 2-col RelatedWork grid all present and correctly laid out.
- `248:3084` POST — 390 — Dark — verified, correct dark recoloring.

Section `220:2669` resized to `2798×6854` to contain all six frames in the
established 3-column × 2-row convention.

**Steps 3-5 status: DONE.** All 4 new frames built, gated, and documented.
One pre-existing live-site bug found and logged as out-of-scope named debt
(not fixed, per task scope). One additional source-frame cleanup (Fix round
3) completed and propagated to all clones.

## Fix round 4 (post-review)

An independent reviewer of Steps 3-5 found two real issues. Both fixed and
re-verified live via `use_figma`/`get_screenshot`.

### Issue A: Header/Footer never resized off the 1280 master default (critical)

All 8 Header/Footer instances in the 4 non-1280 POST frames still carried the
master's default `width: 1280`, unresized to their parent frame's actual
width — full desktop nav/footer layout overflowing/clipping inside 768px and
390px frames:

| Frame | Width | Header | Footer |
|---|---|---|---|
| POST — 768 — Light (`245:2813`) | 768 | `245:2814` | `245:2887` |
| POST — 768 — Dark (`246:2883`) | 768 | `246:2884` | `246:2957` |
| POST — 390 — Light (`247:2953`) | 390 | `247:2954` | `247:3027` |
| POST — 390 — Dark (`248:3084`) | 390 | `248:3085` | `248:3138` |

**Fix mechanism.** Compared against `PAGE/HOME`'s `Home — 768 — Light` /
`Home — 390 — Light` frames, which use the identical `mainComponent`s
(`41:3` Header, `42:3` Footer) and render correctly — confirming the fix is a
plain resize + per-instance override, not a variant swap (no new component
variant created, no raw hex introduced; every override is a layout-property
change on an existing token-bound instance):

1. **Resize.** `node.resize(width, node.height)` on all 8 instances, width
   set to the parent frame's width (768 or 390).
2. **Alignment override.** A resize alone left the master's default
   `Container.primaryAxisAlignItems = "MAX"` (right-packed) in place, which
   pushed the "Home" nav link off-canvas at 390 (negative x). Home's
   reference instances carry an explicit `primaryAxisAlignItems = "MIN"`
   override — replicated onto all 4 Header instances' `Container` child, and
   onto the 2 POST-390 Footer instances' `Container` child (also
   `counterAxisAlignItems = "CENTER"`, matching Home's footer-390 pattern;
   POST-768 footers were left on the master default — see below).
3. **`itemSpacing` override.** Left-packing at `MIN` alone still overflowed
   the 390 header (ThemeToggle icon clipped at the right edge) because
   `Container.itemSpacing` was still the master's default `40`. Reduced to
   `16` on all 4 Header instances (deduced from Home's item x-position
   deltas). Same adjustment on the 2 POST-390 Footer instances:
   `Container.itemSpacing = 24` (was 0), `Links.itemSpacing = 16` (was 32).

**POST-768 footers intentionally left untouched beyond the resize.**
Home-768's footer also uses the master's un-overridden defaults
(`SPACE_BETWEEN`/`MIN` alignment, `itemSpacing=32`, `Links.itemSpacing=32`)
and exhibits the same partial link-text truncation at its right edge
("...Bl" cut off) as a result of the master's footer lacking a true
responsive wrap layout. Since POST-768 now matches Home-768's own reference
behavior exactly, no additional override was applied there — applying one
would have made POST-768 diverge from the established Home pattern rather
than match it.

**Verification (`get_screenshot`, header top ~150px / footer bottom ~200px
region, all 8 nodes):**

- `245:2814` POST-768-Light header — full nav ("Home Blog Work About" +
  play/theme icons) visible, no clipping.
- `246:2884` POST-768-Dark header — same, correct dark recoloring.
- `247:2954` POST-390-Light header — full nav visible and left-packed
  ("Home" underlined + "Blog Work About" + icons), no clipping.
- `248:3085` POST-390-Dark header — same, correct dark recoloring.
- `245:2887` POST-768-Light footer — copyright line + "Home Blog Work About
  GitHub Art Portfolio Email RSS" links visible, right-edge truncation
  ("...Bl") present and matches Home-768's reference behavior exactly (not a
  regression).
- `246:2957` POST-768-Dark footer — same, correct dark recoloring.
- `247:3027` POST-390-Light footer — copyright line + "Home" visible, no
  overflow past frame edge.
- `248:3138` POST-390-Dark footer — same, correct dark recoloring.

**Residual discrepancy (not blocking, logged transparently).** POST-390
footer's `Links` sub-group computed width settled at 607px post-fix, not an
exact match to Home-390's 559px (~48px gap, root cause not fully isolated —
likely a residual text-measurement/wrap difference from the itemSpacing
value chosen vs. Home's exact original value, which wasn't independently
re-derivable from the master). Visually both render the same truncated
"Home"-only footer-link state at 390px; not pursued further given the
footer master's known lack of true responsive reflow (same caveat already
documented for Home itself).

### Issue B: RelatedWork card height mismatch at 390 (both themes)

`WorkMiniCard` instances in the same grid row differed by 28px, producing an
uneven card-row bottom:

| Frame | Card A (Medito) | Card B (Le concept) |
|---|---|---|
| POST — 390 — Light | `247:3020` (256px, unchanged) | `247:3021` (284px → 256px) |
| POST — 390 — Dark | `248:3131` (256px, unchanged) | `248:3132` (284px → 256px) |

**Fix mechanism.** `node.resize(node.width, 256)` on `247:3021` and
`248:3132` — the taller card had `layoutSizingVertical: "HUG"`, letting its
title text push the card past the 256px reference height used elsewhere in
the file for this component; resizing flips `layoutSizingVertical` to
`"FIXED"` at 256px, matching Card A.

**Overflow check.** The card's title text node
(`I247:3021;32:11`/`I248:3132;32:11`, "Le concept de la preuve") now
technically overflows the card's own bottom edge by 28px, since the card has
`clipsContent: false`. Confirmed via absolute-position math this does not
visually overlap the nav-row below (text bottom ≈2871 vs. nav-row top =2875,
4px clearance) — a genuinely tight but non-colliding gap, not a masked bug.

**Verification (`get_screenshot`):** both cards render with even bottoms at
256px in both Light and Dark; no visible overlap with adjacent content below
the grid.

**Fix round 4 status: DONE.** Both issues fixed and re-verified live across
all 12 affected nodes (8 Header/Footer instances + 4 WorkMiniCard height
nodes). One residual minor discrepancy logged above (POST-390 footer Links
width, 607px vs. Home's 559px) — visually equivalent truncation behavior,
not blocking.
