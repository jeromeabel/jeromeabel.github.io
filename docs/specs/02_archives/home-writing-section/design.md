---
shipped: 2026-07-18
---

# Home "Writing" section — design spec (2026-07-18)

Rebuild of the homepage writing block (`SelectedWriting.astro`, currently headed "Start here"). Fixes a live bug, replaces the sparse post list with a richer two-line row, and introduces a consistent folder-icon marker for series.

Visual reference (mockups, all decisions rendered in the real site palette): the brainstorm artifact — three PostRow densities, series-treatment options, kicker positions, and the icon system.

---

## Problem

The current section (`src/components/blog/SelectedWriting.astro`):

- Heads with **"Start here"** — reads like app onboarding, not a personal blog.
- Shows **featured** posts via `getFeaturedPosts(2)`, so the genuinely latest posts **never appear** — a returning visitor sees a frozen page. **This is the live bug.**
- Two series cards + two bare post lines feels arbitrary and unfinished; a bare title gives no "should I read this?" scent.

## Goals

1. Fix the bug: surface genuinely recent writing.
2. Give each row enough information to choose from (description + topic tags).
3. Keep the curated series prominent, but make the section read as one coherent block.
4. Establish a reusable icon language (folder = series) used consistently across layouts.

Non-goals: the `/blog` list redesign (separate brainstorm), Archive/Work/About items.

---

## Final layout

```
Writing                                    ← H2 (was "Start here")

[ 🗂 Series          ] [ 🗂 Series        ]  ← 2 featured SerieCards, 2-up grid (unchanged)
  Web Performance        My AI Journey
  …desc…                 …desc…
  ▤ 5 parts · 🕐 …       ▤ 2 parts · 🕐 …

LATEST ─────────────────────────────────   ← sub-label

🗂 Web Performance · part 5                 ← serie kicker (serie rows only)
Optimizing Images with Astro (part 2)       7 min · Jul 2026
Four levers stack on Astro's <Picture>…     ← one-line description
astro   performance                          ← 1–2 topic tags (non-clickable)

Benchmarking a 10,000-Row Table             12 min · Jun 2026
The same table built three ways…
vue   performance

… (5 rows total)

All posts →
```

### Decisions (locked)

| Aspect                | Decision                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Heading               | **"Writing"** (drop "Start here")                                                                                                  |
| Series on home        | **Keep** the 2 featured `SerieCard`s (unchanged grid)                                                                              |
| Latest feed           | **5 rows**, two-line `PostRow` style                                                                                               |
| Row content           | title + one-line description + 1–2 topic tags + read-time·date                                                                     |
| Topic tags            | **1–2**, topic-only (astro, performance, vue…), **non-clickable**                                                                  |
| Serie membership clue | **Kicker above the title** (Position A): folder icon + serie title + `· part N`                                                    |
| Serie clue clickable? | **No** — plain label; the whole row links to the post                                                                              |
| Icon system           | **folder** = series identity (everywhere a series appears); **layers** = parts count; **clock** = read time; **posts get no icon** |

---

## Components

### `PostRow.astro` (new) — `src/components/blog/PostRow.astro`

The two-line feed row. New component so the homepage feed can be richer than the existing `PostListItem` without disturbing the `/blog` list (that redesign is a separate brainstorm).

**Props:**

```ts
interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number } | undefined;
}
```

**Renders** a single `<a href={/blog/${post.id}}>` (whole row is one link — see clickability note) containing:

- **Kicker** (only when `serie` is set): `<span>` with the folder icon + `{serie.title} · part {serie.part}`. Accent color, `font-mono`, uppercase-ish small caps per the site's eyebrow style. **Not a link.**
- **Title row**: `post.data.title` (flex-1) + right-aligned meta `{minutesRead} min · {Mon YYYY}`.
- **Description**: `post.data.description`, `line-clamp-1`, muted.
- **Tag row**: up to 2 topic tags from `post.data.topic` (see Content dependency). Bordered `font-mono` spans, non-interactive.

Styling mirrors the existing `PostListItem` idioms (`border-muted-border` bottom border, `hover:bg-muted-background`, group hover translate optional). No box — it's a feed row, not a card.

### `SerieCard.astro` (edit) — add folder to the identity marker

For icon consistency, prefix the existing `"Series"` eyebrow (`SerieCard.astro:28`) with the folder icon. The existing `layers` (parts) and `clock` (read time) meta icons stay as-is — they denote count/time, not identity. Small change; the whole point of the folder is that it means the same thing in the card and in the feed kicker.

### `SelectedWriting.astro` (rewrite)

```
H2 "Writing"
grid(2) of SerieCard   ← series = (await getFeaturedSeries()).slice(0, 2)   [unchanged]
sub-label "Latest"
list of PostRow        ← latest = await getLatestWriting(5)
Link "All posts" → /blog
```

Filename stays `SelectedWriting.astro` (imported by `src/pages/index.astro`); only its contents change.

---

## Data layer (`src/utils/repository.ts`)

### New: `getLatestWriting(count)`

Replaces `getFeaturedPosts(2)` for this section. Returns the most recent blog entries (standalone **and** serie posts) sorted by date, each annotated with serie membership when applicable:

```ts
type WritingEntry = {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number };
};
export const getLatestWriting = async (count: number): Promise<WritingEntry[]>
```

Implementation:

1. `getAllBlogPosts()` already merges `post` + `seriePost`, drops drafts, sorts by date desc. Slice to `count`.
2. Build a serie-membership map once: for each serie from `getAllSeries()`, resolve `getPostsFromSerie(serie)`; the ordered `posts` array gives each seriePost its `part` index (1-based). Map `seriePost.id → { title, id, part }`.
3. Annotate each sliced entry via the map; standalone posts get `serie: undefined`.

**Recency note:** the newest entries today are serie posts (Optimizing Images parts). Including serie posts in the feed is deliberate — it's the honest recency signal. A serie post appearing in "Latest" while its parent serie card sits above is acceptable: the card is an entry point to the whole series, the row points at one specific new part. The kicker makes the relationship explicit.

---

## Clickability (explicit decision)

The whole row is a single `<a>` → the post. The serie kicker is a **label, not a link**. Rationale: nesting a serie `<a>` inside the row `<a>` is invalid HTML; splitting the row into two link targets means it can no longer be one anchor, which is a larger restructure with added a11y care. Deferred unless desired later. The series remains reachable via its `SerieCard` above and `/blog`.

---

## Content dependency: topic tags

`PostSchema` already has `topic: z.string().optional()` and `PostListItem` already renders it — **no schema change required**, and the layout is safe with zero tags (tag row simply renders empty).

To show 1–2 tags, `topic` is treated as a comma-separated string (e.g. `topic: "astro, performance"`); `PostRow` splits and renders up to 2. Populating `topic` frontmatter across posts is a **follow-up content pass**, not a blocker — the section ships and works with tags absent. (If a richer multi-tag model is wanted later, that's a separate schema decision.)

Part numbers need no content — they derive from serie `posts` order.

---

## Out of scope

- `/blog` list scanability redesign (separate brainstorm; `PostRow` may be reused there later).
- Making the serie kicker clickable (needs row restructure; flagged above).
- Any Work / Archive / About / Hero items from the UX review.

---

## Acceptance

- Homepage writing section headed "Writing".
- Two featured series cards render as before, each with a folder icon on the "Series" eyebrow.
- A "Latest" list of 5 two-line rows shows the genuinely most recent posts (verify the newest post appears — the old bug is gone).
- Serie-member rows show a non-clickable folder kicker "`{Serie} · part {N}`" above the title; standalone rows show none.
- Rows render correctly with 0, 1, and 2 topic tags.
- Light and dark themes both legible.
- `pnpm build` and `pnpm format:check` pass.
