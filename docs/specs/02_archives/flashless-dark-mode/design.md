---
shipped: 2026-07-19
title: Flashless dark mode
created: 2026-07-18
---

# Flashless dark mode — design spec

Eliminate the dark-mode flash on first paint. Inline a tiny theme script in `<head>` before CSS, reading `localStorage` + `prefers-color-scheme`, so the correct theme is applied before render.

Ref: https://www.vbesse.com/en/blog/flashless-dark-mode
Size: S

---

## Problem

A returning visitor who chose **dark** (or whose OS is dark) sees a light flash on the first paint of every hard load, then the page snaps to dark. Classic FOIT/FOUC-style "flash of incorrect theme" (FOIT here = flash of incorrect theme).

Root cause: the theme is applied by a **deferred module script**, so the browser paints the default (light) theme first, runs the script, adds `.dark`, and repaints.

## Current behavior

Theme = `.dark` class on `<html>`, with Tailwind v4 tokens swapped under a `@variant dark` block (`src/styles/global.css:33`, the `--color-background` etc. pairs). Default page is light: `<html class="bg-background ...">` (`src/layouts/Layout.astro:30`) with no `.dark`.

The applier (`src/scripts/theme.ts`):

```
1  function applyTheme() {
2    if (localStorage.theme === "dark" ||
4      (!("theme" in localStorage) &&
5       window.matchMedia("(prefers-color-scheme: dark)").matches)) {
7      document.documentElement.classList.add("dark");
8    } else { ...remove("dark"); }
11 }
12 document.addEventListener("astro:after-swap", applyTheme);
13 applyTheme();
```

It's loaded as a **processed** script — `<script src="../scripts/theme.ts">` (`src/layouts/Layout.astro:35`). Astro bundles/hoists processed scripts into the head as `type="module"`, which are **implicitly deferred**: they run _after_ HTML parse and CSS, i.e. after first paint. That deferral is the flash. Line 13 (`applyTheme()`) runs too late; line 12 (the swap listener) is for view transitions and is unrelated to the first-paint flash.

Toggle logic lives separately in `src/components/app/ThemeToggle.astro:14-26` — an `is:inline` script that flips `localStorage.theme` and the class on click, attached on `astro:page-load`.

### View transitions interaction (relevant)

`ClientRouter` is on (`src/components/app/SEO.astro:3,53`). On a client-side navigation ClientRouter swaps `<body>` and merges `<head>`, but the incoming document's `<html>` carries `class="bg-background ..."` **without** `.dark`, so the persisted `.dark` gets clobbered mid-swap → a flash on navigation too. That's what the `astro:after-swap` listener (theme.ts:12) exists to fix, and it must be **kept**. The `document`-level listener survives swaps (document isn't replaced), so registering it once is enough.

So there are two distinct flashes: **(1) first hard paint** (deferred module — the item's target) and **(2) navigation swap** (already handled by `astro:after-swap`).

## Approaches

### A — One `is:inline` script at the top of `<head>` (recommended)

Replace the processed `<script src>` with an `is:inline` script placed **first in `<head>`** (before the CSS `<link>`). `is:inline` = Astro emits it verbatim, not as a module → it runs **synchronously during head parse**, before body renders. Fold both the initial `applyTheme()` and the `astro:after-swap` re-apply into that one inline block; delete `src/scripts/theme.ts`.

- **Pros:** smallest change; one source of truth; no extra request (inlined); synchronous so no flash; view-transition case preserved via the same block. Matches the Ref article's pattern exactly.
- **Cons:** `is:inline` isn't bundled/type-checked (plain JS, no TS, no minify) — fine for ~10 lines. Would need a CSP `script-src` allowance if a strict CSP is ever added (none today — no `netlify.toml`/`_headers` CSP).

### B — Split: inline the first-paint apply, keep a bundled module for the rest

Add a minimal `is:inline` "apply now" snippet in head; leave `theme.ts` (module) for the `astro:after-swap` listener.

- **Pros:** keeps the bulk in a TS module.
- **Cons:** the `localStorage` + `matchMedia` branch gets **duplicated** in two files that must stay in sync; two things to load for one behavior. Over-engineered for an S task.

### C — Inline snippet + `transition:persist` the class instead of the swap listener

Inline the first-paint apply, and instead of re-applying on `astro:after-swap`, try to persist the `<html>` class across swaps.

- **Pros:** conceptually removes the swap listener.
- **Cons:** `transition:persist` is for elements inside the swapped tree, not the root `<html>` attribute merge; there's no clean declarative way to protect the root class. More fragile than the listener we already have. Reject.

## Recommendation

**Approach A.** It's the canonical fix, deletes a file, and keeps the one piece we need (the swap re-apply). Consolidate all applier logic into a single `is:inline` head block; leave the toggle in `ThemeToggle.astro` as-is (it's already inline and correct).

## Implementation sketch

**`src/layouts/Layout.astro`** — replace line 35 (`<script src="../scripts/theme.ts">`) with an inline block as the **first child of `<head>`**, above `<SEO />` (so it precedes the CSS `<link>` Astro injects for the `global.css` import):

```astro
<head>
  <script is:inline>
    (function () {
      const apply = () => {
        const d =
          localStorage.theme === "dark" ||
          (!("theme" in localStorage) &&
            matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", d);
      };
      apply();
      document.addEventListener("astro:after-swap", apply);
    })();
  </script>
  <SEO {page} {description} {publishedDate} {image} />
  ...</head
>
```

**`src/scripts/theme.ts`** — delete (logic moved inline; grep confirms it's referenced only from Layout.astro:35).

No change to `ThemeToggle.astro`, `global.css`, or `SEO.astro`.

Optional polish (mention, not required): set `color-scheme` on the root inside the same snippet (`document.documentElement.style.colorScheme = d ? "dark" : "light"`) so native form controls / scrollbars match immediately.

## Risks / edge cases

- **View transitions:** covered — the `astro:after-swap` re-apply is kept inside the inline block; the `document` listener persists across swaps, so it registers once. Verify nav between two pages with dark active shows no flash.
- **Inline script re-execution on swap:** an `is:inline` head script is _not_ re-run on navigation by default. That's fine — `apply()` runs once at load, then the swap listener carries it. Do **not** add `data-astro-rerun` (would re-register the listener each nav → duplicates).
- **No-JS:** page falls back to the light default (`bg-background`, no `.dark`). Same as today; acceptable — the toggle already requires JS.
- **SSR/prerender:** output is static (netlify adapter, no per-page `prerender=false` seen). The server can't know the user's theme, so client-side application before paint is the only option — exactly what A does. No SSR mismatch because the server always emits light and the inline script corrects it _before_ paint.
- **`localStorage` blocked** (privacy mode / sandboxed iframe): `localStorage.theme` access can throw. Current code doesn't guard it and this spec keeps parity; wrap in try/catch only if we see errors (out of scope otherwise).
- **CSP:** none today, so inline is fine. If a strict CSP lands later, this needs a `script-src` hash/nonce — note it in that future work.
- **`meta[name=theme-color]`** is hardcoded light `#f5ffe1` (`SEO.astro:46-47`). Not a paint flash, but the mobile browser chrome stays light in dark mode. Out of scope; flag as a possible follow-up.

## Effort estimate

**S.** One inline block in `Layout.astro`, delete one file, no new deps. ~20-30 min including a manual light/dark + hard-reload + navigation check. `pnpm build` and `pnpm format:check` must pass.

## Acceptance

- Hard-load a page with dark selected (or OS dark, no stored pref): **no light flash** before paint.
- Toggling theme still works and persists across reloads.
- Navigating between pages (ClientRouter) with dark active shows no flash.
- `src/scripts/theme.ts` removed; no dangling reference.
- Light and dark both render correctly; build + format pass.
