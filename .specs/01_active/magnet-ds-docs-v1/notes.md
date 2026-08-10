---
title: Magnet DS docs restructure — notes
created: 2026-08-10
---

# Notes

## Node-ID map (Pass 0, 2026-08-10)

Fresh `use_figma` inventory of file `ihWIWmvtQPTWgUxlrVjC2c` ("Magnet-DS-v1.0"),
taken directly (not from `get_metadata`, which is known to go stale on this file).
All later tasks should read IDs from this table, not from the plan header.

| Item | Node ID | Page |
| --- | --- | --- |
| **Pages (12)** | | |
| 📖 Cover | `0:1` | — |
| 📚 Introduction | `2545:671` | — |
| 📐 Decisions | `2716:4244` | — |
| 🎨 Foundations | `5:14` | — |
| ❖ Components | `461:759` | — |
| 📄 Pages | `2558:18264` | — |
| Page 6 (backup) | `2678:6692` | — |
| Page 7 (backup) | `2678:10236` | — |
| Page 8 (backup, empty) | `2678:23308` | — |
| Page 9 (backup, empty) | `2678:32354` | — |
| Page 10 (backup) | `2678:34067` | — |
| Page 11 (backup, empty) | `2678:34657` | — |
| **`_Docs/*` component masters (10)** | | |
| `_Docs/ChapterHeader` | `2590:537` | 📚 Introduction |
| `_Docs/SpecimenCell` | `2590:542` | 📚 Introduction |
| `_Docs/DecisionCard` (component set) | `2590:571` | 📚 Introduction |
| `_Docs/TokenRow` | `2590:578` | 📚 Introduction |
| `_Docs/DoDont` | `2590:588` | 📚 Introduction |
| `_Docs/Date` (component set) | `2693:9890` | 📚 Introduction |
| `_Docs/Status` (component set) | `2693:9897` | 📚 Introduction |
| `_Docs/Headline` | `2708:21413` | 📚 Introduction |
| `_Docs/Paragraph` | `2709:21540` | 📚 Introduction |
| `_Docs/Divider` | `2709:21527` | 📚 Introduction |
| **Chapter frames (5)** | | |
| `CHAPTER / 00 Read me` | `2705:21254` | 📚 Introduction |
| `CHAPTER / 01 Foundations` | `2670:6678` | 📚 Introduction |
| `CHAPTER / 02 Components` | `2670:6860` | 📚 Introduction |
| `CHAPTER / 03 Sections` | `2670:7567` | 📚 Introduction |
| `CHAPTER / 04 Pages` | `2670:7608` | 📚 Introduction |
| **Intro frames** | | |
| `Intro/01` | `2708:21320` | 📚 Introduction |
| `Intro/02` | `2709:21578` | 📚 Introduction |
| **Stray nodes (3)** | | |
| `Frame 1` (levels diagram) | `2708:21292` | 📚 Introduction |
| `Section` (copied-template residue) | `2709:21629` | 📚 Introduction |
| `BLOG DESIGN SYSTEM v1.0` (stale label, text) | `2670:6656` | 📚 Introduction |
| **🎨 Foundations frames (2)** | | |
| `Foundations · Colors` | `6:2` | 🎨 Foundations |
| `Foundations · Typography` | `8:2` | 🎨 Foundations |
| **❖ Components page sections (8)** | | |
| `App/Header & Footer` | `2041:481` | ❖ Components |
| `App/Icons` | `2041:482` | ❖ Components |
| `App/Buttons` | `2041:483` | ❖ Components |
| `Hero` | `2041:484` | ❖ Components |
| `App/Typography` | `2041:485` | ❖ Components |
| `Blog` | `2041:486` | ❖ Components |
| `Work` | `2045:429` | ❖ Components |
| `Contact` | `2047:428` | ❖ Components |
| **📖 Cover** | | |
| Cover frame | `9:2` | 📖 Cover |
| Date chip text node (characters: "Aug 8, 2026") | `I2694:6660;2693:9892` | 📖 Cover |
| Version chip text node — reference only, **do not touch** (D2), characters: "v0.91" | `I2694:6673;2693:9909` | 📖 Cover |

### Deviations

- **Introduction page child count is stale before load.** The un-loaded
  `figma.root.children` pass (before `setCurrentPageAsync`) reported
  `📚 Introduction` as having 9 children; after loading the page via
  `setCurrentPageAsync`, the actual top-level child count is 11 (the 5 chapter
  frames, `_Docs/Components` section, `Intro/01`, `Intro/02`, and the 3 stray
  nodes). This is exactly the staleness the plan warns about — later tasks
  should always drill in with `setCurrentPageAsync` rather than trust an
  unloaded page's `children.length`. All 11 items were captured above; no item
  is actually missing.
- **A second, unrelated node is also named `Frame 1`.** Besides the top-level
  stray `Frame 1` (`2708:21292`), a `findAllWithCriteria` sweep of the whole
  Introduction subtree turned up a nested node also named `Frame 1`
  (`2709:21630`), sitting inside/near the `Section` stray
  (`2709:21629`) — consistent with it being more copied-template residue
  rather than a second copy of the top-level stray. It is **not** one of the
  3 stray nodes the plan tracks (those are the 3 top-level items listed
  above); flagging it so later tasks scoping "delete `Frame 1`" by name alone
  don't accidentally match this nested node instead of, or in addition to,
  the intended top-level one.
- No other mismatches found. All page IDs, the `9:2` cover frame, the
  `6:2`/`8:2` Foundations frames, and the 3 stray-node IDs (`2708:21292`,
  `2709:21629`, `2670:6656`) match the design.md audit exactly. No frame was
  renamed and no listed node was missing.

## D4 salvage verdict

Diff of the old 🎨 Foundations frames against `CHAPTER / 01 Foundations`
(`2670:6678`), per D4.

### Specimen lists

**Old `Foundations · Typography` (`8:2`)** — 17 specimens: Hero/Title,
Heading/H1, Heading/H2, Heading/H3, Body/4xl/semibold, Body/3xl, Body/xl,
Body/xl/medium, Body/l, Body/base, Body/base/medium, Body/s, Body/xs,
Body/xs/medium, Label/Meta, Chip/Mono, Code/Base.

**Count reconciliation (18 vs 17).** Re-checked frame `8:2` directly via
`use_figma`: it has 18 top-level children, not 17 — but one of them (`8:3`,
name `TYPOGRAPHY`) is the frame's own section-title text node, not a
specimen. Excluding it leaves exactly 17 specimens, matching the list above.
The brief's "18" was counting the section title alongside the specimens; not
a stale estimate of *content*, just an off-by-one over what counts as a
specimen row. A subtree-wide name search for `2xl`
(`frame.findAll(n => /2xl/i.test(n.name))`) returned **zero matches** —
`Body/2xl` does not exist anywhere in this frame. The old ramp genuinely
skips from `Body/3xl` straight to `Body/xl`; there is no gap in the
extraction, and no additional diff/salvage check is needed since there is no
`Body/2xl` specimen to check.

**New `SECTION / Type`** inside `CHAPTER / 01 Foundations` (frame
`2670:6727`, specimens container `2670:6730`) — 3 specimens: H1 cell
(`2670:6731`, Display · Bubbler One · page H1 only), H2 cell (`2670:6734`,
Reading · IBM Plex Sans · prose and titles), type=default cell
(`2670:6737`, Machine · Fira Code · dates, read time, counters).

**Old `Foundations · Colors` (`6:2`)** — 12 semantic color tokens:
color/background, color/foreground, color/foreground-strong,
color/foreground-muted, color/border, color/surface, color/surface-hover,
color/accent, color/accent-hover, color/accent-strong, color/accent-subtle,
color/surface-raised. Each row = semantic name + role text + Light/Dark hex
swatches.

**New "theme token jobs" panel** inside `PANEL / 01 Tokens Intro`
(`2670:6698`), rows `2670:6700`–`2670:6714` — the same 12 `color/*` tokens
(plus 3 `font/*` tokens) as bound-variable `token row` instances, each with
name + role + Light value + Dark value.

### Diff result

**Typography.** Literal name-match diff: 14 of 17 old specimens are absent
from `SECTION / Type` (all `Body/*` sizes, Hero/Title, Heading/H3,
Label/Meta, Chip/Mono, Code/Base). Checked whether this is genuine content
loss before treating it as "unique":

- All 17 old specimen names exist as **local Figma text styles**
  (confirmed via `figma.getLocalTextStylesAsync()`) — Hero/Title,
  Heading/H1–H3, Body/3xl through Body/xs (plus the /medium and /semibold
  variants), Label/Meta, Chip/Mono, Code/Base are all present as reusable
  styles, independent of this specimen frame. Deleting the frame does not
  delete the styles (matches D4's own note: "Deleting frames removes no
  local styles/variables").
- Also checked the `❖ Components` page's `App/Typography` section
  (`2041:485`) for a fuller body-scale showcase elsewhere: it documents
  H1, H2, PreviewTitle, PageDescription only — no additional body-scale
  coverage there, but it doesn't matter since the styles persist
  independently of any specimen rendering.
- `SECTION / Type`'s decision card is intentionally curated — "Three
  families, three jobs" (Display/Bubbler One, Reading/IBM Plex Sans,
  Machine/Fira Code), one representative specimen per job, not an
  exhaustive ramp. This matches the docs page's minimalist chapter format
  (D8 prose/specimen budget), not an oversight.

**Colors.** All 12 `color/*` tokens in the old table are also present, by
name, role, and Light/Dark value, in the new "theme token jobs" panel —
full coverage, nothing unique. Presentation differs (swatch rectangle +
hex text in the old frame vs. bound-variable name + resolved-color object
in text form in the new panel) but no semantic content is missing.

### Verdict: nothing unique — safe to delete

No specimen content requires migration. Step 3 (move unique content) is a
no-op: **no Figma edit was made.**

### Flags for later tasks (non-blocking)

- `SECTION / Colour`'s cross-reference text node (`2670:6726`, "Full token
  table with Light and Dark values → Foundations · Colors") will point at
  a deleted page once Task 8 removes 🎨 Foundations. Out of this task's
  scope to fix; whoever executes Task 8 (or a cross-reference cleanup
  pass) should update or remove that sentence.
- Underlying token values (text styles, variables) are unaffected by frame
  deletion either way — confirmed via `getLocalTextStylesAsync()` and
  consistent with D4's own note.

## Docs page build log

Task 3: created `📚 Docs` page, moved the 10 `_Docs/*` masters and the 4
compliant chapter frames onto it. File `ihWIWmvtQPTWgUxlrVjC2c`.

**New page.** `📚 Docs`, ID `2736:4`, inserted at page-list index 1 — directly
after `📖 Cover` (`0:1`) and before `📚 Introduction` (`2545:671`). Verified
via `figma.root.children` order after insert.

**Chapter gap value: 160px.** Chosen because it is ≤200px (per brief), reads
as a clean, visible break between chapter frames (each thousands of px tall)
without being arbitrary, and is a round multiple of the file's 8px base grid.
**Later tasks (4–6) must reuse this same 160px value** for any new
chapter-to-chapter gap they introduce (e.g. Chapter 00 → 01).

**Column layout (top to bottom, x=0 for all four, in `📚 Docs`):**

| Frame | ID | x | y | width | height |
| --- | --- | --- | --- | --- | --- |
| Reserved space for Chapter 00 (Task 4) | — | 0 | 0–2000 | — | 2000 |
| `CHAPTER / 01 Foundations` | `2670:6678` | 0 | 2000 | 1600 | 5821 |
| `CHAPTER / 02 Components` | `2670:6860` | 0 | 7981 | 1408 | 14272.06 |
| `CHAPTER / 03 Sections` | `2670:7567` | 0 | 22413.06 | 1408 | 4932 |
| `CHAPTER / 04 Pages` | `2670:7608` | 0 | 27505.06 | 1408 | 5134 |

Reserved top space is 2000px (~2× `CHAPTER / 00 Read me`'s current height of
926px), leaving room for the future `CHAPTER / 00 About` frame (Task 4) plus
one 160px gap on each side. Column bottom (bottom edge of `04 Pages`) is
32639.06px.

**Deviation — `01 Foundations` is 1600px wide, not 1408px.** The brief and
design.md (`## Cleanup checklist`, "constant width (1408)") call for all
chapter frames to be a uniform 1408px. Three of the four already are; `01
Foundations` (`2670:6678`) is 1600px because its `PANEL / 01 Tokens Intro`
and other direct children are auto-layout `FIXED`-width at 1600px (built
during the D4 salvage pass — a legitimate 2-column token panel), and the
frame itself is `clipsContent: true`. Force-resizing the frame to 1408
without also narrowing/reflowing its children would silently clip ~192px off
the right edge of that content — a destructive content edit, not a move.
Task 3 is scoped to moving nodes, not redesigning chapter content, so the
frame was left at its native 1600px width and only left-edge x-aligned (x=0,
same as the other three) with the rest of the column. **Flagging for a
follow-up task**: either narrow `PANEL / 01 Tokens Intro` (and siblings) to
fit 1408 and then resize the frame, or accept `01 Foundations` as a
documented width exception.

**`_Docs/*` masters — moved, not copied.** All 10 confirmed reparented from
`📚 Introduction` to `📚 Docs` via `appendChild` (which preserves instance
links network-wide): `_Docs/ChapterHeader` (`2590:537`), `_Docs/SpecimenCell`
(`2590:542`), `_Docs/DecisionCard` component set (`2590:571`, all variants),
`_Docs/TokenRow` (`2590:578`), `_Docs/DoDont` (`2590:588`), `_Docs/Date`
component set (`2693:9890`, all variants), `_Docs/Status` component set
(`2693:9897`, all variants), `_Docs/Headline` (`2708:21413`),
`_Docs/Paragraph` (`2709:21540`), `_Docs/Divider` (`2709:21527`). Placed as a
block starting at y=34740 (column bottom + 2000 + 100px label clearance),
under a plain text label `— _Docs components (private) —` (node `2738:12`,
at x=100, y=34640). Relative x/y layout between the 10 masters was preserved
from their original Introduction-page arrangement (only translated as one
block, dy=+34640) — no re-layout needed since they didn't overlap before and
don't overlap now.

**Instance-link verification (Step 3).** Took `get_screenshot` of `CHAPTER /
01 Foundations` (`2670:6678`) while it was still on `📚 Introduction`, *after*
moving the masters but *before* moving the chapter frames themselves. All
`_Docs/*` instances inside it (ChapterHeader, DecisionCard, TokenRow, DoDont,
SpecimenCell, Date, Status, Headline, Paragraph, Divider) rendered
identically — no detached/red/missing-component placeholders. Confirms
`appendChild`-based page moves preserve instance links as expected.

**Column-layout verification (Step 5).** Took `get_screenshot` of the whole
`📚 Docs` page (node `2736:4`) after moving the 4 chapter frames. Result: a
blank band at the top (reserved space), the four chapters stacked in reading
order 01→04 with visible equal gaps between them, and the `_Docs` masters
cluster clearly separated below chapter 04 by the same design. Structure
matches the expected one-column layout.
