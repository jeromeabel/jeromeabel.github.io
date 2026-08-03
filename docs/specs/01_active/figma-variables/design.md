---
title: Figma variables — primitives / theme / responsive
created: 2026-07-29
---

# Figma variables — primitives / theme / responsive (design)

> Transferable lessons from the design review live in [notes.md](notes.md).

## Problem

The Figma DS file — since 2026-07-29 this is
[`ihWIWmvtQPTWgUxlrVjC2c`](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Blog-Design-System-v1.0)
("Blog Design System v1.0"), a fork of the original `Wf4iomVMYUXlFIBV3Z8bx4`
(library "Blog Design System", build `ds-blog-v3-01`) which is now a read-only
backup until this migration completes. Ids carried over unchanged; the inventory
below was measured on the original and re-verified against v1.0. The file holds
**13 variable collections, 928 variables**, flat and
untiered. There is no primitive/semantic distinction: the 8 project tokens sit
as a sibling of the raw Tailwind import, and a second, foreign semantic system
sits alongside both.

Current inventory, sorted by what each collection actually is:

| Tier                                     | Collections                                                                                                                                                | Vars    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **True primitives** (raw Tailwind)       | Color Primitives 299, Typography 52, Number Primitives 60, Spacing 35, Opacity 21, Scale 21, Container 13, Radius 10, Blur 7, Border Width 5, Breakpoint 5 | **528** |
| **True semantics** (project, Light/Dark) | Color                                                                                                                                                      | **8**   |
| **Foreign semantic import**              | Color Tokens                                                                                                                                               | **392** |

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

- **Primitives = untouched Tailwind mirror + a `brand/` folder.** The Tailwind
  section is never edited, never curated, never pruned. The project's own hues
  (the lime ramp and custom grays in `global.css`) live in a separate
  `color/brand/*` folder inside the same collection — they are primitives too
  (raw values, mode-invariant), they just aren't Tailwind's. This is what makes
  the semantic layer fully alias-based: none of the current hex values
  (`#f5ffe1`, `#e0eec4`, `#d1ddbb`, …) exist in the Tailwind ramp, so without a
  brand folder the theme tokens could never be aliases.
- **A token is semantic only if its value varies by mode (theme, width) or is a
  deliberate brand knob.** Everything else is consumed as a raw primitive
  utility. See "Semantic scope" below.
- **Primitives are hidden from publishing; only semantics are picker-visible.**
  See "Scoping & publishing" below.
- **Names are ISO with Tailwind classes in both code and Figma.** A token's Figma
  leaf, its CSS custom property, and its utility class must be mechanically
  derivable from one another.
- **The semantic layer is project-owned** and free to be renamed.
- Structure is three collections (approach C below).

## Naming rule

**Figma name = the CSS custom property minus `--`, with Tailwind's namespace as
the folder.**

| CSS var                    | Figma                    | Tailwind class          |
| -------------------------- | ------------------------ | ----------------------- |
| `--color-blue-500`         | `color/blue/500`         | `bg-blue-500`           |
| `--spacing-4`              | `spacing/4`              | `p-4`                   |
| `--font-weight-500`        | `font-weight/500`        | `font-medium`           |
| `--drop-shadow-md`         | `drop-shadow/md`         | `drop-shadow-md`        |
| `--color-foreground-muted` | `color/foreground-muted` | `text-foreground-muted` |

Split on Tailwind's own namespace list only — `color`, `spacing`, `radius`,
`text`, `font`, `font-weight`, `tracking`, `leading`, `breakpoint`, `container`,
`blur`, `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow`, `opacity`,
`perspective`, `aspect`, `ease`, `animate` — never on the leaf. One extra split
for colour, on the 22 known Tailwind hue names, so 299 swatches fold into
`color/blue/500` rather than one flat list of 299.

The rule is bijective given the namespace list, the hue list, **and a small
named-value table**: Tailwind's utility names for weights and tracking are
words, not numbers (`font-medium` → `--font-weight-500`, `tracking-wide` →
`--tracking-wide`), so `scripts/figma/diff-tokens.mjs` carries one static map
for those namespaces. Everything else is a pure transform.

**Units rule:** Figma number variables store **pixels**. `spacing/4` = `16`,
`radius/lg` = `8`, `text/xl` = `20`. CSS stays in rem; the diff script converts
`rem × 16` before comparing. This is declared once here so the script and the
Figma build never disagree.

## Structure

### `1 Primitives` — 1 mode — ~480 vars

Tailwind v4 defaults, verbatim. Absorbs `Color Primitives`, `Typography`,
`Spacing`, `Radius`, `Blur`, `Border Width`, `Breakpoint`, `Container`,
`Opacity`, `Scale`, and `Number Primitives`.

Two additions Tailwind already ships and the file is missing: `color/white` and
`color/black`. Being mode-invariant, they retire the `dark:` hack at
`WorkCardImage.astro:52`.

Plus the **`color/brand/*` folder** — the 11 unique hexes currently hardcoded in
`global.css`, named by ramp position so the semantic layer can alias them:

| Figma                  | Hex       | Today feeds                        |
| ---------------------- | --------- | ---------------------------------- |
| `color/brand/lime-100` | `#f5ffe1` | light background                   |
| `color/brand/lime-200` | `#e0eec4` | light muted-background             |
| `color/brand/lime-300` | `#d1ddbb` | light muted-border / hover         |
| `color/brand/gray-50`  | `#f7f7f7` | accent light                       |
| `color/brand/gray-100` | `#ececec` | dark foreground                    |
| `color/brand/gray-400` | `#9b9b9b` | dark muted                         |
| `color/brand/gray-500` | `#5b5b5b` | light muted                        |
| `color/brand/gray-600` | `#4c4c4c` | dark border / hover                |
| `color/brand/gray-700` | `#343434` | dark muted-background              |
| `color/brand/gray-800` | `#1e1e1e` | light foreground / dark background |
| `color/brand/gray-900` | `#101010` | accent dark                        |

Values are the exact current hexes — aliasing them from `2 Theme` produces **zero
visual change** on the live site.

`Number Primitives` (60 raw floats) is deleted rather than merged — `500` is
already expressible as `font-weight/500`. That is why the collection lands at
~480 (528 spread across the eleven source collections, minus the 60 floats,
plus white/black and the 11 brand hexes below).

### `2 Theme` — Light / Dark — 7 vars

The **existing `Color` collection, renamed in place**, so
`VariableCollectionId:3:2` and every dark-frame mode override survive. Values
change from raw hex to aliases into `1 Primitives` (`color/brand/*` — see the
brand table above; same hexes, zero visual change).

| Now                             | New                       | Rationale                         |
| ------------------------------- | ------------------------- | --------------------------------- |
| `color/background`              | `color/background`        | unchanged                         |
| `color/muted-background`        | `color/surface`           | it is the control / block surface |
| `color/muted-background-accent` | `color/surface-hover`     | only ever used as hover           |
| `color/foreground`              | `color/foreground`        | unchanged                         |
| `color/muted`                   | `color/foreground-muted`  | it is text, not a tone            |
| `color/foreground-accent`       | `color/foreground-strong` | emphasis text                     |
| `color/muted-border`            | `color/border`            | the only border token             |
| `color/background-accent`       | **deleted**               | replaced by `color/white`         |

The vocabulary (`surface`, `foreground-muted`, `-hover` as a state suffix) is
harvested from `Color Tokens` before that collection is deleted.

Also lands here, because these are **project overrides of Tailwind defaults, not
Tailwind**: `font/sans` = IBM Plex Sans, `font/title` = Bubbler One, `font/mono`
= Fira Code. Same value in both modes — a Figma-forced duplication (every
variable must define a value per mode), accepted to avoid a fourth collection.

### `3 Responsive` — Desktop 1280 / Tablet 768 / Mobile 390

New collection, aliasing into `1 Primitives`. Holds container max-width and
gutter — today hardcoded in the `container` utility as `--breakpoint-xl` and
`1rem` — plus section rhythm.

Justification: the file already renders every template at 2 themes × 3 widths.
Dark mode is a frame-level mode override; width is manual. This collection makes
width work the same way. It is the one capability a naming convention alone
cannot provide. Three modes fits the Professional-plan cap of 4 modes per
collection.

### Deletions

- `Color Tokens` (392) — after harvesting its role vocabulary.
- `Number Primitives` (60) — absorbed.

## Scoping & publishing

~480 primitives next to 7 semantics in one picker is the classic failure mode:
designers bind raw primitives and the semantic layer rots. Two Figma features
prevent it:

- **`1 Primitives` is hidden from publishing** (collection-level "hide from
  publishing"). Library consumers see only `2 Theme` and `3 Responsive`. Inside
  the DS file itself primitives stay visible — they must be, to author aliases.
- **Scopes on `2 Theme`**: `foreground*` → text fill; `border` → stroke;
  `background` / `surface*` → frame fill; `font/*` → font family. The picker
  then offers the right token in the right context and nothing else.

## Semantic scope — what does _not_ get a semantic token

Rule (from Decisions): a value earns a semantic name only if it **varies by
mode** or is a **brand knob**. Applied to what `src/` actually uses:

| Category                                              | Usage today                                              | Verdict                                                                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color                                                 | 8 tokens, themed                                         | **Semantic** — the whole point                                                                                                                                                                                       |
| Fonts                                                 | 3 families, brand knob                                   | **Semantic** (`2 Theme`)                                                                                                                                                                                             |
| Container width / gutter, section rhythm (`py-24` ×8) | varies by width                                          | **Semantic** (`3 Responsive`)                                                                                                                                                                                        |
| Spacing                                               | `gap-2/4/8`, `p-4`, `py-8`… — consistent scale positions | **Primitive utilities.** Consistency comes from the scale, not from naming. An inset/stack semantic tier is multi-brand machinery this project doesn't need.                                                         |
| Radius                                                | `rounded-full` ×7, `rounded-lg` ×4                       | **Primitive utilities.** `full` is geometry, not brand; one `lg` at 4 call sites doesn't justify a knob. Revisit trigger: a redesign that changes roundness globally.                                                |
| Type scale                                            | full ramp `text-xs`→`text-8xl`                           | **Primitive utilities.** Semantic typography already exists as **components** (`H1`, `H2`, `P`, `Prose`) — encapsulation in components is the semantic layer here, and a token tier under them would be indirection. |

This is also the answer to "is using `p-4` directly professional": yes —
utility-first on primitives is the industry norm (shadcn/ui, Tailwind's own
guidance). The discipline line is colour only: **themed properties go through
semantic classes; raw palette classes are allowed only for mode-invariant cases**
(e.g. `text-white` over an image). Spacing, radius and type consume the
primitive scale directly.

## Code changes

`src/styles/global.css` renames follow the `2 Theme` table above, then a sweep of
`src/`: **~137 replacements across 37 files**, mechanical. `--color-background-accent`
is removed and its single call site rewritten to a plain white.

Measured usage before the rename:

| Token                            | Occurrences |
| -------------------------------- | ----------- |
| `muted` (exclusive of `muted-*`) | ~62         |
| `muted-border`                   | 30          |
| `muted-background`               | 20          |
| `foreground`                     | 17          |
| `background`                     | 3           |
| `foreground-accent`              | 2           |
| `muted-background-accent`        | 2           |
| `background-accent`              | 1           |

## Migration order

1. ✅ **Shipped 2026-07-29** — Rename `Color` → `2 Theme`; rename its 7 variables;
   set their scopes; delete `color/background-accent`. Rename in `global.css` and
   sweep `src/`. Commits `62c8ccb` (extractor), `cbc0e8f` (`global.css` +
   `token-map.json`), `27bc575` (`src/` sweep); Figma side done in-file (no commit
   — collection renamed in place, id still `VariableCollectionId:3:2`).
2. ✅ **Shipped 2026-07-29** — Correct the font families in Figma
   (`Typography` → `2 Theme`). No commit: `font/sans`, `font/title`, `font/mono`
   created directly in `2 Theme`; `tokens.figma.json` is a gitignored artifact.
3. ✅ **Shipped 2026-08-03** — Built `1 Primitives` (443 base variables from
   the Tailwind mirror + `color/brand/*`, plus a few later additions across
   Plan 2 Tasks 1–7), re-pointed `2 Theme` values to brand aliases, hid the
   collection from publishing, rebound every consumer. 12 old primitive
   collections were deleted in the end, not 11 — a 14th, empty stray
   collection literally named `Primitives` (`VariableCollectionId:453:2`) was
   also found and deleted along with the rest. Figma now holds exactly 3
   collections: `1 Primitives`, `2 Theme`, `Color Tokens`. No commits — this
   work happened live in Figma via `use_figma`, not in the repo; see
   `.superpowers/sdd/plan-2-primitives-merge/progress.md` for the task-by-task
   history.
4. Delete `Color Tokens`.
5. Add `3 Responsive`.

Steps 1–3 are shipped. Step 4 (delete `Color Tokens`) and step 5 (add
`3 Responsive`) are Plan 3.

## Resolved — the binding audit (2026-07-29)

> **Are the S0→S4 masters and the 4 detail templates actually _bound_ to the
> `Spacing`, `Typography`, `Radius`, `Opacity`, `Scale`, `Container`, `Blur`,
> `Border Width` and `Breakpoint` collections — or do they use raw numbers?**

Every page was walked and every `boundVariables` alias resolved to its
collection. **Answer: bound — but narrowly.** This is the verified inventory
that step 3 was priced and gated on (see
`plan-2-primitives-merge.md`'s "Verified binding inventory" section):

| Collection               | Vars | Bindings (whole file)     | Verdict                                                                                                |
| ------------------------ | ---- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Color` → now `2 Theme`  | 8    | **5,225**                 | renamed in place (Plan 1) — untouched here                                                              |
| `Scale`                  | 21   | **4,834**                 | `spacing/1…36` + `radius/*`, raw numbers. The scale the file actually uses.                             |
| `Radius`                 | 10   | **164**                   | aliases into `Number Primitives`                                                                        |
| `Typography`             | 52   | **33** (all `fontWeight`) | font families bound **nowhere**                                                                         |
| `Container`              | 13   | **9**                     |                                                                                                          |
| `Breakpoint`             | 5    | **9**                     |                                                                                                          |
| `Color Tokens`           | 392  | **29**                    | Plan 3 handles these                                                                                     |
| `Color Primitives`       | 299  | **0**                     | free to delete                                                                                            |
| `Spacing`                | 35   | **0**                     | dead duplicate of `Scale`                                                                                 |
| `Opacity`                | 21   | **0**                     | free                                                                                                      |
| `Blur`                   | 7    | **0**                     | free                                                                                                      |
| `Border Width`           | 5    | **0**                     | free                                                                                                      |
| `Number Primitives`      | 60   | **0 direct**              | but `Spacing`/`Radius`/`Container`/`Breakpoint`/`Blur`/`Border Width`/`Typography` all alias _into_ it   |
| `Primitives`             | 0    | 0                          | empty stray collection, not in this inventory — deleted alongside the others                             |

Distribution by page: `📄 Pages` 5,219 bound nodes / 7,774 total; `🧩 Components`
757 / 1,542; `Pages Experiment` 418; `🗄️ Legacy` 128; `🎨 Foundations` 16;
`📖 Cover` 0.

Four findings that changed the plan:

1. **427 variables have zero consumers.** The entire rebinding cost is ~5,049
   bindings across 5 collections, and every one is a mechanical id-swap — one
   deterministic script, not manual work. **Step 3 is worth doing**; the
   "stop after 1, 2, 4, 5" fallback above is withdrawn.
2. **`Scale`, not `Spacing`, is the live scale.** `Spacing` is a 35-variable
   alias layer with no consumers at all.
3. **`Scale` and Tailwind disagree on `radius/lg`** — 16px vs 8px. The remap must
   therefore be **by resolved value, never by name**; a name-based remap would
   silently halve every 16px corner in the file. (`radius/md`→`radius/lg`,
   `radius/lg`→`radius/2xl`.)
4. **`Color Tokens` has 29 live bindings**, contrary to the assumption that the
   blog uses none of it. They rebind to `1 Primitives` / `2 Theme` in step 4.

No font family is bound anywhere, so correcting Merriweather / Inter / JetBrains
Mono costs zero rebinds.

Plans: `plan-1-theme-rename.md` (steps 1–2), `plan-2-primitives-merge.md`
(step 3), `plan-3-cleanup-responsive.md` (steps 4–5).

## Non-goals

- No change to the `tracking/*` reference-only rule.
- No new status colours (error / warning / success). The blog has no use for
  them; `Color Tokens` is being deleted, not adopted.
- No component-level token tier. Seven semantic colours do not need one.
