---
title: Figma variables — primitives / theme / responsive
created: 2026-07-29
---

# Figma variables — primitives / theme / responsive (design)

## Problem

The Figma DS file (`Wf4iomVMYUXlFIBV3Z8bx4`, library "Blog Design System", build
`ds-blog-v3-01`) holds **13 variable collections, 928 variables**, flat and
untiered. There is no primitive/semantic distinction: the 8 project tokens sit
as a sibling of the raw Tailwind import, and a second, foreign semantic system
sits alongside both.

Current inventory, sorted by what each collection actually is:

| Tier | Collections | Vars |
| --- | --- | --- |
| **True primitives** (raw Tailwind) | Color Primitives 299, Typography 52, Number Primitives 60, Spacing 35, Opacity 21, Scale 21, Container 13, Radius 10, Blur 7, Border Width 5, Breakpoint 5 | **528** |
| **True semantics** (project, Light/Dark) | Color | **8** |
| **Foreign semantic import** | Color Tokens | **392** |

`Color Tokens` is not a palette — it is a whole imported semantic system in the
Untitled UI idiom (`Background/brand-solid`, `Background/error-primary`,
`Background/primary-hover`, `Utility/Brand/brand-600`). It duplicates the role of
`Color` and the blog uses none of it: `global.css` has no status colors.

### What "accent" means today

Three different things, which is the core of the naming problem:

- **`background-accent`** — used exactly once, and as a **text** colour:
  `text-background-accent dark:text-foreground-accent`
  (`src/components/work/WorkCardImage.astro:52`). Light `#f7f7f7` / dark
  `#101010`; `foreground-accent` is the exact swap of the same hex pair. The
  `dark:` variant exists only to fake a **mode-invariant white** over an image.
- **`muted-background-accent`** — used only as the hover of `muted-background`
  (`ThemeToggle.astro`, `MotionToggle.astro`). A **state** token, not a surface.
- **`foreground-accent`** — emphasis text: active TOC entry, current serie post.

### Collateral drift found

Figma `Typography` declares `family/sans` = Inter, `family/serif` = Merriweather,
`family/mono` = JetBrains Mono. `src/styles/global.css` declares **IBM Plex Sans
/ Bubbler One / Fira Code**, and has no `serif` at all — it has `--font-title`.
Figma is simply wrong and must be corrected in the same pass.

## Constraints (verified, load-bearing)

- **Figma cannot move a variable between collections.** Any merge means
  recreating the variable and rebinding every consumer. This is the entire cost
  of the work.
- **Modes are a per-collection property.** That is the only structural reason to
  have more than one collection.
- **Renaming a collection preserves its id and all bindings.** `Color` is
  `VariableCollectionId:3:2`, and the archived `figma-detail-templates` work
  records dark frames carrying an explicit override
  `explicitVariableModes = { "VariableCollectionId:3:2": "3:1" }`. Replacing that
  collection breaks every dark frame in the file; renaming it does not.
- **Letter-spacing must not be bound.** Existing `tracking/*` descriptions record
  that Figma coerces a bound letter-spacing variable to pixels, destroying
  size-independence. `tracking/*` stays reference-only.
- Figma has no nested collections. Grouping inside a collection is `/`-path only.

## Decisions

- **Primitives are an untouched Tailwind mirror.** Values are never edited, never
  curated, never pruned. The collection exists to hold Tailwind verbatim.
- **Names are ISO with Tailwind classes in both code and Figma.** A token's Figma
  leaf, its CSS custom property, and its utility class must be mechanically
  derivable from one another.
- **The semantic layer is project-owned** and free to be renamed.
- Structure is three collections (approach C below).

## Naming rule

**Figma name = the CSS custom property minus `--`, with Tailwind's namespace as
the folder.**

| CSS var | Figma | Tailwind class |
| --- | --- | --- |
| `--color-blue-500` | `color/blue/500` | `bg-blue-500` |
| `--spacing-4` | `spacing/4` | `p-4` |
| `--font-weight-500` | `font-weight/500` | `font-medium` |
| `--drop-shadow-md` | `drop-shadow/md` | `drop-shadow-md` |
| `--color-foreground-muted` | `color/foreground-muted` | `text-foreground-muted` |

Split on Tailwind's own namespace list only — `color`, `spacing`, `radius`,
`text`, `font`, `font-weight`, `tracking`, `leading`, `breakpoint`, `container`,
`blur`, `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow`, `opacity`,
`perspective`, `aspect`, `ease`, `animate` — never on the leaf. One extra split
for colour, on the 22 known Tailwind hue names, so 299 swatches fold into
`color/blue/500` rather than one flat list of 299.

The rule is bijective given the namespace list and the hue list, so
`scripts/figma/diff-tokens.mjs` can keep comparing Figma names to CSS names by
transform rather than by lookup table.

## Structure

### `1 Primitives` — 1 mode — ~470 vars

Tailwind v4 defaults, verbatim. Absorbs `Color Primitives`, `Typography`,
`Spacing`, `Radius`, `Blur`, `Border Width`, `Breakpoint`, `Container`,
`Opacity`, `Scale`, and `Number Primitives`.

Two additions Tailwind already ships and the file is missing: `color/white` and
`color/black`. Being mode-invariant, they retire the `dark:` hack at
`WorkCardImage.astro:52`.

`Number Primitives` (60 raw floats) is deleted rather than merged — `500` is
already expressible as `font-weight/500`. That is why the collection lands at
~470 rather than the 528 currently spread across the eleven source collections.

### `2 Theme` — Light / Dark — 7 vars

The **existing `Color` collection, renamed in place**, so
`VariableCollectionId:3:2` and every dark-frame mode override survive. Values
change from raw hex to aliases into `1 Primitives`.

| Now | New | Rationale |
| --- | --- | --- |
| `color/background` | `color/background` | unchanged |
| `color/muted-background` | `color/surface` | it is the control / block surface |
| `color/muted-background-accent` | `color/surface-hover` | only ever used as hover |
| `color/foreground` | `color/foreground` | unchanged |
| `color/muted` | `color/foreground-muted` | it is text, not a tone |
| `color/foreground-accent` | `color/foreground-strong` | emphasis text |
| `color/muted-border` | `color/border` | the only border token |
| `color/background-accent` | **deleted** | replaced by `color/white` |

The vocabulary (`surface`, `foreground-muted`, `-hover` as a state suffix) is
harvested from `Color Tokens` before that collection is deleted.

Also lands here, because these are **project overrides of Tailwind defaults, not
Tailwind**: `font/sans` = IBM Plex Sans, `font/title` = Bubbler One, `font/mono`
= Fira Code. Same value in both modes.

### `3 Responsive` — Desktop 1280 / Tablet 768 / Mobile 390

New collection, aliasing into `1 Primitives`. Holds container max-width and
gutter — today hardcoded in the `container` utility as `--breakpoint-xl` and
`1rem` — plus section rhythm.

Justification: the file already renders every template at 2 themes × 3 widths.
Dark mode is a frame-level mode override; width is manual. This collection makes
width work the same way. It is the one capability a naming convention alone
cannot provide.

### Deletions

- `Color Tokens` (392) — after harvesting its role vocabulary.
- `Number Primitives` (60) — absorbed.

## Code changes

`src/styles/global.css` renames follow the `2 Theme` table above, then a sweep of
`src/`: **~137 replacements across 37 files**, mechanical. `--color-background-accent`
is removed and its single call site rewritten to a plain white.

Measured usage before the rename:

| Token | Occurrences |
| --- | --- |
| `muted` (exclusive of `muted-*`) | ~62 |
| `muted-border` | 30 |
| `muted-background` | 20 |
| `foreground` | 17 |
| `background` | 3 |
| `foreground-accent` | 2 |
| `muted-background-accent` | 2 |
| `background-accent` | 1 |

## Migration order

1. Rename `Color` → `2 Theme`; rename its 7 variables; delete
   `color/background-accent`. Rename in `global.css` and sweep `src/`.
2. Correct the font families in Figma (`Typography` → `2 Theme`).
3. Build `1 Primitives`, rebind consumers, delete the 11 old primitive
   collections.
4. Delete `Color Tokens`.
5. Add `3 Responsive`.

Steps 1–2 are safe and independently shippable. Step 3 carries all the risk.

## Open question — must be resolved before planning step 3

> **Are the S0→S4 masters and the 4 detail templates actually *bound* to the
> `Spacing`, `Typography`, `Radius`, `Opacity`, `Scale`, `Container`, `Blur`,
> `Border Width` and `Breakpoint` collections — or do they use raw numbers?**

This single fact decides the cost and shape of step 3:

- **Bound** → merging means rebinding every consumer of 528 variables across the
  whole component catalog. Step 3 becomes the dominant effort and may not be
  worth it; stopping after steps 1, 2, 4 and 5 (leaving the primitive
  collections in place, renamed with a `1 ·` prefix so they sort as a tier)
  remains a legitimate outcome.
- **Unbound** → the old collections have no consumers, merging is close to free,
  and step 3 is pure cleanup.

Resolve it by dumping node variable bindings for a representative sample of the
S0→S4 masters (the same batched `use_figma` dump path used by
`figma-blog-fit`), **before** writing the implementation plan. Do not assume.

## Non-goals

- No change to the `tracking/*` reference-only rule.
- No new status colours (error / warning / success). The blog has no use for
  them; `Color Tokens` is being deleted, not adopted.
- No component-level token tier. Seven semantic colours do not need one.
