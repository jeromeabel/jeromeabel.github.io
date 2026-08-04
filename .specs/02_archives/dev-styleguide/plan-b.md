# Plan B — Variant component stories

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Story every layout variant defined in `src/config/variants.ts` as its own named export, so all alternatives render side-by-side in the catalog regardless of which one is currently selected on the live site.

**Architecture:** The v3 redesign keeps layout alternatives as build-time switches (`VARIANTS` object). The leaf components those switches choose between already exist as separate `.astro` files. Plan B stories each leaf component with one named export per meaningful state, and — for the ratio/column dimensions `WorkGalleryCard` exposes via props — one export per prop combination.

**Tech Stack:** Same as Plan A (requires Plan A landed — astrobook must be mounted).

## Global Constraints

- Depends on **Plan A** (astrobook installed + render gate passed).
- Story idiom is identical to Plan A: `export default { component }` + named `args` exports with `satisfies ComponentProps<typeof X>`.
- Feed real data via `repository.ts` helpers (`getFeaturedWorks`, `getAllStandalonePosts`, etc.).
- Export names are the variant identity, PascalCased from the `VARIANTS` value (e.g. `gallery-3col-1x1` → `Gallery3Col1x1`).
- Variant switches and their leaf components (verified from `src/config/variants.ts` + component source):

  | `VARIANTS` key | value              | leaf component                   | distinguishing prop                                                    |
  | -------------- | ------------------ | -------------------------------- | ---------------------------------------------------------------------- |
  | `workFeatured` | `gallery-2x2-16x9` | `WorkGalleryCard`                | `ratio: 'video'`                                                       |
  | `workFeatured` | `gallery-2x2-1x1`  | `WorkGalleryCard`                | `ratio: 'square'`                                                      |
  | `workFeatured` | `gallery-3col-1x1` | `WorkGalleryCard`                | `ratio: 'square'` (3-col grid is a page-level layout, not a card prop) |
  | `homePosts`    | `calm-rows`        | `PostRowCalm`                    | —                                                                      |
  | `homePosts`    | `arrow-rows`       | `PostRow`                        | —                                                                      |
  | `worksStrip`   | `mini-card`        | `WorkMiniCard`                   | —                                                                      |
  | `worksStrip`   | `overlay-card`     | `WorkOverlayCard`                | —                                                                      |
  | `aboutFacts`   | `strip`            | `AboutFactsStrip` / `AboutStrip` | —                                                                      |
  | `aboutFacts`   | `grid`             | `AboutFacts`                     | —                                                                      |

---

### Task 1: `WorkGalleryCard` ratio variants

**Files:**

- Create: `src/components/work/WorkGalleryCard.stories.ts`

**Interfaces:**

- Consumes: `getFeaturedWorks()` from `../../utils/repository`.
- `WorkGalleryCard` `Props` (verified): `{ work: CollectionEntry<'work'>; ratio?: 'square' | 'video' }`.

- [x] **Step 1: Write one export per ratio**

```ts
import type { ComponentProps } from "astro/types";
import WorkGalleryCard from "./WorkGalleryCard.astro";
import { getFeaturedWorks } from "../../utils/repository";

const works = await getFeaturedWorks();

export default { component: WorkGalleryCard };

// workFeatured: gallery-2x2-1x1 / gallery-3col-1x1 → square card
export const Square = {
  args: { work: works[0], ratio: "square" } satisfies ComponentProps<
    typeof WorkGalleryCard
  >,
};
// workFeatured: gallery-2x2-16x9 → video (16:9) card
export const Video = {
  args: { work: works[0], ratio: "video" } satisfies ComponentProps<
    typeof WorkGalleryCard
  >,
};
```

Note in a comment that the 2-col vs 3-col dimension is a **page-grid** layout decision (`WorksStrip`/featured section wrapper), not a `WorkGalleryCard` prop — the card itself only varies by `ratio`.

- [x] **Step 2: Verify both render in `/styleguide`, then commit**

Run: `pnpm dev`, confirm `Square` is 1:1 and `Video` is 16:9.

```bash
git add src/components/work/WorkGalleryCard.stories.ts
git commit -m "feat(styleguide): WorkGalleryCard ratio variants"
```

---

### Task 2: `worksStrip` leaf-card variants (`WorkMiniCard`, `WorkOverlayCard`)

**Files:**

- Create: `src/components/work/WorkMiniCard.stories.ts`, `src/components/work/WorkOverlayCard.stories.ts`

**Interfaces:**

- Both take `{ work }` (verified against `WorksStrip` usage: `<WorkMiniCard {work} />` / `<WorkOverlayCard {work} />`).

- [x] **Step 1: Write the two stories**

```ts
// WorkMiniCard.stories.ts  — worksStrip: 'mini-card'
import type { ComponentProps } from "astro/types";
import WorkMiniCard from "./WorkMiniCard.astro";
import { getFeaturedWorks } from "../../utils/repository";
const works = await getFeaturedWorks();
export default { component: WorkMiniCard };
export const MiniCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkMiniCard>,
};
```

```ts
// WorkOverlayCard.stories.ts  — worksStrip: 'overlay-card'
import type { ComponentProps } from "astro/types";
import WorkOverlayCard from "./WorkOverlayCard.astro";
import { getFeaturedWorks } from "../../utils/repository";
const works = await getFeaturedWorks();
export default { component: WorkOverlayCard };
export const OverlayCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkOverlayCard>,
};
```

- [x] **Step 2: Verify + commit**

```bash
git add src/components/work/WorkMiniCard.stories.ts src/components/work/WorkOverlayCard.stories.ts
git commit -m "feat(styleguide): worksStrip mini-card + overlay-card variants"
```

---

### Task 3: `homePosts` row variants (`PostRow`, `PostRowCalm`)

**Files:**

- Create: `src/components/blog/PostRow.stories.ts`, `src/components/blog/PostRowCalm.stories.ts`

**Interfaces:**

- `PostRow` `Props` (verified): `{ post: CollectionEntry<'post'> | CollectionEntry<'seriePost'>; serie?: { title: string; id: string; part: number } }`.
- `PostRowCalm` — verify its `Props` at implementation; expected `{ post }` (same post shape, no serie chip).

- [x] **Step 1: Write both stories with real posts**

```ts
// PostRow.stories.ts  — homePosts: 'arrow-rows'
import type { ComponentProps } from "astro/types";
import PostRow from "./PostRow.astro";
import { getAllStandalonePosts } from "../../utils/repository";
const posts = await getAllStandalonePosts();
export default { component: PostRow };
export const ArrowRow = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostRow>,
};
export const WithSerie = {
  args: {
    post: posts[0],
    serie: { title: "Web performance", id: "web-performance", part: 1 },
  } satisfies ComponentProps<typeof PostRow>,
};
```

```ts
// PostRowCalm.stories.ts  — homePosts: 'calm-rows' (current default)
import type { ComponentProps } from "astro/types";
import PostRowCalm from "./PostRowCalm.astro";
import { getAllStandalonePosts } from "../../utils/repository";
const posts = await getAllStandalonePosts();
export default { component: PostRowCalm };
export const CalmRow = {
  args: { post: posts[0] } satisfies ComponentProps<typeof PostRowCalm>,
};
```

Adjust `PostRowCalm`'s args to its actual `Props` if it differs from `{ post }`.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/blog/PostRow.stories.ts src/components/blog/PostRowCalm.stories.ts
git commit -m "feat(styleguide): homePosts calm-rows + arrow-rows variants"
```

---

### Task 4: `aboutFacts` variants (`AboutFacts`, `AboutFactsStrip`, `AboutStrip`)

**Files:**

- Create: `src/components/about/*` stories only if not already created in Plan A Task 6. If Plan A already storied `AboutFacts`/`AboutFactsStrip`/`AboutStrip`, this task instead **augments** those files with explicitly variant-named exports.

**Interfaces:**

- `AboutFacts` (verified) self-fetches `getAllBlogPosts()`, takes **no props** → `args: {}`.
- `AboutFactsStrip` / `AboutStrip` — verify `Props`; expected prop-less or a small facts array.

- [x] **Step 1: Ensure each variant has a clearly-named export**

In `AboutFacts.stories.ts` (grid variant):

```ts
import AboutFacts from "./AboutFacts.astro";
export default { component: AboutFacts };
export const Grid = { args: {} }; // aboutFacts: 'grid'
```

In `AboutFactsStrip.stories.ts` (or `AboutStrip.stories.ts`, whichever renders the one-line strip):

```ts
import AboutFactsStrip from "./AboutFactsStrip.astro";
export default { component: AboutFactsStrip };
export const Strip = { args: {} }; // aboutFacts: 'strip'
```

Confirm which of `AboutFactsStrip` vs `AboutStrip` is the `'strip'` variant by reading both (`AboutStrip` is referenced by the About page per commit `31b2230`; `AboutFactsStrip` may be an earlier iteration). Story both regardless — the redundant one is dead-component review signal.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/about/AboutFacts.stories.ts src/components/about/AboutFactsStrip.stories.ts src/components/about/AboutStrip.stories.ts
git commit -m "feat(styleguide): aboutFacts strip + grid variants"
```

---

### Task 5: Variant coverage audit

- [x] **Step 1: Assert every `VARIANTS` value maps to a storied export**

Cross-check each row of the Global Constraints table against the created stories. Every one of the 9 variant values must have a named export somewhere. Write the mapping into a comment block at the top of `src/config/variants.ts` (or leave the table in this plan as the record) so the correspondence is discoverable.

- [x] **Step 2: Re-run Plan A's coverage audit — the 5 deferred cards now resolve**

Run: `comm -23 <(find src/components -name '*.astro' ! -name 'SEO.astro' | sed 's#.astro$##' | sort) <(find src/components -name '*.stories.ts' | sed 's#.stories.ts$##' | sort)`
Expected: no output (Plan A live components + Plan B variant cards = full live coverage). Legacy components from Plan C are not yet present, so they don't appear.

- [x] **Step 3: Commit any audit fixes**

```bash
git add -A
git commit -m "chore(styleguide): variant coverage audit — all VARIANTS values storied"
```

---

## Self-Review

- **Coverage:** All 9 `VARIANTS` values (Global Constraints table) map to a named export across Tasks 1–4; Task 5 asserts it.
- **Overlap with Plan A:** `WorkGalleryCard`, `WorkMiniCard`, `WorkOverlayCard`, `PostRow`, `PostRowCalm` are storied here (not Plan A) — Plan A Task 7/8 explicitly defer them. `AboutFacts`/`AboutFactsStrip`/`AboutStrip` may be touched in both plans; Task 4 handles the augment-vs-create branch.
- **Prop accuracy:** `WorkGalleryCard`, `PostRow`, `AboutFacts`, and the worksStrip cards' prop shapes were verified from source at plan time; `PostRowCalm`, `AboutFactsStrip`, `AboutStrip` are flagged "verify `Props` at implementation."
