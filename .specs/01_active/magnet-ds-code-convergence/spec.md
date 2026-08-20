---
title: "Code follows Magnet-DS: renames, Link CVA, row collapses"
created: 2026-08-20
---

Magnet-DS shipped 2026-08-20 and is now the **source of truth for the design**. This is the code
catching up. Everything below was found and verified during that work and deliberately **not
fixed** — that was the rule for all three phases.

Source: `.specs/02_archives/magnet-ds-final-state/` — `design.md` §7 for the intended end state,
`progress.md` for how each item was found (`## CODE DEBT` sections at R2.3, R3.1, R3.6-prep and
the R3.3 re-run).

## Route rebuilds — size these apart from the renames

**Do the WorkCard component first.** `WorkCard.astro` is marked LEGACY in-file and is unused:
`/work` renders `WorkGalleryCard`, and `WorkCard` is reachable only via `WorksPreview.astro`,
which no v3 page imports. The Figma master's `catalogue`/`case` anatomy — and its `breakpoint`
axis — has **no code counterpart at all**, so the two route rebuilds below have nothing to build
on until it exists. Spec already written: `.specs/01_active/work-card-redesign/spec.md`.

- **`/work` Selected** — `work.astro:42` maps onto a `WorkGalleryCard` grid; Figma is a 4-card
  `case` zigzag plus `ArchiveTable`, 3 hairlines. The largest item here: a route rebuild.
- **Home composition** — `index.astro:12-18` is `Hero → SelectedWriting → WorksStrip → AboutStrip
→ Contact` with `WorkMiniCard` + `WorkOverlayCard` (`WorksStrip.astro:18,20`); Figma is the
  four-section composition with 3 `catalogue` cards and no `AboutStrip`. Neither half is new
  vocabulary — §7 already carries the `AboutStrip` removal and the WorkCard spec owns
  `getFeaturedWorks(limit)`. The debt is wiring.
- **Serie landing list** — live is boxless (top rule only); Figma uses boxed `blog/SerieContents`.

## Renames and collapses (design.md §7)

- **`Link` CVA vocabulary**: `cta→primary`, `icon→iconOnly`, `iconSmall→iconOnly size=small`,
  `default→inline`; `menuActive`/`menuInactive` express NavLink states; `bold` (single use,
  `ContactText`) folds into `textLink`.
- **Row collapses**: `PostListItem → PostRow type=post`, `SeriePostListItem → PostRow type=serie`;
  `SerieList.astro` / `PostList.astro` adopt canon children and get wired into `blog.astro`, which
  today renders items directly.
- `TopicChips → PostMetadataTopic` · `LinkNavPost → PostNav` (ui→blog) ·
  `Contact → ContactPreview`, `ContactText → ContactContent`.
- Home-section duplicates to canon names: `SelectedWriting`/`BlogPreview` → `BlogPreview`,
  `WorksStrip`/`WorksPreview` → `WorkPreview` (canon name keeps the rendered markup).
- **Archive, not delete**: `WorkOverlayCard`, `WorkGalleryCard`, `PostListItem`,
  `SeriePostListItem`, `SelectedWriting`, `WorksStrip`, `AboutStrip`, `AboutValues`, `ValueCard`,
  `Skills`, `SkillsText`, `SerieListItem`, `SeriePostCard`.

## Responsive — one convention, then verify against code

**The DS has no single responsive convention.** `work/ArchiveTable`, `contact/ContactPreview`,
`blog/TableOfContents`, `work/WorkCard` and `work/WorkPreview` carry `breakpoint` axes;
`blog/PostNav`, `work/WorkHeader`, `work/RelatedWriting` stay 720–832 FIXED and rely on flexible
children. Settle which is the rule, then apply it. Overlaps `figma-mobile-section-variants` and
`figma-mobile-touch-targets` in this backlog — fold them in rather than running them separately.

- **`blog/PostNav` has no mobile treatment.** In bounds, so no gate catches it, but on
  `Post — Mobile` / `Serie post — Mobile` the prev/next titles wrap **mid-word** in a ~170px
  column ("Benchm / arking a / 10,000- / Row / Table") and the two cards end up unequal heights.
  Fix is a `breakpoint` axis stacking the two cards — a design decision, which is why it was
  deferred rather than patched at ship.
- R3.6-prep fixed these in Figma and **none was checked against the site**: prose image FILL +
  16:9 lock, inline-code wrapping, `ui/H1` wrapping, `PostRowCalm` title/meta wrapping, TOC
  active-item wrapping, `ui/Link/secondary` auto-width.

## Tokens

- **`ArchiveTable` row hover** — Figma binds full `2 Theme::color/surface`; code is
  `hover:bg-surface/50` (`ArchiveTable.astro:32`). Decide: `2 Theme` gains `color/surface-subtle`
  (alpha-50), or code drops to the flat token. Deliberately not patched during the DS work — a
  half-step added then would have shipped an unused variable through the phase-2 gate.
- **The Motion doc declares a vocabulary the code lacks** — `--duration-fast` / `--duration-base` /
  `--duration-slow`, `--ease-out` / `--ease-in-out` appear nowhere in `src/`.
- `global.css:140-141` — `.reveal` runs **1.3s**, off the 150/250/400 scale.
- `WorkCard.astro:42` — `duration-1000` + `scale-105` against a 400ms doc and a ≤2% scale spec;
  `:34` adds `hover:bg-surface`, giving **three** hover verbs where the DS allows one coupled pair.
- Dead `--color-accent-hover` declarations to delete.
- The 8 Desktop `work/WorkCard` variants carry raw spacing/padding/radius from P2-T04
  (`boundVariables` holds only `strokes`/`fills`) — gaps 12/20/24/64, padTop 4, radius 8. A
  bounded binding sweep, Figma-side.

## Tooling — the offline prover has two holes

- **`geometry.figma.json` cannot refresh.** `figma:dump` writes only `tokens.figma.json`, and no
  script derives geometry from a `.fig` — so `diff-geometry.mjs` produces no usable drift signal
  (173 rows, and it compares web-light against Figma-dark besides). `fig-decode.mjs` already
  exposes sizes, transforms, paddings and paints, so a `.fig`-side extractor is writable.
- **The strict out-of-root-bounds sweep is live-only.** A `.fig` export carries **no instance
  internals** — `Work — Mobile` has 18 descendants at depth 3 — so the sweep cannot be scripted
  offline and a `.fig`-side 0 is vacuous, not clean. Either document it as live-MCP-only, or
  decide with the item above that the offline prover cannot cover instance interiors at all.
- **`raw-values.figma.json` has no scripted refresh.** It is the only input to `verify-raw`, only
  the manual `dump-raw-values.md` walk produces it, so it drifts behind every Figma write and the
  report's STALE INPUT banner fires on mtime alone. See `figma-raw-value-triage` in this backlog,
  which already owns the "baseline the never-baselined kinds" half of this.

## Figma-side leftovers

- Figma `/blog` renders 2 `SerieCard`s; live maps **all** series (3 live). Figma is one card short.
- `blog/SerieCard` carries a date-range TEXT that `SerieCard.astro` never renders — Figma-only.
- `SerieCard.astro` and `WorkCard.astro` are both headed "LEGACY — main-only, not wired into any
  v3 page". Decide delete-vs-build per component.
- The Motion doc's hover-verb table still uses pre-§3 short master names (`Link/CTA`, `NavLink`…).

## Not debt — recorded so this topic does not re-file them

Each was re-checked against live code during the DS work and found **correct**:

- **Related-block children** use compact children (`WorkMiniCard`, `PostRowCalm`), not the page's
  own cards. Decision record `related-block-children` in `DOC / Decision Log` (📚 Docs) is the durable artifact; code already matches.
- **`WorkHeader` link labels** `website→Website`, `live→Demo`, `git→Code`, `video→Video` —
  `WorkHeader.astro:42-48`.
- **`ContactPreview` Mobile** hides the illustration rather than deleting it — `ContactImage.astro:5`
  (`hidden … sm:block`). The hidden layer models the DOM correctly.
- **`ui/Prose` outside `.container`** on work detail — intentional in code.
- **`ui/Link/menuInactive`** never existed in Figma; both breadcrumbs correctly fell back to
  `ui/Link/textLink`. The briefs were wrong and were struck at R3.1.

Size: L
