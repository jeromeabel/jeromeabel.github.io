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
| `CHAPTER / 01 Foundations` | `2670:6678` | 0 | 2000 | 1408 (fixed post-review, see below) | 5821 |
| `CHAPTER / 02 Components` | `2670:6860` | 0 | 7981 | 1408 | 14272.06 |
| `CHAPTER / 03 Sections` | `2670:7567` | 0 | 22413.06 | 1408 | 4932 |
| `CHAPTER / 04 Pages` | `2670:7608` | 0 | 27505.06 | 1408 | 5134 |

Reserved top space is 2000px (~2× `CHAPTER / 00 Read me`'s current height of
926px), leaving room for the future `CHAPTER / 00 About` frame (Task 4) plus
one 160px gap on each side. Column bottom (bottom edge of `04 Pages`) is
32639.06px.

**Resolved — `01 Foundations` is now 1408px wide, matching the other three
chapters.** A code-review pass on commit `4287cd4` flagged the earlier
1600px-wide deviation as insufficient to leave as a self-flagged aside (it
was Task 3's own stated deliverable and would fail Task 9's D8 gate Check 1
on first pass). Re-inspected the frame's full subtree via `use_figma`
(walking every descendant of `2670:6678` for `width > 1408`) instead of
re-guessing from the earlier read: the FIXED-1600 cascade ran through
`PANEL / 01 Tokens Intro` (`2670:6679`) → `token layers` (`2670:6681`) →
`layer card / 1 Primitives` / `2 Theme` / `3 Responsive` (`2670:6682`,
`2670:6686`, `2670:6690`) → `mode tables` (`2670:6694`) → `theme token jobs`
(`2670:6698`), plus a sibling `PANEL / Token Verification` (`2670:6833`) and
its title text node (`2670:6834`, FIXED 1576px). Crucially, none of these
frames' *actual leaf content* needed 1600px: every text node inside topped
out at 900px, and all 15 `token row / *` instances inside `theme token jobs`
were already FIXED at 1180px — well under 1408. The 1600px width was a
container-level choice, not content-driven, so narrowing was non-destructive.

**Fix applied:** resized all 9 FIXED-1600 frames (the chapter frame itself
plus the 8 listed above) to 1408px via `node.resize(1408, node.height)`, and
the `PANEL / Token Verification` title text from 1576px to 1384px (preserving
its original ~24px inset). `SECTION / Icons` (`2670:6820`) needed no touch —
it was already `layoutSizingHorizontal: FILL` and auto-tracked the parent's
new width. Re-walked the full subtree afterward for anything still
`width > 1408`: only one pre-existing, unrelated hit remained — `radius
specimens` (`2670:6775`, HUG-sized to 1506px) inside `SECTION / Radius`,
which is itself FIXED at 640px with `clipsContent: true`. That content was
*already* being clipped at 640px before this fix (a pre-existing overflow
inside the 640px-wide radius section, unrelated to the chapter's outer
1600→1408 width and not something Task 3 introduced or this fix touches);
flagging it here for a future cleanup pass, out of scope for this fix.
Verified with a `screenshot()` of the full chapter frame post-resize: token
tables, decision cards, layer cards, and the token-coverage line all render
intact with no clipped text or overflowing content. All four chapter frames
(`01`–`04 Pages`) now confirmed at `width: 1408, x: 0`.

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

### Task 4: `CHAPTER / 00 About` composed (fold Intro/01 + Intro/02, D8 cap)

**Frame.** Renamed `CHAPTER / 00 Read me` (`2705:21254`) → `CHAPTER / 00
About`, moved from `📚 Introduction` to `📚 Docs` via `appendChild`, positioned
at x=0/y=0 (top of column). Frame is `VERTICAL` auto-layout (width 1408
fixed, height hugs content, `itemSpacing: 24`, `padding: 24` all sides) — not
plain absolute positioning as Task 3's notes assumed; ordering is controlled
by child index (`insertChild`/`appendChild`), not manual `x`/`y`.

**Final height: 1885px** — inside the 2000px budget Task 3 reserved, no
prose cuts needed against the D8 cap (~2× a typical chapter's first-viewport
height).

**Content built, in order, using `_Docs/*` instances only:**

1. `_Docs/ChapterHeader` (`2751:4198`) — number `00`, title `About`, summary
   `What this system is, who it serves, and the rules that govern it.`
2. Mission — one `_Docs/Paragraph` (`2751:5579`), 3 hand-broken lines (50–75
   char measure, see Fix pass below), compressed verbatim-first from
   `Intro/01`'s problem statement: "Front-end engineer in Vue, Astro, Figma &
   Claude Code — ex-artist (code, electronics, mechanics), 10+ years. Only
   ~2.5 years of front-end experience; internal work isn't public, outcomes
   thin." (cut the trailing "not enough seniority / full-stack is the new
   baseline" sentence to hold the ≤3-line cap).
3. Three-layer identity (`2705:21257`) — kept untouched: Chrome / Content /
   Hand `_Docs/DecisionCard` instances + the closing "only one layer can be
   expressive at a time" line, all verbatim from the old Read-me frame.
4. Core rules — one `_Docs/Paragraph` (`2754:4214`), 7 hand-broken bullets
   (50–75 char measure per rendered line, see Fix pass below). **Caveat:**
   no discrete "7 core rules" list exists anywhere in the source (`CHAPTER /
   00 Read me` only had the 3 DecisionCards + 1 closing line; `Intro/01`/`02`
   don't contain a rules list either) — "7 core rules" in the brief/D3/D8 is
   design.md's description of the *target* structure, not a pointer to
   existing extractable content. Synthesized 7 atomic clauses by decomposing
   the existing layer text (Chrome scope + Chrome operating-layer rule;
   Content scope + the type/radius/border rule; metadata-as-third-layer
   rule; Hand definition; the one-expressive-layer closing rule) as a
   **faithful paraphrase, not a verbatim quote** — every clause traces to
   existing Read-me/DecisionCard text and introduces no new claims, but
   several bullets reword rather than reproduce the source string exactly
   (e.g. "Nav, header, footer, buttons, toggles, icons." →
   "Chrome governs nav, header, footer, buttons, toggles, icons."). Flagging
   for review since this is an interpretive call beyond the literal brief
   instruction ("keep verbatim").
5. Audience — one `_Docs/Paragraph` (`2755:4217`), 2-line bulleted list,
   exact brief wording: "Developers — scanning for useful content" /
   "Recruiters & clients — scanning for credibility in under 1 minute".
6. Page intents — one `_Docs/Paragraph` (`2755:4223`), 4-line bulleted list,
   exact brief wording: Home (best-of + links, credibility), Blog
   (findability, reading), Work (proof, case studies), About (trust, the
   person).

**What was cut from Intro/01–02 (per D3 — deep product strategy lives in
`.specs/`, not Figma):** user-flow diagrams, branding rationale, the
full/uncompressed problem-statement prose (only the mission's first 3
sentences survived, verbatim-trimmed), and any narrative framing beyond the
mission/audience/page-intent facts listed above. `Intro/01` and `Intro/02`
themselves were left in place on `📚 Introduction` (not deleted) — deletion is
Task 8's job, after the migration is validated (D3 non-destructive strategy).

**Reused row idiom.** Audience/Page-intents/Core-rules all reuse the file's
own pre-existing "label + multi-line bulleted `_Docs/Paragraph`" pattern
(seen in the original "Target Audience" row) rather than one row per bullet —
keeps instance count low and stays compliant with "instances only, no new
`_Docs/*` masters" (D7).

**Column repositioned to preserve the 160px gap.** Chapter 00's actual
height (1885px) differs from the 2000px placeholder Task 3 reserved, so
`01`–`04` were shifted down by their delta (+45px) to keep the chosen 160px
chapter-to-chapter gap exact on both sides of Chapter 00:

| Frame | ID | old y | new y | width | height |
| --- | --- | --- | --- | --- | --- |
| `CHAPTER / 00 About` | `2705:21254` | — (new) | 0 | 1408 | 1885 |
| `CHAPTER / 01 Foundations` | `2670:6678` | 2000 | 2045 | 1408 | 5821 |
| `CHAPTER / 02 Components` | `2670:6860` | 7981 | 8026 | 1408 | 14272.06 |
| `CHAPTER / 03 Sections` | `2670:7567` | 22413.06 | 22458.06 | 1408 | 4932 |
| `CHAPTER / 04 Pages` | `2670:7608` | 27505.06 | 27550.06 | 1408 | 5134 |

**Verification.** `get_screenshot` of the full `CHAPTER / 00 About` frame
confirms: reads top-to-bottom in one pass, all 6 content blocks visible with
no clipping/overlap, bullets render cleanly (no stray auto-width overflow),
3-line Mission and 7-line Core-rules both wrap correctly within the 824px
slot width.

**Fix pass (post-review, same session).** Code review on commit `0e17cd0`
flagged that Mission and Core-rules text relied on the slot's natural
auto-wrap (824px / 20px) instead of deliberate line breaks — auto-wrap
produced unbalanced lines (Mission: 80/90/32 chars; Core-rules "Hand"
bullet: 86/14 chars) that blew past the 50–75 char D8 measure and left
short orphans. Fixed by hand-breaking every rendered line with Figma's
soft line-break character (U+2028 — same paragraph/bullet, no new list
marker) instead of letting the slot auto-wrap, re-wording a few clauses
slightly to hit measure. Full char-count-per-line verification is in
`.superpowers/sdd/magnet-ds-docs-v1/task-4-report.md` under "Fix pass". No
frame-height change (still 1885px) — this was a wrap-quality fix only, not
a content-length change.

## Task 5 — Chapter 02 grouped per D5 taxonomy

**Audit (Step 1).** `CHAPTER / 02 Components` (`2670:6860`) pre-task held
seven top-level groups (`GROUP / Navigation`, `GROUP / Buttons`,
`GROUP / Typography` — did not exist yet, headings were raw text —
`GROUP / Metadata & Text`, `GROUP / Cards`, `GROUP / Hero & Contact`) plus
two chapter-level orphan cards (not inside any group): DecisionCard
`2670:7549` ("one verb per surface") and DoDont `2670:7550`
("accent-budget"). DecisionCard/DoDont text content (not names) was read to
map every card to one of the six fixed D5 names.

**GroupHeader trigger (Step 2) — created, evidence recorded.**
`_Docs/Headline` was checked against the D8 requirement for a visible size
step between ChapterHeader and group level. Headline renders at 60px
Bubbler One (display font) — **larger** than ChapterHeader's own 40px IBM
Plex Sans SemiBold title, and DecisionCard `2670:6975` (this file's own
rule, in the new Typography group) states "Display font is page-level
only... card titles use sans bold, never display." Using Headline for
group level would both invert the hierarchy (group heading bigger than
chapter heading) and violate the file's own display-font rule. No existing
component expressed a distinct second level, so `_Docs/GroupHeader` was
created: id `2766:4212`, text child `2766:4213` bound to component
property `Title` (default "Group"), 24px IBM Plex Sans SemiBold — exactly
ChapterHeader's 40px × 0.6, same family/weight logic, number-less. Placed
in the private `_Docs/*` masters block (x=3300, y=34740). This is the one
`_Docs/*` addition this task is permitted to make (D7); `_Docs/PageTOC`
remains the only other slot in the whole plan, not touched here.

**Regrouping (Step 3) — final membership, D5 order:**

| Group | ID | Header instance | Content | Height |
| --- | --- | --- | --- | --- |
| `GROUP / Chrome` | `2766:4214` (new frame) | `2766:4215` | NavLink, NavLinkHome, NavLink hover pair, Icon, Link/Icon (+hover), ThemeToggle, MotionToggle, DecisionCard "three icon sizes" (`2670:6897`) | 1254 |
| `GROUP / Actions` | `2670:6862` (renamed from `GROUP / Buttons`) | `2766:5568` | Link/CTA, Link/Secondary, Link/SecondarySm, Link/TextCTA (each cell + hover pair), DecisionCard "three button styles" (`2670:6896`) | 1388 |
| `GROUP / Typography` | `2766:5570` (new frame) | `2766:5571` | H1, H2, PreviewTitle, PageDescription, DecisionCard "display font page-level only" (`2670:6975`), DoDont title-hover (`2670:6978`) | 1183 |
| `GROUP / Metadata` | `2670:6938` (renamed from `GROUP / Metadata & Text`) | `2766:5573` | PostMetadataTime, PostMetadataTopic, SerieMeta, type=day, type=no-date, DecisionCards `2670:6974`/`6976`/`6977`, DoDont chips (`2670:6995`), DoDont accent-budget (`2670:7550`, adopted from chapter-level orphan) | 1692 |
| `GROUP / Cards` | `2670:7013` (unchanged) | pre-existing | PostRow/SerieCard/PostCardPreviewBig/PostCardPreviewSmall/WorkCardPreviewSmall (+ border cells, hover pairs), DecisionCards `2670:7044`–`7047`, "postrow deep dive" frame (`2670:7063`) | 4947 |
| `GROUP / Sections` | `2670:7075` (renamed from `GROUP / Hero & Contact`) | `2766:5575` | HeroText, HeroAnimation, ContactContent, hero.svg, values/quality.svg, 404.svg, arrow-curve.svg, footer.svg, DecisionCards `2670:7547`/`7548`, DecisionCard "one verb per surface" (`2670:7549`, adopted from chapter-level orphan) | 3233.06 |

`GROUP / Navigation` (`2670:6923`) was deleted after confirming empty
(all content already reparented into Chrome) — non-destructive per D3
since the replacement (Chrome) existed first. Top-level children were then
reordered via sequential `insertChild` to the final D5 sequence; being
real auto-layout frames (chapter itemSpacing 64, group itemSpacing 32),
y-positions reflowed automatically — confirmed clean 64px gaps between all
seven children (ChapterHeader + 6 groups).

**Orphan placement — editorial calls, flagged.** Two chapter-level cards
had no single-group home because their content is cross-cutting: DoDont
`2670:7550` ("accent-budget", spans serie chip + section CTA + metadata
color misuse) was placed at the end of Metadata since its DON'T clause
centers on metadata elements; DecisionCard `2670:7549` ("one verb per
surface, ≤150ms", a hover-behavior summary spanning NavLink/Link/PostRow/
SerieCard/Preview) was placed as the closing card of Sections (last group,
reads as a chapter-wide synthesis). Both satisfy the two-level cap (no
chapter-level orphans left) but are interpretive placements, not a clean
categorical fit — noted for reviewer attention.

**1px cascade fix.** Chapter 02's total height shrank by ~1px during
reflow (14272.06 → 14271.06), breaking the exact 160px gap to Chapter 03.
Fixed by shifting `CHAPTER / 03 Sections` (`2670:7567`) y from 22458.06 →
22457.06 and `CHAPTER / 04 Pages` (`2670:7608`) y from 27550.06 → 27549.06
(both −1px) — both gaps verified back to exactly 160px.

**Verification (Step 4).** `get_screenshot` of the full chapter and of each
group individually confirms a clean layer-cake: ChapterHeader, then six
visually distinct `GroupHeader` instances (24px, smaller than
ChapterHeader's 40px, bigger than card titles), cards under each, in D5
order (Chrome, Actions, Typography, Metadata, Cards, Sections). No
clipping or overlap in any group screenshot, including the two groups that
received adopted orphan cards.

**Pre-existing issues found, not fixed (out of scope).**
ChapterHeader's "Components" title wraps oddly ("Compo"/"nents" across two
lines) — instance width unchanged, unrelated to this task's edits.
Literal `&amp;quot;` HTML-entity artifacts appear in some cell description
text (e.g. PostMetadataTime) — pre-existing content issue. `2670:7045` and
`2670:7047` in `GROUP / Cards` carry identical DecisionCard text ("CONTENT
- One chip per card/row...") — likely a pre-existing duplicate; left as-is
since Cards was out of scope for content changes (already D5-compliant)
and D3 forbids deleting without deciding which copy is canonical.

**Fix round 1 (post-review).** Review found `GROUP / Cards`'s heading
(`2670:7014`, raw 30px text "Cards") was never swapped to
`_Docs/GroupHeader` like the other five groups — Cards being
grouping-compliant (Step 3) had been wrongly conflated with heading
compliant (Step 2). Fixed: created `_Docs/GroupHeader` instance
`2771:4217` (Title="Cards"), inserted at index 0 of `2670:7013`, removed
old text node `2670:7014`. All six group headers now resolve to main
component `2766:4212` at the same 24px/31px size (verified by ID lookup,
not just screenshot). New instance is 8px shorter than the old text node,
so `CHAPTER / 02 Components` shrank 14271.06→14263.06px; shifted
`CHAPTER / 03 Sections` and `CHAPTER / 04 Pages` y by −8px each to
restore both 160px gaps exactly (verified via script return values).

## Task 6 — ❖ Components page sections retitled per D5

**Fresh inventory (Step 1).** Re-read the `❖ Components` page (`461:759`)
live rather than trusting the Pass-0 table (flagged as possibly stale after
Tasks 3–5's moves elsewhere in the file — in the event this page itself
turned out untouched by those tasks, IDs matched Pass-0 exactly). Found the
same 8 top-level sections Pass-0 recorded (`App/Header & Footer` `2041:481`,
`App/Icons` `2041:482`, `App/Buttons` `2041:483`, `Hero` `2041:484`,
`App/Typography` `2041:485`, `Blog` `2041:486`, `Work` `2045:429`, `Contact`
`2047:428`), holding 33 components total. Mapped all 33 by name against the
D5 matrix: **exact 1:1 correspondence** — every current component name
matches a D5 entry, and every D5 entry has exactly one live component.
`Link/TextCTA` and `Link/SecondarySm` were already the live names (no
`LinkWithIcon`/`Link/External` legacy naming found, per the brief's
call-out). **No deviations** — nothing to flag for a design.md follow-up.

**Regrouping (Step 2) — final membership:**

| Section | ID | Content | Notes |
| --- | --- | --- | --- |
| `Chrome` | `2041:481` (renamed from `App/Header & Footer`) | NavLink, NavLinkHome, Header, Footer (pre-existing) + ThemeToggle, MotionToggle (moved from `App/Buttons`), Icon (moved from `App/Icons`) | New row added below existing content; section grown 717→909px height |
| `Actions` | `2041:483` (renamed from `App/Buttons`) | Link/CTA, Link/Secondary, Link/TextCTA, Link/Icon, Link/SecondarySm | ThemeToggle/MotionToggle moved out to Chrome; section shifted y −3717→−3517 (+200px) to clear Chrome's growth, no overlap |
| `Typography` | `2041:485` (renamed from `App/Typography`) | H1, H2, PreviewTitle, PageDescription | Unchanged — already exact D5 match, no moves |
| `Metadata` | `2778:303` (new section) | PostMetadataTime, PostMetadataTopic, SerieMeta | All 3 moved from `Blog` |
| `Cards` | `2778:304` (new section) | PostRow, SerieCard, PostCardPreviewBig, PostCardPreviewSmall, WorkCardPreviewSmall | 4 moved from `Blog`, 1 (WorkCardPreviewSmall) from `Work` |
| `Sections` | `2041:484` (renamed from `Hero`) | Hero, HeroText, HeroAnimation (pre-existing) + BlogPreviewSection, ArchiveTable, SerieCardList (from `Blog`), WorkPreviewSection (from `Work`), ContactContent, ContactPreviewSection (from `Contact`) | Grown from 1864×1716 to 3685×2897 to fit 2 new rows below existing Hero content |

`App/Icons` (`2041:482`), `Blog` (`2041:486`), `Work` (`2045:429`), and
`Contact` (`2047:428`) were deleted after confirming 0 remaining children
(checked via script return values immediately before each `.remove()`) —
safe per the brief's Step 2 note that an emptied section container isn't
"content." No `_Docs/*` component was created (none needed — this task is
pure section/component reorganization, not new documentation UI).

**No doc text found (Step 3).** A full `findAllWithCriteria({types:
['TEXT']})` sweep of the whole page returned 147 text nodes — every one
inspected by name/characters is genuine component-internal content (nav
labels, sample post/work titles, "hello@jeromeabel.net", icon captions,
etc.), not usage prose. No DecisionCard/DoDont/paragraph-style documentation
text exists anywhere on this page (that pattern lives only in the Docs
page's chapter frames, per Task 5). Nothing to delete or cross-reference
into chapter 02.

**Verification (Step 4).** Fresh `use_figma` read confirms exactly 6
top-level sections on `461:759`, named `Chrome`, `Actions`, `Sections`,
`Typography`, `Metadata`, `Cards` (verbatim D5 names; top-level order is
page-insertion order, not D5 order — the brief's Step 4 acceptance criteria
for this page don't require D5 ordering, unlike chapter 02's Task 5, so left
as-is). Every D5-listed component is present in its assigned section, counts
match exactly (Chrome 7, Actions 5, Typography 4, Metadata 3, Cards 5,
Sections 9 = 33 total, no orphans). `get_screenshot` of all 5 touched
sections (Chrome, Actions, Metadata, Cards, Sections — Typography untouched,
skipped) shows clean layouts: no clipped text, no overlapping components,
each new/moved item fully inside its section's bounds.

**Geometry approach.** Since this page uses absolute-positioned components
inside SECTION nodes (not auto-layout, unlike the Docs page's chapter
frames), all moves required manually computed relative x/y per child and
manual section resizing — verified no 2D bounding-box overlaps between any
two final (surviving) sections before executing (only transient overlaps
with soon-to-be-deleted sections were tolerated, resolved by the deletions).

## Task 7 — component descriptions: already present, no edit made

**Fresh inventory (Step 1).** Re-read the `❖ Components` page (`461:759`)
live rather than trusting the brief's table. Confirmed Task 6's 6 sections
and exact counts: `Chrome` 7, `Actions` 5, `Typography` 4, `Metadata` 3,
`Cards` 5, `Sections` 9 = 33 top-level published components, all direct
children of a `SECTION` node, no orphan top-level component sitting outside
any section, no underscore-prefixed component anywhere on the page.

**Table row-count correction.** The brief (and plan.md Task 7) states its
description table has "32 rows" with a 33rd live component missing. Re-counted
the table verbatim from `task-7-brief.md` lines 22–54: it actually contains
**33** rows, not 32 (Header … ContactPreviewSection). Diffing all 33 live
component names against all 33 table names gives an **exact 1:1 match** —
every live component has a table row and every table row has a live
component. Nothing is missing; the brief's own row-count claim was an
off-by-one, not evidence of a gap. No 33rd/orphan component exists to write
a bespoke sentence for.

**Major finding — descriptions already filled, richer than the brief's
draft.** A live read of all 33 top-level components' `description` fields
found **zero empty** — every one already carries a substantive, non-empty
description, and none of them match the brief's plain one-sentence drafts.
The live descriptions are consistently richer: they cite the implementing
code file (`Code: src/components/app/Header.astro`, etc.), spell out hover
verbs with exact colour-token transitions and millisecond timings, budget
rules ("at most 1 per viewport"), and cross-references to `design.md`
sections (`§Buttons`, `§Hover`, `§Icons`). Several explicitly narrate this
exact task by name — `Link/Secondary` and `Link/SecondarySm`: "an earlier
stacked-hover border-colour change was reverted in Task 7"; `Link/TextCTA`:
"NOT an underline — corrected in Task 7"; `SerieCard`: "the background lift
and title underline that were also present were reverted in Task 7 as
stacked hover"; `Link/Icon` references a Task 1 fix ("dashed ring removed in
Task 1"). This means the outcome this task was assigned to produce already
exists in the live file, evidently authored through a channel this plan's
`notes.md` history never recorded (no earlier task section here documents
writing component descriptions) — the file has diverged ahead of what this
plan's tracked task log shows.

**Decision: no Figma edit made.** Overwriting the existing descriptions with
the brief's shorter draft sentences would replace more useful, already
Dev-Mode/AI-consumable content with less useful content — a regression, and
inconsistent with this plan's D3 non-destructive principle (nothing is
replaced with something worse; only fill true gaps). Since Step 2's
acceptance criterion ("zero published components with an empty description")
was already true before this task ran, the task's actual objective is met
without writing anything. Full text of all 33 descriptions was captured for
the record (available in `task-7-report.md`, and reproducible via `use_figma`
against the IDs below).

| Section | Component | ID |
| --- | --- | --- |
| Chrome | NavLink | `2001:1309` |
| Chrome | NavLinkHome | `2001:1312` |
| Chrome | Header | `2001:1669` |
| Chrome | Footer | `2099:2560` |
| Chrome | ThemeToggle | `16:11` |
| Chrome | MotionToggle | `16:12` |
| Chrome | Icon | `461:6204` |
| Actions | Link/CTA | `2012:6179` |
| Actions | Link/Secondary | `2041:275` |
| Actions | Link/TextCTA | `2041:313` |
| Actions | Link/Icon | `2093:6332` |
| Actions | Link/SecondarySm | `2350:737` |
| Typography | H2 | `2034:213` |
| Typography | PreviewTitle | `2041:465` |
| Typography | H1 | `2119:7406` |
| Typography | PageDescription | `2119:7440` |
| Metadata | PostMetadataTime | `2040:482` |
| Metadata | PostMetadataTopic | `2371:10414` |
| Metadata | SerieMeta | `2375:10662` |
| Cards | PostCardPreviewBig | `2385:7139` |
| Cards | PostCardPreviewSmall | `2385:7149` |
| Cards | WorkCardPreviewSmall | `2045:378` |
| Cards | PostRow | `2124:7937` |
| Cards | SerieCard | `2367:7205` |
| Sections | HeroText | `2012:6142` |
| Sections | HeroAnimation | `2012:315` |
| Sections | Hero | `2012:6305` |
| Sections | BlogPreviewSection | `2041:560` |
| Sections | ArchiveTable | `2124:8011` |
| Sections | SerieCardList | `2119:7557` |
| Sections | WorkPreviewSection | `2045:428` |
| Sections | ContactContent | `131:101` |
| Sections | ContactPreviewSection | `2114:7281` |

**Verify coverage (Step 2).** Re-ran a live, page-wide
`findAllWithCriteria({types:['COMPONENT','COMPONENT_SET']})` sweep (99 nodes
total: 33 top-level + 66 nested variants). Result: **zero** top-level
published components with an empty description (matches the brief's
expected outcome). 56 of the 66 nested variant-level nodes (`state=default`,
`state=hover`, `size=normal, state=default`, etc.) have empty descriptions —
expected and compliant with the plan's own constraint that a component-set's
description covers its variants and per-variant descriptions aren't required
unless structure demands it; the 10 variants that do carry a description
(e.g. `PostCardPreviewBig`'s `State=default`/`State=hover`) are a pre-existing
bonus, not something this task added or needs to add.

**No `use_figma` write calls were made in this task** — Steps 1 and 2 were
both read/verify-only; Step 3 is this log entry plus the commit below.

## Task 7 fix round 1 — thin descriptions filled, provenance corrected

An independent review of the section above found two Important findings.
Both are addressed here; nothing above is rewritten, only appended to.

**Finding 1 — thin descriptions.** 13 of the 33 top-level components
technically had a non-empty `description` (satisfying Step 2's literal
"zero empty" bar) but the text was only the `<Level> · Code: <path>`
template with no actual descriptive sentence — meaning their purpose was
*not* readable without opening the code, which was Task 7's real intent.
Affected: Header, Footer, ThemeToggle, MotionToggle, H2, HeroText,
HeroAnimation, Hero, BlogPreviewSection, SerieCardList, WorkPreviewSection,
ContactContent, ContactPreviewSection. Two more were checked as borderline
per the reviewer's flag: `Icon` had only an implementation-source list
("astro-icon (lucide, fa6-brands) + custom SVGs in
src/assets/icons/") with no purpose sentence, judged thin and fixed;
`ArchiveTable` already carried "— date-grouped post list" appended to its
`Section · Code: …` prefix, judged sufficiently descriptive and left
untouched.

**Fix applied.** For the 13 plus `Icon` (14 components total), the
brief's Step 1 table sentence (`task-7-brief.md` lines 22–54) was appended
to the existing `<Level> · Code: <path>` description via `use_figma`,
non-destructively (D3) — nothing removed, only appended — using a
consistent `" — "` separator matching the pre-existing `ArchiveTable`
convention. Example: `Header`'s description went from
`"Section · Code: src/components/app/Header.astro"` to
`"Section · Code: src/components/app/Header.astro — Top site chrome: logo,
nav links, theme and motion toggles."`. Same pattern applied to all 14; full
before/after pairs captured in `task-7-report.md`. The ~19 components that
already carried a real descriptive sentence (the `Link/*` family,
`PostCardPreview*`, `PostRow`, `SerieCard`, the metadata components, `H1`,
`PageDescription`, `PreviewTitle`, `ArchiveTable`) were left untouched, per
the instruction to preserve pre-existing good content.

**Finding 2 — provenance mischaracterization, corrected.** The original
section above (and `task-7-report.md`) called the pre-existing rich
descriptions' "Task 7"/"Task 1" self-references an "undocumented channel"
and flagged them for human investigation as a possible manual edit outside
this plan's process. That framing was wrong and the real source is
traceable to two other, already-completed plans on this same Figma file,
both predating `magnet-ds-docs-v1` by days:

- `.specs/02_archives/artistic-direction/plan.md` — its own **Task 1**
  ("Kill dashed at the three source components, and give them a real hover
  verb") is the source of `Link/Icon`'s "dashed ring removed in Task 1"
  language; its own **Task 7** ("Document hover — the missing chapter")
  wrote the hover-verb descriptions with exact colour-token transitions and
  millisecond timings on `Link/Secondary`, `Link/SecondarySm`,
  `Link/TextCTA`, and `SerieCard`.
- `.specs/02_archives/design-system-docs/plan.md` — its **Task 5** ("Give
  every master a description that a recruiter can read") is the source of
  the `<Level> · <what it is>. <the decision it encodes>. Code: <path>`
  template (the plan text: "every master has a non-empty description in
  the form `<Level> · <what it is>. ... Code: <path>`") that all 33
  components carry as a baseline.

Both plans are archived (shipped), confirming these are prior, tracked
work — not an undocumented or out-of-process channel. The "Task 7"/"Task 1"
self-references in the live descriptions refer to *those* plans' own task
numbering, which coincidentally overlaps with this plan's task numbering
since both plans number tasks sequentially from 1. No mystery, no
unaccounted-for edit; `task-7-report.md` carries a correction note pointing
here.

**Verification.** Fresh `use_figma` pull on all 14 touched components
confirmed each now has both the `<Level> · Code: <path>` prefix and a real
sentence. A full page-wide sweep of all 33 top-level published components
(`Chrome` 7 + `Actions` 5 + `Typography` 4 + `Metadata` 3 + `Cards` 5 +
`Sections` 9 = 33) confirmed zero empty descriptions, matching the
pre-fix count (this fix only enriched existing non-empty text, it didn't
change the empty/non-empty tally).
