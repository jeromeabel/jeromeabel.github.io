---
shipped: 2026-07-19
title: Contact images animation
created: 2026-07-18
---

# Contact images animation — design (2026-07-18)

> Original stub: "Animate the currently-static contact-page images (subtle entrance /
> hover motion), consistent with the site's reveal system and `prefers-reduced-motion`.
> Size: S"

---

## Problem / context

The contact block sits at the bottom of the homepage (`src/pages/index.astro:16` → `Contact.astro`). It has two decorative inline SVGs that never move while the rest of the page already breathes: home sections use the `.reveal` scroll system, and the LinkedIn link in this very block already bounces. The two SVGs are the only static bits in an otherwise animated section, so they read as flat.

Goal: give them a subtle scroll-entrance and a light hover, using the animation infra the site already has — no new system, no JS, fully `prefers-reduced-motion` aware.

## Current contact structure

`Contact.astro` (`src/components/contact/Contact.astro`):

```
<section role="complementary"> …
  <div class="container flex justify-between">
    <ContactText />   ← left: heading, email, social links (LinkedIn already animated)
    <ContactImage />  ← right: the big decorative graphic
```

The static images:

1. **`footer.svg`** — the main graphic. `ContactImage.astro:6`, imported as `FooterImg`, rendered inline (not `CustomImage`/`<Picture>`). Wrapper `div` is `relative hidden flex-1 sm:block` (`ContactImage.astro:5`); the SVG itself is `absolute -top-40 -right-16 z-10 scale-75 lg:scale-100 dark:invert` (`ContactImage.astro:7-8`). Desktop-only.
2. **`arrow-curve.svg`** — the little hand-drawn arrow pointing at "I post sometimes on LinkedIn…". `ContactText.astro:2` (`Curve`), rendered at `ContactText.astro:51`. It's part of the LinkedIn cluster, which _already_ animates (`.anim-shadow` width pulse + `animate-[bounce_...]`, `ContactText.astro:42-84`).

Reference infra:

- **Reveal system** — `.reveal` gets `opacity:0` and an `IntersectionObserver` (threshold 0.25) adds `.reveal-anim` on scroll-in (`src/scripts/reveal-anim.ts:28-45`). CSS in `global.css:94-117`: under `prefers-reduced-motion: reduce` `.reveal` is forced `opacity:1` with no transition; under `no-preference` it fades opacity + optional `.reveal-bottom` slides `translateY(5rem) → 0`. Any element with the class is picked up automatically.
- **Raster fade** — `CustomImage.astro` handles its own LQIP fade via `.reveal-img` (`reveal-anim.ts:2-26`). **Not relevant here** — both contact graphics are inline SVGs, not `<Picture>`, so `.reveal-img` doesn't touch them.
- **Existing reduced-motion pattern** — `ContactText.astro:62-72` gates its keyframe behind `@media (prefers-reduced-motion: no-preference)` and hides it under `reduce`. Same discipline applies here.

### Transform gotcha (important)

`.reveal-bottom` in `global.css:112` sets a raw `transform: translateY(5rem)`. `FooterImg` already carries Tailwind `scale-75 lg:scale-100`. A raw `transform` on the _same_ element would clobber Tailwind's composed transform vars. So `.reveal-bottom` must go on the **wrapper div** (which has no transform), never on the SVG. Hover transforms via Tailwind utilities (`hover:-translate-y-2` etc.) compose with `scale-75` fine because Tailwind v4 builds them from independent `--tw-*` vars — they only fight the raw global-css `transform`.

## Approaches

### A — Reuse `.reveal` / `.reveal-bottom` on the wrapper + CSS-only hover _(recommended)_

Entrance: add `reveal reveal-bottom` to the `ContactImage` wrapper div. The existing observer picks it up; it fades + slides up on scroll-in. Hover: `motion-safe:transition-transform motion-safe:hover:-translate-y-2` on the SVG (keeps `scale-75 lg:scale-100`, composes).

- **Pros:** zero new infra, zero JS, zero keyframes. `prefers-reduced-motion` handled for free (entrance by the existing media queries, hover by the `motion-safe:` variant). Consistent with every other reveal on the site. When `home-animation-toggle` lands, this is already wired into the shared `.reveal` class it will gate — nothing bespoke to retrofit.
- **Cons:** entrance is the same fade/slide as everything else — not a bespoke "decorative float". `reveal-bottom`'s 5rem slide is tuned for content blocks; may want a gentler custom distance (see B).

### B — Reuse the observer, but layer a custom keyframe on `.reveal-anim`

Add `.reveal` (so the observer toggles `.reveal-anim`), then a component-scoped `@keyframes` — a slight drift+rotate settle — triggered by `.reveal-anim`, wrapped in `@media (prefers-reduced-motion: no-preference)`.

- **Pros:** entrance motion tailored to the decorative graphic (e.g. a small rotate/scale settle) rather than the generic slide. Still reuses the observer, still one class the future toggle can gate.
- **Cons:** more CSS to own and maintain; must hand-write the reduced-motion guard (A gets it for free). Marginal payoff for a bottom-of-page decoration.

### C — Pure CSS-only, no observer (`animation` on load)

Drop the observer entirely; run entrance via a CSS `animation` that fires on load, hover via `:hover`.

- **Pros:** no JS dependency at all.
- **Cons:** fires whether or not the element is in view — and this element is at the very bottom of the page, so it'd animate unseen and be static by the time you scroll to it. Inconsistent with the rest of the site (everything else is scroll-tied). Also invents a _second_ motion mechanism that `home-animation-toggle` would then have to gate separately. Reject.

## Recommendation

**Approach A.** It's the smallest change, reuses the exact system the CLAUDE.md calls out, and inherits reduced-motion handling on both entrance and hover. If the plain slide feels too much like the content blocks once it's on screen, downgrade to plain `.reveal` (fade only, no `reveal-bottom`) or borrow B's custom keyframe later — but ship A first.

Include the `arrow-curve.svg` only as an optional nicety: it already lives inside an animated cluster, so leave the entrance to that cluster and, at most, add a `motion-safe:` hover. Primary target is `footer.svg`.

## Implementation sketch

`ContactImage.astro`:

```diff
- <div class="relative hidden flex-1 sm:block">
+ <div class="reveal reveal-bottom relative hidden flex-1 sm:block">
    <FooterImg
-     class="absolute -top-40 -right-16 z-10 scale-75 lg:scale-100 dark:invert"
+     class="absolute -top-40 -right-16 z-10 scale-75 lg:scale-100 dark:invert
+            motion-safe:transition-transform motion-safe:duration-300
+            motion-safe:hover:-translate-y-2"
      width="433" height="400" />
  </div>
```

- Entrance: wrapper `reveal reveal-bottom` → observer fades opacity + slides `translateY(5rem)→0` on scroll-in.
- Hover: `motion-safe:hover:-translate-y-2` composes with `scale-75 lg:scale-100`; the raw-transform clash is avoided because the slide lives on the wrapper.
- No changes to `reveal-anim.ts` or `global.css`.

Optional (`ContactText.astro`, `arrow-curve.svg` at line 51): add `motion-safe:transition-transform motion-safe:hover:-translate-y-1` to `<Curve />` if a hover nudge is wanted. Skip its entrance — the LinkedIn cluster owns that.

Verify: `pnpm build` + `pnpm format:check`; check light/dark (SVG uses `dark:invert`); confirm the section still lays out (wrapper is `flex-1`, the slide is transform-only so it won't reflow siblings).

## prefers-reduced-motion handling

- **Entrance:** `.reveal` already forces `opacity:1` + `transition-property:none` and skips the translate under `@media (prefers-reduced-motion: reduce)` (`global.css:94-99`) — graphic appears statically, no work needed.
- **Hover:** `motion-safe:` variant emits the transition/transform only under `no-preference`; reduce → no hover motion.
- Matches the block's own existing pattern (`ContactText.astro:62-72`). No `prefers-reduced-motion` media query authored by hand.

## Effort estimate

**S** (unchanged). Approach A is a handful of classes across one (optionally two) files, no new CSS/JS. Realistically <30 min including build + light/dark check. B or C would push toward the top of S / into M and aren't recommended.

## Dependencies / ordering

- **`home-animation-toggle` (the key one):** that item adds a _visible in-page_ switch to pause motion, on top of the OS-level `prefers-reduced-motion` the reveal system honors today. If it ships, these contact animations must obey it too. **Ship contact-images-animation FIRST.** Because A rides the shared `.reveal` class + `motion-safe:` variant (no bespoke JS or keyframes), the toggle — which will gate the shared reveal system in one place — subsumes it automatically; the contact block just becomes one more `.reveal` element it already covers. Building the toggle first buys nothing here and risks it landing before it knows about this motion. The one contract to honor: keep this on the shared system (Approach A/B), not a private mechanism (C), so the toggle has a single seam to hook.
- **`flashless-dark-mode`:** independent — head/FOUC script, no motion overlap. Any order.
- **`blog-toc`, `blog-v2-1`, `work-about-blog`:** independent — blog/nav scope, don't touch the contact block. Any order.

Net: only real coupling is `home-animation-toggle`, and this should precede it.
