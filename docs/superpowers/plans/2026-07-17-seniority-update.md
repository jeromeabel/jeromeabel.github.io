# Seniority Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the portfolio site (home, blog, work, about, footer) to signal senior product-engineer level — writing-first curation, featured ranking, era-grouped work history — per spec `docs/superpowers/specs/2026-07-17-seniority-update-design.md` (v2) plus the accepted design-review recommendations.

**Architecture:** Additive `featured: number` frontmatter field drives selection + ordering through `src/utils/repository.ts`, which becomes the single query point for all collections (works currently bypass it). Two new presentational components (`SerieCard`, `WorkMiniCard`); two renames (`BlogPreview` → `SelectedWriting`, `WorksPreview` → `WorksStrip`). RSS + sitemap added at the end.

**Tech Stack:** Astro 5 (content layer, `glob` loaders), Tailwind CSS v4 (CSS-native config), TypeScript strict, pnpm, Netlify adapter. No test framework — verification is `pnpm build` (validates schemas, types, pages) plus targeted checks.

## Global Constraints

- Package manager: **pnpm** only. Dev server: `pnpm dev` (localhost:4321). Build: `pnpm build`.
- No test suite exists. Every task's verification gate is `pnpm build` completing without errors. Do not add a test framework.
- TypeScript strict mode; path aliases `@components/*`, `@layouts/*`, `@assets/*`; `src/utils/` and `src/content/` are imported with **relative-style paths** (`src/utils/repository`), never an alias.
- Commit style: conventional commits like existing history (`feat(blog): …`, `fix(work): …`, `style(contact): …`).
- Copy rules from spec: facts only, no self-adjectives ("product-minded"), no naked job metrics outside About, no uhlive link in hero (About only), never the word "Archive" in UI copy.
- The site's only Nuxt serie is **"Testing a Simple Nuxt Feature"** (`src/content/serie/testing-a-simple-nuxt-feature/index.md`). The spec calls it the "Nuxt Clean Architecture serie" — same slot. Do NOT rename or retitle it.
- Series have **no image field** — `SerieCard` is typographic (no cover). Do not add image fields to the serie schema.
- Prettier with `prettier-plugin-astro` + `prettier-plugin-tailwindcss` — run `pnpm format:write` in the final task, don't fight class ordering by hand.
- Existing `draft` filtering (`import.meta.env.PROD`) must be preserved unchanged for posts/seriePosts. Work entries have no `draft` field — do not add one.
- **All work happens on the branch created in Task 0** — never commit Tasks 1–10 to `main`. The branch is reviewed and merged via PR in Task 11.

---

### Task 0: Create the working branch

**Files:**
- Commit (already on disk, uncommitted): `docs/superpowers/specs/2026-07-17-seniority-update-design.md`, `docs/superpowers/plans/2026-07-17-seniority-update.md`

**Interfaces:**
- Consumes: nothing.
- Produces: branch `feat/seniority-update` — every later task commits onto it; Task 11 opens the PR from it.

- [ ] **Step 1: Confirm a clean starting point**

Run: `git status --short`
Expected: only `docs/superpowers/` paths appear (the spec edit and this plan). If anything under `src/` is modified or untracked, **stop** and ask the human — do not sweep unrelated work onto the branch.

- [ ] **Step 2: Branch from main**

```bash
git checkout main
git pull --ff-only
git checkout -b feat/seniority-update
```

- [ ] **Step 3: Commit the spec + plan onto the branch**

```bash
git add docs/superpowers/specs/2026-07-17-seniority-update-design.md docs/superpowers/plans/2026-07-17-seniority-update.md
git commit -m "docs: add seniority update implementation plan, correct values-section status in spec"
```

- [ ] **Step 4: Verify**

Run: `git branch --show-current`
Expected: `feat/seniority-update`.

---

### Task 1: Zero-risk fixes — blog page bug + section flip, footer links

**Files:**
- Modify: `src/pages/blog.astro`
- Modify: `src/components/app/Footer.astro:6-13`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Fix blog Layout page prop and flip section order**

Replace the full contents of `src/pages/blog.astro` with:

```astro
---
import PostList from "@components/blog/PostList.astro";
import SerieList from "@components/blog/SerieList.astro";
import H1 from "@components/ui/H1.astro";
import H2 from "@components/ui/H2.astro";
import P from "@components/ui/P.astro";
import Layout from "@layouts/Layout.astro";
---

<Layout page="Blog">
  <main class="container flex flex-col gap-16 py-8 md:gap-24 lg:py-24">
    <header class="flex w-full flex-col gap-4 lg:w-2/3 lg:gap-8">
      <H1>Blog</H1>
      <P
        >Reflections, experiments, and lessons learned from my developer's
        journey.
      </P>
    </header>

    <section>
      <H2>Series</H2>
      <SerieList />
    </section>

    <section>
      <H2>Posts</H2>
      <PostList />
    </section>
  </main>
</Layout>
```

Two changes vs current file: `page="Work"` → `page="Blog"` (line 10), and Series section now before Posts.

- [ ] **Step 2: Update footer links (remove Framagit, reorder)**

In `src/components/app/Footer.astro`, replace the `links` array (lines 6–13) with:

```ts
const links = [
  { label: "GitHub", href: "https://github.com/jeromeabel" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jerome-abel/" },
  { label: "Email", href: "mailto:dev@jeromeabel.net" },
  { label: "Bluesky", href: "https://bsky.app/profile/jeromeabel.bsky.social" },
  { label: "Art Portfolio", href: "https://jeromeabel.net" },
];
```

Note: the RSS link is added in Task 9 together with the RSS endpoint — do not add it now (it would be a dead link).

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog.astro src/components/app/Footer.astro
git commit -m "fix(blog): correct Layout page prop, put series first; drop Framagit from footer"
```

---

### Task 2: `featured` schema field + frontmatter ranks

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/content/work/leconceptdelapreuve/index.md`
- Modify: `src/content/work/portfolio/index.md`
- Modify: `src/content/work/chimeres-orchestra/index.md`
- Modify: `src/content/work/logariat/index.md`
- Modify: `src/content/serie/web-performance/index.md`
- Modify: `src/content/serie/testing-a-simple-nuxt-feature/index.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `featured?: number` on `work`, `serie`, and both post collections (`post`, `seriePost` share `PostSchema`). Absent = not featured; value = display rank, 1 first. Task 3's repository functions read `entry.data.featured`.

- [ ] **Step 1: Add `featured` to PostSchema**

In `src/content.config.ts`, inside `PostSchema` (after the `draft` line):

```ts
    draft: z.boolean().default(true),
    featured: z.number().optional(),
```

- [ ] **Step 2: Add `featured` to the serie schema**

In the `serie` collection schema, after `date`:

```ts
    date: z.coerce.date(),
    featured: z.number().optional(),
```

- [ ] **Step 3: Add `featured` to the work schema**

In the `work` collection schema, after `date`:

```ts
      date: z.coerce.date(),
      featured: z.number().optional(),
```

- [ ] **Step 4: Set frontmatter ranks**

Add one line to each file's frontmatter, directly under the `date:` line:

| File | Line to add |
|---|---|
| `src/content/work/leconceptdelapreuve/index.md` | `featured: 1` |
| `src/content/work/portfolio/index.md` | `featured: 2` |
| `src/content/work/chimeres-orchestra/index.md` | `featured: 3` |
| `src/content/work/logariat/index.md` | `featured: 4` |
| `src/content/serie/web-performance/index.md` | `featured: 1` |
| `src/content/serie/testing-a-simple-nuxt-feature/index.md` | `featured: 2` |

No post files get `featured` for now (home falls back to latest posts — Task 3).

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: completes without errors (schema is additive; all existing entries still validate).

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/work/leconceptdelapreuve/index.md src/content/work/portfolio/index.md src/content/work/chimeres-orchestra/index.md src/content/work/logariat/index.md src/content/serie/web-performance/index.md src/content/serie/testing-a-simple-nuxt-feature/index.md
git commit -m "feat(content): add featured rank field to schemas and set initial ranks"
```

---

### Task 3: Repository as single query point + reading-time number helper

**Files:**
- Modify: `src/utils/get-minutes-read.ts`
- Modify: `src/utils/repository.ts`

**Interfaces:**
- Consumes: `featured` field from Task 2; existing `getAllPosts`, `getPostsFromSerie`.
- Produces (exact signatures — Tasks 4, 5, 7 import these from `src/utils/repository`):
  - `getFeaturedSeries(): Promise<CollectionEntry<"serie">[]>` — featured series, rank asc.
  - `getFeaturedPosts(count: number): Promise<CollectionEntry<"post">[]>` — featured standalone posts by rank, padded with latest non-featured, sliced to `count`. Draft-filtered.
  - `getFeaturedWorks(): Promise<CollectionEntry<"work">[]>` — featured works, rank asc, date-desc tiebreak.
  - `getEarlierWorksByEra(): Promise<{ label: string; works: CollectionEntry<"work">[] }[]>` — non-featured works, date desc, bucketed by era, empty eras dropped.
  - `getSerieStats(serie: CollectionEntry<"serie">): Promise<{ parts: number; minutes: number }>` — draft-filtered part count + summed reading minutes.
  - From `src/utils/get-minutes-read`: `getMinutesFromBody(body: string | undefined): number`.

- [ ] **Step 1: Add numeric reading-time helper**

Append to `src/utils/get-minutes-read.ts`:

```ts
export function getMinutesFromBody(body: string | undefined): number {
  if (!body) {
    return 0;
  }

  return getReadingTime(body, { wordsPerMinute: 120 }).minutes;
}
```

- [ ] **Step 2: Add featured + era query functions to the repository**

In `src/utils/repository.ts`: delete the commented-out `getPostsFromSerie` variant at the bottom (lines 32–33), add `import { getMinutesFromBody } from "./get-minutes-read";` at the top, then append:

```ts
export const getFeaturedSeries = async () =>
  (await getCollection("serie"))
    .filter((serie) => serie.data.featured !== undefined)
    .sort((a, b) => (a.data.featured ?? 0) - (b.data.featured ?? 0));

export const getFeaturedPosts = async (count: number) => {
  const posts = await getAllPosts();
  const featured = posts
    .filter((post) => post.data.featured !== undefined)
    .sort((a, b) => (a.data.featured ?? 0) - (b.data.featured ?? 0));
  const rest = posts.filter((post) => post.data.featured === undefined);
  return [...featured, ...rest].slice(0, count);
};

export const getFeaturedWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured !== undefined)
    .sort(
      (a, b) =>
        (a.data.featured ?? 0) - (b.data.featured ?? 0) ||
        b.data.date.valueOf() - a.data.date.valueOf(),
    );

const WORK_ERAS = [
  { label: "Training & first web projects (2022–2024)", from: 2022, to: 2100 },
  { label: "Interactive art & research (2012–2021)", from: 1900, to: 2021 },
];

export const getEarlierWorksByEra = async () => {
  const earlier = (await getCollection("work"))
    .filter((work) => work.data.featured === undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return WORK_ERAS.map((era) => ({
    label: era.label,
    works: earlier.filter((work) => {
      const year = work.data.date.getFullYear();
      return year >= era.from && year <= era.to;
    }),
  })).filter((era) => era.works.length > 0);
};

export const getSerieStats = async (serie: CollectionEntry<"serie">) => {
  const posts = await getPostsFromSerie(serie);
  const minutes = posts.reduce(
    (total, post) => total + getMinutesFromBody(post.body),
    0,
  );
  return { parts: posts.length, minutes: Math.ceil(minutes) };
};
```

Rank ties degrade gracefully: the date-desc tiebreak in `getFeaturedWorks` makes a duplicate rank deterministic instead of flickering.

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: completes without errors (functions are exported but unused so far — that's fine for one task).

- [ ] **Step 4: Commit**

```bash
git add src/utils/get-minutes-read.ts src/utils/repository.ts
git commit -m "feat(utils): add featured/era repository queries and numeric reading time"
```

---

### Task 4: `SerieCard` + `BlogPreview` → `SelectedWriting`

**Files:**
- Create: `src/components/blog/SerieCard.astro`
- Rename: `src/components/blog/BlogPreview.astro` → `src/components/blog/SelectedWriting.astro` (then rewrite contents)
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getFeaturedSeries`, `getFeaturedPosts`, `getSerieStats` from `src/utils/repository` (Task 3); existing `PostCard.astro`.
- Produces: `<SelectedWriting />` section with `id="writing"` — Task 6's hero CTA anchors to `#writing`. `<SerieCard serie={...} />` takes `serie: CollectionEntry<"serie">`.

- [ ] **Step 1: Create the serie card (typographic — series have no cover image)**

Create `src/components/blog/SerieCard.astro`:

```astro
---
import { Icon } from "astro-icon/components";
import type { CollectionEntry } from "astro:content";
import { getSerieStats } from "src/utils/repository";

interface Props {
  serie: CollectionEntry<"serie">;
}

const { serie } = Astro.props;

if (!serie) {
  throw new Error("Sorry, could not find serie");
}

const { parts, minutes } = await getSerieStats(serie);
---

<a
  href={`/blog/${serie.id}`}
  class="border-muted-border hover:bg-muted-background/50 flex flex-col gap-2 border-2 p-4 lg:p-6"
>
  <span class="text-muted text-base font-normal uppercase">Serie</span>
  <h3 class="text-xl font-bold tracking-wide lg:text-2xl">
    {serie.data.title}
  </h3>
  <p class="line-clamp-3">{serie.data.description}</p>
  <div class="text-muted mt-auto flex items-center justify-end gap-2 pt-2">
    <Icon name="lucide:chevron-right" />
    <span class="text-sm">{parts} parts</span>
    <Icon name="lucide:clock" class="ms-6" />
    <span class="text-sm">{minutes} min total</span>
  </div>
</a>
```

The `border-2` (vs `border` on `PostCard`) is the deliberate tier-1 visual weight.

- [ ] **Step 2: Rename and rewrite BlogPreview**

```bash
git mv src/components/blog/BlogPreview.astro src/components/blog/SelectedWriting.astro
```

Then replace the contents of `src/components/blog/SelectedWriting.astro` with:

```astro
---
import PostCard from "@components/blog/PostCard.astro";
import SerieCard from "@components/blog/SerieCard.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import P from "@components/ui/P.astro";
import { getFeaturedPosts, getFeaturedSeries } from "src/utils/repository";

const series = (await getFeaturedSeries()).slice(0, 2);
const posts = await getFeaturedPosts(2);
---

<section id="writing" class="container flex flex-col gap-4 lg:gap-8">
  <H2>Selected Writing</H2>
  <P
    >How I approach performance, architecture, and the craft of web
    engineering.
  </P>
  <div class="grid gap-4 md:grid-cols-2 lg:gap-8">
    {series.map((serie) => <SerieCard {serie} />)}
  </div>
  <div class="grid gap-4 md:grid-cols-2 lg:gap-8">
    {posts.map((post) => <PostCard {post} />)}
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

Layout is the accepted asymmetric two-tier: serie cards on top (heavier border), standalone posts below. `getFeaturedPosts` already handles the "fallback: latest posts" rule.

- [ ] **Step 3: Update the home page import**

In `src/pages/index.astro`, change:

```astro
import BlogPreview from "@components/blog/BlogPreview.astro";
```
to
```astro
import SelectedWriting from "@components/blog/SelectedWriting.astro";
```
and `<BlogPreview />` to `<SelectedWriting />`.

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: completes without errors.

- [ ] **Step 5: Verify content**

Run: `grep -c 'id="writing"' dist/index.html || pnpm dev` — if `dist` output isn't plain HTML with the Netlify adapter, instead start `pnpm dev` in the background and run:
`curl -s http://localhost:4321/ | grep -o 'Selected Writing'`
Expected: `Selected Writing` found once; page also contains both serie titles ("Web Performance", "Testing a Simple Nuxt Feature").

- [ ] **Step 6: Commit**

```bash
git add src/components/blog/SerieCard.astro src/components/blog/SelectedWriting.astro src/pages/index.astro
git commit -m "feat(home): replace latest-posts preview with Selected Writing (serie cards + featured posts)"
```

---

### Task 5: `WorkMiniCard` + `WorksPreview` → `WorksStrip`

**Files:**
- Create: `src/components/work/WorkMiniCard.astro`
- Rename: `src/components/work/WorksPreview.astro` → `src/components/work/WorksStrip.astro` (then rewrite contents)
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getFeaturedWorks` from `src/utils/repository` (Task 3).
- Produces: `<WorkMiniCard work={...} />` takes `work: CollectionEntry<"work">` — reused by Task 7 for "earlier work" grids. `<WorksStrip />` home section.

- [ ] **Step 1: Create the mini card**

Create `src/components/work/WorkMiniCard.astro`:

```astro
---
import { Image } from "astro:assets";
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
  class="group border-muted-border hover:bg-muted-background/50 flex flex-col gap-2 border p-2 outline-offset-4 outline-black focus:outline-2 dark:outline-white"
>
  <div class="aspect-square overflow-hidden">
    <Image
      src={work.data.img_preview}
      alt={`${work.data.title} preview`}
      class="block h-full w-full object-cover transition-transform duration-1000 motion-safe:group-hover:scale-105"
      loading="lazy"
      widths={[160, 240, 360]}
      sizes="(max-width: 767px) calc((100vw - 3rem) / 2), 220px"
    />
  </div>
  <p class="text-sm font-semibold tracking-wide lg:text-base">
    {work.data.title}
  </p>
</a>
```

- [ ] **Step 2: Rename and rewrite WorksPreview**

```bash
git mv src/components/work/WorksPreview.astro src/components/work/WorksStrip.astro
```

Replace the contents of `src/components/work/WorksStrip.astro` with:

```astro
---
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import P from "@components/ui/P.astro";
import WorkMiniCard from "@components/work/WorkMiniCard.astro";
import { getFeaturedWorks } from "src/utils/repository";

const works = await getFeaturedWorks();
---

<section class="container flex flex-col gap-4 lg:gap-8">
  <H2>Works</H2>
  <P>15 years of building — from robotic drummers to web apps.</P>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
    {works.map((work) => <WorkMiniCard {work} />)}
  </div>
  <Link
    class="mt-8"
    label="All work"
    href="/work"
    icon="lucide:arrow-right"
    variant="secondary"
  />
</section>
```

This removes the raw `getCollection("work")` bypass and the date-sorted "latest 3" — the strip now shows exactly the 4 ranked works.

- [ ] **Step 3: Update the home page import**

In `src/pages/index.astro`, change `WorksPreview` import/usage to:

```astro
import WorksStrip from "@components/work/WorksStrip.astro";
```
and `<WorksPreview />` to `<WorksStrip />`. Final `src/pages/index.astro`:

```astro
---
import SelectedWriting from "@components/blog/SelectedWriting.astro";
import Contact from "@components/contact/Contact.astro";
import Hero from "@components/hero/Hero.astro";
import WorksStrip from "@components/work/WorksStrip.astro";
import Layout from "@layouts/Layout.astro";
---

<Layout>
  <div>
    <Hero />
    <main class="mb-32 flex flex-col gap-16 lg:gap-24 xl:gap-36">
      <SelectedWriting />
      <WorksStrip />
    </main>
    <Contact />
  </div>
</Layout>
```

- [ ] **Step 4: Verify build + content**

Run: `pnpm build`
Expected: no errors.
With `pnpm dev` running: `curl -s http://localhost:4321/ | grep -o "robotic drummers to web apps"`
Expected: match found. Also check the 4 featured titles appear: `curl -s http://localhost:4321/ | grep -c -E "Le concept de la preuve|Portfolio|Chimères Orchestra|Logariat"`.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/WorkMiniCard.astro src/components/work/WorksStrip.astro src/pages/index.astro
git commit -m "feat(home): compact works strip with featured mini-cards via repository"
```

---

### Task 6: Hero rewrite + CTA

**Files:**
- Modify: `src/components/hero/HeroText.astro`
- Modify: `astro.config.mjs:32-45` (icon include list)

**Interfaces:**
- Consumes: `id="writing"` anchor from Task 4; existing `Link.astro` variants.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Add `arrow-down` to the lucide icon allowlist**

In `astro.config.mjs`, in the `icon({ include: { lucide: [...] } })` array, add `"arrow-down"` after `"arrow-up-right"`.

- [ ] **Step 2: Rewrite HeroText**

Replace the contents of `src/components/hero/HeroText.astro` with:

```astro
---
import HeroSocials from "@components/hero/HeroSocials.astro";
import Link from "@components/ui/Link.astro";
---

<div class="flex-1 lg:flex-2 xl:flex-1" role="presentation">
  <div class="flex flex-col justify-center gap-2 text-balance md:gap-4">
    <h1 class="font-title text-2xl tracking-wide md:text-4xl lg:text-5xl">
      Hi! I'm Jérôme Abel
    </h1>
    <p
      class="text-lg sm:text-pretty md:text-xl md:tracking-wide xl:text-2xl xl:leading-tight"
    >
      I build web applications with Vue &amp; TypeScript, and write about web
      performance and clean architecture along the way. Coding since 2010 —
      robotic art installations, audio tools, open-source frameworks.
    </p>
    <HeroSocials />
    <Link
      class="mt-2"
      label="Selected writing"
      href="#writing"
      icon="lucide:arrow-down"
      variant="secondary"
    />
  </div>
</div>
```

Changes encoded here, all accepted in review: uhlive link removed (moves to About, Task 8); accepted copy option C (facts + route to proof, ends on the 2010 depth fact); CTA anchors to `#writing`; text size stepped down one notch (`text-lg…xl:text-2xl`, was `text-xl…xl:text-3xl`) because the paragraph is longer; **name typo fixed**: "Jerôme" → "Jérôme" (footer already spells it Jérôme).

- [ ] **Step 3: Verify build + content**

Run: `pnpm build`
Expected: no errors (an unknown icon name would fail the build — that's the check on `arrow-down`).
With `pnpm dev` running: `curl -s http://localhost:4321/ | grep -o "uh.live"`
Expected: **no output** (uhlive gone from home; it returns in About in Task 8).

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/HeroText.astro astro.config.mjs
git commit -m "feat(hero): facts-only copy with writing CTA, drop uhlive link, fix name accent"
```

---

### Task 7: Work page — featured + era-grouped earlier work

**Files:**
- Modify: `src/pages/work.astro`

**Interfaces:**
- Consumes: `getFeaturedWorks`, `getEarlierWorksByEra` from `src/utils/repository` (Task 3); `WorkCard.astro` (existing); `WorkMiniCard.astro` (Task 5).
- Produces: nothing other tasks depend on. `/work/[id].astro` untouched — all deep links stay live.

- [ ] **Step 1: Rewrite the work index page**

Replace the contents of `src/pages/work.astro` with:

```astro
---
import H1 from "@components/ui/H1.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import P from "@components/ui/P.astro";
import WorkCard from "@components/work/WorkCard.astro";
import WorkMiniCard from "@components/work/WorkMiniCard.astro";
import Layout from "@layouts/Layout.astro";
import { getEarlierWorksByEra, getFeaturedWorks } from "src/utils/repository";

const featured = await getFeaturedWorks();
const eras = await getEarlierWorksByEra();
---

<Layout page="Work">
  <main class="container flex flex-col gap-16 py-8 md:gap-24 lg:py-24">
    <header class="flex w-full flex-col gap-4 lg:w-2/3 lg:gap-8">
      <H1>Work</H1>
      <P>
        Fifteen years of open work — art systems, tools, experiments — where
        you can see how I think. What I build at work is private; <Link
          href="/blog"
          label="the writing"
        /> covers how I build now.
      </P>
    </header>

    <section>
      <H2>Featured</H2>
      <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {featured.map((work) => <WorkCard {work} />)}
      </div>
    </section>

    {
      eras.map((era) => (
        <section>
          <H2>{era.label}</H2>
          <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
            {era.works.map((work) => <WorkMiniCard {work} />)}
          </div>
        </section>
      ))
    }
  </main>
</Layout>
```

Structure encodes the accepted decisions: intro copy option C (positive-first, routes to blog — "the writing" links to `/blog`); featured entries as full `WorkCard`s in a 2-up grid (bigger = tier 1); earlier work as 4-up `WorkMiniCard`s under exactly two era headings, most recent era first (labels come from `WORK_ERAS` in the repository — never the word "Archive").

- [ ] **Step 2: Verify build + content**

Run: `pnpm build`
Expected: no errors.
With `pnpm dev` running:
`curl -s http://localhost:4321/work | grep -o -E "Featured|Training & first web projects|Interactive art"`
Expected: all three headings present.
`curl -s http://localhost:4321/work/malinette/ | grep -o "La Malinette"`
Expected: match — deep links still live.

- [ ] **Step 3: Commit**

```bash
git add src/pages/work.astro
git commit -m "feat(work): featured section + era-grouped earlier work via repository"
```

---

### Task 8: About — engineering-first bio, stat row, teaching, CV

**Files:**
- Create: `src/components/about/AboutFacts.astro`
- Modify: `src/components/about/AboutText.astro`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `<AboutFacts />` (no props).

- [ ] **Step 1: Create the stat row**

Create `src/components/about/AboutFacts.astro`:

```astro
---
const facts = [
  { value: "2010", label: "coding since" },
  { value: "185", label: "merged PRs · current role" },
  { value: "21", label: "articles published" },
  { value: "5000+", label: "framework downloads" },
  { value: "1000+", label: "people trained" },
];
---

<dl class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
  {
    facts.map((fact) => (
      <div class="flex flex-col">
        <dd class="font-title text-3xl tracking-wide">{fact.value}</dd>
        <dt class="text-muted text-sm">{fact.label}</dt>
      </div>
    ))
  }
</dl>
```

Every number is verifiable and carries its context in the sub-label — this is the accepted "stat row, not prose" decision (numbers allowed here, unlike home).

- [ ] **Step 2: Rewrite the bio**

Replace the contents of `src/components/about/AboutText.astro` with:

```astro
---
import AboutFacts from "@components/about/AboutFacts.astro";
import H1 from "@components/ui/H1.astro";
import Link from "@components/ui/Link.astro";
import Prose from "@components/ui/Prose.astro";
import { Icon } from "astro-icon/components";
---

<section class="flex w-full flex-col gap-6 sm:gap-8 lg:w-2/3">
  <H1>About</H1>
  <Prose>
    <p>
      <strong>I build web applications</strong> with Vue and TypeScript. After
      an intensive reconversion to web development, I deepened my Vue and
      Kotlin skills at Raccourci Agency, and now work at <Link
        label="uhlive"
        href="https://uh.live/"
      />, on the front end of an AI-driven call-intelligence product.
    </p>
  </Prose>

  <AboutFacts />

  <Link
    label="Download CV"
    href="/CV_JeromeAbel_en.pdf"
    icon="lucide:download"
    variant="external"
  />

  <Prose>
    <p>
      <strong>Before the web</strong>, I spent over a decade in software arts —
      embedded systems, creative frameworks, many programming languages. My
      projects have been exhibited in Brussels, Dakar, Montreal, Dubrovnik,
      Neuss, Tunis, Dublin, Paris, and beyond; my artistic work lives at <Link
        href="https://jeromeabel.net"
        label="jeromeabel.net"
      />. I built and maintained <Link
        href="https://reso-nance.org/malinette/"
        label="La Malinette"
      />, an open-source creative-coding framework used in schools — 5000+
      downloads.
    </p>

    <p>
      <strong>Teaching</strong> has run through all of it: fablab workshops,
      schools, and artist residencies, where I trained more than 1000 people in
      electronics, programming, and open-source tools.
    </p>

    <p>
      <strong>Open source since 2010</strong> — creative-coding tools first on
      <Link href="https://framagit.org/jeromeabel" label="Framagit" />, now on
      <Link href="https://github.com/jeromeabel" label="GitHub" />.
    </p>

    <p>
      Beyond technical expertise, I focus on engineering best practices that
      promote quality and maintainability. I value clean architecture, testing,
      and performance to ensure that everything I build is solid and scalable. I
      look forward to working with talented engineers, learning from them, and
      building great things together. <Icon
        name="lucide:handshake"
        class="inline-block h-6 w-6"
      />
    </p>
  </Prose>
</section>
```

Encodes the accepted decisions: ¶1 engineering-first (art paragraph demoted to second); OpenClassrooms compressed to "intensive reconversion"; stat row directly after ¶1, CV button directly after the stat row (verify → download); Malinette as past-tense line with reso-nance link; Teaching section absorbs the archived Fablab story; OSS/Framagit framed line (Framagit lives here now, not the footer); uhlive named in About only; final values paragraph kept unchanged. **Note for the human:** `public/CV_JeromeAbel_en.pdf` exists but predates the 2026 CV — swap the PDF when ready; the link works today.

- [ ] **Step 3: Verify build + content**

Run: `pnpm build`
Expected: no errors.
With `pnpm dev` running:
`curl -s http://localhost:4321/about | grep -o -E "I build web applications|185|reso-nance.org|Download CV"`
Expected: all four present.

- [ ] **Step 4: Commit**

```bash
git add src/components/about/AboutFacts.astro src/components/about/AboutText.astro
git commit -m "feat(about): engineering-first bio with stat row, teaching and OSS sections, CV button"
```

---

### Task 9: RSS feed + sitemap + footer RSS link

**Files:**
- Create: `src/pages/rss.xml.ts`
- Modify: `astro.config.mjs`
- Modify: `src/components/app/Footer.astro` (links array from Task 1)
- Modify: `package.json` (via pnpm add)

**Interfaces:**
- Consumes: `getAllBlogPosts` from `src/utils/repository` (existing — posts + serie posts, draft-filtered, date desc).
- Produces: `/rss.xml` endpoint; sitemap at `/sitemap-index.xml`.

- [ ] **Step 1: Install packages**

Run: `pnpm add @astrojs/rss @astrojs/sitemap`
Expected: both added to `dependencies` in `package.json`.

- [ ] **Step 2: Create the RSS endpoint**

Create `src/pages/rss.xml.ts`:

```ts
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllBlogPosts } from "src/utils/repository";

export async function GET(context: APIContext) {
  const posts = await getAllBlogPosts();

  return rss({
    title: "Jérôme Abel — Blog",
    description:
      "Web performance, clean architecture, and the craft of web engineering.",
    site: context.site ?? "https://dev.jeromeabel.net",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 3: Add the sitemap integration**

In `astro.config.mjs`: add `import sitemap from "@astrojs/sitemap";` with the other imports, and add `sitemap(),` to the `integrations` array (after `icon({...})`).

- [ ] **Step 4: Add the RSS footer link**

In `src/components/app/Footer.astro`, in the `links` array from Task 1, insert between Email and Bluesky:

```ts
  { label: "RSS", href: "/rss.xml" },
```

- [ ] **Step 5: Verify build + endpoint**

Run: `pnpm build`
Expected: no errors; build log mentions sitemap generation (`@astrojs/sitemap`).
With `pnpm dev` running:
`curl -s http://localhost:4321/rss.xml | head -5`
Expected: XML starting with `<?xml version="1.0"` and containing `<rss`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/pages/rss.xml.ts astro.config.mjs src/components/app/Footer.astro
git commit -m "feat(app): add RSS feed, sitemap integration, and footer RSS link"
```

---

### Task 10: Format + full verification pass

**Files:**
- Modify: whatever `pnpm format:write` touches.

**Interfaces:**
- Consumes: everything.
- Produces: clean, formatted final state.

- [ ] **Step 1: Format**

Run: `pnpm format:write`
Expected: prettier normalizes class ordering (tailwind plugin) and astro formatting in the files touched by Tasks 1–9.

- [ ] **Step 2: Full build**

Run: `pnpm build`
Expected: completes without errors.

- [ ] **Step 3: Final content sweep**

With `pnpm dev` running, verify each accepted decision landed:

```bash
curl -s http://localhost:4321/          | grep -c -E "Selected Writing|Selected writing|robotic drummers"   # expect ≥3
curl -s http://localhost:4321/          | grep -c "uh.live"                                                  # expect 0
curl -s http://localhost:4321/blog      | grep -o "<title>[^<]*</title>"                                     # expect title containing "Blog"
curl -s http://localhost:4321/work      | grep -c -E "Featured|Interactive art|Training"                     # expect ≥3
curl -s http://localhost:4321/about     | grep -c -E "uh.live|Framagit|reso-nance"                           # expect ≥3 (all live in About now)
curl -s http://localhost:4321/rss.xml   | grep -c "<rss"                                                     # expect 1
```

Also check the footer on any page: GitHub · LinkedIn · Email · RSS · Bluesky · Art Portfolio, no Framagit.

- [ ] **Step 4: Commit (if formatting changed anything)**

```bash
git add -A
git commit -m "style: format after seniority update"
```

---

### Task 11: Code review + pull request

**Files:**
- Modify: whatever review findings require.

**Interfaces:**
- Consumes: the finished `feat/seniority-update` branch (Tasks 0–10).
- Produces: an open PR against `main`. **Do not merge** — the human reviews and merges.

- [ ] **Step 1: Request code review**

REQUIRED SUB-SKILL: `superpowers:requesting-code-review`. Review the full branch diff (`git diff main...HEAD`), not just the last commit.

- [ ] **Step 2: Address findings**

REQUIRED SUB-SKILL: `superpowers:receiving-code-review`. Fix what's real, push back on what isn't, and commit fixes onto the same branch. Re-run `pnpm build` after any fix.

Copy findings get the same weight as code findings here — the whole point of this branch is the wording. Re-check against the spec's copy rules: facts only, no self-adjectives, no naked job metrics outside About, no uhlive in hero, never the word "Archive" in UI copy.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin feat/seniority-update
```

- [ ] **Step 4: Open the PR**

```bash
gh pr create --base main --title "Seniority update: writing-first curation, featured ranking, era-grouped work" --body "$(cat <<'EOF'
## Summary

Restructures home, blog, work, about, and footer to signal senior product-engineer level, per `docs/superpowers/specs/2026-07-17-seniority-update-design.md` (v2).

- `featured: number` frontmatter field drives both selection and ordering, routed through `src/utils/repository.ts` — now the single query point for all collections (works previously bypassed it).
- Home: `SelectedWriting` (serie cards + featured posts) replaces the latest-posts preview; `WorksStrip` shows the 4 ranked works.
- Work: featured section plus earlier work grouped into two eras. All `/work/[id]` deep links unchanged.
- About: engineering-first bio, verifiable stat row, teaching and OSS sections, CV button re-enabled.
- Hero: facts-only copy with a `#writing` CTA; uhlive link moves to About.
- Adds RSS feed and sitemap; drops Framagit from the footer.

## Verification

No test framework in this repo. Verified with `pnpm build` (schemas, types, pages) plus the per-task `curl` content checks in the plan.

## Notes for review

- `public/CV_JeromeAbel_en.pdf` predates the 2026 CV — the link works, but the PDF still needs swapping.
- The values section (`AboutValues.astro`) remains dead code, deliberately out of scope.
EOF
)"
```

- [ ] **Step 5: Report the PR URL to the human and stop**

Do not merge. Do not delete the branch.

---

## Out of scope (unchanged from spec)

New post authoring (P1/P2), Nuxt side project, KFS abstract rewrite, LIKE feature, dark-mode flash fix, repo rename, home animation a11y, tags/taxonomy cleanup, generated thumbnail set, CV 2026 PDF content (link re-enabled; PDF swap is a human task).
