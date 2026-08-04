---
shipped: 2026-07-21
title: Dev-only component styleguide (astrobook)
created: 2026-07-20
---

# Dev-only component styleguide (astrobook) — design (2026-07-20)

Original stub: _"Dev-only component styleguide. Visual catalog of the site's components in isolation; doubles as a dead-component review tool. Size: S"_

---

## Problem / context

The site has 46 `.astro` components (`src/components/**`) with no catalog. There's no way to see a component in isolation, eyeball its variants, catch a visual regression, or notice when one falls out of use. A reference sweep this session found **3 currently-unreferenced** components — leftover A/B variants from the v3 redesign:

- `src/components/about/AboutValues.astro` — alt to `AboutFacts` / `AboutStrip`
- `src/components/contact/ContactNoise.astro` — alt to `ContactImage`
- `src/components/hero/HeroImage.astro` — alt to `HeroAnimation`

Building a catalog by hand means writing nav, routing, per-component isolation, and dev/prod gating ourselves. An off-the-shelf tool that's Astro-native avoids all of that.

Goal: a **dev-only** visual catalog of every visual component, rendered in isolation, that also serves as the review surface for deciding delete-vs-adopt on the dead components.

## Decision — astrobook

Adopt **[astrobook](https://github.com/ocavue/astrobook)** (v0.13.2), a minimal Storybook-lite shipped as an Astro integration. Colocated `*.stories.ts` files; the integration provides nav, routing, component isolation, and dev/prod gating.

**Why over a hand-rolled `styleguide.astro`:** batteries included (nav/routing/isolation/gating all free), idiomatic colocated stories that scale, Astro-native (peer `astro >=5.0.0`; repo is on Astro 5), and — the crux — a story is a plain TS module, so it can import real content-collection entries from `src/utils/repository.ts` and feed them as `args`. That renders feature components with **real content** instead of hand-mocked fixtures.

**Verified facts (load-bearing):**

- astrobook@**0.13.2**, `peerDependencies: { astro: ">=5.0.0" }`. Deps: `@astrobook/core`, `@astrobook/types`, `@astrobook/ui`.
- Astro component story format (from repo `examples/playground/.../AstroCounter.stories.ts`):
  ```ts
  import type { ComponentProps } from "astro/types";
  import AstroCounter from "./AstroCounter.astro";
  export default { component: AstroCounter };
  export const LargeStep = {
    args: { step: 5 } satisfies ComponentProps<typeof AstroCounter>,
  };
  ```
- `args` are arbitrary typed objects → real collection entries are passable.
- `satisfies ComponentProps<typeof X>` gives **compile-time prop-drift detection** — a fixture that stops matching the component's props fails the build.
- A component's own client `<script>` **runs** in astrobook (the example counter is interactive). Only _decorators_ render as static HTML. So interactive components (`HeroAnimation`, toggles) work.

## Architecture

**Install:** `pnpm add -D astrobook`.

**Config — `astro.config.mjs`, conditional/dev-only:**

```js
integrations: [
  // …existing integrations…
  process.env.NODE_ENV === "development"
    ? astrobook({ subpath: "/styleguide" })
    : null,
];
```

The `null` is filtered from the integrations array in prod → **zero production footprint** (no route emitted, not linked, not crawlable). This does **not** touch the fragile custom markdown `processor` block in the config; integrations compose independently.

**Story pattern — colocated next to each component:**

```ts
import type { ComponentProps } from "astro/types";
import Link from "./Link.astro";

export default { component: Link };

export const Default = {
  args: { href: "#" } satisfies ComponentProps<typeof Link>,
};
export const Cta = {
  args: { variant: "cta", href: "#" } satisfies ComponentProps<typeof Link>,
};
```

**Data-dependent components** (`WorkGalleryCard`, `PostRow`, `SerieCard`, `RelatedWork`, …) — the story imports real entries from `src/utils/repository.ts` via top-level await (valid ESM, runs in Astro build context) and feeds them as `args`:

```ts
import { getFeaturedWorks } from "../../utils/repository";
const works = await getFeaturedWorks();
export const Default = { args: { work: works[0] } };
```

Available helpers (`src/utils/repository.ts`): `getAllBlogPosts`, `getAllStandalonePosts`, `getAllSeriePosts`, `getAllSeries`, `getFeaturedSeries`, `getFeaturedWorks`, `getArchiveWorks`, `getPostsFromSerie`, `getSerieStats`, `getLatestWriting`.

Inline fixture object only where no repository helper fits the shape.

## Scope

Story every **visual** component. Skip non-visual infra:

- `app/SEO.astro` — renders `<meta>`/head only, nothing to preview.

Explicitly story the **3 dead components** (`AboutValues`, `ContactNoise`, `HeroImage`) so they render in the catalog and the delete-vs-adopt call can be made by looking at them. This is what turns the styleguide into the dead-component review tool.

Net: ~45 components in scope.

## Dev / prod gating

- Conditional integration (above) is the gate.
- `.gitignore` already ignores `dist/` and `.astro/` — verify no new artifact dirs need ignoring after install.
- Confirm a production `pnpm build` emits **no** `/styleguide` route.

## Rollout (phased)

- **Phase 1 — pattern proof + render gate:** wire the integration + dev-gating, then story **one** primitive (`Link`, has CVA variants + `astro-icon`) as a smoke test. **Hard gate — verify before storying anything else:** `/styleguide` renders in dev and the component shows correctly inside astrobook's shell, i.e. (a) global CSS + `@theme` tokens resolve, (b) `astro-icon` icons render, (c) dark mode works or is at least not broken, (d) prod `pnpm build` emits no `/styleguide` route. Only once the gate passes: story the rest of the `ui/` primitives (`H1`, `H2`, `P`, `Prose`, `CustomImage`, `SocialShare`, `LinkNavPost`). Establishes the story idiom and the `satisfies ComponentProps` drift guard end-to-end. **If the gate fails** (astrobook can't resolve site CSS/tokens/icons and no small fix exists via `css`/`head` config options), stop — the approach is unviable; fall back to a hand-rolled `styleguide.astro`.
- **Phase 2 — remaining domains:** `app/`, `hero/`, `about/`, `work/`, `blog/`, `contact/`, `skills/`, using real `repository.ts` data for content-dependent components. Includes the 3 dead components.

## Risks

- **Pre-1.0 solo-maintainer dependency** (ocavue) — churn or abandonment risk. Mitigated: dev-only (never in the shipped bundle), MIT, small blast radius, removable in one config line + deleting `*.stories.ts`.
- **Story/prop drift** as components change — mitigated by `satisfies ComponentProps<typeof X>` (build-time failure on mismatch).
- **Decorators static-only** — irrelevant; we story components, not decorators.
- **`NODE_ENV` assumption** — `pnpm dev` must set `NODE_ENV=development` (Astro/Vite default) for the gate to open. Verify during Phase 1.

## Out of scope

- Storying non-visual infra (`SEO`).
- Interaction/play functions (astrobook CSF subset doesn't support them).

---

# Extension — full-coverage build + pixel gate (2026-07-20)

The base design above installs astrobook and stories the ~45 live v3 components. This
extension widens scope on two axes the user requested and decomposes the whole thing
into **four independently-shippable plans (buckets)**. It supersedes the base's
"Phase 1 / Phase 2" split — Phase 1's render gate is preserved verbatim as the first
task of Plan A.

## Scope changes vs. base design

1. **Variant components get one named story export per variant** (Plan B). The v3
   redesign keeps layout alternatives as build-time switches in `src/config/variants.ts`.
   The styleguide renders every alternative side-by-side, not just the currently-selected one.
2. **Main-only components are restored into v3 and storied** (Plan C). Nine components
   the redesign deleted still live on `main`. They are checked back into `redesign/v3`,
   tagged **legacy / review-only**, and storied so the delete-vs-adopt call is made by
   eyeballing them in the catalog. They are **never re-imported by any page** — restoring
   the file is not adopting the component.
3. **Pixel-perfect verification against the live preview** (Plan D). A dev-only Playwright
   script diffs each story against the same component on
   `https://deploy-preview-104--jeromeabel.netlify.app/` (the redesign/v3 preview).

## Component inventory (verified 2026-07-20)

**Live v3 visual components (46, skip `app/SEO.astro`):**
`ui/`: H1, H2, P, Prose, Link, LinkNavPost, CustomImage, SocialShare.
`app/`: Header, Footer, ThemeToggle, MotionToggle.
`hero/`: Hero, HeroText, HeroSocials, HeroAnimation, HeroImage*.
`about/`: AboutText, AboutFacts, AboutFactsStrip, AboutStrip, AboutValues*, ValueCard.
`work/`: WorkGalleryCard, WorkOverlayCard, WorkMiniCard, WorksStrip, ArchiveTable, WorkHeader, RelatedWriting.
`blog/`: PostRow, PostRowCalm, PostListItem, SeriePostListItem, SerieCard, SerieContents, TableOfContents, TopicChips, SelectedWriting, RelatedWork.
`contact/`: Contact, ContactText, ContactImage, ContactNoise*.
`skills/`: Skills, SkillsText.

`*` = the 3 known dead/unreferenced components (`HeroImage`, `AboutValues`, `ContactNoise`).

**Variant mapping (Plan B) — from `src/config/variants.ts`:**

| Switch (`VARIANTS` key) | Values                                                    | Component(s) storied per value               |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `workFeatured`          | `gallery-2x2-16x9`, `gallery-2x2-1x1`, `gallery-3col-1x1` | `WorkGalleryCard` (ratio + column props)     |
| `homePosts`             | `calm-rows`, `arrow-rows`                                 | `PostRowCalm`, `PostRow`                     |
| `worksStrip`            | `mini-card`, `overlay-card`                               | `WorkMiniCard`, `WorkOverlayCard`            |
| `aboutFacts`            | `strip`, `grid`                                           | `AboutFactsStrip`/`AboutStrip`, `AboutFacts` |

Each variant value becomes a named export (e.g. `export const Gallery3Col1x1 = {...}`) so
all alternatives render in one catalog page. The story fixtures use the real prop shapes
these components already receive on the live site.

**Main-only components to restore (Plan C, 9) — deleted in v3, present on `main`:**
`blog/BlogPreview`, `blog/PostCard`, `blog/PostList`, `blog/SerieList`, `blog/SerieListItem`,
`blog/SeriePostCard`, `work/WorkCard`, `work/WorkCardImage`, `work/WorksPreview`.

## Plan C — restore-and-tag mechanics

- `git checkout main -- src/components/blog/BlogPreview.astro …` for the 9 files.
- Each restored file gets a header comment on line 1:
  `{/* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See .specs/01_active/dev-styleguide. */}`
- Their stories declare a `Legacy/` title prefix (astrobook groups by `title`) so they sit
  in a separate catalog section, visually fenced off from live components.
- **Prop drift is expected:** these components were written against the pre-v3 content
  schema / `repository.ts`. If `satisfies ComponentProps<typeof X>` fails to compile against
  current data helpers, the story uses an inline fixture object matching the _restored
  component's own_ prop types (not current-site data). Document any component that no longer
  compiles against live `repository.ts` — that incompatibility is itself review signal.

## Plan D — pixel-perfect verification (strict identity)

**Goal (user decision):** strict pixel identity between a story's rendered component and the
same component on the live preview — not a loose threshold. Strict identity is _earned_, not
assumed, by removing every non-determinism source:

- **Matching render context:** each pixel-checked story wraps the component in the same
  container the live page uses (the site's `container` utility / same `max-width` + padding),
  rendered at a **fixed viewport** (checked at 1280px desktop and 390px mobile).
- **Ready-state waits:** `document.fonts.ready`, all `<img>` `decode()` resolved, and
  `prefers-reduced-motion` forced on so reveal/fade animations don't fire.
- **Animation freeze:** inject CSS `*,*::before,*::after{animation:none!important;transition:none!important}`
  on both the story page and the live page before capture.
- **Anchor selection:** each live component is located by a stable selector (documented
  per component in a manifest); the element's bounding box is captured, not the full page.
- **Diff:** `pixelmatch` at `threshold: 0.1` (antialiasing tolerance only) with a **0-pixel
  mismatch budget** beyond AA. Any component over budget fails and writes a side-by-side
  `expected/actual/diff` triptych PNG to a gitignored report dir.

**Explicitly excluded from the strict gate (logged, not failed):**

- `HeroAnimation` — non-deterministic canvas/motion; masked entirely.
- `CustomImage` LQIP fade regions — the blurred placeholder is time-dependent; the image
  box is masked.
- **Variant values not selected on the live preview** — e.g. if `worksStrip` is
  `overlay-card` on live, the `mini-card` story has no live anchor. These get no live
  counterpart, so they are catalog-only and skipped by the gate (logged with reason).
- **All 9 legacy components** — not present on the live site at all; skipped by definition.

The script is dev-only (`scripts/pixel-check.mjs`, run manually via a `package.json`
script), never part of `pnpm build`, and its output dir is gitignored. Playwright is added
as a `devDependency`.

## Plan sequencing

```
Plan A (install + gate + live components)   ← must land first; installs astrobook
        │
        ├─→ Plan B (variant story exports)   ← needs astrobook working
        ├─→ Plan C (restore + legacy stories) ← needs astrobook working
        │
        └─→ Plan D (pixel gate)              ← needs stories to diff; runs last
```

## Out of scope (unchanged + additions)

- Storying non-visual infra (`SEO`).
- Interaction/play functions (astrobook CSF subset doesn't support them).
- Re-wiring any restored legacy component into a live page (Plan C restores files only).
- Making the pixel gate a CI/build blocker — it is a manually-run review artifact this pass.
