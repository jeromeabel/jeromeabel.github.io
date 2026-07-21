# Plan C — Restore main-only components + legacy stories

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the 9 components the v3 redesign deleted (still present on `main`) back into `redesign/v3`, tag each as legacy/review-only, and story them under a fenced-off `Legacy/` catalog section so the delete-vs-adopt decision can be made by eyeballing them.

**Architecture:** `git checkout main -- <file>` brings each deleted `.astro` file back verbatim. A one-line header comment marks it legacy. Its story uses a `Legacy/` title prefix so astrobook groups it separately. These components are **never re-imported by any page** — restoring the file is cataloguing, not adopting. Because they were written against the pre-v3 content schema, some may not compile against current `repository.ts`; that incompatibility is captured as review signal, not fixed.

**Tech Stack:** Same as Plan A (requires Plan A landed).

## Global Constraints

- Depends on **Plan A** (astrobook mounted + render gate passed).
- The 9 components to restore (verified via `git diff --diff-filter=D main..redesign/v3`):
  `blog/BlogPreview`, `blog/PostCard`, `blog/PostList`, `blog/SerieList`, `blog/SerieListItem`, `blog/SeriePostCard`, `work/WorkCard`, `work/WorkCardImage`, `work/WorksPreview`.
- Every restored file gets this exact header comment on line 1:
  `{/* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See docs/specs/01_active/dev-styleguide. */}`
- Every legacy story declares `title: 'Legacy/<Name>'` in its default export so it groups apart from live components.
- **Do NOT** add any `import` of these components to any page, layout, or live component. Grep-verify at the end.
- If a restored component fails to compile against current `repository.ts`/schema, use an inline fixture matching the **restored component's own** `Props`; if it still cannot compile, record it in `notes.md` under "legacy incompatibilities" and skip its story (the file stays restored + tagged).

---

### Task 1: Restore the 9 files + tag them legacy

**Files:**

- Create (via checkout): the 9 `.astro` files listed above.

- [x] **Step 1: Check the files back out from `main`**

```bash
git checkout main -- \
  src/components/blog/BlogPreview.astro \
  src/components/blog/PostCard.astro \
  src/components/blog/PostList.astro \
  src/components/blog/SerieList.astro \
  src/components/blog/SerieListItem.astro \
  src/components/blog/SeriePostCard.astro \
  src/components/work/WorkCard.astro \
  src/components/work/WorkCardImage.astro \
  src/components/work/WorksPreview.astro
```

- [x] **Step 2: Prepend the legacy header comment to each**

Add as the very first line of each of the 9 files:

```astro
{
  /* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See docs/specs/01_active/dev-styleguide. */
}
```

- [x] **Step 3: Verify no page imports them (they must stay orphaned)**

Run: `git grep -l -E "(BlogPreview|PostCard|PostList|SerieList|SerieListItem|SeriePostCard|WorkCard|WorkCardImage|WorksPreview)\.astro" -- 'src/pages' 'src/layouts' | grep -v stories`
Expected: **no output** (no page/layout references them). The `\.astro` suffix is load-bearing: bare names substring-match live v3 components (`PostList` ⊂ `PostListItem`, `SerieList` ⊂ `SerieListItem`), which pages legitimately import — without the suffix the check fails spuriously. If a line still prints, inspect: a true match means an accidental re-wire.

- [x] **Step 3b: Scan restored files' imports for modules missing in v3**

The legacy components import utils/components from the pre-v3 tree. Run:
`for f in <the 9 files>; do grep -E "^import|from ['\"]" $f; done` and check every specifier resolves on this branch.

**Known in advance (verified at plan time):** `PostList.astro` imports `getAllPosts` from `src/utils/repository` — that export no longer exists in v3 (`getAllBlogPosts`/`getAllStandalonePosts` replaced it). This is a module-resolution error, not prop drift — an inline fixture cannot fix it, so `PostList` goes straight to the `notes.md` "legacy incompatibilities" skip path (file stays restored + tagged, no story). All other 8 components' imports resolve on v3 (`format-date`, `get-minutes-read`, `PostListItem`, `SeriePostListItem`, `CustomImage` exist; `WorkCard`↔`WorkCardImage`↔`WorksPreview` and `PostCard`/`SeriePostCard`↔`BlogPreview` are restored together). Record any NEW missing import found by the scan in `notes.md` the same way.

- [x] **Step 4: Confirm the branch still builds**

Run: `pnpm build && echo BUILD-OK`
Expected: `BUILD-OK` — orphaned components that aren't imported don't break the build.

- [x] **Step 5: Commit the restore**

```bash
git add src/components/blog/BlogPreview.astro src/components/blog/PostCard.astro src/components/blog/PostList.astro src/components/blog/SerieList.astro src/components/blog/SerieListItem.astro src/components/blog/SeriePostCard.astro src/components/work/WorkCard.astro src/components/work/WorkCardImage.astro src/components/work/WorksPreview.astro
git commit -m "chore(styleguide): restore 9 main-only components as legacy (not wired)"
```

---

### Task 2: Story the restored `work/` legacy components

**Files:**

- Create: `src/components/work/WorkCard.stories.ts`, `WorkCardImage.stories.ts`, `WorksPreview.stories.ts`

- [x] **Step 1: Read each restored component's `Props` first**

Open `WorkCard.astro`, `WorkCardImage.astro`, `WorksPreview.astro` and note their prop interfaces — these predate v3 so the shapes differ from `WorkGalleryCard`.

- [x] **Step 2: Write legacy-grouped stories using real work data where it compiles**

```ts
import type { ComponentProps } from "astro/types";
import WorkCard from "./WorkCard.astro";
import { getFeaturedWorks } from "../../utils/repository";
const works = await getFeaturedWorks();
export default { component: WorkCard, title: "Legacy/WorkCard" };
export const Default = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkCard>,
};
```

If `satisfies ComponentProps<typeof WorkCard>` errors because the legacy prop shape no longer matches the current `work` entry, drop `satisfies` and pass an inline fixture matching the legacy `Props`; add a `// LEGACY: prop drift vs current schema` comment and note it in `notes.md`. `WorksPreview` self-fetches (like the v3 `WorksStrip`) — likely `args: {}`.

- [x] **Step 3: Verify each renders (or is documented as incompatible), then commit**

```bash
git add src/components/work/WorkCard.stories.ts src/components/work/WorkCardImage.stories.ts src/components/work/WorksPreview.stories.ts
git commit -m "feat(styleguide): legacy work component stories"
```

---

### Task 3: Story the restored `blog/` legacy components

**Files:**

- Create: `BlogPreview.stories.ts`, `PostCard.stories.ts`, `PostList.stories.ts`, `SerieList.stories.ts`, `SerieListItem.stories.ts`, `SeriePostCard.stories.ts`

- [x] **Step 1: Read each restored component's `Props`, then write legacy-grouped stories**

Feed real data by each legacy component's own prop shape:

```ts
import type { ComponentProps } from "astro/types";
import PostCard from "./PostCard.astro";
import { getAllStandalonePosts } from "../../utils/repository";
const posts = await getAllStandalonePosts();
export default { component: PostCard, title: "Legacy/PostCard" };
export const Default = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostCard>,
};
```

Map the rest: `PostList` → **no story** (imports the removed `getAllPosts` export — pre-known incompatibility, see Task 1 Step 3b; goes straight to `notes.md`); `BlogPreview` → self-fetch or a posts array; `SerieList` → `getAllSeries()`; `SerieListItem` → one serie entry; `SeriePostCard` → one seriePost entry (`getAllSeriePosts()[0]`). Where the legacy prop shape no longer matches current schema, use an inline fixture + `// LEGACY: prop drift` comment + `notes.md` entry, per Global Constraints.

- [x] **Step 2: Verify each renders (or is documented incompatible), then commit**

```bash
git add src/components/blog/*.stories.ts
git commit -m "feat(styleguide): legacy blog component stories"
```

---

### Task 4: Legacy section audit + review notes

**Files:**

- Create: `docs/specs/01_active/dev-styleguide/notes.md` (if not already created in Tasks 2–3)

- [x] **Step 1: Confirm all 9 appear under `Legacy/` in the catalog**

Run: `pnpm dev`, open `/styleguide`, confirm a `Legacy/` group holds the 9 (minus any documented-incompatible ones), visually separate from live components.

- [x] **Step 2: Write the delete-vs-adopt review note**

In `notes.md`, list all 9 legacy components with a one-line verdict placeholder each (`keep / delete / adopt — decide after eyeballing`) plus any prop-drift incompatibilities found. This is the artifact the styleguide-as-review-tool produces.

- [x] **Step 3: Final orphan re-check + commit**

Run: `git grep -l -E "(BlogPreview|PostCard|PostList|SerieList|SerieListItem|SeriePostCard|WorkCard|WorkCardImage|WorksPreview)\.astro" -- 'src/pages' 'src/layouts'`
Expected: no output (still orphaned). (`\.astro` suffix required — bare names substring-match live `PostListItem`/`SerieListItem` imports.)

```bash
git add docs/specs/01_active/dev-styleguide/notes.md
git commit -m "docs(styleguide): legacy delete-vs-adopt review notes"
```

---

## Self-Review

- **Coverage:** all 9 restored files (Task 1) get stories (Tasks 2–3) or a documented-incompatible skip.
- **Not-adopted invariant:** enforced at Task 1 Step 3, Task 4 Step 3 — grep proves no page imports them.
- **Legacy fencing:** `title: 'Legacy/<Name>'` groups them apart (Tasks 2–3).
- **Prop drift handled:** every legacy story task has an explicit fallback (inline fixture → `notes.md` skip) because these components predate the v3 schema and were not read at plan time.
