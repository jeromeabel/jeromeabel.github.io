# Home "Writing" Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage writing block: heading "Writing", 2 featured series cards with folder icon, and a "Latest" feed of the 5 genuinely most recent posts as two-line rows (fixes the frozen featured-only bug).

**Architecture:** New `getLatestWriting(count)` repository function merges standalone + serie posts by date and annotates serie membership. New `PostRow.astro` renders a two-line feed row (kicker / title+meta / description / tags). `SelectedWriting.astro` is rewritten to compose them; `SerieCard.astro` gets a folder icon on its eyebrow.

**Tech Stack:** Astro 5, Tailwind CSS v4 (CSS-native tokens), astro-icon (lucide), pnpm.

**Spec:** `docs/superpowers/specs/2026-07-18-home-writing-section-design.md`

## Global Constraints

- Package manager: **pnpm**. No test suite or linter — verification is `pnpm build` (must succeed) + `pnpm format:check` (must pass) + visual check in dev server.
- Heading copy is exactly **"Writing"**; sub-label exactly **"Latest"**; link label exactly **"All posts"**.
- Latest feed shows exactly **5** rows; tags capped at **2**; description clamped to **1** line.
- Icon language: `lucide:folder` = series identity, `lucide:layers` = parts count, `lucide:clock` = read time. Standalone posts get **no** icon.
- The whole PostRow is a single `<a>` to the post; the serie kicker is a **label, not a link**.
- No accent color token exists in the theme (`src/styles/global.css` defines only foreground/muted variants) — the kicker uses `text-muted`, matching the site's existing eyebrow idiom. (Spec said "accent color"; this is the resolved deviation.)
- Read-time trap: `getMinutesReadFromBody()` returns a string `"7 min read"`; `getMinutesFromBody()` returns a float number. PostRow uses `getMinutesFromBody` + `Math.ceil` + its own `min` label. Never combine `.text` output with another "min" suffix.
- Part numbers are **1-based** (`index + 1`), matching `SeriePostListItem.astro:18`.
- Run `pnpm format:write` before every commit.

---

### Task 1: Data layer — `getMonthYear` + `getLatestWriting`

**Files:**

- Modify: `src/utils/format-date.ts` (8 lines, append)
- Modify: `src/utils/repository.ts` (append after `getSerieStats`, line 68)

**Interfaces:**

- Consumes: existing `getAllBlogPosts()`, `getAllSeries()`, `getPostsFromSerie()` from `src/utils/repository.ts`.
- Produces:
  - `getMonthYear(date: string | Date): string` — e.g. `"Jul 2026"` (en-GB, short month + numeric year).
  - `export type WritingEntry = { post: CollectionEntry<"post"> | CollectionEntry<"seriePost">; serie?: { title: string; id: string; part: number } }`
  - `getLatestWriting(count: number): Promise<WritingEntry[]>` — newest-first, drafts already excluded in prod (inherited from `getAllBlogPosts`).

- [ ] **Step 1: Add `getMonthYear` to `src/utils/format-date.ts`**

Append to the end of the file:

```ts
const monthYearOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
};

export const getMonthYear = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", monthYearOptions);
```

(Why a new helper: existing `getFormattedDate` includes the day — `"18 Jul 2026"` — the feed meta wants `"Jul 2026"`.)

- [ ] **Step 2: Add `WritingEntry` + `getLatestWriting` to `src/utils/repository.ts`**

Append to the end of the file:

```ts
export type WritingEntry = {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number };
};

export const getLatestWriting = async (
  count: number,
): Promise<WritingEntry[]> => {
  const latest = (await getAllBlogPosts()).slice(0, count);

  const membership = new Map<
    string,
    { title: string; id: string; part: number }
  >();
  for (const serie of await getAllSeries()) {
    const posts = await getPostsFromSerie(serie);
    posts.forEach((post, index) => {
      membership.set(post.id, {
        title: serie.data.title,
        id: serie.id,
        part: index + 1,
      });
    });
  }

  return latest.map((post) => ({ post, serie: membership.get(post.id) }));
};
```

Notes for the implementer:

- `CollectionEntry` is already imported at the top of `repository.ts` (line 1) — no new imports needed.
- No id collisions between collections: `post` ids are flat (`my-post`), `seriePost` ids are nested (`web-performance/05-images-part-2`).
- Part numbering from the draft-filtered `getPostsFromSerie` order is the existing site-wide convention (serie landing page does the same) — do not "fix" it.

- [ ] **Step 3: Verify build passes**

Run: `pnpm build`
Expected: build completes without errors (unused exports are fine).

- [ ] **Step 4: Format and commit**

```bash
pnpm format:write
git add src/utils/format-date.ts src/utils/repository.ts
git commit -m "feat(blog): add getLatestWriting query and month-year date helper"
```

---

### Task 2: `PostRow.astro` — two-line feed row

**Files:**

- Create: `src/components/blog/PostRow.astro`

**Interfaces:**

- Consumes: `WritingEntry` shape from Task 1 (`post` + optional `serie`), `getMinutesFromBody` from `src/utils/get-minutes-read`, `getMonthYear` from `src/utils/format-date`.
- Produces: `<PostRow post={...} serie={...} />` — used by Task 3. Props:

```ts
interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number } | undefined;
}
```

- [ ] **Step 1: Create `src/components/blog/PostRow.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { CollectionEntry } from "astro:content";
import { getMonthYear } from "src/utils/format-date";
import { getMinutesFromBody } from "src/utils/get-minutes-read";

interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  serie?: { title: string; id: string; part: number } | undefined;
}

const { post, serie } = Astro.props;

if (!post) {
  throw new Error("Sorry, could not find post");
}

const minutes = Math.ceil(getMinutesFromBody(post.body));
const topics = (post.data.topic ?? "")
  .split(",")
  .map((topic) => topic.trim())
  .filter(Boolean)
  .slice(0, 2);
---

<a
  href={`/blog/${post.id}`}
  class="border-muted-border hover:bg-muted-background flex flex-col gap-1 border-b py-4"
>
  {
    serie && (
      <span class="text-muted flex items-center gap-2 font-mono text-xs uppercase">
        <Icon name="lucide:folder" />
        {serie.title} · part {serie.part}
      </span>
    )
  }
  <div class="flex items-baseline justify-between gap-8">
    <h3 class="flex-1 font-bold">{post.data.title}</h3>
    <span class="text-muted shrink-0 font-mono text-xs">
      {minutes} min · {getMonthYear(post.data.date)}
    </span>
  </div>
  <p class="text-muted line-clamp-1 text-sm">{post.data.description}</p>
  {
    topics.length > 0 && (
      <div class="mt-1 flex gap-2">
        {topics.map((topic) => (
          <span class="border-muted-border text-muted border px-2 py-0.5 font-mono text-xs">
            {topic}
          </span>
        ))}
      </div>
    )
  }
</a>
```

Notes for the implementer:

- Whole row is one `<a>`; kicker is a plain `<span>` (spec decision — do not add a nested link).
- `topic` frontmatter is an optional comma-separated string (`topic: "astro, performance"`); zero tags must render nothing (the `topics.length > 0` guard).
- Styling mirrors `PostListItem.astro` idioms: `border-muted-border` bottom border, `hover:bg-muted-background`. No card box.
- `/blog/${post.id}` resolves for both collections (flat post ids hit `/blog/[id]`, nested seriePost ids hit `/blog/[serie]/[post]`) — same pattern `PostListItem` already uses.

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: build completes (component not yet imported anywhere — that's fine).

- [ ] **Step 3: Format and commit**

```bash
pnpm format:write
git add src/components/blog/PostRow.astro
git commit -m "feat(blog): add PostRow two-line feed row component"
```

---

### Task 3: Rewrite `SelectedWriting.astro`

**Files:**

- Modify: `src/components/blog/SelectedWriting.astro` (full rewrite of contents; filename unchanged — `src/pages/index.astro:2` imports it)

**Interfaces:**

- Consumes: `getLatestWriting(5)` and `getFeaturedSeries()` from `src/utils/repository`; `PostRow` from Task 2; existing `SerieCard`, `H2`, `Link` components.
- Produces: the rendered homepage section (no exports).

- [ ] **Step 1: Replace the contents of `src/components/blog/SelectedWriting.astro`**

```astro
---
import PostRow from "@components/blog/PostRow.astro";
import SerieCard from "@components/blog/SerieCard.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import { getFeaturedSeries, getLatestWriting } from "src/utils/repository";

const series = (await getFeaturedSeries()).slice(0, 2);
const latest = await getLatestWriting(5);
---

<section
  id="writing"
  class="container flex scroll-mt-16 flex-col gap-4 lg:gap-8"
>
  <H2>Writing</H2>
  <div class="grid gap-4 md:grid-cols-2 lg:gap-8">
    {series.map((serie) => <SerieCard {serie} />)}
  </div>
  <div class="mt-4 flex flex-col">
    <span class="text-muted pb-2 font-mono text-sm uppercase">Latest</span>
    <div class="border-muted-border border-t">
      {latest.map(({ post, serie }) => <PostRow {post} {serie} />)}
    </div>
  </div>
  <Link
    class="mt-8"
    label="All posts"
    href="/blog"
    icon="lucide:arrow-right"
    variant="secondary"
  />
</section>
```

What changed vs. current file: heading "Start here" → "Writing"; `getFeaturedPosts(2)` + `PostListItem` → `getLatestWriting(5)` + `PostRow`; new "Latest" sub-label above the list. Series grid and "All posts" link unchanged.

- [ ] **Step 2: Remove now-dead code from `src/utils/repository.ts`**

`SelectedWriting.astro` was `getFeaturedPosts`'s only consumer, and `getFeaturedPosts` was `getAllPosts`'s only consumer (both verified via grep across `src/`). Delete both:

```ts
export const getAllPosts = async () =>
  (await getCollection("post"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .filter((post) => (import.meta.env.PROD ? post.data.draft !== true : true));
```

```ts
export const getFeaturedPosts = async (count: number) => {
  const posts = await getAllPosts();
  const featured = posts
    .filter((post) => post.data.featured !== undefined)
    .sort((a, b) => (a.data.featured ?? 0) - (b.data.featured ?? 0));
  const rest = posts.filter((post) => post.data.featured === undefined);
  return [...featured, ...rest].slice(0, count);
};
```

Do **not** remove: `getAllSeriePosts` (also unused, but pre-existing dead code — separate cleanup, not this feature) or the `featured` field from `PostSchema` (out of scope).

- [ ] **Step 3: Visual check in dev server**

Run: `pnpm dev`, open `http://localhost:4321/`, scroll to the writing section.
Expected:

- Heading reads "Writing".
- 2 series cards, then "LATEST" sub-label, then 5 rows.
- The newest post on the site appears as row 1 (compare against the top entry of `/blog` — this is the bug-fix proof).
- Serie-member rows show a folder kicker "`{Serie title} · part {N}`"; part numbers match the numbering on that serie's landing page.
- Standalone rows have no kicker and no icon.
- Rows with no `topic` frontmatter show no empty tag area.
- Each row is fully clickable and navigates to the post.

- [ ] **Step 4: Verify build passes**

Run: `pnpm build`
Expected: build completes without errors (proves nothing else imported `getFeaturedPosts`).

- [ ] **Step 5: Format and commit**

```bash
pnpm format:write
git add src/components/blog/SelectedWriting.astro src/utils/repository.ts
git commit -m "feat(home): rebuild writing section with latest feed and Writing heading"
```

---

### Task 4: `SerieCard.astro` — folder icon on the eyebrow

**Files:**

- Modify: `src/components/blog/SerieCard.astro:28`

**Interfaces:**

- Consumes: nothing new (`Icon` is already imported in the file, line 2).
- Produces: visual change only.

- [ ] **Step 1: Add the folder icon to the "Series" eyebrow**

Replace line 28:

```astro
<span class="text-muted text-base font-normal uppercase">Series</span>
```

with:

```astro
<span
  class="text-muted flex items-center gap-2 text-base font-normal uppercase"
>
  <Icon name="lucide:folder" />
  Series
</span>
```

Do **not** touch the `lucide:layers` / `lucide:clock` meta icons (lines 34/36) — they denote count/time, not identity, and stay as-is.

- [ ] **Step 2: Visual check**

Run: `pnpm dev`, check the homepage series cards and the `/blog` page (SerieCard is reused there).
Expected: folder icon before "Series" on every card, vertically centered with the text, in both light and dark themes.

- [ ] **Step 3: Verify build passes**

Run: `pnpm build`
Expected: build completes without errors.

- [ ] **Step 4: Format and commit**

```bash
pnpm format:write
git add src/components/blog/SerieCard.astro
git commit -m "feat(blog): add folder icon to SerieCard eyebrow for series identity"
```

---

### Task 5: Acceptance pass

**Files:**

- None created/modified unless a check fails (fix in place, then re-run).

**Interfaces:**

- Consumes: everything above.
- Produces: verified acceptance of the spec's criteria.

- [ ] **Step 1: Run the spec's acceptance checklist against the dev server**

Run: `pnpm dev`, open `http://localhost:4321/`. Check each item:

1. Section headed "Writing".
2. Two featured series cards render as before, each with a folder icon on the eyebrow.
3. "Latest" list shows exactly 5 rows; the genuinely newest post is present (old bug gone).
4. Serie rows: non-clickable folder kicker "`{Serie} · part {N}`" above the title. Standalone rows: no kicker.
5. Tag rendering: find one row with 0 tags, one with 1, one with 2 if content allows (`topic: "a, b, c"` renders only 2). If no post has `topic` set, temporarily add `topic: "astro, performance"` to one post's frontmatter, verify, then revert.
6. Toggle theme (header button): both light and dark legible — kicker, meta, description, tag borders.
7. Known-accepted state: today's latest rows are mostly Web Performance parts under their own serie card — this is deliberate honest recency (spec §Recency note), not a defect.

- [ ] **Step 2: Run the final gates**

```bash
pnpm build
pnpm format:check
```

Expected: both pass.

- [ ] **Step 3: Commit any fixes made during acceptance**

```bash
git add -A
git commit -m "fix(home): acceptance fixes for writing section"
```

(Skip if nothing changed.)

---

## Out of scope (do not implement)

- `/blog` list redesign (`PostListItem` stays untouched).
- Making the serie kicker clickable.
- Populating `topic` frontmatter across posts (follow-up content pass; note it will also surface the raw comma string in `/blog`'s `PostListItem`, which renders `topic` verbatim).
- Work / Archive / About / Hero items.
