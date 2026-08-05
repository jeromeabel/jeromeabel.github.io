---
created: 2026-08-05
status: design approved — dashed direction decided via Figma board `EXP / Dashed`
---

# Artistic Direction — design

Decides the site's visual signature: what dashed means, where it lives, how motion is
tokenized, and what the one authored moment is. Research and options live in
[notes.md](notes.md). This file records what was chosen and why.

Target branch: `redesign/v3`. All line references below are v3, not `main`.

## Decision summary

| Question | Decision |
|---|---|
| Dashed semantic | **Chrome only** — never text, never a closed content region |
| Dash rhythm | **6/3 at 1.5px**, authored via an SVG-background utility |
| Prose/default links | **Solid underline**, `text-underline-offset: 4px` |
| Hover verb | **Background tint**, one verb per surface; `hover:border-solid` removed |
| Motion | Tokenized in `@theme`; zero infinite loops |
| About gradient blob | **Dropped** |
| Hero shapes | **Self-draw once on load** (dashed outline → solid fill), no GSAP |
| Covers/illustrations | **Out of scope** — separate spec |

Evidence for the decision: the `EXP / Dashed` Figma board
([node 483:2](https://www.figma.com/design/Wf4iomVMYUXlFIBV3Z8bx4/?node-id=483-2)),
which rendered three semantic hypotheses (OUTSIDE / CHROME / SKETCH→REAL) across the same
six real surfaces at rest and hover, plus a rhythm-and-offset ladder annotated with the CSS
each option costs.

## 1. The dashed rule

**Dashed marks chrome. It never touches text, and it never closes a region around content.**

Two sub-rules make it legible:

- **One edge dashed = divider.** Allowed. A single dashed edge separates things; it does not
  enclose them.
- **Four edges dashed around content = drop zone.** Banned. This is the documented Polaris /
  shadcn / react-dropzone semantic. The Figma board confirmed it visually: the `ValueCard`
  specimen with a full dashed rectangle reads as "drag files here", not as a value card.
- **Pills and circles are exempt** from the four-edge ban. The shape itself already reads as a
  control rather than a region, so a dashed outline does not trigger the drop-zone reading.

### Where dashed lives

| Call site | v3 state | Target |
|---|---|---|
| `Link.astro` `icon` circle | `border-dashed` + `hover:border-solid` | dashed 6/3, hover = tint only |
| `Link.astro` `iconSmall` circle | `border-dashed` + `hover:border-solid` | dashed 6/3, hover = tint only |
| `Link.astro` `external` pill | `border-dashed` + `hover:border-solid` | dashed 6/3, hover = tint only |
| `Hero.astro:14` scroll pill | `border-dashed` | dashed 6/3 |
| `ValueCard.astro:25` border-t / border-l | `border-dashed` | keeps dashed — single edge, divider |
| `cross-big.svg` | `stroke-dasharray:1.5875,.79375` (6/3 at render) | unchanged; it is the rhythm reference |
| Empty states | none exist yet | dashed when introduced |

### Where dashed dies

| Call site | v3 state | Target |
|---|---|---|
| `Link.astro` `default` | `border-b border-dashed` | solid underline, `text-underline-offset: 4px` |
| `Prose.astro:8` `prose-a` | `prose-a:border-dashed` | solid underline, offset 4px |
| `ArchiveTable.astro:39` | `border-b border-dashed` | solid underline, offset 4px |
| `ArchiveTable.astro:57` | `border-b border-dashed` | solid underline, offset 4px |

Rationale: a dashed or dotted underline is the documented UA convention for
`abbr[title]` — tooltip, definition, annotation. Carbon, Procore, Roselli and gwern all
reserve it for that. Using it for ordinary links spends a convention on nothing.

The current implementation also has no offset control: `border-b` sits flush at the box
bottom and runs through descenders. The rhythm ladder on the Figma board shows 4px as the
first offset where glyph descenders clear the line.

### `hover:border-solid` is removed everywhere

Dashed→solid on hover was the H3 gesture. Under the chosen direction, dashed chrome stays
dashed and hover is a background tint — the same single verb the v3 rows already use after
Study C. This also removes a hover signal that had zero external precedent as a link pattern.

## 2. Dash rhythm and implementation

**Target rhythm: 6/3 at 1.5px stroke.** This matches `cross-big.svg`, the one dashed asset on
the site that was authored rather than browser-generated.

`border-dashed` cannot express this. CSS gives no handle on dash length, gap, or weight
independence — the UA picks roughly 3/3 for a 1px border, and it drifts between engines. Side
by side on the board, UA 3/3 reads like a cheap print rule; 6/3 reads authored.

A second, subtler failure: `border-dashed` on a `border-radius: 50%` element distributes dashes
unevenly around the arc. The 48px icon circles are exactly this case.

**Implementation: a single utility using an inline-SVG `background-image`**, with dash length,
gap and weight exposed as CSS custom properties:

- exact and identical across browsers
- works on rounded corners and full circles, evenly
- one definition, applied at every call site — the rhythm cannot drift
- roughly 15 lines of CSS plus swapping the call sites listed above

Rejected alternatives: accepting the UA default and retuning `cross-big.svg` down to 3/3 (free,
but leaves the rhythm browser-defined and the circles uneven); a hybrid of both techniques
(reintroduces the two-rhythm inconsistency that prompted this work).

## 3. Motion system

v3 has **no motion tokens**. Durations are ad-hoc: `0.3s`, `0.4s`, `1.3s`, `2.5s`.

Add to `@theme`:

```
--ease-out:       cubic-bezier(0.23, 1, 0.32, 1)
--ease-in-out:    cubic-bezier(0.77, 0, 0.175, 1)
--duration-fast:  150ms   /* hover, chrome, toggles */
--duration-base:  250ms   /* enter / exit */
--duration-slow:  400ms   /* first-visit hero surfaces only */
```

Ad-hoc duration and easing values are forbidden after this change. Coherence visible in
devtools is itself part of the signal.

| Fix | v3 state | Target |
|---|---|---|
| `Link.astro` `.hover-fx` wipe | `transition: 0.4s` | `--duration-fast` |
| `global.css:139-141` `.reveal` | `1.3s 0.1s ease-in-out` | `--duration-slow` + `--ease-out` |
| `ContactText.astro:42` LinkedIn | `bounce 2.5s ease-in infinite` | 3 bounces on reveal, then rest |
| `ContactText.astro:64` `anim-width` | `2.5s ... infinite` | one pass on reveal |
| `HeroAnimation.astro:125-212` | 6 × infinite float/pulse | replaced — see §5 |

Rules adopted as system:

- UI motion under 300ms; hover and press 100–160ms.
- `transform` and `opacity` only. Entrances ease-out; never ease-in on UI.
- Infinite loops are justified only for ongoing-state indicators (loading, live). None qualify
  on this site.
- Reduced motion is a designed variant, not a kill switch: keep opacity and color fades, drop
  transforms.
- `MotionToggle` (`html[data-motion]`, `@custom-variant motion-off`) drives the same tokens
  rather than maintaining a parallel path.

## 4. About gradient blob

`src/pages/about.astro:11` — orange radial gradient, both light and dark variants.

**Dropped.** Nothing replaces it. The blob is 1/14 in the portfolio survey, belongs to the
2021-era cohort, and is the only element on the site with no relationship to any other element.
The section reads fine flat.

## 5. Hero shapes — the authored moment

`HeroAnimation.astro` currently renders three filled SVG shapes plus three shadow SVGs, driven
by six infinite `float-rotate` / `shadow-pulse` loops. The loops die.

**Replacement: the shapes draw themselves once on load.** They render first as dashed 6/3
outlines, then animate via `stroke-dasharray` into their solid filled form over roughly 1.2s at
first paint.

This is the one authored moment, and it earns its place by performing the system rather than
decorating it: the site's rule is that dashed is the sketch state, and the hero literally shows
the sketch becoming real. Pure CSS — no GSAP, no new dependency.

Reduced motion / `data-motion="off"`: shapes render in their final solid state immediately.

Requires the shape SVGs to expose strokable paths. `shape1-3.svg` are currently fill-only
(14 paths in `shape1.svg`, no `stroke-dasharray`), so they need stroke outlines added as part
of implementation.

## 6. Out of scope

**Covers and illustrations.** Article and work covers are 8 jpg + 1 png across 24 posts and
works, with the `illustration:` frontmatter field currently unused on this branch, and
`cover-studio` owning that pipeline. Redrawing them as line-art SVG under a dashed art
direction is a materially larger project with its own dependencies. It gets its own spec if
pursued; it does not block this one.

**404 easter egg.** The peak-end research argues for a strong ending moment alongside the hero
peak. Not included here — revisit once the hero moment ships and the register is confirmed.

## 7. Figma sync

The `EXP / Dashed` board (page `483:2`) is an experiment artifact, not a source of truth. Once
implementation lands:

- Update the DS components on `Components (new)` to the chosen dashed treatment, so the Figma
  file and code agree.
- `pnpm figma:verify` must pass — if the dash utility introduces new token-bound values (dash
  length, gap, weight), they need Figma variables or an entry in `named-debt.json`.
- The board page can then be deleted or archived.
