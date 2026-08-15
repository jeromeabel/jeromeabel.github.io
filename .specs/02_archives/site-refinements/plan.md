# Site Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the decided site-refinement spec (`docs/superpowers/specs/2026-07-18-site-critique-recommendations.md`) — hero rewrite, "Start here" writing section, Latest-first blog, tiered Work page (Selected work + Archive), and the batch of copy/UX fixes.

**Architecture:** Incremental edits to an Astro 5 static site. Presentation lives in `.astro` components under `src/components/`; all collection queries funnel through `src/utils/repository.ts`; content schema in `src/content.config.ts`. Changes are grouped so each task is one reviewable, independently shippable unit. No behavioral runtime code changes the data model except three new **optional** frontmatter fields (`updated`, `topic`, `kicker`) that render only when present.

**Tech Stack:** Astro 5, Tailwind CSS v4 (CSS-native `@theme`), `astro-icon` (lucide + fa6-brands), `class-variance-authority` (Link variants), pnpm.

## Global Constraints

- **No test suite / no linter** in this repo. Per-task verification = `pnpm build` succeeds + `pnpm format:check` clean + a described dev-server visual check. Run `pnpm format:write` before `format:check` if formatting drifts.
- **Package manager is pnpm.** Never invoke npm/yarn.
- **No new dependencies.** Everything ships with what's installed.
- **No framework names in the hero** (Vue/TypeScript/etc. stay in About/Work/CV only).
- **Copy label:** user-facing "Serie" → **"Series"**. Code identifiers, collection names (`serie`, `seriePost`), route params, and `serie.id`/`serie.data` stay unchanged.
- **No image generation now.** Existing covers/thumbnails are kept as-is. (Illustration system is backlog.)
- **Featured ranking** is a positive integer; smaller = higher. Existing sort: `(a.featured ?? 0) - (b.featured ?? 0)` then date desc.
- Commit after every task with a Conventional-Commits message. Branch is `feat/seniority-update` (continue on it).

## Decision flag (confirm before Task 11)

Spec §7 relocates two portfolio entries, **flagged for user agreement**:

- **La Malinette** → Selected work (gains a `featured` rank).
- **Logariat** → Archive (loses its `featured` rank).

Task 11 implements exactly this. If the user disagrees, adjust the `featured` assignments in Task 11 only — no other task depends on which specific works are featured.

## File Structure

**Created:**

- `src/components/work/ArchiveTable.astro` — the Work-page archive table (Year | Project | Type | Built with | Link). One responsibility: render non-featured works as external-linked rows.
- `src/components/about/AboutTimeline.astro` — compact 5-dot career strip on the About page (Task 15).

**Modified (presentation):**

- `src/components/blog/SerieCard.astro` — "Serie" → "Series".
- `src/components/app/Footer.astro` — link order.
- `src/components/about/AboutFacts.astro` — drop the 185-PR stat, grid → 4 cols.
- `src/components/about/AboutText.astro` — explicit `{" "}` before inline `<Link>`s.
- `src/components/ui/Link.astro` — hit-area fix on `default` + `secondary` variants.
- `src/components/work/WorkMiniCard.astro` — bare image tile + title, retina `widths`.
- `src/components/hero/HeroText.astro` — new hero copy, drop inline CTA.
- `src/components/hero/HeroSocials.astro` — mailto → envelope icon.
- `src/components/hero/Hero.astro` — centered scroll cue at bottom of hero box.
- `src/components/blog/SelectedWriting.astro` — "Start here", drop intro, posts → `PostListItem`, `scroll-mt`.
- `src/components/blog/PostListItem.astro` — optional `updated` badge + optional `topic` tag.
- `src/pages/blog.astro` — Latest-first merged list + year separators; Series cards below.
- `src/pages/work.astro` — Selected work + Archive table; retire era sections.
- `src/components/work/WorkCard.astro` — year+type kicker.

**Modified (data):**

- `src/content.config.ts` — add optional `updated`, `topic` (post/seriePost) and `kicker` (work).
- `src/utils/repository.ts` — add `getArchiveWorks`; remove `getEarlierWorksByEra` + `WORK_ERAS`.
- `src/content/work/{malinette,logariat,chimeres-orchestra,leconceptdelapreuve,portfolio}/index.md` — `featured` + `kicker` frontmatter.

**Removed (orphaned):**

- `src/components/blog/PostCard.astro` (last consumer was `SelectedWriting.astro`).
- `src/components/blog/PostList.astro` + `src/components/blog/SerieList.astro` + `src/components/blog/SerieListItem.astro` (last consumer was `blog.astro`).

**Out of scope — separate plans (each needs its own brainstorm before implementation):**

- **§10 CV system** — separate `~/code/projects/cv` repo (Typst + YAML), per spec §10.
- **Illustration system** — one artistic direction (palette · contrast · texture) spanning every cover/thumbnail, doubling as the OG-image pipeline. Direction to explore (user, 2026-07-18):
  - _Blog-post thumbnails_ — pick one generation path (or a hybrid): **(a)** auto SVG gradient seeded per slug/title; **(b)** art/image processing (duotone + grain over a source); **(c)** hand-drawn motifs scanned, then modified/composited by an automatic pipeline.
  - _Work thumbnails_ — keep the real project images, but run them through the **same** artistic direction (shared palette + grain/duotone post-process) so blog and work covers read as one system.
  - Open decision: which blog path, and whether the shared direction is a build-time transform vs. pre-baked assets. Defer to the illustration-system brainstorm.

---

## Phase A — Quick fixes

### Task 1: Rename "Serie" → "Series" label

**Files:**

- Modify: `src/components/blog/SerieCard.astro:23`

**Interfaces:** none changed.

- [ ] **Step 1: Edit the label**

In `src/components/blog/SerieCard.astro`, change line 23 from:

```astro
  <span class="text-muted text-base font-normal uppercase">Serie</span>
```

to:

```astro
  <span class="text-muted text-base font-normal uppercase">Series</span>
```

- [ ] **Step 2: Verify no other user-facing singular "Serie" remains**

Run: `grep -rn ">Serie<\|\"Serie\"\|>Serie \|Serie</" src --include=*.astro`
Expected: no output (blog.astro already says "Series"; all other matches are code identifiers).

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: build completes, format check passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/blog/SerieCard.astro
git commit -m "fix(blog): rename user-facing Serie label to Series"
```

### Task 2: Reorder footer links

**Files:**

- Modify: `src/components/app/Footer.astro:6-13`

Target order (identity → social → contact → subscribe): `GitHub · Art Portfolio · Bluesky · LinkedIn · Email · RSS`.

- [ ] **Step 1: Reorder the `links` array**

Replace the `links` array (lines 6–13) with:

```astro
const links = [
  { label: "GitHub", href: "https://github.com/jeromeabel" },
  { label: "Art Portfolio", href: "https://jeromeabel.net" },
  { label: "Bluesky", href: "https://bsky.app/profile/jeromeabel.bsky.social" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jerome-abel/" },
  { label: "Email", href: "mailto:dev@jeromeabel.net" },
  { label: "RSS", href: "/rss.xml" },
];
```

- [ ] **Step 2: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 3: Visual check**

Run: `pnpm dev`, open `localhost:4321`, scroll to footer.
Expected: link row reads `GitHub · Art Portfolio · Bluesky · LinkedIn · Email · RSS` left→right.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/Footer.astro
git commit -m "style(footer): reorder links by relationship gradient"
```

### Task 3: About page — drop 185-PR stat, fix inline-link spacing

**Files:**

- Modify: `src/components/about/AboutFacts.astro:2-8,11`
- Modify: `src/components/about/AboutText.astro` (inline `<Link>` spacing)

**Interfaces:** none changed.

- [ ] **Step 1: Remove the 185-PR fact and drop the grid to 4 columns**

In `src/components/about/AboutFacts.astro`, replace the `facts` array (remove the `185` entry):

```astro
const facts = [
  { value: "2010", label: "coding since" },
  { value: "21", label: "articles published" },
  { value: "5000+", label: "framework downloads" },
  { value: "1000+", label: "people trained" },
];
```

Then change the `<dl>` class (line 11) from `lg:grid-cols-5` to `lg:grid-cols-4`:

```astro
<dl class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
```

- [ ] **Step 2: Fix `compressHTML` spacing before inline Links in AboutText**

`compressHTML` collapses the newline before an inline `<Link>`, gluing the preceding word to the link ("onFramagit", "onGitHub"). Add an explicit `{" "}` immediately before each inline `<Link>` that follows text on a wrapped line. In `src/components/about/AboutText.astro`, apply to every inline Link:

- Before `<Link label="uhlive" ...>` (after "now work at"):
  ```astro
        at{" "}<Link
          label="uhlive"
          href="https://uh.live/"
        />
  ```
- Before `<Link href="https://jeromeabel.net" label="jeromeabel.net" />` (after "lives at"):
  ```astro
        my artistic work lives at{" "}<Link
          href="https://jeromeabel.net"
          label="jeromeabel.net"
        />
  ```
- Before `<Link href="https://reso-nance.org/malinette/" label="La Malinette" />` (after "I built and maintained"):
  ```astro
        /> I built and maintained{" "}<Link
          href="https://reso-nance.org/malinette/"
          label="La Malinette"
        />
  ```
- Before `<Link href="https://framagit.org/jeromeabel" label="Framagit" />` (after "first on"):
  ```astro
        creative-coding tools first on{" "}
        <Link href="https://framagit.org/jeromeabel" label="Framagit" />, now on{" "}
        <Link href="https://github.com/jeromeabel" label="GitHub" />.
  ```

Leave the sentence-initial `<Link>`s (none here) alone; only wrapped mid-sentence links need `{" "}`.

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:write && pnpm format:check`
Expected: build passes; format check passes after write.

- [ ] **Step 4: Visual check**

Run: `pnpm dev`, open `localhost:4321/about`.
Expected: stat row shows 4 columns (`2010 · 21 · 5000+ · 1000+`); prose reads "…now work at uhlive…", "…lives at jeromeabel.net…", "…maintained La Malinette…", "…first on Framagit, now on GitHub…" with a space before every link (no "onFramagit").

- [ ] **Step 5: Commit**

```bash
git add src/components/about/AboutFacts.astro src/components/about/AboutText.astro
git commit -m "fix(about): drop role-specific PR stat and fix inline-link spacing"
```

### Task 4: Enlarge link hit areas (Link.astro)

**Files:**

- Modify: `src/components/ui/Link.astro:11-12,18-19`

Spec §2: `default` and `secondary` text variants need ≥44px touch targets. `secondary` already has `py-4` (comfortable) — add `min-h-11`. `default` is a thin inline underline — give it a pseudo-element hit area so surrounding tap zone grows without shifting layout.

**Interfaces:**

- Produces: unchanged `Link` public API (`label`, `variant`, `icon`, `href`, `class`).

- [ ] **Step 1: Update the `default` variant**

In `linkVariants`, change the `default` entry to add an inline-flex baseline and a pseudo hit area:

```astro
      default:
        "relative inline-flex items-center border-dashed border-current border-b max-w-fit hover:border-solid hover:text-foreground after:absolute after:-inset-y-2 after:-inset-x-1 after:content-['']",
```

- [ ] **Step 2: Update the `secondary` variant**

Add `min-h-11` to the `secondary` entry:

```astro
      secondary:
        "min-h-11 max-w-fit border-foreground text-foreground flex py-4 justify-between items-center gap-2 rounded-full border w-full px-6 text-xl hover:bg-muted-background",
```

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 4: Visual check (no regression)**

Run: `pnpm dev`. Check footer links (`default` variant) and the "All posts"/"All work" buttons (`secondary`).
Expected: footer underline links look identical but have a larger clickable zone (hover slightly outside the text still triggers); secondary buttons unchanged visually. Confirm the `default` `after` overlay doesn't block sibling links (dashed underline still individually clickable in the footer row).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Link.astro
git commit -m "fix(ui): enlarge tap targets on default and secondary link variants"
```

### Task 5: WorkMiniCard — bare tile + retina widths

**Files:**

- Modify: `src/components/work/WorkMiniCard.astro:19,27-28`
- Review only: `src/components/work/WorkCard.astro:41-42`

Spec §9: drop the border/padding box (bare image tile + title); fix retina blur — tiles render ~220–280px CSS, so serve 2× candidates.

**Interfaces:** none changed.

- [ ] **Step 1: Remove the box and update image widths/sizes**

In `src/components/work/WorkMiniCard.astro`, change the anchor class (line 19) from the bordered/padded box to a bare tile:

```astro
  class="group flex flex-col gap-2 outline-offset-4 outline-black focus:outline-2 dark:outline-white"
```

Then update the `<Image>` `widths` and `sizes` (lines 27–28):

```astro
      widths={[160, 240, 320, 480, 640]}
      sizes="(max-width: 767px) calc((100vw - 3rem) / 2), 280px"
```

- [ ] **Step 2: Sanity-check WorkCard sizes (no change unless blur)**

Read `src/components/work/WorkCard.astro:41-42`. It already serves `widths={[240, 360, 540, 768, 960]}` up to 960px against a max ~395px display slot — that is ≥2× and needs no change. Leave as-is.

- [ ] **Step 3: Verify source images are large enough**

Run: `for f in src/content/work/*/preview*.{png,jpg,jpeg,webp}; do [ -f "$f" ] && identify -format "%f %wx%h\n" "$f" 2>/dev/null; done`
Expected: each preview source ≥ 640px on its shortest side (2× the 320 tile candidate). If `identify` is unavailable, open one preview in the browser dev tools and confirm intrinsic width ≥ 640. Note any undersized source in the commit body; do not upscale.

- [ ] **Step 4: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 5: Visual check**

Run: `pnpm dev`, open `localhost:4321` (home Works strip) and `localhost:4321/work`.
Expected: mini cards are bare image tiles with a title underneath, no border box; images are crisp on a retina display / at browser zoom 200%.

- [ ] **Step 6: Commit**

```bash
git add src/components/work/WorkMiniCard.astro
git commit -m "fix(work): bare-tile WorkMiniCard with retina-safe image widths"
```

---

## Phase B — Home hero + writing section

### Task 6: Hero rewrite — new copy, envelope icon, centered scroll cue

**Files:**

- Modify: `src/components/hero/HeroText.astro`
- Modify: `src/components/hero/HeroSocials.astro`
- Modify: `src/components/hero/Hero.astro`
- Modify: `src/components/blog/SelectedWriting.astro:13` (add `scroll-mt`)

Spec §1 + §2: H1 drops surname; new craft-focused copy; no framework names. Mailto CTA becomes an envelope icon in `HeroSocials`. The single text CTA leaves the text column and becomes a centered scroll cue at the bottom of the hero box (`↓ Start reading` → `#writing`), inside the `lg:h-[500px]` section so it stays above the fold. Add `scroll-mt-16` to `#writing`.

**Interfaces:**

- Consumes: `Link` (`variant="icon"`), `astro-icon` `Icon`.
- Produces: hero markup with a single scroll anchor targeting `#writing`.

- [ ] **Step 1: Rewrite HeroText copy and remove the inline CTA**

Replace the body of `src/components/hero/HeroText.astro` with (drop the `Link` import and the `#writing` Link block):

```astro
---
import HeroSocials from "@components/hero/HeroSocials.astro";
---

<div class="flex-1 lg:flex-2 xl:flex-1" role="presentation">
  <div class="flex flex-col justify-center gap-2 text-balance md:gap-4">
    <h1 class="font-title text-2xl tracking-wide md:text-4xl lg:text-5xl">
      Hi, I'm Jérôme.
    </h1>
    <p
      class="text-lg sm:text-pretty md:text-xl md:tracking-wide xl:text-2xl xl:leading-tight"
    >
      I've been making things with code since 2010 — robotic drum orchestras,
      audio tools, open-source frameworks, and now web applications. Here I
      write about the craft of building them well.
    </p>
    <HeroSocials />
  </div>
</div>
```

- [ ] **Step 2: Turn the mailto CTA into an envelope icon in HeroSocials**

Replace `src/components/hero/HeroSocials.astro` with (envelope icon first, matching GitHub/LinkedIn icon variant):

```astro
---
import Link from "@components/ui/Link.astro";
---

<div class="mt-6 flex items-center gap-4 lg:mt-10 lg:gap-6">
  <Link
    label="Email"
    href="mailto:dev@jeromeabel.net"
    icon="lucide:mail"
    variant="icon"
  />
  <Link
    label="Github"
    href="https://github.com/jeromeabel"
    icon="fa6-brands:github"
    variant="icon"
  />
  <Link
    label="LinkedIn"
    href="https://www.linkedin.com/in/jerome-abel/"
    icon="fa6-brands:linkedin-in"
    variant="icon"
  />
</div>
```

- [ ] **Step 3: Add the centered scroll cue to the hero box**

Replace `src/components/hero/Hero.astro` with (make the section `relative`, add a bottom-centered anchor):

```astro
---
import HeroAnimation from "@components/hero/HeroAnimation.astro";
import HeroText from "@components/hero/HeroText.astro";
import { Icon } from "astro-icon/components";
---

<section
  class="container relative my-16 flex items-center gap-8 md:my-32 lg:h-[500px]"
>
  <HeroText />
  <HeroAnimation />
  <a
    href="#writing"
    class="text-muted hover:text-foreground absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 py-2 transition-colors"
  >
    <Icon name="lucide:arrow-down" />
    Start reading
  </a>
</section>
```

- [ ] **Step 4: Add scroll-margin to the `#writing` anchor target**

In `src/components/blog/SelectedWriting.astro`, add `scroll-mt-16` to the section (line 13):

```astro
<section id="writing" class="container flex scroll-mt-16 flex-col gap-4 lg:gap-8">
```

- [ ] **Step 5: Build + format**

Run: `pnpm build && pnpm format:write && pnpm format:check`
Expected: passes.

- [ ] **Step 6: Visual check**

Run: `pnpm dev`, open `localhost:4321`.
Expected: H1 reads "Hi, I'm Jérôme."; paragraph has no framework names; three round icon buttons (envelope, GitHub, LinkedIn); a centered "↓ Start reading" cue sits at the bottom of the hero area. Click it → smooth-scrolls to the writing section, which lands ~16 (4rem) below the viewport top, not glued to it.

- [ ] **Step 7: Commit**

```bash
git add src/components/hero/HeroText.astro src/components/hero/HeroSocials.astro src/components/hero/Hero.astro src/components/blog/SelectedWriting.astro
git commit -m "feat(hero): craft-focused copy, envelope icon, centered scroll cue"
```

### Task 7: "Start here" writing section — posts as line items

**Files:**

- Modify: `src/components/blog/SelectedWriting.astro`
- Remove: `src/components/blog/PostCard.astro`

Spec §3 + §4: heading "Start here" (replaces "Selected Writing"); delete the redundant intro sentence; **series stay `SerieCard`**, **posts switch to `PostListItem`** (line style). `PostCard` becomes orphaned → delete.

**Interfaces:**

- Consumes: `getFeaturedSeries`, `getFeaturedPosts` (unchanged), `SerieCard`, `PostListItem`.

- [ ] **Step 1: Rewrite SelectedWriting**

Replace `src/components/blog/SelectedWriting.astro` with:

```astro
---
import PostListItem from "@components/blog/PostListItem.astro";
import SerieCard from "@components/blog/SerieCard.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import { getFeaturedPosts, getFeaturedSeries } from "src/utils/repository";

const series = (await getFeaturedSeries()).slice(0, 2);
const posts = await getFeaturedPosts(2);
---

<section id="writing" class="container flex scroll-mt-16 flex-col gap-4 lg:gap-8">
  <H2>Start here</H2>
  <div class="grid gap-4 md:grid-cols-2 lg:gap-8">
    {series.map((serie) => <SerieCard {serie} />)}
  </div>
  <div class="border-muted-border mt-4 border-t">
    {posts.map((post) => <PostListItem {post} />)}
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

- [ ] **Step 2: Delete the orphaned PostCard**

Run: `grep -rn "PostCard" src` — Expected: no matches after the SelectedWriting rewrite.
Then: `git rm src/components/blog/PostCard.astro`

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes (no dangling import to deleted PostCard).

- [ ] **Step 4: Visual check**

Run: `pnpm dev`, open `localhost:4321`.
Expected: section heading "Start here", no intro sentence; two series cards (with "Series" kicker) on top; two featured posts render as arrow-animated line items (not boxed cards); "All posts" button below.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/SelectedWriting.astro
git commit -m "feat(home): rename writing section to Start here, posts as line items"
```

---

## Phase C — Blog page + schema

### Task 8: Optional `updated` badge + `topic` tag on line items

**Files:**

- Modify: `src/content.config.ts:9-18` (PostSchema)
- Modify: `src/components/blog/PostListItem.astro`

Spec §3 (updated badge, never reorders) + §6 (optional topic tag). Both fields are **optional** — items without them render exactly as today.

**Interfaces:**

- Produces: `post.data.updated?: Date`, `post.data.topic?: string` on `post` and `seriePost` entries.

- [ ] **Step 1: Add optional fields to PostSchema**

In `src/content.config.ts`, extend `PostSchema` (shared by `post` and `seriePost`):

```ts
const PostSchema = ({ image }: { image: ImageFunction }) =>
  z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    topic: z.string().optional(),
    description: z.string(),
    abstract: z.string(),
    draft: z.boolean().default(true),
    featured: z.number().int().positive().optional(),
    img: image().optional(),
  });
```

- [ ] **Step 2: Render the badge + tag in PostListItem**

Replace `src/components/blog/PostListItem.astro` with:

```astro
---
import { Icon } from "astro-icon/components";
import type { CollectionEntry } from "astro:content";
import { getFormattedDate } from "src/utils/format-date";
import { getMinutesReadFromBody } from "src/utils/get-minutes-read";

interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
}

const { post } = Astro.props;

if (!post) {
  throw new Error("Sorry, could not find post");
}

const minutesRead = getMinutesReadFromBody(post.body);
const updatedLabel = post.data.updated
  ? new Date(post.data.updated).toLocaleDateString("en-EN", {
      year: "numeric",
      month: "short",
    })
  : null;
---

<a
  href=`/blog/${post.id}`
  class="border-muted-border hover:bg-muted-background group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4"
>
  <Icon
    name="lucide:arrow-right"
    class="text-muted absolute -translate-x-8 transition-transform group-hover:translate-x-2"
  />
  <h3 class="flex-1 transition-transform group-hover:translate-x-8">
    {post.data.title}
    {
      updatedLabel && (
        <span class="text-muted ms-2 font-mono text-xs">
          · updated {updatedLabel}
        </span>
      )
    }
  </h3>
  <div class="text-muted flex items-center gap-2 font-mono text-xs md:text-sm">
    {post.data.topic && <span class="hidden md:inline">{post.data.topic}</span>}
    {minutesRead && <p class="hidden sm:block">{minutesRead} -</p>}
    <time>{getFormattedDate(post.data.date)}</time>
  </div>
</a>
```

Note: the `Props` type widens to accept `seriePost` too (Task 9 feeds merged entries through this component). `updated` never affects sort order — it is display-only; ordering stays by `date`.

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes (all existing content lacks `updated`/`topic`, so nothing renders yet).

- [ ] **Step 4: Smoke-test rendering with a temporary field**

Temporarily add `topic: "Performance"` and `updated: 2026-06-01` to one post's frontmatter under `src/content/post/`, run `pnpm dev`, open `localhost:4321/blog` (or home).
Expected: that item shows a right-aligned `Performance` tag (≥md) and a `· updated Jun 2026` badge next to the title. **Revert the temporary frontmatter before committing.**

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/components/blog/PostListItem.astro
git commit -m "feat(blog): optional updated badge and topic tag on post line items"
```

### Task 9: Blog page — Latest-first merged list with year separators

**Files:**

- Modify: `src/pages/blog.astro`
- Remove: `src/components/blog/PostList.astro`, `src/components/blog/SerieList.astro`, `src/components/blog/SerieListItem.astro`

Spec §6: lead with **"Latest"** — one merged reverse-chron list (`getAllBlogPosts()`, posts + serie posts interleaved) in `PostListItem` style, with year separators (mono, muted). **"Series"** section below with the two series cards (`SerieCard`).

**Interfaces:**

- Consumes: `getAllBlogPosts()` → `(CollectionEntry<"post"> | CollectionEntry<"seriePost">)[]` sorted date desc; `getFeaturedSeries()`; `PostListItem`; `SerieCard`.

- [ ] **Step 1: Rewrite blog.astro**

Replace `src/pages/blog.astro` with:

```astro
---
import PostListItem from "@components/blog/PostListItem.astro";
import SerieCard from "@components/blog/SerieCard.astro";
import H1 from "@components/ui/H1.astro";
import H2 from "@components/ui/H2.astro";
import P from "@components/ui/P.astro";
import Layout from "@layouts/Layout.astro";
import { getAllBlogPosts, getFeaturedSeries } from "src/utils/repository";

const posts = await getAllBlogPosts();
const series = await getFeaturedSeries();

// Group the already-date-desc list into year buckets, preserving order.
const byYear: { year: number; posts: typeof posts }[] = [];
for (const post of posts) {
  const year = post.data.date.getFullYear();
  const bucket = byYear.at(-1);
  if (bucket && bucket.year === year) bucket.posts.push(post);
  else byYear.push({ year, posts: [post] });
}
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
      <H2>Latest</H2>
      <div class="mt-8 flex flex-col gap-8">
        {
          byYear.map((group) => (
            <div>
              <p class="text-muted mb-2 font-mono text-sm">{group.year}</p>
              <div class="border-muted-border border-t">
                {group.posts.map((post) => (
                  <PostListItem {post} />
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </section>

    {
      series.length > 0 && (
        <section>
          <H2>Series</H2>
          <div class="mt-8 grid gap-4 md:grid-cols-2 lg:gap-8">
            {series.map((serie) => (
              <SerieCard {serie} />
            ))}
          </div>
        </section>
      )
    }
  </main>
</Layout>
```

- [ ] **Step 2: Delete the orphaned list components**

Run: `grep -rn "PostList\b\|SerieList\b\|SerieListItem" src` — Expected: no matches after the rewrite.
Then:

```bash
git rm src/components/blog/PostList.astro src/components/blog/SerieList.astro src/components/blog/SerieListItem.astro
```

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 4: Visual check**

Run: `pnpm dev`, open `localhost:4321/blog`.
Expected: "Latest" section first — a single merged list where standalone posts and serie posts interleave by date, grouped under mono/muted year headers (newest year first); "Series" section below with the featured series cards. Serie-post line items link to their `/blog/<serie>/<post>` URL.

- [ ] **Step 5: Verify serie-post links resolve**

Click a serie-post line item.
Expected: navigates to the serie post page (route `/blog/[serie]/[post]`), not a 404. (`post.id` for `seriePost` entries includes the serie segment.)

- [ ] **Step 6: Commit**

```bash
git add src/pages/blog.astro
git commit -m "feat(blog): latest-first merged timeline with year separators"
```

---

## Phase D — Work page (Selected work + Archive)

### Task 10: Work schema `kicker` + archive query (additive only)

**Files:**

- Modify: `src/content.config.ts:42-63` (work schema)
- Modify: `src/utils/repository.ts:47-54` (add `getArchiveWorks` — keep era code for now)

Spec §7: add an optional `kicker` (the "Art · 2013–2019" style year+type line) to work; add a flat archive query. This task is **purely additive** — the old `getEarlierWorksByEra`/`WORK_ERAS` stay until Task 13 removes them together with their last caller (`work.astro`), so the build never has a dangling import.

**Interfaces:**

- Produces: `work.data.kicker?: string`; `getArchiveWorks()` → non-featured works, date desc.

- [ ] **Step 1: Add optional `kicker` to the work schema**

In `src/content.config.ts`, add one line inside the `work` schema object (after `type`):

```ts
      type: z.string(),
      kicker: z.string().optional(),
```

- [ ] **Step 2: Add `getArchiveWorks` (leave era code in place)**

In `src/utils/repository.ts`, add — do **not** delete `WORK_ERAS`/`getEarlierWorksByEra` yet:

```ts
export const getArchiveWorks = async () =>
  (await getCollection("work"))
    .filter((work) => work.data.featured === undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes (nothing removed; `getEarlierWorksByEra` still imported by `work.astro`).

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/utils/repository.ts
git commit -m "feat(work): add kicker field and flat archive query"
```

### Task 11: Reassign featured works + add kickers (spec §7 — see Decision flag)

**Files:**

- Modify frontmatter in:
  - `src/content/work/chimeres-orchestra/index.md`
  - `src/content/work/malinette/index.md`
  - `src/content/work/leconceptdelapreuve/index.md`
  - `src/content/work/portfolio/index.md`
  - `src/content/work/logariat/index.md`

Target Selected work set + order (spec §7): Chimères (1), La Malinette (2), Le Concept de la Preuve (3), Portfolio (4). Logariat drops to Archive. Kickers per spec.

**Interfaces:** consumes `getFeaturedWorks()` (unchanged sort: featured asc, then date desc).

- [ ] **Step 1: chimeres-orchestra — rank 1 + kicker**

Set `featured: 1` (was 3) and add `kicker: "Art · 2013–2019"`.

- [ ] **Step 2: malinette — add rank 2 + kicker**

Add `featured: 2` and `kicker: "Open source · 2013–2021"` (currently has no `featured`).

- [ ] **Step 3: leconceptdelapreuve — rank 3 + kicker**

Set `featured: 3` (was 1) and add `kicker: "Web · 2023"`.

- [ ] **Step 4: portfolio — rank 4 + kicker**

Set `featured: 4` (was 2) and add `kicker: "Web · 2024–now"`.

- [ ] **Step 5: logariat — remove featured**

Delete the `featured: 4` line from `src/content/work/logariat/index.md` frontmatter (moves it to Archive).

- [ ] **Step 6: Verify the featured set resolves as expected**

Run: `grep -rl "^featured:" src/content/work/*/index.md`
Expected: exactly four files — chimeres-orchestra, malinette, leconceptdelapreuve, portfolio.

- [ ] **Step 7: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes (schema accepts new optional `kicker`).

- [ ] **Step 8: Commit**

```bash
git add src/content/work/chimeres-orchestra/index.md src/content/work/malinette/index.md src/content/work/leconceptdelapreuve/index.md src/content/work/portfolio/index.md src/content/work/logariat/index.md
git commit -m "content(work): promote Malinette to selected work, demote Logariat, add kickers"
```

### Task 12: Show the kicker on WorkCard

**Files:**

- Modify: `src/components/work/WorkCard.astro:58-62`

Spec §7: Selected-work cards carry a "year + type kicker".

**Interfaces:** consumes `work.data.kicker?`.

- [ ] **Step 1: Render the kicker above the title**

In `src/components/work/WorkCard.astro`, inside the text `<div>` (line 58 block), add the kicker before the title `<p>`:

```astro
  <div class="flex flex-col p-6 md:flex-1 lg:flex-auto lg:p-8">
    {
      work.data.kicker && (
        <p class="text-muted font-mono text-xs tracking-wide uppercase">
          {work.data.kicker}
        </p>
      )
    }
    <p class="font-title text-3xl tracking-wide">
      {work.data.title}
    </p>
```

- [ ] **Step 2: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 3: Visual check** (after Task 13 the page shows these)

Run: `pnpm dev`, open `localhost:4321/work`.
Expected: each Selected-work card shows a small mono/uppercase kicker (e.g. "Art · 2013–2019") above the title.

- [ ] **Step 4: Commit**

```bash
git add src/components/work/WorkCard.astro
git commit -m "feat(work): show year+type kicker on selected-work cards"
```

### Task 13: Work page — Selected work + Archive table

**Files:**

- Create: `src/components/work/ArchiveTable.astro`
- Modify: `src/pages/work.astro`

Spec §7: **"Selected work"** section (replaces "Featured") = `getFeaturedWorks()` in `WorkCard`. **"Archive"** table replaces the era-grouped mini-card sections: columns Year | Project | Type | Built with | Link, one line per project, external links (`live` → `website` → `git`), no detail pages linked.

**Interfaces:**

- Consumes: `getFeaturedWorks()`, `getArchiveWorks()` (Task 10), `WorkCard`.
- ArchiveTable Props: `{ works: CollectionEntry<"work">[] }`.

- [ ] **Step 1: Create ArchiveTable**

Create `src/components/work/ArchiveTable.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  works: CollectionEntry<"work">[];
}

const { works } = Astro.props;

const externalUrl = (data: CollectionEntry<"work">["data"]) =>
  data.live || data.website || data.git || "";
---

<div class="mt-8 overflow-x-auto">
  <table class="w-full border-collapse text-sm md:text-base">
    <thead>
      <tr class="text-muted border-muted-border border-b text-left font-mono text-xs uppercase">
        <th class="py-2 pr-4 font-normal">Year</th>
        <th class="py-2 pr-4 font-normal">Project</th>
        <th class="hidden py-2 pr-4 font-normal sm:table-cell">Type</th>
        <th class="hidden py-2 pr-4 font-normal md:table-cell">Built with</th>
        <th class="py-2 font-normal">Link</th>
      </tr>
    </thead>
    <tbody>
      {
        works.map((work) => {
          const url = externalUrl(work.data);
          return (
            <tr class="border-muted-border hover:bg-muted-background/50 border-b align-top">
              <td class="text-muted py-3 pr-4 font-mono text-xs whitespace-nowrap">
                {work.data.date.getFullYear()}
              </td>
              <td class="py-3 pr-4 font-semibold">{work.data.title}</td>
              <td class="text-muted hidden py-3 pr-4 sm:table-cell">
                {work.data.type}
              </td>
              <td class="text-muted hidden py-3 pr-4 font-mono text-xs md:table-cell">
                {work.data.stack?.join(", ") ?? "—"}
              </td>
              <td class="py-3">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    class="border-current border-b border-dashed hover:border-solid"
                  >
                    Visit
                  </a>
                ) : (
                  <span class="text-muted">—</span>
                )}
              </td>
            </tr>
          );
        })
      }
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Rewrite work.astro**

Replace `src/pages/work.astro` with:

```astro
---
import ArchiveTable from "@components/work/ArchiveTable.astro";
import H1 from "@components/ui/H1.astro";
import H2 from "@components/ui/H2.astro";
import Link from "@components/ui/Link.astro";
import P from "@components/ui/P.astro";
import WorkCard from "@components/work/WorkCard.astro";
import Layout from "@layouts/Layout.astro";
import { getArchiveWorks, getFeaturedWorks } from "src/utils/repository";

const selected = await getFeaturedWorks();
const archive = await getArchiveWorks();
---

<Layout page="Work">
  <main class="container flex flex-col gap-16 py-8 md:gap-24 lg:py-24">
    <header class="flex w-full flex-col gap-4 lg:w-2/3 lg:gap-8">
      <H1>Work</H1>
      <P>
        Fifteen years of open work — art systems, tools, experiments — where you
        can see how I think. What I build at work is private; <Link
          href="/blog"
          label="the writing"
        /> covers how I build now.
      </P>
    </header>

    <section>
      <H2>Selected work</H2>
      <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {selected.map((work) => <WorkCard {work} />)}
      </div>
    </section>

    <section>
      <H2>Archive</H2>
      <ArchiveTable works={archive} />
    </section>
  </main>
</Layout>
```

- [ ] **Step 3: Remove the now-orphaned era code**

`work.astro` was the last caller of `getEarlierWorksByEra`. In `src/utils/repository.ts`, delete `WORK_ERAS` (the `const WORK_ERAS = [...]` block) and the entire `getEarlierWorksByEra` function.

Run: `grep -rn "getEarlierWorksByEra\|WORK_ERAS\|WorkMiniCard" src`
Expected: no matches (WorkMiniCard is still used by the home `WorksStrip` — if it appears there, that is expected; only `work.astro` should have dropped it). Re-run narrowed: `grep -rn "getEarlierWorksByEra\|WORK_ERAS" src` → no matches.

- [ ] **Step 4: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes (no dangling import).

- [ ] **Step 5: Visual check**

Run: `pnpm dev`, open `localhost:4321/work`.
Expected: "Selected work" shows four `WorkCard`s (Chimères, La Malinette, Le Concept de la Preuve, Portfolio) with kickers; "Archive" is a single table — Year | Project | Type | Built with | Link — one row per non-featured work (incl. Logariat), newest first, "Visit" links open external targets in a new tab, "Built with" shows the `stack` list or "—". Table scrolls horizontally on narrow viewports without pushing the page body sideways.

- [ ] **Step 6: Commit**

```bash
git add src/components/work/ArchiveTable.astro src/pages/work.astro src/utils/repository.ts
git commit -m "feat(work): tiered Selected work + Archive table, retire era grouping"
```

---

## Phase E — Case-study content (trailing, can land later)

### Task 14: Write case-study bodies for the three flagship projects

**Files:**

- Modify (markdown body only): `src/content/work/chimeres-orchestra/index.md`, `src/content/work/malinette/index.md`, `src/content/work/leconceptdelapreuve/index.md`

Spec §7: detail pages for Selected work follow the case-study structure: **problem → constraints → process/decisions → outcome → learnings**. This is content work with no code surface; it can trail the layout. (Portfolio's own page can stay lighter — it's the "optional 4th".)

**Interfaces:** none (markdown rendered by existing `src/pages/work/[id].astro` via `<Content />`).

- [ ] **Step 1: Draft each case study**

For each of the three files, write the markdown body under the existing frontmatter using these five H2 sections, in the author's voice:

```markdown
## The problem
<what was being solved and for whom>

## Constraints
<budget, tech, timeline, physical/exhibition, or open-source constraints>

## Process & decisions
<key technical/design decisions and why — the reasoning worth showing>

## Outcome
<what shipped: exhibitions, downloads, users, links>

## Learnings
<what you'd keep or change; what it taught you>
```

Keep prose tight; link to `git`/`website`/`live` where relevant (those already exist in frontmatter). No new images required (spec: no image generation now).

- [ ] **Step 2: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 3: Visual check**

Run: `pnpm dev`, open `localhost:4321/work/chimeres-orchestra` (and the other two).
Expected: each renders the five case-study sections in order under the hero image.

- [ ] **Step 4: Commit (one per project, or one batched)**

```bash
git add src/content/work/chimeres-orchestra/index.md
git commit -m "content(work): case study for Chimères Orchestra"
# repeat for malinette, leconceptdelapreuve
```

---

## Phase F — About career strip

### Task 15: Compact 5-dot career timeline on the About page

**Files:**

- Create: `src/components/about/AboutTimeline.astro`
- Modify: `src/components/about/AboutText.astro` (insert the component after `<AboutFacts />`)

Spec §7 _(promoted from backlog at user request)_: a compact 5-dot career strip — the timeline idea at the scale where it works. Milestones derived from the bio (open-source since 2010; over a decade in software arts; web reconversion via Raccourci; now frontend at uhlive). Dates are editable content, not load-bearing.

**Interfaces:**

- Consumes: nothing (static milestone list local to the component).

- [ ] **Step 1: Create AboutTimeline**

Create `src/components/about/AboutTimeline.astro`:

```astro
---
const milestones = [
  { year: "2010", label: "Open source & software arts" },
  { year: "2013", label: "Interactive art & research" },
  { year: "2021", label: "Frameworks & teaching" },
  { year: "2022", label: "Web reconversion" },
  { year: "2024", label: "Frontend @ uhlive" },
];
---

<ol
  class="border-muted-border grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-6 sm:grid-cols-3 lg:grid-cols-5"
>
  {
    milestones.map((m) => (
      <li class="flex flex-col gap-1">
        <span
          class="bg-foreground inline-block h-2 w-2 rounded-full"
          aria-hidden="true"
        />
        <span class="font-title text-xl tracking-wide">{m.year}</span>
        <span class="text-muted text-sm">{m.label}</span>
      </li>
    ))
  }
</ol>
```

- [ ] **Step 2: Insert it into AboutText after the stat row**

In `src/components/about/AboutText.astro`, add the import and place the component between `<AboutFacts />` and the `Download CV` link:

```astro
---
import AboutFacts from "@components/about/AboutFacts.astro";
import AboutTimeline from "@components/about/AboutTimeline.astro";
import H1 from "@components/ui/H1.astro";
import Link from "@components/ui/Link.astro";
import Prose from "@components/ui/Prose.astro";
import { Icon } from "astro-icon/components";
---
```

and:

```astro
  <AboutFacts />

  <AboutTimeline />

  <Link
    label="Download CV"
    href="/CV_JeromeAbel_en.pdf"
    icon="lucide:download"
    variant="external"
  />
```

- [ ] **Step 3: Build + format**

Run: `pnpm build && pnpm format:check`
Expected: passes.

- [ ] **Step 4: Visual check**

Run: `pnpm dev`, open `localhost:4321/about`.
Expected: below the 4-stat row, a compact strip of 5 dots each with a year + one-line label; wraps to 2 columns on mobile, 5 across on desktop; readable in light and dark.

- [ ] **Step 5: Commit**

```bash
git add src/components/about/AboutTimeline.astro src/components/about/AboutText.astro
git commit -m "feat(about): compact 5-dot career timeline"
```

---

## Self-Review

**Spec coverage:**

- §1 Hero copy → Task 6. §2 CTA/socials/scroll-mt/hit-area → Tasks 6 (cue, envelope, scroll-mt) + 4 (Link hit area). §3 "Start here" heading, drop intro, updated badge, ordering → Tasks 7 + 8. §4 series-as-cards / posts-as-line-items / "Series" label / remove PostCard → Tasks 1, 7. §5 footer order → Task 2. §6 blog flip+merge, year separators, updated badge, topic tag → Tasks 8, 9 (covers kept per constraint; illustration system is backlog, correctly omitted). §7 Selected work + Archive, kickers, retire era grouping → Tasks 10–13; §7 career strip _(promoted from backlog)_ → Task 15. §8 drop 185 stat + `{" "}` spacing → Task 3. §9 WorkMiniCard bare tile + retina widths → Task 5. §10 CV → separate plan (out of scope), noted. Illustration system → separate plan (out of scope); direction captured below.
- All spec sections map to a task; no gaps.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N" — every code step carries full content. Task 14 is intentionally content-authoring (structure given, prose is the author's); it is not a code placeholder.

**Type consistency:** `getArchiveWorks` defined in Task 10, consumed in Task 13. `kicker` added in Task 10, set in Task 11, rendered in Task 12/13. `updated`/`topic` added in Task 8, rendered in Task 8's PostListItem, consumed by merged list in Task 9. `PostListItem` Props widened to `post | seriePost` in Task 8 before Task 9 feeds it serie posts. External-link precedence (`live → website → git`) consistent in ArchiveTable.

**Ordering (resolved):** Task 10 is additive only — it adds `getArchiveWorks` and keeps `getEarlierWorksByEra`/`WORK_ERAS` in place. The era code is removed in Task 13 Step 3, immediately after `work.astro` (its last caller) is rewritten in Task 13 Step 2. Every intermediate build stays green; no dangling-import window exists.
