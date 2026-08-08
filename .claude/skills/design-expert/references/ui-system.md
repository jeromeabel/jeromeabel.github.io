# UI System — components, color, type, responsive

Dark-first design. Content column max ~1280px inside 1920/1536 frames.
Tokens live in `src/styles/global.css` (`@theme {}`) and the Figma
`Blog Design System v1.0` file (see `scripts/figma/` tooling).

## Color roles

| Role | Value | Used for |
|---|---|---|
| Accent (single) | teal | See accent budget below — and nothing else |
| Foreground | near-white | Titles, body |
| Muted | grey ≥ 4.5:1 on bg | Descriptions, metadata, topic labels |
| Background lift | subtle grey | Row hover tint, bordered-card hover bg |

**Surfaces are relational, not absolute** *(decided 2026-08-04)*. There are three
stacking levels, and each one steps *away* from the background — which means
darker in light mode and lighter in dark, the same per-mode direction flip the
accent scale already uses.

| Token | Light | Dark | Sits on |
|---|---|---|---|
| `--color-surface` | lime-200 `#e0eec4` | gray-700 `#343434` | background |
| `--color-surface-hover` | lime-150 `#eaf5d3` | gray-750 `#2b2b2b` | background (rows, cards at rest) |
| `--color-surface-raised` | lime-250 `#d3e3ae` | gray-650 `#3f3f3f` | a hovered surface (chip inside a hovered row) |

The retune was forced by contrast, not taste. The old hover tint sat a full
border-step away from the background (`#d1ddbb` / `#4c4c4c`) and broke AA for
everything printed on it: teal-700 fell to **3.77:1** in light, teal-500 to
**3.54:1** in dark. The new values keep the tint near the background —
teal-700 **4.72:1**, teal-500 **5.84:1**. Muted dark also had to move up one
step (`#9b9b9b` → `#b0b0b0`) because `#9b9b9b` on the topic chip's `surface`
box was already **4.48:1**, under AA at rest.

**Pick by what the element sits on, not by the interaction.** An element resting
on the background hovers to `surface-hover`; an element already on `surface`
(theme/motion toggles, topic chip in a hovered row) steps to `surface-raised`.
Using `surface-hover` for the second case makes the element move *toward* the
background and read as recessed.

`--color-surface-hover` no longer shares primitives with `--color-border` — the
overload was why one token had to serve two incompatible jobs.

**Accent steps differ per mode** *(added 2026-08-04)*. No single teal clears
4.5:1 on both backgrounds — teal-500 is 2.34:1 on the cream `#f5ffe1`, teal-800
is 2.21:1 on the near-black `#1e1e1e`. So the role token flips scale position,
and hover moves *away* from the background in both directions (darker in light,
brighter in dark):

| Token | Light (on `#f5ffe1`) | Dark (on `#1e1e1e`) |
|---|---|---|
| `--color-accent` | teal-700 `#00786f` — 5.18:1 | teal-500 `#00bba7` — 6.88:1 |
| `--color-accent-hover` | teal-800 `#005f5a` — 7.28:1 | teal-400 `#00d5be` — 8.94:1 |
| `--color-accent-strong` | teal-900 `#0b4f4a` — 9.09:1 | teal-300 `#46ecd5` — 11.29:1 |
| `--color-accent-subtle` | teal-50 `#f0fdfa` | teal-950 `#022f2e` |

`accent-subtle` is a **surface** tint, never text. Figma `2 Theme/color/accent*`
aliases the same `1 Primitives` teal steps per mode; `scripts/figma/token-map.json`
covers all eight so `pnpm figma:verify` catches drift.

**Accent budget at rest** (benchmark-backed: 5/8 dev blogs show zero accent
inside cards; accent marks CTAs/category-links — see benchmarks.md):

1. Serie chip (navigational category — Stripe precedent)
2. Section CTAs (`All posts →` — "Read more" precedent)
3. Active nav state
4. Focus outlines
5. Hover underline *decoration* (see Hover states)

Explicitly NOT accent: titles (rest or hover repaint), topic labels, dates,
`6 parts` meta inside SerieCard (it's metadata; the whole card is the link —
accenting it falsely promises a separate click target).

Rules:
- **Teal means "you can go somewhere".** Passive labels never get accent.
- No second accent (violet/pink experiments rejected — two accents on same-role
  elements make the first one meaningless).
- Images carry their own color; chips/metadata around them stay quiet.

## Chip anatomy

Chips are mono 12/16, +2% tracking, UPPERCASE. **Shape encodes behaviour**, not
just color: the box says "passive label", the icon + teal says "link". A chip
that both boxes *and* accents is reserved for a real filter button (none today).

| Chip | Anatomy | Color | Links? |
|---|---|---|---|
| Serie chip | folder icon 16px + `WEB PERFORMANCE · 2/5` — **no box**, padding `3px 0`, 6px gap *(decided 2026-08-04)* | teal | yes → serie page |
| Topic label | `PERFORMANCE`, no icon — muted **background-only box**, padding `3px 6px` (no border, no hover, no pointer) *(decided 2026-08-04)* | muted | no (until filters exist) |

**Both chips are 22px tall.** The serie chip carries `3px 0` padding — vertical
only — so it matches the boxed topic chip's height while its *text* still starts
flush on the title's left rule. Horizontal padding is deliberately asymmetric
between the two: for a boxed chip the box edge is the aligned edge, for a boxless
one the glyph is (Carbon/Primer convention). Equal heights matter because the two
variants swap into the same slot; unequal ones shift every row below them.

Boxing the serie chip too would erase that signal and leave color as the only
differentiator — which fails for anyone who doesn't already read teal as
interactive. Topic box: `radius 4`, padding `3px 6px`, `surface/muted` fill.

Design-system basis (benchmarks.md study B): static muted boxes are
first-class (Carbon read-only Tag, Primer Label); the bg-box separates topic
from date/read-time metadata and upgrades cleanly to a filter later. What's
forbidden: border + hover + pointer on a label that does nothing.

- One chip per card/row (serie wins over topic — see SKILL.md rule 1).

**Part indicator: `· 2/5`, one format everywhere** *(decided 2026-08-04)*. Dot
separator, no parentheses, no long form. `(2/5)` adds two glyphs of pure noise at
12px; `Part 2 of 5` triples the width of the least important token on the row and
competes with the title. The earlier "long form acceptable in featured cards"
exception is **removed** — three formats in one design file was the whole
complaint. Related: post titles never carry `(part 2)`, because the chip directly
above already says it. Serie totals read `6 PARTS`, uppercase like every other
mono chip.

Accessibility: the compact form needs a spelled-out label. Put it *inside* the
chip as `<span class="sr-only">Web Performance, part 2 of 5</span>` next to
`<span aria-hidden="true">· 2/5</span>` — **not** as `aria-label` on the row
link, which would replace the whole accessible name and swallow the post title.
Shipped this way in `PostRow.astro` / `PostRowCalm.astro`.

## Card anatomy

| Component | Border | Padding | Image | Notes |
|---|---|---|---|---|
| SerieCard | 1px border, radius 16 | card 0, content 20 (gap 20) | top, **bleeds to card edge** | Aggregate entity. Meta: folder + `6 parts`, title, desc, `Mar–Jul 2026` |
| PostCardPreviewBig | none | none | top | Home featured. Chip → title → desc → date |
| PostCardPreviewSmall | none | none | left thumb (~40%) | Chip → title → desc(optional) → date |
| WorkCard | none | none | top | `WEB APP · 2026` mono kicker → title → desc |
| PostRow | border-bottom hairline | vertical padding | none | title left; chip + date·time right |
| ArchiveTable | year in left gutter + vertical rule | — | — | Rows grouped by year, year not repeated per row |

**Cover aspect ratio is 2:1 everywhere** *(decided 2026-08-04)* — featured,
small thumb, SerieCard. cover-studio emits source art at 1664×845 (≈1.97:1), so
2:1 is the only ratio that doesn't crop. Three different ratios (2.34 / 1.78 /
1.35) was the single biggest source of the "chaotic sizes" feeling.

Concrete boxes: big `552×276`, small thumb `240×120`, SerieCard `378×189`. The
small thumb must be **fixed-height and top-aligned**, not stretched to the text
column — letting it fill vertically silently re-derives its ratio from whatever
the description happens to wrap to.

### Spacing: two numbers, both explicit

*(decided 2026-08-04)* Every card and row uses exactly two gaps:

| Gap | Value | Between |
|---|---|---|
| Inner | **4** | chip → title → description (the identity block) |
| Block | **20** | cover → content, and identity block → footer metadata |

4px binds the identity block into one visual unit; 20px separates units. Measured
drift before the fix was 24 / 20 / 16 across the three cards — three numbers doing
one job.

**Never `SPACE_BETWEEN` / distributed spacing here**, even though it makes cards
in a stretched grid look tidy. It ties spacing to card *height*, so the same
component breathes differently in a 3-col and a 2-col grid, and the metadata line
drifts away from the text it belongs to. Equal card heights come from the 2-line
clamps on title **and** description — see Sizing model.

**Nested radius rule**: an inset child's radius must be `r_outer − padding`.
SerieCard sidesteps it by bleeding the cover to the card edge (padding 0, cover
top corners = card radius, bottom corners = 0, `clipsContent` on the card).

## Hover states — ONE gesture per surface

Benchmark rule (0/8 blogs stack two hover signals): each surface gets exactly
one coordinated hover gesture. Entire surface is the link, `cursor: pointer`,
visible `:focus-visible` ring everywhere.

Title treatment: **underline decoration appears** — 2px thickness, 4px offset,
`text-decoration-color` teal, text color unchanged (Josh Comeau pattern).
Repainting the title in accent is rejected: collides with the teal serie chip
sitting next to it (GitHub can color titles only because its cards carry no
chips).

| Surface | The one gesture *(decided 2026-08-04)* |
|---|---|
| PostRow | full-row background tint (`--color-surface-hover`) — no underline, no arrow, no content shift |
| Borderless card (Post/Work) | title underline + image scale(1.02) ~500ms ease-out, coupled as one gesture (GitHub `:has` pattern); `overflow: hidden` on image wrapper |
| SerieCard (bordered) | border lightens (neutral, NOT teal) + title underline + faint bg lift |

`prefers-reduced-motion`: drop the scale (underline/tint remain — color-only
changes are fine). Transitions 150–200ms except image scale (~500ms).

### Why rows tint and cards underline

*(re-litigated and upheld 2026-08-04 — the question "shouldn't PostRow underline
like the others?" is reasonable and will come back; this is the answer.)*

The hover's job is to **mark the hit area**, and the two surfaces start from
different places:

- A **card** is already a bounded object at rest — the cover block draws its
  edges. The link boundary is visible before you touch it, so the underline only
  has to name *which part* is the link. Tinting it would invent a box that
  doesn't exist at rest.
- A **row** has no edges at rest. The strip runs the full container width and the
  hit area extends past the title, through empty space, to the meta on the right.
  An underline marks maybe 40% of that target and leaves the pointer sitting over
  apparently-dead space for the rest. The tint *is* the boundary.

Density compounds it: rows stack 10–20 deep. A 2px underline is a local signal
that doesn't answer "which row am I on" peripherally; a tint does, instantly.

**Contrast was the real complaint, not the tint.** When this was raised the teal
serie chip was failing AA on the hovered row (3.54:1 dark). That was the hover
tint sitting a full border-step from the background, not the choice of gesture —
see Color roles. Post-retune it's 5.84:1 / 4.72:1. Don't re-open the gesture
because of a token bug.

**Evidence** *(Study C, 12 sites CSS-verified 2026-08-04 — gap now closed)*. The
strip tint is the **unanimous data-list idiom**: GitHub file list, GitHub issue
list, jsr.io search results, Vercel changelog — 4/4 tint the full row. It is
*not* the majority blog-list idiom: of 8 blog indexes only react.dev tints, and
its rows are bordered panels; the rest use a title underline (MDN), a title color
shift (Next.js), or nothing at all (Stripe, deno, HN). So argue PostRow from
**density**, not from "everyone does this" — our rows run at data-list density
(10–20 deep, chip + meta, full-width hit area), which is why the data-list
precedent is the right one to borrow. Two of the twelve sites *stack* signals
(GitHub issues tint + accent title; react.dev tint + underline), so one-gesture
on rows is our choice, not a benchmark verdict. Study A's "Vercel pattern" note
previously attached here was a card-container tint doing double duty.

**Tint magnitude is the part that's actually load-bearing.** Measured band across
the tinting sites: ΔL\* 2.5–4.5 light, 4.6–9.3 dark (bg-vs-tint ratio 1.07–1.21).
Ours: −3.63 / +6.27 (1.10 / 1.18) — in band. Pre-retune: −12.15 / +21.05, 3–5×
outside it. Keep new tints inside the band.

**Consistency is of the principle, not the gesture** *(2026-08-04)*. Row-tint and
card-underline look inconsistent side by side but aren't, for the reason above.
Consistency is per-role here, same as the border rule — the DS deliberately runs
three gestures (row tint / card underline+scale / SerieCard border+underline+lift).
Rows and cards never appear in the same block, so the two gestures never have to
agree on screen.

**Anything sitting on a hovered surface must step up with it.** The topic chip
inside a hovered PostRow re-binds to `--color-surface-raised`; keeping it on the
absolute `--color-surface` made the box dissolve into the tint, which was read as
"the hover has no contrast".

## Images

- **Full brightness at rest, always** (3/3 benchmark sites with images; no
  dim/opacity rest state, no tint). LQIP fade-in on load ends at 100%.
- Hover: slow slight scale as above, or nothing. Never brightness/tint on
  hover (0/8 precedent; light-mint covers wash out, teal-duotone covers turn
  muddy under a teal overlay).

## Typography layers

1. **Title** — sans SemiBold, foreground (never muted), the scan anchor.
2. **Description** — sans Regular 16/24 **muted**, clamp at 2 lines everywhere
   (incl. SerieCard — it was foreground, which made it compete with the title).
3. **Metadata/chips** — mono 12/16, +2% tracking, muted (accent if serie chip).
4. **Display font** — page H1 only (`BLOG`, hero H1). Never below H1.

**Bubbler One is display-only** *(decided 2026-08-04)*. It's a thin single-weight
face: under ~20px the strokes drop below one device pixel and it reads as noise.
Page H1 at 60px, natural case, no tracking adjustment. Card titles, section
headings and anything smaller use the sans.

**Case**: chips are UPPERCASE (`FULL-STACK`, `WEB PERFORMANCE · 2/5`); dates and
read-time stay natural case (`Apr 16, 2026 · 14 min`) — uppercasing a date makes
it harder to parse and gives it chip weight it hasn't earned.

| Slot | Font / size / line-height | Color |
|---|---|---|
| Page H1 | Bubbler One Regular 60 / auto | foreground |
| Featured card title | Sans SemiBold 32 / 38 | foreground |
| SerieCard title | Sans SemiBold 22 / 28 | foreground |
| Small card title | Sans SemiBold 18 / 24 | foreground |
| Row title | Sans SemiBold ~17 | foreground |
| Description | Sans Regular 16 / 24 | muted |
| Chip / metadata | Mono Regular 12 / 16, +2% | muted, or accent (serie) |

Chips must bind the **`font/mono`** token. The topic chip was bound to
`font/sans` at 10px Medium — a wrong *family* binding, not just a wrong size,
and one that survives a visual review because 10px sans and 12px mono look
similar at card scale. When a chip looks off, check the bound token before the
numbers.

## Sizing model

The hug/fill/fixed mix was the other half of the "chaotic" complaint. One rule:

- **Width `FILL`, height `HUG`** on every card, row and content stack.
- **No fixed heights** except cover aspect boxes (`height = width / 2`).
- **The grid stretches the card, not the card itself** — cards never carry
  explicit widths; the parent grid/flex does.
- **Never `SPACE_BETWEEN` on an axis that hugs** — see pitfalls below. Use start
  alignment + an explicit gap. (`SPACE_BETWEEN` is legitimate on a *fixed*-width
  axis, e.g. PostRow's title-left / meta-right line.)
- **Gaps are always explicit numbers — 4 or 20**, never derived from stretch.
- Equal-height cards in a grid come from the **2-line clamps**, not from fixed
  heights. Clamp title *and* description, or the row is still ragged.

## Figma authoring pitfalls

Four traps that produced the "chaotic rules" symptom. All cost a debugging round
before they were identified — check these first when Figma renders wrong.

| Trap | Symptom | Rule |
|---|---|---|
| `primaryAxisAlignItems = 'SPACE_BETWEEN'` with `primaryAxisSizingMode = 'AUTO'` | `itemSpacing` reads 24 but renders 0; frame height < sum of children | Never pair them. `MIN` + explicit gap |
| `textTruncation = 'ENDING'` resets `maxLines` to 1 | 2-line clamp silently becomes 1 line; card loses exactly one line-height | Set `textTruncation` **first**, `maxLines` second |
| `setBoundVariableForPaint` on a `VARIABLE_ALIAS`-backed variable | Renders black | Walk the alias chain to a literal, put that color on the paint, *then* bind |
| Two sizing enums | `FIXED\|HUG\|FILL` vs `FIXED\|AUTO` | `layoutSizingHorizontal/Vertical` ≠ `primary/counterAxisSizingMode` |
| `resize()` silently resets **both** sizing modes to `FIXED` | Cover stops filling its card after a ratio fix | Re-apply `layoutSizing*` immediately after every `resize()` |
| Instance points at a **stale duplicate** main component | `resetOverrides()` "does nothing"; one instance keeps wrong padding/font forever | Check `getMainComponentAsync()` before debugging overrides — `swapComponent(canonical)` then reset |
| Mutating instances while iterating a `query()` result | `getMainComponentAsync: Node with id "I…;…" not found` | Collect ids first (drop nested `I…;…` ids), re-fetch inside the loop |

Also: `setBoundVariableForPaint` returns a **new** paint — capture and reassign
it, mutating in place does nothing. CSS selectors in `findOne` break on names
containing spaces; traverse `children` instead.

## Figma node index

File `ihWIWmvtQPTWgUxlrVjC2c` (`Blog Design System v1.0`), section `Blog`
`2041:486`. Variant sets are marked ✳.

| Component | Node |
|---|---|
| PostMetadataTopic ✳ (`type=post` / `type=serie`) | `2371:10414` |
| PostMetadataTime ✳ | `2040:482` |
| SerieMeta | `2375:10662` |
| PostCardPreviewBig ✳ (`State=default` / `hover`) | `2385:7139` |
| PostCardPreviewSmall ✳ (`State=default` / `hover`) | `2385:7149` |
| SerieCard ✳ (`State=default` / `hover`) | `2367:7205` |
| SerieCard-XP | `2377:10751` |
| SerieCardList | `2119:7557` |
| PostRow ✳ | `2124:7937` |
| ArchiveTable | `2124:8011` |
| BlogPreviewSection | `2041:560` |

Theme variables live in collection `2 Theme` (modes Light `3:0`, Dark `3:1`) and
alias into `1 Primitives` (single mode). Primitives added 2026-08-04 for the
surface retune: `gray-300` `#b0b0b0`, `gray-650` `#3f3f3f`, `gray-750` `#2b2b2b`,
`lime-150` `#eaf5d3`, `lime-250` `#d3e3ae`.

⚠️ `2375:10617` `PostMetadataTopic/serie-accent` is an **orphaned duplicate** of
the serie chip (IBM Plex Sans instead of Fira Code, stray hidden fill). Its last
instance was swapped to the canonical variant on 2026-08-04; delete it rather
than let it collect new instances.

## Known code drift

**Closed 2026-08-04** (all three PostRow items fixed after Study C): arrow +
content translate removed from `PostRow.astro` (0/12 surveyed lists stack an
arrow with a tint), both rows moved to `hover:bg-surface-hover`, part indicator
now `· 2/5` — `total` threaded through `SerieMembership` in `repository.ts`.

Note: `PostRow.astro` and `PostRowCalm.astro` are now identical except for the
description line, so the `VARIANTS.homePosts` toggle no longer picks between two
real designs. Merge or delete one when the variant question is settled.

**Still open:**

| Where | Drift | Should be |
|---|---|---|
| Post titles in content frontmatter | `Optimizing Images with Astro (part 2)` | drop the suffix — the chip above already says `· 2/5` (see Part indicator) |
| `PostListItem`, `SeriePostListItem`, `WorkCard`, `WorkGalleryCard`, `LinkNavPost`, card components | `hover:bg-surface` / `hover:bg-surface/50` | `hover:bg-surface-hover` — `surface` sits a full step from the background, outside the benchmarked ΔL\* band |

## Responsive rules

Design frames are 1920/1536; container caps at ~1280 so real breakpoints are
container-relative. Use Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280).

| Block | ≥1024 | 768–1023 | <768 |
|---|---|---|---|
| Home blog preview | featured left (~55%) + right column: vertical stack of 3 image-left smalls | featured full-width (image top), smalls stay image-left, full-width stacked | same, thumb ~96px; desc hidden on small cards |
| Home work | 3 cols | 2 cols (3rd wraps) | 1 col |
| Blog series grid | 3 cols | 2 cols | 1 col (cards full-width) |
| Blog post rows | single line: title left, meta right | same | two lines: title, then chip + date below; year gutter → inline year heading |
| Featured card | image ~55% | image full-width above text | same |

Touch: full card/row remains one tap target ≥ 44px high; hover effects must
have non-hover equivalents (nothing essential revealed on hover only).

## Iconography

lucide via astro-icon. Semantic assignments: folder = serie (only), calendar =
date (optional, usually omitted), clock = read time (optional), arrows =
navigation. Don't add icons to topic chips.
