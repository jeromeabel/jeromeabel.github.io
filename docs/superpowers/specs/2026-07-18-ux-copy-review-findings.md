# UX/UI & Copy Review — feat/seniority-update (2026-07-18)

Two review passes on the branch diff vs `main`: Jérôme's own browser review + Claude's deep diff review. To be triaged and worked on later. Not yet fixed unless marked.

---

## Implementation status (2026-07-18)

**Deterministic fixes — DONE** (build + format verified):

- Footer overflow → `overflow-x: clip` (`global.css`).
- Hero "Start reading" anchor overlap → hidden below `lg` (`Hero.astro`).
- Archive titles link to internal `/work/[id]` (balanced choice), external "Visit" kept secondary with `aria-label` (`ArchiveTable.astro`).
- RSS autodiscovery `<link rel="alternate">` in `<head>` (`SEO.astro`).
- WorkCard drops calendar date row when `kicker` present (`WorkCard.astro`).
- Copy: "reconversion" → "career change" (`AboutText`, `AboutTimeline`); blog intro reworded (`blog.astro`); years → "since 2010" (`work.astro`, `WorksStrip`); "at work" → "at my day job" (`work.astro`); heading "Works" → "Work" (`WorksStrip`).
- AboutFacts article count now computed from collection; "framework downloads" → "Malinette downloads".
- Nits: `en-EN` → `en-GB` (`format-date.ts`, `WorkCard`, `PostListItem`); SerieCard chevron → `layers` icon (added to icon allowlist) + "94 min total" → "~1h 34m read".

**Verified, no change needed:** HeroText h1 dropping surname is fine — SEO `<title>`/OG carry "Jérôme Abel" (`SEO.astro:26`).

**Deferred — need your decision (not implemented):**

- §2 brainstorm items: blog-list scanability, Selected-work ordering (which project leads — currently Chimères 2013–2019) + card density, "Start here" heading + composition + latest-vs-curated on home, About layout alternatives, Archive table layout rework.
- Hero layout composition (taste).
- `Link.astro` `-inset-y-2` prose stacked-link overlap — footer bug already fixed via `clip`; this separate visual concern left for a real browser test.
- Case-study `TODO(author)` comments — need your prose, can't author.

---

## Part 1 — Jérôme's review (browser pass)

### Home

- **Hero layout**: improve UI position of the text block, the 3 social icons, and the "Start reading" link. Composition feels off.
- **"Start here" section**:
  - Rename the heading — "Start here" reads like an app onboarding step, not a personal blog. Find a better heading.
  - Section is not visually balanced: 2 series cards + 2 list lines looks arbitrary/unfinished.
  - **The latest blog posts don't appear!** Section currently shows _featured_ posts (`getFeaturedPosts`), not the most recent ones. Decide: latest vs curated, or both (e.g. curated series + genuinely latest posts).
- **Footer**: links section shows a scrollbar — overflow bug. ✅ **FIXED** (2026-07-18). Root cause: `.container` used `overflow-x: hidden`; per CSS spec a `hidden`/`visible` axis pair makes the `visible` axis compute to `auto`, turning every container into a vertical scroll box. Link `after:-inset-y-2` tap-area pseudo bled ±8px vertically → stray scrollbar. Fix: `overflow-x: clip` in `src/styles/global.css` (clip doesn't force `overflow-y: auto`).

### Blog

- Post list needs to be easier to scan in a long list:
  - More space between dates / clearer date column.
  - Add per-line topic info — a tag like "perf", "astro", "testing"… or the serie name — so a reader can choose in a big list.
  - **Needs brainstorming**: several different approaches to compare (tags column, serie prefix, grouped by topic, two-column meta…). Don't just pick the first idea.

### Work

- **Selected work ordering**: must NOT start with robotic / old art projects. Current `featured: 1` is Chimères Orchestra (2013–2019). Lead with recent/web work; art projects later.
- **Featured card layout**: takes too much space — image is ~50% of viewport height. Make cards denser.
- **Wording**: "Archive" or "Archives"? Decide.
- **Archive table**: rework layout — vertically align row content.
- **Archive → project pages disconnect**: archive rows don't link to the internal project pages even though every work has one. Splitting "deep case studies" vs "the rest" is understandable, but listing items with only an external link while hiding their own content pages is weird. **Needs a decision — balanced or radical**:
  - Balanced: archive rows link to internal pages, external link secondary.
  - Radical: archived projects have no internal pages at all (external only), or all projects get equal internal treatment.

### About

- Content seems OK. Explore alternative layout approaches (facts/timeline/prose ordering, visual treatment).

---

## Part 2 — Claude's diff review

### Bugs / high priority

- `src/components/hero/Hero.astro:14` — 🔴 "Start reading" anchor is `absolute bottom-0` but the section only has a fixed height at `lg:` (`lg:h-[500px]`). Below `lg`, the link overlaps the `HeroSocials` icon row. Add bottom padding below `lg` or hide the anchor on small screens. (Related to Jérôme's hero-layout point.)
- `src/components/work/ArchiveTable.astro:36` — 🔴 archive titles not linked to `/work/[id]` although all works build detail pages → orphaned case studies. (Same finding as Jérôme's "can't see project's page"; resolve via the balanced/radical decision above.)
- `src/pages/rss.xml.ts` + `SEO.astro` — 🟡 no `<link rel="alternate" type="application/rss+xml">` in `<head>`; feed readers can't autodiscover the new feed.

### UX / a11y

- `src/components/work/ArchiveTable.astro:51` — 🟡 repeated bare "Visit" links; screen-reader link list is useless. Add `sr-only` project name or `aria-label`.
- `src/components/ui/Link.astro` (default variant) — 🟡 new `after:-inset-y-2` hit-area may overlap adjacent text lines/links in prose. Test stacked links; consider `-inset-y-1`.
- `src/components/work/WorkCard.astro:60–77` — 🟡 kicker "Art · 2013–2019" AND calendar footer "Jan 1, 2019" show the same info twice; the fake precise date looks wrong next to the honest range. Drop the calendar row when `kicker` exists.
- `src/pages/blog.astro` — ✅ **RESOLVED / STALE** (2026-07-18). Page already refactored: "Latest" posts grouped into year buckets, then "Series" section below. The "series buried under a flat 21-post list" state this described no longer exists. Open sub-question that survives: whether "Latest" should be capped (e.g. Latest N + Series-first) — folds into Jérôme's blog-list scanability brainstorming, not a standalone finding.

### Copy

- `src/components/about/AboutText.astro:15` + `AboutTimeline.astro:6` — 🟡 "reconversion" is a French calque. Use "career change" / "retrained as a web developer"; timeline label → "Career switch to web".
- `src/pages/blog.astro:28` — 🟡 "Reflections, experiments, and lessons learned from my developer's journey" is generic filler. Reuse the RSS description promise: e.g. "Web performance, testing, and the craft of building front ends well."
- `src/pages/work.astro:20` vs `WorksStrip.astro:13` vs `AboutFacts.astro:3` — 🔵 "Fifteen years" / "15 years" / "coding since 2010" inconsistent (2010→2026 = 16 years). Standardize on "since 2010" — it self-updates.
- `src/pages/work.astro:20–23` — 🔵 "What I build at work is private": "work" collides with the page title. Say "at my day job".
- `src/components/work/WorksStrip.astro:12` — 🔵 heading "Works" vs nav "Work". Standardize (also relates to Archive/Archives question).
- `src/components/about/AboutFacts.astro:4–5` — 🔵 "21 articles published" hardcoded, will go stale — compute from collection. "framework downloads" vague — "Malinette downloads".
- `src/components/hero/HeroText.astro` — 🔵 h1 "Hi, I'm Jérôme." drops the surname from the only homepage h1. Verify `<title>`/SEO still carries "Jérôme Abel".
- Hero link "Start reading" → lands on heading "Start here" — scent mismatch; pick one phrase (moot if heading is renamed per Part 1).

### Nits

- `src/components/blog/PostListItem.astro:19` — `"en-EN"` invalid BCP-47 locale (also pre-existing in `WorkCard`). Use `"en-GB"` or `"en"`.
- `src/components/blog/SerieCard.astro:29` — `chevron-right` icon glued to "3 parts" reads as navigation affordance. Use a list/layers icon or drop it.
- `src/components/blog/SerieCard.astro:32` — "94 min total" intimidates; prefer "~1 h 30 read" or parts-only.
- Case studies — `TODO(author)` HTML comments still present in chimeres/malinette/leconceptdelapreuve; resolve before content is final.

---

## Suggested triage order

1. **Bugs**: ~~footer overflow scroll~~ ✅ fixed, hero anchor overlap, "Start here" missing latest posts.
2. **Decisions needing brainstorming** (each deserves options + pros/cons, not a first-idea fix):
   - Blog list scanability (tags / serie name / spacing / grouping).
   - Archive ↔ project pages relationship (balanced vs radical).
   - "Start here" heading + section composition.
   - Selected work ordering & card density.
   - About layout alternatives.
3. **Copy pass**: reconversion, blog intro, years consistency, labels (Work/Works, Archive/Archives).
4. **Detail fixes**: a11y visit links, locale strings, SerieCard icon/time, RSS autodiscovery, WorkCard date duplication.
