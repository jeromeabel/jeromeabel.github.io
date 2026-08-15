---
title: Claude Design brief — WorkCard exploration round
created: 2026-08-15
spec: ./design.md
---

# Brief — WorkCard exploration round (Figma, Magnet-DS)

Self-contained. Everything you need is below; `./design.md` holds the longer rationale if you
want it, but do not require it to start.

---

## 0 · The use case

A developer portfolio + blog, one person, French, senior engineer with an art background.

- **Blog posts are deep and recent.** They generalise internal day-job work into
  problem-shaped articles. Some are standalone, some belong to a **serie** (multi-part).
- **Work projects are small and public.** They are formatted Problem / Solution / Learning
  and link *down* into the blog articles. They do **not** show everything built at the day
  job — they show the public artifacts: an open-source toolkit, an art installation, a
  freelance site.

So: the blog is where the thinking lives; work is a shelf of things that exist in the world.

## 1 · The job

**Brainstorm UX/UI variations for the work card so it reads as a different kind of thing
from a blog post card** — at a glance, before reading a word. Today it does not: on Home the
two sections are the same component with different words in it.

Deliver **4–6 variants**, each built in Figma, token-bound, with pros / cons and a
recommendation. Explore honestly: plain image, overlay, size hierarchy, case-study framing,
more immersive, borderless vs bordered, magazine/editorial grids. Push past the shortlist in
§6 if you find something better — that list is a floor, not a ceiling.

Two surfaces in scope, and they may resolve differently:

1. **Home `WorkPreviewSection`** — the trailer. Three entries, must not out-shout the blog
   section that sits above it.
2. **`/work` "Selected work" grid** — the receipts page. Same three entries, more room, a
   recruiter-ish audience, and an `ArchiveTable` of everything else sits below it.

Out of scope: `ArchiveTable`, the work detail page, related-work on post pages.

## 2 · Where to work

File: **`Magnet-DS`**, key `ihWIWmvtQPTWgUxlrVjC2c`.

- **Pass-0 first.** Run a `use_figma` inventory of pages and components before touching
  anything. The MCP `get_metadata` page list is stale in this file — trust only the live
  inventory.
- Build on a **new page named `EXP / WorkCard`**. Never modify the shipped `📄 Pages` frames,
  the `Components (new)` library, or any variable collection.
- **Bind every value to existing variables** in `1 Primitives` / `2 Theme` / `3 Responsive`.
  Create **no new variables**. If a variant needs a value that does not exist, that is a
  finding to report, not a variable to add.
- Reuse existing components as instances where they fit (`Link/TextCTA`, `Chip/Serie`,
  covers). Detached copies are acceptable inside `EXP /` only for parts you are genuinely
  redesigning.
- Deliver each variant at **Desktop 1280** and **Mobile 390**, in **Light and Dark** — four
  frames per variant, pinned by explicit `(Theme, Responsive)` mode pairs, not hand-resized
  duplicates.

## 3 · Current state to design against

Reference frame: `Home — Desktop [Dark]`, node **`2989:4642`**.

**BlogPreviewSection** (`2586:1141`) — `BLOG` heading + hairline + `All posts →`. Asymmetric,
ranked by a `featured` number where **1 is the big one**:
- featured 1: large 16:9 cover, serie chip (`📁 WEB PERFORMANCE · 2/5`), large title,
  description, date.
- the others: horizontal rows — small 16:9 thumb left, uppercase mono topic kicker
  (`FULL-STACK`), bold title, description, date right.

**WorkPreviewSection** (`2586:1142`) — `WORK` heading + hairline + `All work →`. Three equal
vertical plates: 16:9 cover, uppercase mono kicker (`WEB APP · 2026`), bold title, two-line
description. Borderless.

That is the problem in one sentence: **the work plate is the blog small card, rotated.** Blog
also owns a serie chip, a part counter, a date, and a hierarchy. Work owns nothing of its own.

The distinction cannot be "images vs text" — blog cards carry covers.

## 4 · The content you may use (hard constraint)

**Existing frontmatter fields only. No new schema keys.** Anything not on this list does not
exist for this exercise.

Work entries (19 total, 3 currently featured) carry:

| Field | Coverage | Example |
| --- | --- | --- |
| `title` | 19/19 | `Malinette` |
| `type` (**required**) | 19/19 | `Web app`, `Art`, `Open source` |
| `date` | 19/19 | used for sort today |
| `description` | 19/19 | one to two sentences |
| `abstract` | most | longer |
| `img_preview` | 19/19 | heterogeneous photos/screenshots |
| `stack[]` | ~19/19 | `["Astro", "Tailwind", "TypeScript"]` |
| `git` / `live` / `website` / `video` | most | external URLs |
| `kicker` | 4/19 (all featured candidates) | `Web app · 2026`, `Art · 2013–2019`, `Open source · 2013–2021` |
| `featured` | 3/19 | `leconceptdelapreuve: 2`, `chimeres-orchestra: 3`, `malinette: 4` |
| `related_posts` | 2/19 | link to blog articles |

Because `type` is required, the **Name / Discipline / Year** triple is free — no authoring.
`kicker` is cheap to backfill on the featured few. `stack[]` and the external URLs are the
signals **blog can never have**. Note `featured: 1` is currently unassigned for work, and
work is currently sorted by date, not by `featured` — if your variant needs rank hierarchy,
say so and it will be fixed in code.

Blog exclusively owns: **date, read-time, part counter, serie chip.** Do not borrow them.

## 5 · Design system constraints (non-negotiable — a variant that breaks these is dead)

- **Border** — 1px, `--color-border`, structure only. A full border means *aggregate entity*
  (a container of many things). **Preview cards are borderless; the image is the frame.**
  `border-2` is dead. Dashed has been removed from the library entirely.
- **Radius** — exactly three, meaning-bound: `full` (pressable: buttons, chips, icon
  circles), `lg` / 8px (media: covers, media cards), `0` (reading: rows, tables, prose).
  Never two radii on one element.
- **Type** — Bubbler One (display) is **page H1 only**, never at card size. IBM Plex Sans for
  titles and prose: 400 body, 600 titles, no 500, no 700. Fira Code (mono) for dates,
  counters, topic labels. Mono uppercase only for strings ≤3 words.
- **Numbers** — always mono, tabular figures, muted. **Never accent** — accent promises a
  click target. This kills the giant coloured display numerals many portfolio references use.
- **Accent (teal)** — budgeted to: serie chips, section CTAs, active nav, focus rings, hover
  underline. Nothing else. A work card painting itself accent collides with the serie chip's
  meaning.
- **Hover** — **one verb per surface**, ≤150ms. For a borderless preview card the verb is
  *title underline + slow cover scale, coupled*. Hover must never dim or tint a cover, never
  turn a title accent, never move anything more than 2%. Reduced motion keeps colour, drops
  transforms.
- **Touch** — there is no hover on touch. **Nothing essential — title, type, year — may be
  hover-revealed.** The current shipped code violates this (title hidden under a black wipe
  until hover); do not reproduce it.
- **Hand layer** — the author's drawn SVG line art never goes inside a card and never below
  ~200px. Cards are the Chrome/Content layers only.
- **Icons** — lucide, 1.5px, `currentColor`. The **folder icon is reserved for serie
  membership** and nothing else.
- **Motion** — UI < 300ms; hover/press 100–160ms; ease-out on entrances, never ease-in;
  animate `transform`/`opacity` only.
- **Contrast** — AA minimum for all text, checked in both themes. Text over a photographic
  cover must hold AA across all 19 heterogeneous previews, or it is not a valid pattern.

Authority: `.specs/02_archives/artistic-direction/design.md` (condensed in
`.claude/skills/design-expert/references/artistic-direction.md`). Figma audit gotcha: when
sweeping for drift, **exclude `COMPONENT_SET` and `SECTION` nodes** — their radii are Figma's
own frame chrome, not design.

## 6 · Directions to explore (floor, not ceiling)

Already filtered against §5.

- **A · Meta rail** — keep the plate, add a work-only mono line (`stack` joined) plus an
  external-artifact affordance (`↗ Live · Repo`). Cheapest; honest receipts; but same
  silhouette as a blog row — the distinction is read, not seen.
- **B · Numbered catalogue** — mono `01 / 02 / 03` and a hairline above each plate; caption =
  `title` + `kicker`. Index-vs-feed is the clearest structural split; `featured` already is a
  rank; mono numerals are the register the DS reserves for generated facts. Requires a
  defensible ranking.
- **C · Shape flip** — work covers take a ratio distinct from blog's 16:9 (square, or 4:5).
  Pre-attentive, needs zero extra text. Costs re-crops across 19 previews and a second ratio
  system.
- **D · Mirrored asymmetry** — work also gets a one-big layout, but the big one is a **case
  block**: large cover + Problem / Solution / Learning + `2 articles →` + Live/Repo. Best
  content fit; but two big blocks compete on Home, where writing is meant to lead. **Hold
  this one for `/work` Selected.**
- **E · Spec-sheet card** — cover plus a small mono key/value block (Year / Type / Stack /
  Links). Maximum artifact reading, zero blog overlap; risks reading as a table fragment.
- **F · Overlay label** — discipline + year set **on** the cover, title below. Gallery feel,
  fits the art history; but AA is unreliable across heterogeneous covers and it must be a
  **rest state, never hover-revealed**. Explore only in that constrained form.

**Rejected, do not build:** work as full-width `year | title | type | stack` ledger rows —
collides head-on with the blog `PostRow` and erases the very distinction this round exists to
create. That grammar already lives, correctly, in `ArchiveTable` on `/work`.

**Starting recommendation to beat: B + A, with C as the strong alternative.** Numbered plates
carrying a work-only meta rail, and a cover ratio distinct from blog's — with blog keeping
the one-big asymmetry exclusively, because hierarchy-by-freshness is a time signal and time
belongs to blog. Home would then read: *blog = a feature plus a feed; work = a numbered row
of catalogue entries.* Disagree with evidence if you find better.

## 7 · Inspiration set

19 screenshots in `~/Bureau/UI_Redesign_WorkCard_inspirations` (`Capture d'écran du
2026-08-14 *.png`). Look at them; they are the visual vocabulary, not a spec. Recurring
devices, by frequency:

1. Name / Discipline / Year caption under a plain image (8+) — the dominant pattern, no
   border, the caption does all the work.
2. Numbered index `01 / 02 / 03` with a hairline (6) — reads as a curated catalogue.
3. A per-card arrow affordance, ↗ or → (5).
4. Overlay or vertical side label on the cover (3).
5. Asymmetric editorial grid, one large plus smaller (3).
6. Case-study block — Challenge / Solution / Result beside one large cover (2). Closest match
   to this portfolio's Problem / Solution / Learning content.

**Worth noticing: almost none of them put a description paragraph on a work card.** They show
what it is and when, then get out of the way. The current plate's two-line description is the
single biggest reason it reads as a blog card.

**Several references are DS-illegal here** and must be translated, not copied: accent-flooded
colour blocks, hover-dim overlays, boxed/bordered cards, and giant display-font numerals
(numerals must be mono).

## 8 · Deliverables

1. **4–6 variants** on `EXP / WorkCard`, each at Desktop 1280 + Mobile 390 × Light + Dark,
   fully token-bound, no new variables. Name frames
   `EXP / WorkCard — <Variant> — <Desktop|Mobile> [<Light|Dark>]`.
2. Each variant shown **in situ**: three cards in the Home strip context (heading + hairline
   + `All work →`), and — for at least the top two — in the `/work` Selected grid context.
3. **At least one variant placed directly under a copy of `BlogPreviewSection`**, so the
   Home-page adjacency can be judged. That adjacency is the actual test.
4. **A screenshot per variant per theme.**
5. **Pros / cons / recommendation appended to `./design.md` as `## 8 · Round results`** — one
   short block per variant, then a single recommendation with reasoning, then the runner-up
   and why it lost.
6. **A code-impact note**: which components change (`WorkPreviewSection`, the work card
   component, the `/work` Selected grid), whether a new variant set is needed, and whether
   the `getFeaturedWorks` sort must move from date to `featured`.
7. **A constraint-violations list**: anything you wanted to do that §5 forbade, and what you
   did instead. This is signal, not failure.

## 9 · Answer these in the write-up

1. **Keep or cut the description on a work card?** Cutting it is the cheapest way to stop work
   looking like blog, but it removes the only pre-detail-page surface for the Problem/Solution
   framing. Take a position.
2. **How does the layout behave at 3 entries and at 4?** The Selected list is not frozen.
3. **If you use rank hierarchy, which entry earns `featured: 1`,** and does `portfolio` come
   back into Selected to fill it?
4. **Cover treatment** — Figma currently shows gradient placeholders; the real `img_preview`
   files are heterogeneous photos and screenshots. Does your variant survive a bad cover?

## 10 · Rules of engagement

- Do not touch shipped `📄 Pages` frames, `Components (new)`, or any variable collection.
- Do not create variables, styles, or components outside `EXP / WorkCard`.
- Do not change any code. This round is Figma-only; code follows once a direction is picked.
- If a constraint in §5 blocks the best idea you have, **report the conflict** — do not
  silently break the rule and do not silently drop the idea.
