# UI Refinements v2 — Design Spec (2026-07-18)

A second UI/UX refinement pass on `feat/seniority-update`, layered on top of the already-shipped home "Writing" section rebuild. Directions chosen with Jérôme via the options artifact (`https://claude.ai/code/artifact/594d0bad-a640-4914-967c-8f468cd47b97`).

**Scope:** Home writing feed row, Blog list layout, Work page (featured + past projects), About page, Series landing page, Hero, plus a batch of deterministic fixes. No new dependencies, no image generation, no schema-breaking changes.

**Stack constraints (unchanged):** Astro 5, Tailwind v4 CSS-native tokens (`src/styles/global.css` — only `foreground`/`muted` families, **no accent token**), `astro-icon` (lucide + fa6-brands), CVA `Link` variants, pnpm. Verification per change = `pnpm build` green + `pnpm format:check` clean + dev-server visual check. Icon language stays: `lucide:folder` = series identity, `lucide:layers` = parts, `lucide:clock` = read time, `lucide:arrow-right` = row affordance.

---

## 1. Home — PostRow (writing feed row)

**Current** (`src/components/blog/PostRow.astro`): `flex flex-col` `<a>`; serie kicker (folder + title + part), title row (title + `min · MonthYear`), 1-line clamped description, up to 2 topic tags. No hover animation.

**Target:**
- **Drop the description entirely.** Serie kicker + topic tags carry the topic signal. Rows become: kicker (if serie) / title + meta / tags (if any).
- **Add the blog-post arrow animation** — identical mechanics to `PostListItem.astro`:
  - Root `<a>` gains `group relative overflow-hidden`.
  - An absolutely-positioned `<Icon name="lucide:arrow-right" class="text-muted absolute -translate-x-8 transition-transform group-hover:translate-x-2" />` at the row's left, vertically aligned to the title line.
  - The left content column (kicker + title + tags) gets `transition-transform group-hover:translate-x-8`. The right-aligned meta (`min · MonthYear`) does **not** shift (matches `PostListItem`, where only the title translates).
  - Keep existing `hover:bg-muted-background`.
- Tags unchanged in style (`border-muted-border text-muted border px-2 py-0.5 font-mono text-xs`), still capped at 2. They render only once `topic` frontmatter exists (see §7).

**Files:** `src/components/blog/PostRow.astro` (restructure markup: wrap kicker/title/tags in a shifting group, add absolute arrow, remove `<p class="line-clamp-1">` description).

---

## 2. Blog — year-rail chronological list

**Current** (`src/pages/blog.astro`): H1 "Blog" + intro P; `<H2>Latest</H2>` over year-bucketed `PostListItem` rows; `<H2>Series</H2>` + `SerieCard` grid below.

**Target — "year rail":**
- **Remove the `<H2>Latest</H2>` heading.** The year label becomes the structural spine — no redundant section title.
- Each year group renders as a two-column rail:
  - `sm`+: `grid grid-cols-[3rem_1fr] gap-x-3` — left cell = the year (mono, bold, `text-accent`-equivalent → since there is no accent token, use `text-foreground` bold to stand out from muted rows; year is the one strong mark). Right cell = the rows, with a `border-l border-muted-border pl-3` rail.
  - base (mobile): collapse to a single column — year as a full-width mono label above its rows, no left rail (avoids the 3rem gutter squeezing titles on narrow screens).
- Rows: dates drop from full date to **month only** within a year group (year is already the header). Reuse `PostListItem` but the meta shows `MonthYear`→ month; **simpler: keep `PostListItem` as-is (it shows `getFormattedDate` = "18 Jul 2026")**. Decision: introduce a compact rail row rather than reuse `PostListItem`, OR pass a `dateFormat` hint.
  - **Resolved:** keep `PostListItem` but add an optional `compact` prop that, when set, renders the date via `getMonthYear` (→ "Jul 2026") instead of the full day date. Blog list passes `compact`. The home feed already uses `PostRow` (its own component) so this is isolated to `PostListItem` + `blog.astro`.
- Year never repeats; groups keep date-desc order (already computed in `blog.astro`'s `byYear`).
- **Series section stays** below the rail (`<H2>Series</H2>` + `SerieCard` grid) — unchanged.

**Files:** `src/pages/blog.astro` (rail markup replacing the flat "Latest" section), `src/components/blog/PostListItem.astro` (optional `compact` → `getMonthYear`). The folder-icon `SerieCard` is unaffected.

---

## 3. Work — Selected work (featured), horizontal split

**Current** (`src/components/work/WorkCard.astro`): bordered `<a>`, image block `aspect-video flex-1 lg:aspect-square lg:flex-none` (near-square, dominant), text block with kicker/title/description(clamp-3)/date-if-no-kicker, plus a hover overlay rotating a `cross-big` icon. Grid `sm:grid-cols-2`.

**Target — horizontal split (denser):**
- Card becomes a **horizontal row**: image left (fixed width ~38%), text right. On mobile (base) stack vertically (image on top), switch to horizontal at `sm`+.
  - Suggested classes on the `<a>`: `flex flex-col sm:flex-row` (remove the `lg:flex-col` reversal).
  - Image block: `sm:w-[38%] sm:flex-none aspect-video` (landscape crop; keep `aspect-video` on mobile top image too). Remove the `lg:aspect-square`/`lg:flex-none` square treatment.
- Text block keeps kicker → title → description (clamp-3). Since cards are now shorter and there are 4 of them, **use a single-column stack** (`grid grid-cols-1 gap-8`) rather than 2-col, so each row spans full width and 3-4 are visible with less scroll. (Alternatively `sm:grid-cols-2` of horizontal cards — but full-width single column reads cleaner for a "row" card. **Decision: single column.**)
- **Hover affordance:** drop the oversized rotating `cross-big` overlay (it suited the big square image); keep `hover:bg-muted-background` and add a small `lucide:arrow-right` sliding arrow consistent with the rest of the site (optional — or keep the overlay scaled down). **Decision: keep `hover:bg-muted-background`, drop the big cross overlay, no per-card arrow** (the whole card is obviously a link via hover tint + cursor).
- Kicker stays the canonical `"{Type} · {years}"` format (see §7).

**Files:** `src/components/work/WorkCard.astro` (layout rewrite), `src/pages/work.astro` (Selected-work grid → single column: `grid grid-cols-1 gap-8`).

---

## 4. Work — "More projects" (renamed from Archive)

**Current** (`src/pages/work.astro` + `src/components/work/ArchiveTable.astro`): `<H2>Archive</H2>` over a table Year | Project | Type | Built with | Link; rows are `<tr align-top>`; only the Project-title cell and the external "Visit" cell are links.

**Target:**
- **Rename heading `Archive` → `More projects`** (`work.astro` H2). Component filename `ArchiveTable.astro` may stay (internal name) — do not churn imports; only the user-facing H2 changes. (Optional: rename to `MoreProjectsTable.astro` for clarity — low value, skip unless trivial.)
- **Whole row is a link to the internal project page** (`/work/[id]`), not just the title cell. Implement by making each `<tr>` behave as a link: wrap the row's content so a click anywhere navigates. Astro/HTML can't nest `<a>` around `<tr>`; use a JS-free pattern: put the primary `<a href="/work/{id}">` on the Project cell as a **stretched link** — `class="... after:absolute after:inset-0"` on the anchor with the `<tr>` set `relative` — so the whole row is clickable while the external "Visit" link stays a separate, higher-`z` anchor. Keep `Visit` external link as the secondary action.
- **Vertical-center rows:** change `align-top` → `align-middle` on the `<tr>`.
- Columns unchanged: Year | Project | Type | Built with (stack) | Link. Keep the mobile column hiding (`Type` `hidden sm:table-cell`, `Built with` `hidden md:table-cell`) and the `overflow-x-auto` wrapper.
- Drop `Built with` column? No — keep; it is useful metadata. Keep the "—" fallback.

**Files:** `src/pages/work.astro` (H2 text), `src/components/work/ArchiveTable.astro` (`align-middle`, stretched-link row, keep external Visit above the stretched link with `relative z-10`).

---

## 5. About — lead + narrative (keep facts, drop timeline)

**Current** (`src/components/about/AboutText.astro`): single 2/3-width column — H1 "About", intro Prose (with inline uhlive link), `<AboutFacts />` (4 stats), `<AboutTimeline />` (5-dot year timeline), Download CV link, then more Prose.

**Target — "Lead + narrative", one column:**
- Keep the single 2/3-width column (one narrative line).
- **Add an emphasized lead sentence** directly under H1 — larger type, `text-balance`, sets the story in one line before the prose flows. **It must NOT contain "since 2010"** — the About page already carries the year twice (the facts stat "2010 / coding since" and the prose "Open source since 2010"); a third is redundant (see "since 2010" placement note below). Reframe thematically around the art→web throughline. Draft (author to finalize): *"Artist turned web developer — I build things meant to be used, not just seen."* Must differ from the hero paragraph.
- **Keep `<AboutFacts />`** (2010 · articles · downloads · trained) — 4-stat row stays.
- **Remove `<AboutTimeline />`** (the 5-dot dates row) — delete the component usage and the file if it has no other consumer.
- Keep Download CV link and the trailing Prose blocks.

**Files:** `src/components/about/AboutText.astro` (add lead `<p>`, remove `<AboutTimeline />` import + usage). Delete `src/components/about/AboutTimeline.astro` if orphaned (verify via grep). `AboutFacts.astro` unchanged.

---

## 6. Hero — composition fixes

**Current** (`src/components/hero/Hero.astro`, `HeroText.astro`, `HeroSocials.astro`): `HeroSocials` gap `gap-4 lg:gap-6`; "Start reading" scroll cue is `absolute bottom-0`, `text-muted`, `hidden lg:flex` (desktop-only), targeting `#writing`.

**Target:**
- **Icon buttons closer:** `HeroSocials` gap `gap-4 lg:gap-6` → `gap-3 lg:gap-4`.
- **"Start reading" more prominent + always visible:**
  - Promote it from a muted text link to a visible pill: border (dashed→matches `Link` icon idiom) + `text-foreground` on hover, small `lucide:arrow-down`. Give it breathing room (`gap-2`, padding).
  - Make it visible on all breakpoints. Below `lg` the hero is not a fixed-height box, so the `absolute bottom-0` overlaps the socials — **place the cue in normal flow below `lg`** (a centered block after the hero content) and keep it `absolute bottom-0 lg:flex` only at `lg`+. Simplest robust approach: render the cue once, `static` (in flow, centered, `mt-8`) at base, switch to `absolute bottom-0` at `lg`. Verify no overlap with `HeroSocials` at any width.

**Files:** `src/components/hero/HeroSocials.astro` (gap), `src/components/hero/Hero.astro` (scroll-cue prominence + responsive positioning).

---

## 7. Deterministic fixes (batch)

1. **Kill redundant WorksStrip line** — remove `<P>Building since 2010 — from robotic drummers to web apps.</P>` (`WorksStrip.astro:13`); duplicates the hero paragraph. Keep the section heading and mini-cards.
2. **Series folder icon on the landing page** — add `<Icon name="lucide:folder" />` before the serie title in the Series landing header (`src/pages/blog/[serie]/index.astro`, currently `<H1>{entry.data.title}</H1>` with no icon). Match the SerieCard eyebrow idiom (icon + text, muted). Since it's an H1 (uppercase, large), place a smaller folder icon inline before the title, vertically centered.
3. **Populate `topic` frontmatter** — add 1–2 comma-separated topics per post (`post` + `seriePost`) so PostRow/PostListItem tags render. Author-owned content values; propose per-post topics from titles (e.g. Web Performance posts → `"astro, performance"`). This is a content task; the UI already supports it.
4. **Unify work metadata order** — canonical order wherever type/date/stack appear together:
   - **Kicker** format = `"{Type} · {years}"` (already the convention; verify all featured works follow it).
   - **WorkHeader** (`src/components/work/WorkHeader.astro`) metadata table rows → order **TYPE · DATE · STACK** (verify current order matches; reorder if not).
   - **More-projects table** columns stay **Year · Project · Type · Built with** (year leads because the table is chronological — acceptable divergence; the *type/stack* sub-order is consistent).
   - Ensure `en-GB` date formatting everywhere (already standardized in the prior pass).

---

## "since 2010" placement (one owner per meaning)

The phrase was echoing across five surfaces. Rationalized so each page states the year once as a sentence, and the About page carries it as data + a scoped claim rather than a repeated headline:

| Surface | Role | Verdict |
| --- | --- | --- |
| `HeroText.astro:13` "making things with code since 2010…" | Canonical career identity | **Keep** |
| `WorksStrip.astro:13` "Building since 2010…" | Duplicate of hero | **Delete** (§7.1) |
| `work.astro:20` "Open work since 2010…" | Work page's own framing | **Keep** — sole echo once WorksStrip is gone |
| `AboutFacts.astro:7` stat "2010 / coding since" | The number's data home | **Keep** |
| `AboutText.astro:56` "Open source since 2010…" | Scoped claim (open source specifically) | **Keep** — distinct meaning |
| About new lead (§5) | — | **No year** — reframe thematically |
| `AboutTimeline.astro:3` "2010 / Open source…" | — | **Removed** with the timeline (§5) |

Rule of thumb: "since 2010" as a *sentence* appears once per page (Hero, Work). On About it lives as a stat and one scoped prose claim — never as the lead.

## Cross-area consistency notes

- **List idiom:** three list surfaces now coexist — home `PostRow` (feed), blog year-rail `PostListItem`, work More-projects table. They share the muted-border + mono-meta + hover-tint language; this is intentional family resemblance, not identical components.
- **No accent color token exists.** Anywhere the artifact showed a green accent (year, kicker), the real site uses `text-foreground` (strong) vs `text-muted` (weak) — do not introduce a new color token.
- **Arrow affordance** (`lucide:arrow-right`, slide-in) now appears on: `PostListItem` (existing), `PostRow` (§1 new). Do not add it to the More-projects table rows (stretched-link + hover tint is enough there).

---

## Out of scope

- CV system (separate `~/code/projects/cv` repo + plan).
- Illustration/OG-image system (separate backlog brainstorm).
- Case-study prose bodies for flagship works (content, trails layout).
- Any change to the `serie`/`seriePost` route structure or collection schemas beyond reading existing optional `topic`.

---

## Acceptance criteria

1. Home feed rows show no description; hovering a row slides an arrow in from the left and shifts the title/kicker/tags right (matches `/blog` rows).
2. `/blog` shows year-labelled groups with no "Latest" heading; dates read as month+year; Series section persists below.
3. `/work` Selected work: 4 horizontal-split cards, image ~38% left, visibly less tall than before; single-column stack.
4. `/work` past section titled **More projects**; every row navigates to its internal project page on click anywhere; rows vertically centered; external Visit still works as a distinct link.
5. `/about`: emphasized lead line under H1; 4-stat facts row present; no 5-dot timeline.
6. Hero: social icons visibly tighter; "Start reading" is a prominent, always-visible cue with no overlap at any width.
7. WorksStrip no longer shows the "Building since 2010…" line; Series landing H1 carries a folder icon; posts with `topic` render tag pills; work metadata order consistent.
8. `pnpm build` green, `pnpm format:check` clean.
