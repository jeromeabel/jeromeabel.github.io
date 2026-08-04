---
shipped: 2026-07-19
title: Home animation toggle
created: 2026-07-18
---

# Home animation toggle — design spec

Give visitors control over scroll/reveal motion. Keep honoring `prefers-reduced-motion` by default, and add a visible toggle that force-pauses motion regardless of the OS setting. Accessibility + perceived-performance win. Not homepage-only in practice — the reveal system is site-wide, so the toggle governs the whole site (see Scope note).

---

## Problem / context

Today motion is entirely OS-driven: if you haven't set `prefers-reduced-motion: reduce` at the system level, you get the full reveal treatment with no in-page escape hatch. Two gaps:

1. **No user control.** People who find the 1.3s fade/translate distracting, or who are on a low-power device, can't turn it off without digging into OS settings.
2. **All-or-nothing, OS-only.** The reduce/no-preference media queries are the only switch. There's no way to say "I want motion off on _this_ site" independent of the OS.

The fix is a persisted, in-page toggle that overrides the media query in both directions, defaulting to whatever the OS says.

---

## Current behavior

The motion system has three pieces, all site-wide (not homepage-scoped):

- **CSS reveal classes** — `src/styles/global.css:94-117`. Two media-query blocks:
  - `@media (prefers-reduced-motion: reduce)` → `.reveal { opacity: 1; transition-property: none; }` (global.css:94-99).
  - `@media (prefers-reduced-motion: no-preference)` → `.reveal` fades opacity 0→1 over 1.3s; `.reveal-bottom` adds a `translateY(5rem)→0` slide (global.css:101-117).
  - The visible state is triggered by adding class `.reveal-anim`.
- **IntersectionObserver** — `src/scripts/reveal-anim.ts:28-45`. On `astro:page-load`, observes every `.reveal` at `threshold: 0.25` and adds `.reveal-anim` when it enters view. Also drives a JS image cross-fade (`.reveal-img`, `handleImageFadeIn`, reveal-anim.ts:2-26) — a 1200ms opacity swap from LQIP placeholder to loaded image, set via inline styles. **Note: the image fade is _not_ gated by `prefers-reduced-motion` today** (JS writes inline opacity directly).
- **Smooth scroll** — `motion-safe:scroll-smooth` on `<html>` (`src/layouts/Layout.astro:30`), already OS-gated via Tailwind's `motion-safe` variant.

Where `.reveal` is used: `HeroAnimation.astro:47`, `about/ValueCard.astro:13`, `Skills.astro`, `SkillsText.astro`, `CustomImage.astro` (`.reveal-img`), plus several `work/` and `serie/` markdown bodies. So this is a site-wide control, not literally homepage-only.

**Reference pattern — theme toggle.** `src/scripts/theme.ts` and `ThemeToggle.astro` are the template to mirror: `theme.ts` applies `.dark` on `<html>` from `localStorage.theme` (falling back to `prefers-color-scheme`) on load _and_ on `astro:after-swap` (view-transition re-apply); `ThemeToggle.astro:14-25` is an inline `astro:page-load` click handler that flips localStorage + the class. The toggle sits in the header nav (`Header.astro:39`).

---

## Approaches

### Approach A — `data-motion` attribute on `<html>`, script folds the media query in (recommended)

Single source of truth. A tiny script (sibling to `theme.ts`) computes _one_ boolean — `stored value if set, else prefers-reduced-motion` — and stamps `document.documentElement.dataset.motion = "on" | "off"`. CSS keys purely off the attribute; the `@media` blocks are replaced by attribute selectors. `reveal-anim.ts` reads the same attribute before observing / before the image fade.

- **Pros:** one decision point (no media-query-vs-override precedence puzzle); CSS stays declarative and readable; identical mental model to `theme.ts`; the JS image fade and IntersectionObserver can cheaply check `dataset.motion`; the attribute is set pre-paint if the script is inline in `<head>` (shared bootstrap with flashless-dark-mode — see Dependencies).
- **Cons:** must remember to set the attribute early or reveals could flash their animated start state; folding the media query into JS means the media query no longer works with JS disabled (acceptable — the whole reveal trigger is JS-driven anyway, so no-JS already means "everything visible").

### Approach B — keep the media queries, add attribute overrides on top

Leave global.css:94-117 as-is (OS default), and layer `html[data-motion="off"] .reveal { opacity:1; transform:none; transition:none; }` plus a mirror `html[data-motion="on"] .reveal { … animate … }` to force motion on when the OS says reduce.

- **Pros:** OS default still works with zero JS; smaller diff to the existing media-query blocks.
- **Cons:** the "force on" branch has to re-declare the full animation → duplicated keyframe values, easy to drift; three-way precedence (media query vs off-attr vs on-attr) is fiddly; still need the JS side to know the state anyway. More moving parts for the same result as A.

### Approach C — CSS custom-property gate (`--motion: 1 | 0`)

Set `--motion` on `:root`, drive durations with it: `transition-duration: calc(var(--motion) * 1.3s)`, `transform: translateY(calc(var(--motion) * 5rem))`.

- **Pros:** no attribute selectors; flips everything by changing one var.
- **Cons:** clunky to thread the var through every animated property; `calc()`-gated transitions are less obvious to read/maintain; the JS image fade still needs a separate check (can't read a CSS var cleanly pre-decision); no real advantage over A. Rejected.

---

## Recommendation

**Approach A.** It collapses the OS default and the user override into a single `data-motion` attribute on `<html>`, exactly mirroring the existing theme system, and gives both the CSS and the two JS motion paths one thing to read. It also sets up the shared pre-paint bootstrap that flashless-dark-mode wants anyway.

Default = follow `prefers-reduced-motion`; first click writes an explicit `localStorage.motion` that thereafter wins over the OS.

---

## Implementation sketch

**1. Bootstrap script — `src/scripts/motion.ts`** (mirror `theme.ts`)

```ts
function applyMotion() {
  const stored = localStorage.motion; // "on" | "off" | undefined
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = stored ? stored === "on" : !reduce;
  document.documentElement.dataset.motion = on ? "on" : "off";
}
document.addEventListener("astro:after-swap", applyMotion);
applyMotion();
```

Load it inline in `<head>` alongside the theme script so the attribute exists before first paint (`Layout.astro:35` area). See Persistence note re: flashless-dark-mode sharing this slot.

**2. CSS — `src/styles/global.css:94-117`** — replace the two `@media` blocks with attribute selectors:

```css
html[data-motion="off"] .reveal {
  opacity: 1;
  transition-property: none;
  transform: none;
}
html[data-motion="on"] .reveal {
  opacity: 0;
  transition:
    opacity 1.3s 0.1s ease-in-out,
    transform 1.3s 0.1s ease-in-out;
}
html[data-motion="on"] .reveal-anim {
  opacity: 1;
}
html[data-motion="on"] .reveal.reveal-bottom {
  transform: translateY(5rem);
}
html[data-motion="on"] .reveal.reveal-bottom.reveal-anim {
  transform: translateY(0);
}
```

(Smooth scroll: swap `motion-safe:scroll-smooth` on `Layout.astro:30` for an attribute-driven rule, or leave it OS-gated — low stakes, decide at build.)

**3. IntersectionObserver — `src/scripts/reveal-anim.ts`** — respect the flag. In `setupRevealAnimations`, if `document.documentElement.dataset.motion === "off"`, skip the observer and just add `.reveal-anim` (or rely purely on the CSS off-rule, which already forces `opacity:1`, and simply not observe). Likewise gate `handleImageFadeIn` (reveal-anim.ts:2-26) to show images immediately when motion is off — this also closes the current gap where the image fade ignores `prefers-reduced-motion`.

**4. Toggle UI — `src/components/app/MotionToggle.astro`** (clone `ThemeToggle.astro`)

Lives in the header nav next to the theme toggle: add `<li><MotionToggle /></li>` after `Header.astro:39`. Same pill button styling. Icons: `lucide:play` / `lucide:pause` (or `lucide:sparkles` / `lucide:sparkles-off`-style pair from the installed lucide set). Inline `astro:page-load` click handler:

```js
document.getElementById("motion-toggle")?.addEventListener("click", () => {
  const off = document.documentElement.dataset.motion === "off";
  localStorage.motion = off ? "on" : "off";
  document.documentElement.dataset.motion = off ? "on" : "off";
});
```

`aria-pressed` reflects state; `aria-label` like "Toggle animations". Button label/icon should reflect current state so it's a visible control, not a mystery.

---

## Persistence + view-transitions interaction

- **Persistence:** `localStorage.motion` = `"on" | "off"`. Absent = follow OS. Identical lifecycle to `localStorage.theme`.
- **View transitions:** the site uses `ClientRouter`. Like `theme.ts`, `applyMotion()` must re-run on `astro:after-swap` (view-transition swaps replace `<html>`'s children but the attribute lives on `<html>` itself — still, re-applying on swap is the safe, proven pattern the theme uses). The toggle's click handler binds on `astro:page-load` for the same reason `ThemeToggle` does.
- **Pre-paint:** to avoid a first-paint flash of the animated start state (`.reveal` at `opacity:0`), the bootstrap must set `data-motion` before CSS applies — i.e. inline in `<head>`, not a deferred module. This is the exact same requirement as flashless-dark-mode; they should share one inline bootstrap block.

---

## Accessibility notes

- **Default respects `prefers-reduced-motion: reduce`** — unchanged for users who never touch the toggle.
- The toggle is a real, focusable `<button>` with `aria-label` and `aria-pressed`; state is conveyed by icon _and_ ARIA, not color alone.
- Turning motion off also disables the JS image cross-fade and (optionally) smooth scroll — currently `prefers-reduced-motion` users still get the image fade, so this is a net a11y improvement.
- No motion is essential to content or navigation; disabling it never hides or reorders anything (reveal-off = everything visible immediately).

---

## Scope note

Labeled "home animation toggle," but `.reveal` is used site-wide (Hero, About, Skills, Work, serie bodies). The toggle governs all of it — which is the correct behavior; a control that only paused homepage motion would be surprising. Keep the button in the global header.

---

## Effort estimate

**S.** One new script (~12 lines), one new toggle component (clone of an existing one), a contained CSS rewrite of an existing 24-line block, and two small guards in `reveal-anim.ts`. No data-layer or content changes. Nudges toward S/M only if bundled with the shared pre-paint bootstrap for flashless-dark-mode — but that refactor is better owned by that ticket (see Dependencies).
