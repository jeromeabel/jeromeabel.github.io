---
title: Figma ↔ Blog perfect fit (token + layout exact)
created: 2026-07-21
---

# Figma ↔ Blog perfect fit — design (2026-07-21)

## Problem / context

The Figma DS file (`Wf4iomVMYUXlFIBV3Z8bx4`, build `ds-blog-v3-01`, S0→S4 complete)
does **not** represent the same UI as the live Blog. Meanwhile the pixel-check
baseline (dev-styleguide spec, Plan D Task 4) proved astrobook stories can't be
diffed against live pages either: captures used the **dashboard** route, whose
chrome boxes every story at a fixed ~976px while live widths vary (container
832px / full-bleed 1280px) → 53/55 fails were size mismatches, not content.

Goal: Figma becomes a trustworthy mockup surface (test design variants there),
astrobook becomes a trustworthy dev surface (implement the chosen variant), and
the three-way fit code ↔ astrobook ↔ Figma is **verified by deterministic
scripts** wherever technically possible.

**Fidelity bar (decided):** *token + layout exact* — every color / font /
spacing / radius value in Figma matches `src/styles/global.css` tokens exactly
(script-verified), layout geometry matches per breakpoint (script-verified),
side-by-side screenshots look identical to the eye. Machine 0-pixel Figma↔web is
explicitly NOT the bar (Figma and browsers rasterize text differently).

**Strategy (decided):** audit + repair the existing Figma file (keep variables,
masters, ledger). No rebuild, no fresh file.

**Scope (decided):** full catalog — 46 live components **+ 9 legacy components
restored from `main`** (variant-testing material) — at 2 themes × 3 widths
(1280 / 768 / 390).

## Verified facts (load-bearing)

- astrobook 0.13.2 serves every story at **two routes**: dashboard
  (`/styleguide/dashboard/<id>`, sidebar chrome — the 976px cage) and
  **preview** (`/styleguide/stories/<id>`, `hasSidebar: false`, bare page).
  Verified in `@astrobook/core/dist/index.js` (`previewSubpath` default
  `"stories"`, route pair per story). The 976px problem is largely a
  wrong-URL problem.
- astrobook decorators: per named story export,
  `decorators: [{ component: SomeAstro, props?: {} }]`; applied by
  `astrobook/lib/components/with-decorators.astro` as nested wrappers around a
  `<slot/>`. Static HTML only — fine for containers.
- Tokens in code: `@theme` = 3 font stacks + 8 semantic colors; `@variant dark`
  = 8 dark overrides; `@utility container` = max-width
  `var(--breakpoint-xl)` + 1rem inline padding + `overflow-x: clip`.
- Figma DS state (from ds-blog-v3-01 ledger): `Color` collection Light/Dark
  8 tokens, `Scale` 12 spacing + 5 radius, 10 text styles, 16 masters +
  4 desktop-1280 templates. Node IDs in ledger but **volatile — always
  re-inventory by name** (fe-figma-verify Pass 0 rule).
- Root font-size is 16px (no override in `Layout.astro`) — rem×16.
- Legacy 9 (`work/`: WorkCard, WorkCardImage, WorksPreview; `blog/`:
  BlogPreview, PostCard, PostList, SerieList, SerieListItem, SeriePostCard)
  are restored on `redesign/v3`, storied (8 of 9), orphaned from pages.
  `PostList` imports the removed `getAllPosts` export → currently unstoried.

## Skill reuse (adapted, not imported wholesale)

- **fe-figma-verify** (allo-media): det→LLM→det loop, batched variable dump
  script (reused nearly verbatim), Pass 0 live-inventory-by-name, Pass 1
  unbound-fill scan, Pass 2 detached instances. Uhlive-specific parts (13px
  root, PrimeOne, changelog REST) dropped.
- **fe-figma-replicate** (allo-media): discipline rules — repair masters never
  assembled pages (F2), bind tokens never hex (F4), real content never invented
  (F9), retire superseded builds same pass (F8), screenshot gate per master.
  Uhlive pipeline phases (library publish etc.) don't apply — DS is local to
  the file.

## Architecture — four stages

### Stage 1 — Token pipeline (deterministic core)

New scripts (no new deps):

- `scripts/figma/extract-code-tokens.mjs` — parses `src/styles/global.css`
  (`@theme`, `@variant dark`, `@utility container`) → `tokens.code.json`:
  8 colors × 2 modes, 3 font stacks, container metrics. Exit-code guards if
  the CSS shape changes (missing block = exit 2, unparseable value = exit 3).
- One **batched** `use_figma` dump (collections + modes + text styles) →
  `tokens.figma.json`. Single MCP call, fe-figma-verify dump script adapted.
- `scripts/figma/diff-tokens.mjs` — code vs Figma, both modes; verdict per
  finding: `real-drift` / `expected-gap` / `map-update`. **Code is truth.**
  Repairs applied Figma-side in one batched `use_figma` write.

Wired as `pnpm figma:verify` (extract + diff; the Figma dump pasted in when
run interactively) — a standing drift check, re-runnable forever.

### Stage 2 — Astrobook real-width stories + pixel-check rehab

- Decorator components in `src/components/styleguide/`:
  - `StoryContainer.astro` — `<div class="container"><slot/></div>` using the
    real site utility → exact live max-width/padding at every viewport.
  - `StorySection.astro` — container + the section spacing live pages add
    (only where a component's live parent adds it).
  - Full-bleed components (Header, Footer, Hero, WorksStrip) get **no**
    wrapper.
  - Per-story assignment derived from each component's live parent context
    (grep of `src/pages/` + `Layout.astro`), recorded in the pixel manifest —
    deterministic and reviewable.
- `scripts/pixel-check.mjs` changes:
  - capture **preview routes** (`/styleguide/stories/<id>`), not dashboard;
  - `waitUntil: 'load'` (kills the networkidle flake);
  - dark theme by adding `.dark` to `documentElement` pre-render (same
    mechanism as `theme.ts`);
  - matrix: 3 viewports (1280 / 768 / 390) × 2 themes.
- Re-anchor the 11 broken manifest selectors to stable owned/CVA classes
  (buckets already identified in dev-styleguide notes.md).
- **Gate:** story↔live goes from 2 passes to majority-pass; every residual
  fail gets a one-line explanation in notes (no silent acceptance).

### Stage 3 — Component sweep (geometry diff, not eyeballs)

The "layout exact" prover — deterministic on both sides:

- `scripts/figma/extract-web-geometry.mjs` — Playwright over story preview
  routes: per component root + descendants, a fixed `getComputedStyle` subset
  (font-size/-family/-weight, padding, gap, color, background, border-radius,
  border-color, effective width) → `geometry.web.json`.
- Per Figma component page, one `use_figma` traversal (batched): same props
  read off nodes + their variable bindings → `geometry.figma.json`.
- `scripts/figma/diff-geometry.mjs` — px↔px (rem×16), tolerance 0.5px;
  unbound-hex flags folded in (Pass 1). Output = repair worklist per master.
- Repairs: **masters only, never templates** (F2); token bindings never raw
  hex (F4); re-run diff until clean or named-debt.
- Final per-master gate: Figma `get_screenshot` vs story PNG, judged visually
  (not pixel-diffed — bar is token+layout).
- Sweep order: chrome (Header/Footer) → cards → templates → ui atoms.

### Stage 3b — Legacy 9 in Figma (variant-testing material)

Legacy components have **no live page** — their story preview route IS the
reference (geometry + screenshots via the same pipeline; the story↔live
pixel-check cell is skipped, nothing live to diff).

- New Figma page **🗄️ Legacy** — 9 masters built fresh, same discipline:
  bound to existing S0 variables/text styles, real collection content, no
  invented strings. Separate page keeps variant experiments out of the live
  catalog.
- **PostList fix (named decision):** one-line component edit —
  `getAllPosts` → `getAllBlogPosts` (nearest current equivalent) — plus a
  story, so all 9 render and can seed variants. This intentionally breaks the
  "restored verbatim" property from the dev-styleguide spec; the delete-vs-
  adopt review there is superseded by "keep as variant material" for any
  legacy component that graduates into a mockup.

### Stage 4 — Responsive + dark templates in Figma

Templates today are desktop-1280 only. Per template (Home / Blog / Work /
About): add 768 + 390 frames (masters reused; reflow copied from story/live
screenshots at those widths), and dark duplicates via explicit variable-mode
override per frame (Pro-tier modes verified working in S0). 4 templates ×
3 widths × 2 themes = **24 frames**, instances-only, superseded builds
archived (F8).

## Success criteria

- `diff-tokens` clean, both modes.
- `diff-geometry` clean or named-debt per master — including the legacy 9.
- pixel-check majority green at preview routes; every residual fail explained.
- Figma: 24 template frames + repaired masters + 🗄️ Legacy page; adapted
  strictness audit (Pass 0 inventory, Pass 1 unbound fills, Pass 2 detached
  instances) clean.
- Standing drift check `pnpm figma:verify` runs any time.

## Error handling / risks

- **Preview route regression risk:** if `/styleguide/stories/<id>` turns out
  to inject any chrome, fall back to decorator-only width control and record
  the measured frame delta in the manifest.
- **MCP writes are LLM-mediated:** kept to batched scripts (one dump, one
  repair batch per stage) — the diff/verdict layers around them are
  deterministic files that survive session death.
- **Ledger IDs stale:** never trusted; Pass 0 name-based re-inventory before
  any write.
- **Morning timebox:** stages are independently landable (1 → 2 → 3 → 3b → 4);
  each ends at a reviewable commit. Tail (ui atoms, some templates) can slip
  past noon without blocking mockup work on chrome + cards.

## Out of scope

- New mockup designs themselves (this spec makes them possible).
- Code Connect (plan-gated on this Figma tier; `codeSource` plugin-data
  fallback already shipped).
- Astrobook sidebar grouping (0.13.2 has none; accepted previously).
- Delete-vs-adopt verdicts for legacy components (superseded — they stay as
  variant material).
