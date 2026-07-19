---
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
  import type { ComponentProps } from 'astro/types'
  import AstroCounter from './AstroCounter.astro'
  export default { component: AstroCounter }
  export const LargeStep = {
    args: { step: 5 } satisfies ComponentProps<typeof AstroCounter>,
  }
  ```
- `args` are arbitrary typed objects → real collection entries are passable.
- `satisfies ComponentProps<typeof X>` gives **compile-time prop-drift detection** — a fixture that stops matching the component's props fails the build.
- A component's own client `<script>` **runs** in astrobook (the example counter is interactive). Only *decorators* render as static HTML. So interactive components (`HeroAnimation`, toggles) work.

## Architecture

**Install:** `pnpm add -D astrobook`.

**Config — `astro.config.mjs`, conditional/dev-only:**

```js
integrations: [
  // …existing integrations…
  process.env.NODE_ENV === 'development'
    ? astrobook({ subpath: '/styleguide' })
    : null,
]
```

The `null` is filtered from the integrations array in prod → **zero production footprint** (no route emitted, not linked, not crawlable). This does **not** touch the fragile custom markdown `processor` block in the config; integrations compose independently.

**Story pattern — colocated next to each component:**

```ts
import type { ComponentProps } from 'astro/types'
import Link from './Link.astro'

export default { component: Link }

export const Default = { args: { href: '#' } satisfies ComponentProps<typeof Link> }
export const Cta = { args: { variant: 'cta', href: '#' } satisfies ComponentProps<typeof Link> }
```

**Data-dependent components** (`WorkGalleryCard`, `PostRow`, `SerieCard`, `RelatedWork`, …) — the story imports real entries from `src/utils/repository.ts` via top-level await (valid ESM, runs in Astro build context) and feeds them as `args`:

```ts
import { getFeaturedWorks } from '../../utils/repository'
const works = await getFeaturedWorks()
export const Default = { args: { work: works[0] } }
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
- Visual-regression snapshot testing (no test infra in repo; could layer later).
- Interaction/play functions (astrobook CSF subset doesn't support them).
