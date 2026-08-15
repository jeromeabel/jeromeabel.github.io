---
title: WorkCard redesign — distinguishing work from blog
created: 2026-08-15
status: design — brief for a Figma exploration round
prompt: ./prompt.md
---

# WorkCard redesign

The Home page shows a blog section and a work section that currently look like the same
component with different words in it. This spec defines **why** they must read differently,
**what** each one is allowed to own, and the direction shortlist a design round should
explore. The self-contained brief handed to the design agent is [prompt.md](./prompt.md).

Scope: **Home `WorkPreviewSection` + `/work` Selected grid**. Not in scope: `ArchiveTable`,
`RelatedWork` on post pages, the work detail page.
Medium: **Figma-first** in `Magnet-DS` (`ihWIWmvtQPTWgUxlrVjC2c`); code follows after a
direction is picked.
Content budget: **existing frontmatter fields only** — no new schema keys, no per-entry
authoring beyond `kicker` backfill.

---

## 1 · Current state

### Figma (source of truth, ahead of code)

Frame `Home — Desktop [Dark]` (`2989:4642`), instances `BlogPreviewSection`
(`2586:1141`) and `WorkPreviewSection` (`2586:1142`).

**BlogPreviewSection** — `BLOG` heading + hairline + `All posts →`. Asymmetric, ranked by
`featured` (1 = the big one):

- featured 1: large 16:9 cover, serie chip (`📁 WEB PERFORMANCE · 2/5`), large title,
  description, date.
- the rest: three horizontal rows — small 16:9 thumb left; uppercase mono topic kicker
  (`FULL-STACK`), bold title, description, date right.

**WorkPreviewSection** — `WORK` heading + hairline + `All work →`. Three equal vertical
plates: 16:9 cover, uppercase mono kicker (`WEB APP · 2026`), bold title, two-line
description. Borderless.

### Code (behind Figma)

| Surface | Component | Drift vs Figma |
| --- | --- | --- |
| Home work strip | `WorksStrip` → `WorkOverlayCard` (`VARIANTS.worksStrip`) | square cover, **title hidden until hover** under a black wipe |
| `/work` Selected | `WorkGalleryCard` (`VARIANTS.workFeatured = gallery-3col-1x1`) | **bordered** card; Figma plates are borderless |
| Home writing | `SelectedWriting` → `SerieCard` ×2 + `PostRowCalm` ×4 | no covers at all; Figma blog cards have covers |
| Legacy, unwired | `WorkCard`, `WorkCardImage`, `PostCard`, `BlogPreview`, `WorksPreview` | marked LEGACY, kept for styleguide review |

Two live DS violations in code: `WorkOverlayCard` dims/tints the cover on hover
(§Hover forbids it, and it leaves touch users with no title at all), and `WorkGalleryCard`
puts a full border on a preview card (§Border: border = aggregate entity; preview cards are
borderless, the image is the frame).

Ordering discrepancy: `getFeaturedSeries` sorts by `featured` number (`repository.ts:35-36`)
— which is what makes blog's featured-1 the big card — but **`getFeaturedWorks` sorts by
date** (`repository.ts:38-41`). Any work direction that uses rank hierarchy needs that sort
changed.

---

## 2 · The problem

Work is the degenerate copy of the blog small card: same cover ratio, same uppercase-mono
kicker, same bold sans title, same muted description. Blog additionally owns a serie chip, a
part counter, a date, and a hierarchy. **Work owns nothing of its own.**

The distinction cannot come from "images vs text" — blog cards carry covers now.

Editorial doctrine already states the difference (`editorial-v4/design.md` §1): *Work =
nouns with outcomes; Blog = verbs with reasoning. Work entries are covers, articles are
chapters.* For this portfolio specifically: blog posts are **deep and recent**, and they
generalise internal day-job work; projects are **small, public, atemporal artifacts**
formatted Problem / Solution / Learning, linking down into the articles.

Translated to form:

| | Blog | Work |
| --- | --- | --- |
| reads as | a **feed** — dated, recent, ranked by freshness | a **catalogue** — curated, typed, era-stamped |
| time | owns it: date, read-time, part counter | should stop competing on it |
| unit | a chapter in an argument | an artifact with receipts |
| cover means | an illustration of the argument | the thing itself |

## 3 · What work can own (existing fields only)

Every entry already has `title`, `date`, `description`, `abstract`, `type`, `img_preview`.
Because `type` is required by the schema, the **Name / Discipline / Year triple ships with
zero authoring** — which is exactly what most of the inspiration set leans on.

| Signal | Blog has it | Work field | Coverage |
| --- | --- | --- | --- |
| tech line | no | `stack[]` | 19/19 |
| external artifact ↗ | no | `git` / `live` / `website` / `video` | most |
| discipline | topic only | `type` | 19/19 (required) |
| era range, not a date | no | `kicker` — `Art · 2013–2019` | 4/19, all candidates |
| "→ 2 articles" bridge | reversed direction | `related_posts` | 2/19 |
| date, read-time, part counter | **exclusive** | — | — |

`featured` today: `leconceptdelapreuve: 2`, `chimeres-orchestra: 3`, `malinette: 4`.
`portfolio` has none (deliberate 2026-07-19 demotion; `editorial-v4` §5 reopened it). No
work carries `featured: 1`. Kicker format is `Web app · 2026` / `Art · 2013–2019`.

Both in-scope surfaces render the same three entries — Home strip and `/work` Selected both
call `getFeaturedWorks()`. The two surfaces differ in density and in what `/work` can afford
below the fold, not in dataset.

---

## 4 · Constraints (from the design system — non-negotiable)

Authority: `.specs/02_archives/artistic-direction/design.md`, condensed in
`.claude/skills/design-expert/references/artistic-direction.md`.

- **Border** — 1px, `--color-border`, structure only. A full border means *aggregate
  entity*. Preview cards are borderless; the image is the frame. `border-2` is dead. Dashed
  is removed from the library entirely.
- **Radius** — three values, meaning-bound: `full` (pressable), `lg`/8px (covers, media
  cards), `0` (rows, tables, prose). Never two radii on one element.
- **Type** — Bubbler One is page-H1 only and never appears at card size; IBM Plex Sans for
  titles and prose (400 body / 600 titles, no 500, no 700); Fira Code for dates, counters,
  topic labels. Mono uppercase only for strings ≤3 words.
- **Numbers** — always mono, tabular figures, muted. Never accent: accent promises a click
  target.
- **Accent** — teal is budgeted to serie chips, section CTAs, active nav, focus rings, hover
  underline. A work card using accent collides with the serie chip's meaning.
- **Hover** — one verb per surface, ≤150ms. Borderless preview card = title underline + slow
  cover scale, *coupled*. Hover must never dim or tint a cover, never turn a title accent,
  never move an element more than 2%. Reduced motion keeps colour, drops transforms.
- **Hand layer** — drawn SVG line art never goes inside a card, never below ~200px.
- **Icons** — lucide 1.5px, `currentColor`. The folder icon is reserved for serie membership
  and nothing else.
- **Touch** — no hover on touch devices: nothing essential (title, type, year) may be
  hover-revealed.

Two consequences worth stating up front, because much of the inspiration set breaks them:
accent-flooded cards (orange/yellow/blue blocks) are out, and the giant display numerals of
the numbered-index references must be **mono**, not the display font.

---

## 5 · Inspiration reading

19 screenshots in `~/Bureau/UI_Redesign_WorkCard_inspirations`. Recurring devices, in
frequency order:

1. **Name / Discipline / Year caption under a plain image** (8+ refs) — the dominant
   pattern; no border, caption does the work.
2. **Numbered index** `01 / 02 / 03` with a hairline (6 refs) — reads as a curated
   catalogue; often paired with a left-hand section rail.
3. **Arrow affordance per card** (↗ or →, 5 refs) — signals "this exits or opens".
4. **Overlay / vertical side label on the cover** (3 refs) — gallery feel, contrast risk.
5. **Asymmetric editorial grid** — one large plus smaller (3 refs).
6. **Case-study block** — Challenge / Solution / Result triplet next to one large cover
   (2 refs), the closest match to this portfolio's Problem / Solution / Learning content.

Notable: almost none of the references show a description paragraph on a work card. They
show *what it is* (discipline) and *when* (year), then get out of the way. The current work
plate's two-line description is the main thing making it look like a blog card.

---

## 6 · Directions to explore

Each filtered against §4 already.

**A · Meta rail.** Keep the plate; add a work-only mono line (`stack` joined) and an
external-artifact affordance (`↗ Live · Repo`). *Pro:* cheapest, and honest receipts —
these are the fields blog can never have. *Con:* same silhouette as a blog row; distinction
is read, not seen.

**B · Numbered catalogue.** Mono `01 / 02 / 03` plus a hairline above each plate; caption
becomes `title` + `kicker`. *Pro:* index vs feed is the clearest structural split; the
`featured` field already is a rank; mono numerals are the machine register the DS reserves
for generated facts. *Con:* numbering implies a ranking that must be defensible; needs the
`getFeaturedWorks` sort fixed.

**C · Shape flip.** Work covers take a different ratio from blog's 16:9 — square, or 4:5.
*Pro:* pre-attentive distinction, no extra text at all; objects and installations read
better square than letterboxed. *Con:* re-crops across 19 previews; two ratio systems to
maintain in Figma and in `sizes` attributes.

**D · Mirrored asymmetry.** Work also gets a featured-1-big layout, but the big one is a
case block: large cover + Problem / Solution / Learning + `2 articles →` + Live/Repo.
*Pro:* parallel page structure with genuinely different content; matches the content model
and the Work-as-receipts doctrine. *Con:* two big blocks compete on Home, and the writing
section is meant to lead in v3; description quality varies across entries.

**E · Spec-sheet card.** Cover plus a small mono key/value block (Year / Type / Stack /
Links). *Pro:* maximum artifact-receipt reading, zero overlap with blog, reuses
`ArchiveTable`'s grammar in card form. *Con:* dense; risks reading as a table fragment;
heavy mono budget on a page that already has mono dates.

**F · Overlay label.** Discipline + year set on the cover, title below. *Pro:* gallery feel,
fits the art history. *Con:* AA is unreliable across 19 heterogeneous covers; and it must be
a rest state, never hover-revealed (§4 touch rule). Explore only in that constrained form.

**Rejected before exploration — ledger rows.** Work as full-width `year | title | type |
stack` rows collides head-on with `PostRow`/`PostRowCalm`, erasing the distinction this spec
exists to create. It also already exists, correctly, as `ArchiveTable` on `/work`.

### Recommendation

**B + A, with C as the strong option.** Numbered plates carrying a work-only meta rail, and
a cover ratio distinct from blog's. Blog keeps the one-big asymmetry exclusively — hierarchy
by freshness is a time signal, and time belongs to blog. Home then reads: *blog = a feature
plus a feed; work = a numbered row of catalogue entries.* **D is held for `/work` Selected**,
where a case block has room and where recruiters, not readers, are the audience.

---

## 7 · Deliverables from the design round

See [prompt.md](./prompt.md) for the executable brief. Expected back:

1. 4–6 variants on a new `EXP / WorkCard` page in `Magnet-DS`, token-bound, Desktop 1280 +
   Mobile 390 × Light + Dark.
2. One screenshot per variant per theme.
3. Pros / cons / recommendation appended to this file as `## 8 · Round results`.
4. A short note on which existing components would change (`WorkPreviewSection`, the work
   card component itself, the `/work` Selected grid), whether a new variant set is needed,
   and whether `getFeaturedWorks` must move from date sort to `featured` sort.

## Open questions

1. **Selected list size** — 3 featured today; `editorial-v4` §5 left the list and each
   entry's content reopened, with only "Malinette is featured" fixed. A direction that
   depends on a 1+2 or 1+3 layout must state what happens at 3 and at 4 entries.
2. **`featured: 1` is unassigned for work.** If rank hierarchy is adopted, which entry earns
   the big slot — and does `portfolio` come back into Selected to fill it?
3. **Description on a work card: keep or cut?** The inspiration set overwhelmingly cuts it.
   Cutting it is the single cheapest way to stop work looking like blog, but it removes the
   only place the Problem/Solution framing surfaces before the detail page.
4. **Cover treatment** — still open from `artistic-direction` §Open questions (photos vs
   noise-gradient). Figma currently shows gradient placeholders; real `img_preview` files
   are photographic and heterogeneous. Direction C and F both depend on this.
