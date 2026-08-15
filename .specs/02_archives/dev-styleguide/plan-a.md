# Plan A — Foundation + live v3 component stories

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install astrobook as a dev-only integration and story every live v3 visual component (~46) in an isolated catalog at `/styleguide`.

**Architecture:** astrobook is an Astro integration mounted only when `NODE_ENV === 'development'`, so it has zero production footprint. Each component gets a colocated `*.stories.ts` file that renders it with real content-collection data pulled through `src/utils/repository.ts`, or an inline fixture where no helper fits. `satisfies ComponentProps<typeof X>` on every `args` gives build-time prop-drift detection.

**Tech Stack:** Astro 5, astrobook 0.13.2, Tailwind v4, pnpm.

## Global Constraints

- astrobook **0.13.2**, installed with `pnpm add -D astrobook` (dev dependency only).
- Integration is mounted **only** in development: `process.env.NODE_ENV === 'development' ? astrobook({ subpath: '/styleguide' }) : null`, with the `null` filtered from the integrations array. Prod `pnpm build` MUST emit no `/styleguide` route.
- Do **not** touch the custom markdown `processor` block in `astro.config.mjs`; integrations compose independently.
- Story files are colocated: `Foo.astro` → `Foo.stories.ts` in the same directory.
- Import components with **relative** paths (`./Link.astro`); import repository helpers relatively (`../../utils/repository`) — the `@components/*` alias also works but stories stay relative for portability.
- Every `args` object ends with `satisfies ComponentProps<typeof Component>`.
- Skip `src/components/app/SEO.astro` (renders `<head>` only, nothing to preview).
- The 3 known dead components (`hero/HeroImage`, `about/AboutValues`, `contact/ContactNoise`) ARE storied — they render in the catalog for the delete-vs-adopt review.
- Repository helpers available: `getAllBlogPosts`, `getAllStandalonePosts`, `getAllSeriePosts`, `getAllSeries`, `getFeaturedSeries`, `getFeaturedWorks`, `getArchiveWorks`, `getPostsFromSerie`, `getSerieStats`, `getLatestWriting`.

---

### Task 1: Install astrobook + wire dev-only integration

**Files:**

- Modify: `package.json` (devDependencies)
- Modify: `astro.config.mjs`
- Modify: `.gitignore`

**Interfaces:**

- Produces: a mounted `/styleguide` route in dev; the `astrobook()` integration import used by no other task.

- [x] **Step 1: Install the package**

Run: `pnpm add -D astrobook`
Expected: `astrobook 0.13.2` added under `devDependencies` in `package.json`.

- [x] **Step 2: Import and conditionally mount the integration**

In `astro.config.mjs`, add the import at the top with the other integration imports:

```js
import astrobook from 'astrobook';
```

In the `integrations: [...]` array, append the conditional entry as the **last** element (after all existing integrations, leaving the `processor`/markdown config untouched):

```js
integrations: [
  // …existing integrations, unchanged…
  process.env.NODE_ENV === 'development'
    ? astrobook({ subpath: '/styleguide' })
    : null,
].filter(Boolean),
```

If the array is already wrapped in `.filter(Boolean)` leave one; if not, add it so the `null` is dropped in prod.

- [x] **Step 3: Gitignore any new artifact dir**

Confirm `.gitignore` already covers `dist/` and `.astro/`. astrobook writes into `.astro/` — no new entry needed. If `pnpm dev` creates any other top-level dir, add it. Leave a note in the commit if so.

- [x] **Step 4: Verify dev route mounts**

Run: `pnpm dev` (background), then `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/styleguide`
Expected: `200`.

- [x] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs .gitignore
git commit -m "chore(styleguide): add astrobook dev-only integration"
```

---

### Task 2: Phase-1 render gate — story `Link`, verify the whole approach

**This is a HARD GATE.** If any check fails and no small fix exists via astrobook's `css`/`head` options, STOP and fall back to a hand-rolled `styleguide.astro` (see base design). Do not story anything else until every check below passes.

**Files:**

- Create: `src/components/ui/Link.stories.ts`
- Test: manual render at `http://localhost:4321/styleguide`

**Interfaces:**

- Produces: the canonical story idiom (`export default { component }` + named `args` exports with `satisfies ComponentProps`) that Tasks 3–9 copy.

- [x] **Step 1: Write the `Link` story**

`Link` uses `class-variance-authority` variants (`default`, `bold`, `cta`, `icon`, `secondary`, `external`, `menuActive`, …) and `astro-icon`. Story a representative spread:

```ts
import type { ComponentProps } from 'astro/types';
import Link from './Link.astro';

export default { component: Link };

export const Default = {
  args: { href: '#', variant: 'default' } satisfies ComponentProps<typeof Link>,
};
export const Cta = {
  args: { href: '#', variant: 'cta' } satisfies ComponentProps<typeof Link>,
};
export const IconButton = {
  args: { href: '#', variant: 'icon', 'aria-label': 'Menu' } satisfies ComponentProps<typeof Link>,
};
export const Secondary = {
  args: { href: '#', variant: 'secondary' } satisfies ComponentProps<typeof Link>,
};
export const External = {
  args: { href: 'https://example.com', variant: 'external' } satisfies ComponentProps<typeof Link>,
};
```

If `Link` renders its label via a slot rather than an arg, astrobook renders the component with empty children — add a `default` slot value if astrobook's API supports it in this version; otherwise note that slot content is not previewable and the variant chrome is still verifiable.

- [x] **Step 2: Verify the render gate (all four must pass)**

Run: `pnpm dev`, open `http://localhost:4321/styleguide`, click into the `Link` stories. Confirm:

- (a) **Global CSS + `@theme` tokens resolve** — the CTA pill has `bg-foreground`/`text-background` colors, not unstyled defaults.
- (b) **`astro-icon` icons render** — the icon variant shows its glyph, not a broken box.
- (c) **Dark mode works or is at least not broken** — toggling `.dark` on `<html>` (devtools) recolors tokens.
- (d) **Prod build emits no `/styleguide`**: run `pnpm build` then `test ! -e dist/styleguide && echo "GATE-OK: no styleguide route"`. Expected: `GATE-OK`.

- [x] **Step 3: If gate passes, commit; if it fails, STOP**

```bash
git add src/components/ui/Link.stories.ts
git commit -m "feat(styleguide): Link story + phase-1 render gate passing"
```

---

### Task 3: `ui/` primitive stories

**Files:**

- Create: `src/components/ui/H1.stories.ts`, `H2.stories.ts`, `P.stories.ts`, `Prose.stories.ts`, `LinkNavPost.stories.ts`, `CustomImage.stories.ts`, `SocialShare.stories.ts`

**Interfaces:**

- Consumes: story idiom from Task 2.

- [x] **Step 1: Write text-primitive stories**

For `H1`, `H2`, `P` (they render slot text), story the component with the props their `Props` interface declares. Example `H2`:

```ts
import type { ComponentProps } from 'astro/types';
import H2 from './H2.astro';
export default { component: H2 };
export const Default = { args: {} satisfies ComponentProps<typeof H2> };
```

Repeat the same shape for `H1`, `P`, `Prose`, `LinkNavPost`. For each, open the component's frontmatter `Props` interface and pass any required prop (e.g. `LinkNavPost` takes navigation props — supply an inline fixture matching its interface).

- [x] **Step 2: Write media-primitive stories**

`CustomImage` wraps `<Picture>` — it needs a real imported image. Import an asset that already exists in the repo:

```ts
import type { ComponentProps } from 'astro/types';
import CustomImage from './CustomImage.astro';
import img from '../../assets/…'; // pick any existing image asset
export default { component: CustomImage };
export const Default = {
  args: { src: img, alt: 'Sample', width: 800, height: 600 } satisfies ComponentProps<typeof CustomImage>,
};
```

Verify the actual prop names against `CustomImage.astro`'s `Props` before finalizing. `SocialShare` takes a URL/title — supply an inline fixture matching its interface.

- [x] **Step 3: Verify each renders in `/styleguide`, then commit**

```bash
git add src/components/ui/*.stories.ts
git commit -m "feat(styleguide): ui primitive stories"
```

---

### Task 4: `app/` stories

**Files:**

- Create: `src/components/app/Header.stories.ts`, `Footer.stories.ts`, `ThemeToggle.stories.ts`, `MotionToggle.stories.ts`
- (Skip `SEO.astro`.)

- [x] **Step 1: Write the stories**

`ThemeToggle` and `MotionToggle` are prop-less interactive components — their client `<script>` runs in astrobook:

```ts
import ThemeToggle from './ThemeToggle.astro';
export default { component: ThemeToggle };
export const Default = { args: {} };
```

`Header` and `Footer` self-fetch or take minimal props — story with `args: {}` (or the fixture their `Props` requires). Verify the nav links and theme toggle render inside the header.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/app/*.stories.ts
git commit -m "feat(styleguide): app chrome stories"
```

---

### Task 5: `hero/` stories

**Files:**

- Create: `Hero.stories.ts`, `HeroText.stories.ts`, `HeroSocials.stories.ts`, `HeroAnimation.stories.ts`, `HeroImage.stories.ts`

- [x] **Step 1: Write stories, including the dead `HeroImage`**

`HeroAnimation` runs a client script — confirm it animates in astrobook. `HeroImage` is unreferenced (dead) — story it anyway so it appears in the catalog for review. Pass each component the props its `Props` interface declares; `HeroText`/`HeroSocials` take copy/link props — inline fixtures.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/hero/*.stories.ts
git commit -m "feat(styleguide): hero stories (incl. dead HeroImage)"
```

---

### Task 6: `about/` + `skills/` stories

**Files:**

- Create: `about/AboutText.stories.ts`, `AboutFacts.stories.ts`, `AboutFactsStrip.stories.ts`, `AboutStrip.stories.ts`, `AboutValues.stories.ts`, `ValueCard.stories.ts`, `skills/Skills.stories.ts`, `skills/SkillsText.stories.ts`

- [x] **Step 1: Write stories**

`AboutFacts` self-fetches article count via `getAllBlogPosts()` and takes **no props**:

```ts
import AboutFacts from './AboutFacts.astro';
export default { component: AboutFacts };
export const Default = { args: {} };
```

`ValueCard` takes a single value item — inline fixture matching its `Props`. `AboutValues` is the dead component — story it. `Skills`/`SkillsText` self-render — `args: {}`.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/about/*.stories.ts src/components/skills/*.stories.ts
git commit -m "feat(styleguide): about + skills stories (incl. dead AboutValues)"
```

---

### Task 7: `work/` stories (non-variant)

**Files:**

- Create: `WorksStrip.stories.ts`, `ArchiveTable.stories.ts`, `WorkHeader.stories.ts`, `RelatedWriting.stories.ts`
- (Variant cards `WorkGalleryCard`, `WorkOverlayCard`, `WorkMiniCard` are in **Plan B**.)

- [x] **Step 1: Write data-dependent stories using real repository data**

`WorksStrip` self-fetches `getFeaturedWorks()` and reads `VARIANTS.worksStrip` internally — story with `args: {}`. `ArchiveTable` takes archive works:

```ts
import type { ComponentProps } from 'astro/types';
import ArchiveTable from './ArchiveTable.astro';
import { getArchiveWorks } from '../../utils/repository';
const works = await getArchiveWorks();
export default { component: ArchiveTable };
export const Default = { args: { works } satisfies ComponentProps<typeof ArchiveTable> };
```

Confirm `ArchiveTable`'s actual prop name (`works` vs `entries`) against its `Props`. `WorkHeader` takes a single work entry (`(await getFeaturedWorks())[0]`); `RelatedWriting` takes related posts (`getLatestWriting()` or the prop shape it declares).

- [x] **Step 2: Verify + commit**

```bash
git add src/components/work/WorksStrip.stories.ts src/components/work/ArchiveTable.stories.ts src/components/work/WorkHeader.stories.ts src/components/work/RelatedWriting.stories.ts
git commit -m "feat(styleguide): work non-variant stories"
```

---

### Task 8: `blog/` stories (non-variant)

**Files:**

- Create: `PostListItem.stories.ts`, `SeriePostListItem.stories.ts`, `SerieCard.stories.ts`, `SerieContents.stories.ts`, `TableOfContents.stories.ts`, `TopicChips.stories.ts`, `SelectedWriting.stories.ts`, `RelatedWork.stories.ts`
- (Variant rows `PostRow`, `PostRowCalm` are in **Plan B**.)

- [x] **Step 1: Write data-dependent stories**

`SerieCard` takes `{ serie }`:

```ts
import type { ComponentProps } from 'astro/types';
import SerieCard from './SerieCard.astro';
import { getAllSeries } from '../../utils/repository';
const series = await getAllSeries();
export default { component: SerieCard };
export const Default = { args: { serie: series[0] } satisfies ComponentProps<typeof SerieCard> };
```

For the rest, feed real data by the prop each `Props` declares: `PostListItem`/`SeriePostListItem` → a post entry (`getAllStandalonePosts()[0]` / `getAllSeriePosts()[0]`); `SerieContents` → a serie + its posts (`getPostsFromSerie(serie)`); `TopicChips` → an inline `['astro','performance']` array matching its prop; `TableOfContents` → an inline headings fixture matching its `Props` (array of `{ depth, slug, text }`); `SelectedWriting`/`RelatedWork` → `getLatestWriting()` / real post entries.

- [x] **Step 2: Verify + commit**

```bash
git add src/components/blog/*.stories.ts
git commit -m "feat(styleguide): blog non-variant stories"
```

---

### Task 9: `contact/` stories + coverage audit

**Files:**

- Create: `Contact.stories.ts`, `ContactText.stories.ts`, `ContactImage.stories.ts`, `ContactNoise.stories.ts`

- [x] **Step 1: Write stories (incl. dead `ContactNoise`)**

`Contact`/`ContactText` self-render — `args: {}`. `ContactImage`/`ContactNoise` render an image/effect — supply props per their `Props`. `ContactNoise` is the dead component — story it for review.

- [x] **Step 2: Coverage audit — every live component storied**

Run: `comm -23 <(find src/components -name '*.astro' ! -name 'SEO.astro' | sed 's#.astro$##' | sort) <(find src/components -name '*.stories.ts' | sed 's#.stories.ts$##' | sort)`
Expected output: **exactly these 5 lines** — the variant components deliberately deferred to Plan B. Do NOT story them here:

```
src/components/blog/PostRow
src/components/blog/PostRowCalm
src/components/work/WorkGalleryCard
src/components/work/WorkMiniCard
src/components/work/WorkOverlayCard
```

Any OTHER line printed is an unstoried component — add its story before committing.

- [x] **Step 3: Verify build still emits no styleguide route, then commit**

```bash
pnpm build && test ! -e dist/styleguide && echo "GATE-OK"
git add src/components/contact/*.stories.ts
git commit -m "feat(styleguide): contact stories + full live-component coverage"
```

---

## Self-Review

- **Coverage:** Task 9 Step 2 asserts every non-SEO `.astro` has a story — the gate for "all live components storied." The 5 variant cards deferred to Plan B are baked into Task 9 Step 2 as the exact expected output, so an executor cannot mistake them for missing stories.
- **Gate:** Task 2 is the hard render gate; nothing proceeds if it fails.
- **Prod footprint:** verified in Task 2 Step 2(d) and Task 9 Step 3.
- **Prop accuracy:** every task says "verify prop name against the component's `Props`" rather than inventing signatures, because only `Link`, `WorkGalleryCard`, `PostRow`, `SerieCard`, `WorksStrip`, `AboutFacts` were read at plan time.
