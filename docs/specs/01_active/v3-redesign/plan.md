# v3 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v3.0.0 layout decisions (work gallery, calm home rows, quiet works strip, chips demoted to post pages, about facts strip) with every alternative kept as a build-time variant.

**Architecture:** One constant file `src/config/variants.ts` selects a variant per area; pages/components branch on it at build time. New components sit beside the ones they replace; nothing is runtime-switchable. Hero copy is a separate track (`hero-copy-*.md`) and is NOT in this plan.

**Tech Stack:** Astro 5, Tailwind CSS v4 (CSS-native tokens), TypeScript strict, pnpm. **No test suite exists** — every task verifies via `pnpm build` (must exit 0) plus a described visual check in `pnpm dev`, and `pnpm format:write` before each commit.

## Global Constraints

- Package manager: `pnpm`. Build: `pnpm build`. Format: `pnpm format:write` / `pnpm format:check`.
- Site copy rules: no "since 2010" anywhere except the About facts value `2010`; no marketing abstractions (see `hero-copy-context.md`).
- Design tokens: use existing Tailwind classes seen in the codebase (`border-muted-border`, `text-muted`, `bg-muted-background`, `font-title`, `container`). Invent no new tokens.
- Hover language v3: background tint / opacity / border shifts. No translate/scale on the chosen defaults (variants may keep their historic motion). Always guard motion with `motion-safe:`/`motion-reduce:` as the existing code does.
- All commits on branch `redesign/v3`, conventional-commit style.
- Astro components must pass strict TS (`astro/tsconfigs/strict`).

---

### Task 1: Variants config

**Files:**
- Create: `src/config/variants.ts`

**Interfaces:**
- Produces: `VARIANTS` const with fields `workFeatured: "gallery-2x2-16x9" | "gallery-2x2-1x1" | "gallery-3col-1x1"`, `homePosts: "calm-rows" | "arrow-rows"`, `worksStrip: "mini-card" | "overlay-card"`, `aboutFacts: "strip" | "grid"`. Later tasks import `{ VARIANTS }` from `src/config/variants`.

- [ ] **Step 1: Create the file**

```ts
// src/config/variants.ts
// Build-time layout variant switches for the v3 redesign.
// Change a value, restart `pnpm dev`, compare on the real site.
// See docs/specs/01_active/v3-redesign/design.md

export type WorkFeaturedVariant =
  | "gallery-2x2-16x9"
  | "gallery-2x2-1x1"
  | "gallery-3col-1x1";
export type HomePostsVariant = "calm-rows" | "arrow-rows";
export type WorksStripVariant = "mini-card" | "overlay-card";
export type AboutFactsVariant = "strip" | "grid";

export const VARIANTS: {
  workFeatured: WorkFeaturedVariant;
  homePosts: HomePostsVariant;
  worksStrip: WorksStripVariant;
  aboutFacts: AboutFactsVariant;
} = {
  workFeatured: "gallery-2x2-1x1",
  homePosts: "calm-rows",
  worksStrip: "mini-card",
  aboutFacts: "strip",
};
```

(Default `gallery-2x2-1x1`: square crops match existing preview assets, zero recropping needed to evaluate.)

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: exit 0 (file is unused so far; this catches TS/syntax errors only).

- [ ] **Step 3: Commit**

```bash
pnpm format:write
git add src/config/variants.ts
git commit -m "feat(v3): add build-time layout variant switches"
```

---

### Task 2: Featured works — latest-first + Portfolio demotion

**Files:**
- Modify: `src/utils/repository.ts:33-40` (`getFeaturedWorks`)
- Modify: `src/content/work/portfolio/index.md` (frontmatter)

**Interfaces:**
- Consumes: nothing new.
- Produces: `getFeaturedWorks(): Promise<CollectionEntry<"work">[]>` — unchanged signature, now sorted by `date` desc; `featured:` frontmatter is membership-only. Featured set becomes exactly 3: leconceptdelapreuve (2026-02-20), chimeres-orchestra (2021-12-01), malinette (2020-01-01).

- [ ] **Step 1: Replace the sort in `getFeaturedWorks`**

Replace lines 33–40 of `src/utils/repository.ts` with:

```ts
export const getFeaturedWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured !== undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

- [ ] **Step 2: Demote Portfolio**

In `src/content/work/portfolio/index.md` frontmatter, delete the line:

```yaml
featured: 1
```

Leave `kicker:` in place (harmless; only featured entries render kickers).

- [ ] **Step 3: Verify**

Run: `pnpm build`
Expected: exit 0.
Run: `pnpm dev`, open `/work`.
Expected: Selected work shows exactly 3 entries in order Le concept de la preuve → Chimères Orchestra → La Malinette; Portfolio now appears in the More-projects table (its year row, sorted by date desc).

- [ ] **Step 4: Commit**

```bash
pnpm format:write
git add src/utils/repository.ts src/content/work/portfolio/index.md
git commit -m "feat(v3): featured works latest-first, demote portfolio to archive"
```

---

### Task 3: Work gallery card + work page variants

**Files:**
- Create: `src/components/work/WorkGalleryCard.astro`
- Modify: `src/pages/work.astro`
- Delete: `src/components/work/WorkCard.astro` (horizontal split, rejected)

**Interfaces:**
- Consumes: `VARIANTS` (Task 1), `getFeaturedWorks` (Task 2).
- Produces: `WorkGalleryCard` with props `{ work: CollectionEntry<"work">; ratio?: "square" | "video" }` (default `"square"`).

- [ ] **Step 1: Create `WorkGalleryCard.astro`**

```astro
---
import { Image } from "astro:assets";
import type { CollectionEntry } from "astro:content";

interface Props {
  work: CollectionEntry<"work">;
  ratio?: "square" | "video";
}

const { work, ratio = "square" } = Astro.props;

if (!work) {
  throw new Error("Sorry, could not find work");
}
---

<a
  href={"/work/" + work.id}
  title={`Open the "${work.data.title}" project`}
  class="border-muted-border hover:bg-muted-background group flex flex-col border outline-offset-4 outline-black focus:outline-2 dark:outline-white"
>
  <div
    class:list={[
      "overflow-hidden",
      ratio === "video" ? "aspect-video" : "aspect-square",
    ]}
  >
    <Image
      src={work.data.img_preview}
      alt={`${work.data.title} preview`}
      class="block h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
      loading="lazy"
      widths={[240, 360, 540, 768]}
      sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc((100vw - 3rem) / 2), 380px"
    />
  </div>
  <div class="flex flex-col gap-1 p-4">
    {
      work.data.kicker && (
        <span class="text-muted font-mono text-xs uppercase">
          {work.data.kicker}
        </span>
      )
    }
    <p class="font-title text-xl tracking-wide">{work.data.title}</p>
    <p class="text-muted line-clamp-2 text-sm">{work.data.description}</p>
  </div>
</a>
```

- [ ] **Step 2: Rewire `src/pages/work.astro`**

Replace the `WorkCard` import with `WorkGalleryCard` and `VARIANTS`, and replace the Selected-work section. Full new frontmatter + section:

```astro
---
import ArchiveTable from "@components/work/ArchiveTable.astro";
import H1 from "@components/ui/H1.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import P from "@components/ui/P.astro";
import WorkGalleryCard from "@components/work/WorkGalleryCard.astro";
import Layout from "@layouts/Layout.astro";
import { VARIANTS } from "src/config/variants";
import { getArchiveWorks, getFeaturedWorks } from "src/utils/repository";

const selected = await getFeaturedWorks();
const archive = await getArchiveWorks();

const ratio = VARIANTS.workFeatured === "gallery-2x2-16x9" ? "video" : "square";
const gridClass =
  VARIANTS.workFeatured === "gallery-3col-1x1"
    ? "grid-cols-2 sm:grid-cols-3"
    : VARIANTS.workFeatured === "gallery-2x2-1x1"
      ? "grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2";
---
```

Section markup (replaces the existing `Selected work` section body):

```astro
<section>
  <H2>Selected work</H2>
  <div class:list={["mt-8 grid gap-4 lg:gap-8", gridClass]}>
    {selected.map((work) => <WorkGalleryCard {work} {ratio} />)}
  </div>
</section>
```

(Mobile per design: 16:9 → 1-col, 1:1 → 2-col.)

- [ ] **Step 3: Delete the old card**

Run: `grep -rn "WorkCard" src/` — expected: only `WorkGalleryCard` and `WorkMiniCard` hits remain (no bare `WorkCard.astro` import).
Then: `git rm src/components/work/WorkCard.astro`

- [ ] **Step 4: Verify all three variants**

Run: `pnpm dev`, open `/work`. For each value of `VARIANTS.workFeatured` (`gallery-2x2-1x1`, `gallery-2x2-16x9`, `gallery-3col-1x1`): edit `src/config/variants.ts`, check grid columns, image ratio, kicker/title/description, and mobile width (≤ 640 px in devtools). Restore default `gallery-2x2-1x1`.
Run: `pnpm build` — exit 0.

- [ ] **Step 5: Commit**

```bash
pnpm format:write
git add -A src/components/work src/pages/work.astro src/config/variants.ts
git commit -m "feat(v3): work featured compact gallery with ratio variants"
```

---

### Task 4: Topic chips on post pages

**Files:**
- Create: `src/components/blog/TopicChips.astro`
- Modify: `src/pages/blog/[id].astro` (header meta block, around line 52)
- Modify: `src/pages/blog/[serie]/[post].astro` (same insertion; find the date/clock meta block by grepping `lucide:clock`)

**Interfaces:**
- Produces: `TopicChips` with props `{ topic?: string | undefined }`; renders nothing when the field is empty.

- [ ] **Step 1: Create `TopicChips.astro`**

```astro
---
interface Props {
  topic?: string | undefined;
}

const { topic } = Astro.props;

const topics = (topic ?? "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
---

{
  topics.length > 0 && (
    <div class="flex flex-wrap gap-2">
      {topics.map((t) => (
        <span class="border-muted-border text-muted border px-2 py-0.5 font-mono text-xs">
          {t}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Insert on both post pages**

In `src/pages/blog/[id].astro`: add import `import TopicChips from "@components/blog/TopicChips.astro";` and, inside the header, directly after the closing `</div>` of the calendar/clock meta `div` (line ~57), add:

```astro
<TopicChips topic={entry.data.topic} />
```

In `src/pages/blog/[serie]/[post].astro`: same import; grep `lucide:clock` in that file and add the same `<TopicChips topic={entry.data.topic} />` after that meta block's closing `</div>`. (If the entry variable is named differently there, match it.)

- [ ] **Step 3: Verify**

Run: `pnpm dev`. Open one standalone post with `topic:` set (e.g. from `src/content/post/`) and one serie post. Expected: chips under the date/read-time line; posts without `topic` show nothing.
Run: `pnpm build` — exit 0.

- [ ] **Step 4: Commit**

```bash
pnpm format:write
git add src/components/blog/TopicChips.astro "src/pages/blog/[id].astro" "src/pages/blog/[serie]/[post].astro"
git commit -m "feat(v3): render topic chips on post page headers"
```

---

### Task 5: Remove topic chips from list rows

**Files:**
- Modify: `src/components/blog/PostRow.astro` (delete lines 19–23 topics const and 51–61 chips block)
- Modify: `src/components/blog/PostListItem.astro` (delete lines 25–29 topics const and 51–59 chips block)

**Interfaces:**
- Consumes: Task 4 must land first (topics stay visible somewhere).
- Produces: both rows render kicker/title/meta only.

- [ ] **Step 1: PostRow — delete the `topics` const and the chips block**

Remove from the frontmatter:

```ts
const topics = (post.data.topic ?? "")
  .split(",")
  .map((topic) => topic.trim())
  .filter(Boolean)
  .slice(0, 2);
```

Remove from the markup:

```astro
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
```

- [ ] **Step 2: PostListItem — same surgery**

Remove the identical `topics` const, and remove:

```astro
{
  topics.length > 0 && (
    <span class="flex shrink-0 items-center gap-2">
      {topics.map((topic) => (
        <span class="border-muted-border border px-2 py-0.5">{topic}</span>
      ))}
    </span>
  )
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`. Home Latest list and `/blog` year list show no chips; rows align cleanly on mobile width.
Run: `pnpm build` — exit 0.

- [ ] **Step 4: Commit**

```bash
pnpm format:write
git add src/components/blog/PostRow.astro src/components/blog/PostListItem.astro
git commit -m "feat(v3): drop topic chips from list rows (post pages keep them)"
```

---

### Task 6: Calm home rows + homePosts switch

**Files:**
- Create: `src/components/blog/PostRowCalm.astro`
- Modify: `src/components/blog/SelectedWriting.astro`

**Interfaces:**
- Consumes: `VARIANTS.homePosts` (Task 1); `getLatestWriting`, `WritingEntry` from `src/utils/repository`; `PostRow` (arrow variant, Task 5 state).
- Produces: `PostRowCalm` with props `{ post: CollectionEntry<"post"> | CollectionEntry<"seriePost">; serie?: { title: string; id: string; part: number } | undefined }`.

- [ ] **Step 1: Create `PostRowCalm.astro`**

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
---

<a
  href={`/blog/${post.id}`}
  class="border-muted-border hover:bg-muted-background flex flex-col gap-1 border-b px-1 py-4 transition-colors"
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
</a>
```

(No arrow, no translate — hover is background tint only. `description` is schema-required, so it always exists.)

- [ ] **Step 2: Switch `SelectedWriting.astro` to 4 posts + variant**

Change `getLatestWriting(5)` to `getLatestWriting(4)`, add imports:

```ts
import PostRowCalm from "@components/blog/PostRowCalm.astro";
import { VARIANTS } from "src/config/variants";
```

Replace the row-rendering line with:

```astro
{
  latest.map(({ post, serie }) =>
    VARIANTS.homePosts === "calm-rows" ? (
      <PostRowCalm {post} {serie} />
    ) : (
      <PostRow {post} {serie} />
    ),
  )
}
```

- [ ] **Step 3: Verify both variants**

Run: `pnpm dev`, home page. `calm-rows`: 4 rows, description line, tint hover, no arrow. Flip `VARIANTS.homePosts` to `arrow-rows`: old PostRow behavior returns. Restore `calm-rows`.
Run: `pnpm build` — exit 0.

- [ ] **Step 4: Commit**

```bash
pnpm format:write
git add src/components/blog/PostRowCalm.astro src/components/blog/SelectedWriting.astro
git commit -m "feat(v3): calm home post rows with description, homePosts variant"
```

---

### Task 7: Works strip — quiet hover + overlay-card variant

**Files:**
- Modify: `src/components/work/WorkMiniCard.astro:25` (hover)
- Create: `src/components/work/WorkOverlayCard.astro` (resurrected main-branch overlay card)
- Modify: `src/components/work/WorksStrip.astro`

**Interfaces:**
- Consumes: `VARIANTS.worksStrip` (Task 1).
- Produces: `WorkOverlayCard` with props `{ work: CollectionEntry<"work"> }`.

- [ ] **Step 1: Quiet the WorkMiniCard hover**

In `WorkMiniCard.astro`, replace the `<Image>` class:

```
class="block h-full w-full object-cover transition-transform duration-1000 motion-safe:group-hover:scale-105"
```

with:

```
class="block h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-85"
```

- [ ] **Step 2: Create `WorkOverlayCard.astro`**

Prerequisite check: `ls src/assets/icons/ | grep cross` — icon `cross-big` must exist (it did on main). If missing, copy it from main: `git show main:src/assets/icons/cross-big.svg > src/assets/icons/cross-big.svg`.

```astro
---
import { Image } from "astro:assets";
import { Icon } from "astro-icon/components";
import type { CollectionEntry } from "astro:content";

interface Props {
  work: CollectionEntry<"work">;
}

const { work } = Astro.props;

if (!work) {
  throw new Error("Sorry, could not find work");
}
---

<a
  href={"/work/" + work.id}
  title={`Open the "${work.data.title}" project`}
  class="group relative block aspect-square overflow-hidden outline-offset-4 outline-black focus:outline-2 dark:outline-white"
>
  <Image
    src={work.data.img_preview}
    alt={`${work.data.title} preview`}
    class="block h-full w-full object-cover transition-transform duration-1000 motion-safe:group-hover:scale-110"
    loading="lazy"
    widths={[160, 240, 320, 480, 640]}
    sizes="(max-width: 767px) calc((100vw - 3rem) / 2), 280px"
  />
  <div
    class="absolute inset-0 grid items-center duration-500 group-hover:bg-black/85 motion-reduce:transition-all dark:group-hover:bg-black/90"
  >
    <div
      class="flex flex-col items-center justify-center gap-4 p-4 opacity-0 duration-500 group-hover:opacity-100"
    >
      <Icon
        name="cross-big"
        class="text-5xl text-white transition-all delay-100 duration-500 group-hover:rotate-0 motion-safe:-rotate-45"
      />
      <p class="font-title text-xl text-white">{work.data.title}</p>
    </div>
  </div>
</a>
```

- [ ] **Step 3: Switch `WorksStrip.astro`**

Add imports:

```ts
import WorkOverlayCard from "@components/work/WorkOverlayCard.astro";
import { VARIANTS } from "src/config/variants";
```

Replace the card-rendering line with:

```astro
{
  works.map((work) =>
    VARIANTS.worksStrip === "mini-card" ? (
      <WorkMiniCard {work} />
    ) : (
      <WorkOverlayCard {work} />
    ),
  )
}
```

Note: featured set is now 3 (Task 2), so the strip grid `grid-cols-2 md:grid-cols-4` leaves an empty slot on md+. Change the grid div class to:

```
grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-8
```

- [ ] **Step 4: Verify both variants**

Run: `pnpm dev`, home page. `mini-card`: opacity dim on hover, no zoom. Flip to `overlay-card`: black overlay + rotating × + title on hover; keyboard focus ring intact. Restore `mini-card`.
Run: `pnpm build` — exit 0.

- [ ] **Step 5: Commit**

```bash
pnpm format:write
git add src/components/work
git commit -m "feat(v3): quiet works strip hover, overlay-card variant, 3-col grid"
```

---

### Task 8: About facts strip

**Files:**
- Create: `src/components/about/AboutFactsStrip.astro`
- Modify: `src/components/about/AboutText.astro:26` (the `<AboutFacts />` slot)

**Interfaces:**
- Consumes: `VARIANTS.aboutFacts` (Task 1); `getAllBlogPosts` from repository.
- Produces: `AboutFactsStrip`, no props.

- [ ] **Step 1: Create `AboutFactsStrip.astro`**

```astro
---
import { getAllBlogPosts } from "src/utils/repository";

const articleCount = (await getAllBlogPosts()).length;

const facts = [
  { value: "2010", label: "coding since" },
  { value: String(articleCount), label: "articles" },
  { value: "5000+", label: "downloads" },
  { value: "1000+", label: "people trained" },
];
---

<dl
  class="border-muted-border text-muted flex flex-wrap gap-x-6 gap-y-2 border-y py-3 font-mono text-sm"
>
  {
    facts.map((fact) => (
      <div class="flex gap-2">
        <dd class="font-bold">{fact.value}</dd>
        <dt>{fact.label}</dt>
      </div>
    ))
  }
</dl>
```

- [ ] **Step 2: Switch in `AboutText.astro`**

Add imports:

```ts
import AboutFactsStrip from "@components/about/AboutFactsStrip.astro";
import { VARIANTS } from "src/config/variants";
```

Replace `<AboutFacts />` with:

```astro
{VARIANTS.aboutFacts === "strip" ? <AboutFactsStrip /> : <AboutFacts />}
```

- [ ] **Step 3: Verify both variants**

Run: `pnpm dev`, `/about`. `strip`: one quiet mono line between borders; wraps to two lines on mobile without overflow. Flip to `grid`: old 4-col grid returns. Restore `strip`.
Run: `pnpm build` — exit 0.

- [ ] **Step 4: Commit**

```bash
pnpm format:write
git add src/components/about
git commit -m "feat(v3): about facts as one-line strip, grid kept as variant"
```

---

### Task 9: Version bump + final sweep

**Files:**
- Modify: `package.json:4` (`"version": "2.0.0"` → `"3.0.0"`)

- [ ] **Step 1: Bump version**

In `package.json`, set:

```json
"version": "3.0.0",
```

- [ ] **Step 2: Full verification**

Run: `pnpm format:check` — expected: clean (run `pnpm format:write` if not).
Run: `pnpm build` — exit 0.
Run: `pnpm preview`, click through: home (4 calm rows, 3-card strip), `/work` (3-card gallery + Portfolio in table), `/blog` (no chips), one post page (chips present), `/about` (facts strip).
Grep: `grep -rn "since 2010" src/` — expected: only pre-existing copy scheduled for the hero-copy track (do not fix here).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(v3): bump version to 3.0.0"
```
