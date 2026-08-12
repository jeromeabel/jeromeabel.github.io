---
title: Magnet-DS review — execution notes
created: 2026-08-11
---

# Magnet-DS review — execution notes

## Node-ID map (Pass 0, 2026-08-11)

Captured live via `use_figma` against file `ihWIWmvtQPTWgUxlrVjC2c` (name at
capture time: `Magnet-DS-v1.0`). Every ID below was re-confirmed in this
session — none trusted from review.md without a live read. **Result: every
node ID that review.md/plan.md quoted matched the live file exactly. Zero
drift found.** The one real "staleness" trap encountered is not an ID
mismatch but a **read-timing** issue — see the note under Pages.

### Pages (11)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| 📖 Cover | `0:1` | — | ✅ (ID not given in review.md; captured fresh) |
| 📚 Docs | `2736:4` | — | ✅ |
| 📐 Decisions | `2716:4244` | — | ✅ |
| ❖ Components | `461:759` | — | ✅ |
| 📄 Pages | `2558:18264` | — | ✅ |
| Page 8 | `2678:23308` | — | ✅ |
| Page 9 | `2678:32354` | — | ✅ |
| Page 11 | `2678:34657` | — | ✅ |
| 🗄 Backup — UI kit foundations & controls | `2678:6692` | — | ✅ |
| 🗄 Backup — Getting started & theme overview | `2678:10236` | — | ✅ |
| 🗄 Backup — Brand guidelines template | `2678:34067` | — | ✅ |

**Read-timing note:** the first `use_figma` call (page list without
`setCurrentPageAsync`) reported `childCount: 0` for `📐 Decisions`, `Page 8`,
`Page 9`, and `Page 11` — Figma's dynamic-page loading leaves a page's
`children` empty until that page is made current at least once in a script.
A follow-up call per page (`setCurrentPageAsync` then re-read) returned the
real counts: Decisions `1`, Page 8 `12`, Page 9 `5`, Page 11 `33` — the last
three match review.md's F2 table exactly (12/5/33). Lesson for later tasks:
an unloaded page's `children.length` of `0` is not evidence the page is
empty — load it first.

### Page templates (8) — on `📄 Pages` (2558:18264)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| Home — Mobile — Light | `2604:1742` | 📄 Pages | ✅ |
| Home — Mobile — Dark | `2604:1743` | 📄 Pages | ✅ |
| Home — Desktop — Light | `2604:1741` | 📄 Pages | ✅ (new — not previously IDed) |
| Home — Desktop — Dark | `2604:1739` | 📄 Pages | ✅ (new) |
| Blog — Desktop — Light | `2604:1744` | 📄 Pages | ✅ (new) |
| Blog — Desktop — Dark | `2604:1740` | 📄 Pages | ✅ (new) |
| Blog — Mobile — Light | `2604:1745` | 📄 Pages | ✅ (new) |
| Blog — Mobile — Dark | `2604:1746` | 📄 Pages | ✅ (new) |

### Mobile section components (3)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| BlogPreviewSection — Mobile | `2826:5489` | ❖ Components → `Sections` (2041:484) | ✅ — already correctly grouped (F6 baseline) |
| WorkPreviewSection — Mobile | `2829:5539` | ❖ Components → top-level (parent = page, not `Sections`) | ✅ — confirms F6 defect (misplaced) |
| ContactPreviewSection — Mobile | `2829:5576` | ❖ Components → top-level (parent = page, not `Sections`) | ✅ — confirms F6 defect (misplaced) |

### Component sets (15 named in F5, + 1 extra found)

`❖ Components` (461:759) top-level sections: Chrome (2041:481), Actions
(2041:483), Sections (2041:484), Typography (2041:485), Metadata (2778:303),
Cards (2778:304) — 6 sections, matching review.md's inventory snapshot.

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| NavLink | `2001:1309` | ❖ Components → Chrome | ✅ (new) |
| NavLinkHome | `2001:1312` | ❖ Components → Chrome | ✅ (new) |
| ThemeToggle | `16:11` | ❖ Components → Chrome | ✅ (new) |
| MotionToggle | `16:12` | ❖ Components → Chrome | ✅ (new) |
| Link/CTA | `2012:6179` | ❖ Components → Actions | ✅ (new) |
| Link/Secondary | `2041:275` | ❖ Components → Actions | ✅ (new) |
| Link/TextCTA | `2041:313` | ❖ Components → Actions | ✅ (new) |
| Link/Icon | `2093:6332` | ❖ Components → Actions | ✅ (new) |
| Link/SecondarySm | `2350:737` | ❖ Components → Actions | ✅ (new) |
| PostMetadataTime | `2040:482` | ❖ Components → Metadata | ✅ (new) |
| PostMetadataTopic | `2371:10414` | ❖ Components → Metadata | ✅ (new) |
| PostCardPreviewBig | `2385:7139` | ❖ Components → Cards | ✅ (new) |
| PostCardPreviewSmall | `2385:7149` | ❖ Components → Cards | ✅ (new) |
| PostRow | `2124:7937` | ❖ Components → Cards | ✅ (new) |
| SerieCard | `2367:7205` | ❖ Components → Cards | ✅ (new) |

**Extra, not in F5's scope:** `Icon` component set, `461:6204`, in Chrome.
Distinct from `Link/Icon` — not a target of Task 6, recorded here only so a
later `❖ Components` sweep isn't surprised by 16 sets instead of 15.

### Docs nodes (4)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| PANEL / 01 Tokens Intro | `2670:6679` | 📚 Docs → CHAPTER / 01 Foundations | ✅ |
| CHAPTER / 01 Foundations | `2670:6678` | 📚 Docs | ✅ (new) |
| CHAPTER / 02 Components | `2670:6860` | 📚 Docs | ✅ (new) |
| `_Docs/TokenRow` | `2590:578` | 📚 Docs | ✅ (new) |
| `_Docs/DecisionCard` (COMPONENT_SET) | `2590:571` | 📚 Docs | ✅ (new) |
| `_Docs/SpecimenCell` | `2590:542` | 📚 Docs | ✅ (new) |
| `_Docs/GroupHeader` | `2766:4212` | 📚 Docs | ✅ (new) |

Other `_Docs/*` masters seen but outside the "especially" list (kept for
reference, not part of the required 4): `ChapterHeader` (2590:537), `DoDont`
(2590:588), `Date` (2693:9890, COMPONENT_SET), `Status` (2693:9897,
COMPONENT_SET), `Headline` (2708:21413), `Paragraph` (2709:21540), `Divider`
(2709:21527). Also present: `CHAPTER / 03 Sections` (2670:7567),
`CHAPTER / 04 Pages` (2670:7608), `CHAPTER / 00 About` (2705:21254).

### Variable collections (4)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| 1 Primitives | `VariableCollectionId:2013:2` | — | ✅ (451 vars, 1 mode "Mode 1" — matches review.md's 451 count) |
| 2 Theme | `VariableCollectionId:3:2` | — | ✅ (15 vars, modes Light/Dark) |
| 3 Responsive | `VariableCollectionId:2245:42` | — | ✅ (4 vars, modes Desktop/Tablet/Mobile) |
| Design System | `VariableCollectionId:2721:4` | — | ✅ (2 vars, 1 mode "Mode 1") |

#### `2 Theme` variables (15/15)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| color/background | `VariableID:3:3` | — | ✅ |
| color/foreground | `VariableID:3:4` | — | ✅ |
| color/foreground-strong | `VariableID:3:6` | — | ✅ (F4's "falsely Reserved" list) |
| color/foreground-muted | `VariableID:3:7` | — | ✅ |
| color/border | `VariableID:3:8` | — | ✅ |
| color/surface | `VariableID:3:9` | — | ✅ |
| color/surface-hover | `VariableID:3:10` | — | ✅ |
| font/sans | `VariableID:2006:2` | — | ✅ (F4's "falsely Reserved" list) |
| font/title | `VariableID:2006:3` | — | ✅ (F4's "falsely Reserved" list) |
| font/mono | `VariableID:2006:4` | — | ✅ (F4's "falsely Reserved" list) |
| color/accent | `VariableID:2328:2` | — | ✅ |
| color/accent-hover | `VariableID:2328:3` | — | ✅ (F4's "falsely Reserved" list) |
| color/accent-strong | `VariableID:2328:4` | — | ✅ |
| color/accent-subtle | `VariableID:2328:5` | — | ✅ |
| color/surface-raised | `VariableID:2400:7` | — | ✅ |

All five of F4's "falsely Reserved semantic token" candidates
(`font/sans`, `font/title`, `font/mono`, `color/accent-hover`,
`color/foreground-strong`) confirmed present in `2 Theme` — Task 4 can
target them directly by these IDs.

#### `3 Responsive` variables (4/4)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| container/max-width | `VariableID:2245:43` | — | ✅ |
| container/gutter | `VariableID:2245:44` | — | ✅ |
| section/rhythm-y | `VariableID:2245:45` | — | ✅ |
| viewport/width | `VariableID:2245:46` | — | ✅ |

#### `Design System` variables (2/2 — Task 10's F7 target)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| ds/version | `VariableID:2721:5` | — | ✅ |
| ds/last-updated | `VariableID:2721:6` | — | ✅ |

### Text styles (17: 13 `Tailwind/text-*` + 4 F8 outliers)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| Tailwind/text-9xl | `S:856fe0b82647dd6f489cf42ca21eea0ada46f544,` | — | ✅ |
| Tailwind/text-8xl | `S:d296c532b281c8b8317edc2019e6dbfff7552743,` | — | ✅ |
| Tailwind/text-7xl | `S:de94e308ab03e0121debee283db72c2cb3bc152a,` | — | ✅ |
| Tailwind/text-6xl | `S:9cc961c9643d7928db467bfde1f35b4a29161d3d,` | — | ✅ |
| Tailwind/text-5xl | `S:f3bb8db84212940ec8a6e7fed6b5733a29761de9,` | — | ✅ |
| Tailwind/text-4xl | `S:78c8d23fd76c456b7ebb37346db8622b606b98eb,` | — | ✅ |
| Tailwind/text-3xl | `S:cf8df07ee126851de66cf255b57493a099f807ee,` | — | ✅ |
| Tailwind/text-2xl | `S:e8363f640d9ee6d8a6fb4daa21c8b5327f8b243c,` | — | ✅ |
| Tailwind/text-xl | `S:d51e3a4585ad449154f2bb4def640154ccf68efb,` | — | ✅ |
| Tailwind/text-lg | `S:cfc74dba42187d5277383e1b2e2b71b7f0562c7d,` | — | ✅ |
| Tailwind/text-base | `S:b8b5624c48ca6f2a4af5ec073b3ecdfd598c99e2,` | — | ✅ |
| Tailwind/text-sm | `S:cd44c82232a9fd29ee8ef60c3c3368b8e3cec3fe,` | — | ✅ |
| Tailwind/text-xs | `S:148c27a4101bac03dd0aecb0dd2798d2ee11375e,` | — | ✅ |
| Body/xs/medium | `S:4929cc7e06a3a018b200e83354e9b01f1f52ca7f,` | — | ✅ (F8 outlier) |
| Body/xl/medium | `S:54bfedd7bbe7989a3ee3cf89d2003c62db95a3fb,` | — | ✅ (F8 outlier) |
| Body/4xl/semibold | `S:183278db48dcd3bba55b95b5d679adfaa095c223,` | — | ✅ (F8 outlier) |
| Body/base/medium | `S:efea7acc186902fccab6af958a2a7cf1909b8766,` | — | ✅ (F8 outlier) |

Other text styles exist (`Hero/Title`, `Heading/H1-H3`, `Body/3xl` `/xl`
`/l` `/base` `/s` `/xs`, `Label/Meta`, `Chip/Mono`, `Code/Base` — 13 more,
30 total in the file) but are outside Task 1's Step 2.5 scope, which asked
only for the 13 `Tailwind/*` + 4 outliers.

## Completeness check (Step 4)

| Expected | Found | Status |
|---|---|---|
| 11 pages | 11 | ✅ |
| 8 page templates | 8 | ✅ |
| 3 Mobile section components | 3 | ✅ |
| 15 component sets (F5 scope) | 15 named + 1 extra (`Icon`, out of scope, noted) | ✅ |
| 4 Docs nodes | 4 (PANEL/01 Tokens Intro, CHAPTER/01 Foundations, CHAPTER/02 Components, `_Docs/*` masters group) | ✅ |
| 21 variables (15 Theme + 4 Responsive + 2 metadata) | 21 | ✅ |
| 17 text styles (13 Tailwind + 4 outliers) | 17 | ✅ |

No `❌` rows in this map — every ID quoted by review.md/plan.md was found
live and unchanged. No follow-up-line exceptions needed.

## F1 — Home Mobile Light rebuild (Task 2, 2026-08-11)

**Before (Step 1):** `get_screenshot` of `Home — Mobile — Light` (2604:1742)
rendered at ~1288×2533 against a 390 px frame — matches the defect exactly.
Hero image overlapped the headline; "LET'S TALK", the footer, and the
hand-drawn SVGs sat outside the 390 px frame bounds on both edges.

**Diff against Dark (Step 2):** re-confirmed live (frame IDs, section IDs
all matched notes.md's Pass-0 map, zero drift). Direct children of the
`PageContent (slot)` frame in each variant:

| Section | Light (before) | Dark (known-good) |
|---|---|---|
| Blog | `BlogPreviewSection` → master `2041:560` (Desktop) | `BlogPreviewSection — Mobile` → master `2826:5489` |
| Work | `WorkPreviewSection` → master `2045:428` (Desktop) | `WorkPreviewSection — Mobile` → master `2829:5539` |
| Contact | `ContactPreviewSection` → master `2114:7281` (Desktop) | `ContactPreviewSection — Mobile` → master `2829:5576` |

Confirmed: Light was pointing at the three Desktop masters, exactly as
predicted.

**Instances swapped (Step 3):** used `InstanceNode.swapComponent()` (not
detach) on all three, so future master edits keep propagating:

- `2586:1149` `BlogPreviewSection` → `BlogPreviewSection — Mobile` (`2826:5489`)
- `2586:1150` `WorkPreviewSection` → `WorkPreviewSection — Mobile` (`2829:5539`)
- `2586:1151` `ContactPreviewSection` → `ContactPreviewSection — Mobile` (`2829:5576`)

Instance names updated automatically to match the new masters.

**Sizing cascade fixes (Step 4):** swapping alone left two overrides
carried over from the old Desktop instances, both diagnosed by diffing
against the equivalent Dark node:

1. **Hero illustration bleeding outside the mobile frame.** The `Hero`
   instance (`2586:1148`, shared master `2012:6305`, not swapped — it was
   never wrong at the instance-reference level) still had its
   `HeroAnimation` child (`I2586:1148;2012:6162`, the hand-drawn SVG
   illustration, fixed 608×500) visible. Dark's equivalent instance
   (`2586:1156`) carries an override hiding that child. Applied the same
   override: `visible = false` on the Light `HeroAnimation` child. This
   dropped `Hero`'s height from 580 → 273 px (matches Dark's `Hero` exactly)
   and stopped the illustration overlapping the headline.
2. **`WorkPreviewSection — Mobile` still FIXED-height (rule 1: FILL-inside-HUG-parent deadlock).**
   Post-swap the instance (`2586:1150`) still carried `primaryAxisSizingMode:
   FIXED`, `layoutSizingVertical: FIXED`, height 470 — a leftover override
   from the old Desktop instance. Its internal `WorkPreviewSmallList` child
   (`I2586:1150;2829:5541`) was `layoutSizingVertical: FILL`, which deadlocks
   inside a FIXED-height parent. Fixed in two steps (order matters — content
   must be freed to grow before the instance re-measures against it):
   - `workSection.primaryAxisSizingMode = 'AUTO'` (auto-cascaded
     `layoutSizingVertical` to `HUG` and left `counterAxisSizingMode` at the
     already-correct `FIXED`).
   - `workList.layoutSizingVertical = 'HUG'` on `WorkPreviewSmallList`.
   Result: `WorkPreviewSection — Mobile` height 470 → 1234 px, exactly
   matching Dark's `2586:1158` (1234 px).
   - Rule 2 (`ContactContainer` must be FILL, not FIXED) was checked and
     found already correct on the swapped `ContactPreviewSection — Mobile`
     instance — no fix needed there.
   - `use_figma` mutations are atomic per script; a first combined attempt
     (Hero visibility + both Work fixes in one call) threw `Error: in
     get_name: The node with id "2842:14" does not exist` and rolled back
     with zero changes. Splitting into three separate calls (Hero alone,
     then `primaryAxisSizingMode`, then the child's `layoutSizingVertical`)
     succeeded — no root cause found for the combined-call error, noted here
     in case it recurs on a future multi-mutation script.

**Verify (Step 5):** `get_screenshot` after fixes: frame renders with the
Blog/Work/Contact sections vertically stacked in the mobile layout, Hero
image below (not overlapping) the headline, "LET'S TALK" and the footer
fully inside the frame. Read the frame height via `use_figma`:
**3548 px** — inside the required 3120–3810 px band (±10% of Dark's 3465).
A `findAll` sweep of the whole frame for any descendant wider than 391 px
found exactly **2** remaining nodes, both inside the `HeroText` instance
(`I2586:1148;2012:6158`, FIXED width 576, and its child text node) —
**this exact same override, at the same width, exists on the Dark
reference's equivalent `HeroText` instance** (confirmed by re-screenshotting
Dark: `2604:1743` also renders at a 592 px canvas, not 390, with the same
faint text-ghosting past the right edge). Left unchanged: it is a
pre-existing artifact shared identically by both variants, not part of the
Desktop-section-instance defect this task targets, and "fixing" only Light
would break Light/Dark parity rather than preserve it. Recommended as a
follow-up finding for a future task (Hero's `HeroText` child should be FILL
or HUG rather than a hardcoded 576 px width) — not filed as a new backlog
item here since Task 2's scope is F1 only.

**Before/after summary:**

| | Before | After |
|---|---|---|
| Rendered canvas width | ~1288 px | 390 px (excluding the pre-existing shared Hero-text artifact noted above) |
| Frame height | 2533 px | 3548 px (target 3120–3810) |
| Section masters | 3× Desktop | 3× Mobile (via `swapComponent`, not detach) |
| Hero illustration | overlapping headline | hidden (matches Dark) |
| Footer / LET'S TALK | outside frame bounds | inside frame |

## F1 fix round 1 — Contact section padding parity (Task 2 review finding, 2026-08-11)

**Finding (Important, from task review):** the Step 4 top-down walk checked
`ContactContainer` (correctly FILL, no issue) but stopped one level too
early — it did not walk up to `ContactPreviewContent`
(`I2586:1151;2829:5577`), which carried a leftover Desktop-inherited
`paddingTop`/`paddingBottom` of **80/80**. Dark's equivalent
(`I2586:1159;2829:5577`) has **24/24**. This inflated Light's Contact
section to 429 px vs Dark's 317 px (112 px of extra whitespace, visible as
an oversized gap around "LET'S TALK").

**Fix:** reset `ContactPreviewContent`'s `paddingTop`/`paddingBottom` to
`24`/`24` in `Home — Mobile — Light`. `ContactPreviewContent` height
381 → 269 px; `ContactPreviewSection — Mobile` height 429 → **317 px** —
now an exact match to Dark's `2586:1159` (317 px).

**Re-verification:**

- Frame height: 3548 → **3436 px** (was already inside the 3120–3810 band;
  now measurably closer to Dark's 3465 px — 29 px off instead of 83 px).
- Re-ran the whole-frame width-overflow sweep (`width > 391`): still exactly
  the same 2 pre-existing `HeroText` nodes flagged before the fix, nothing
  new — confirms the padding fix didn't shift or break anything else in the
  frame.
- Re-screenshotted `Home — Mobile — Light`: Blog/Work sections unchanged,
  Hero unchanged, "LET'S TALK" section now has tight, correct spacing
  matching the Mobile design intent — no more 112 px gap.

**Controller sign-off (recorded per reviewer request, no action taken):**
the pre-existing `HeroText` 576 px FIXED-width overflow (2 nodes, ~592 px
rendered canvas instead of 390) is confirmed present identically on the
Dark reference and is **not** a Light-only regression. Signed off as
out-of-scope for F1 — a shared cross-variant defect this task did not
introduce and is not scoped to fix. Not filed as a new backlog item at this
time.

## F2 — page disposition (Task 3, 2026-08-11)

**Step 1 — screenshots.** All six pages screenshotted before any change.
Real content confirmed on every page (none were empty) — matching the
backlog stub's counts, not the plan's original "0 children" assumption:

- `Page 8` (12 top-level frames): "Foundation" typography/color specimen —
  `Display`/`Heading`/`Label`/`Paragraph` classes plus a parallel `Mono *`
  set, a rainbow "01 Primitives" swatch grid, "02 Core"/"03 Semantic"/"03
  Semantic Extensions"/"05 Programs" color groups, two `Layout grids`
  frames. All copy is generic commercial-template filler ("We ignite
  opportunity by setting the world in motion") — not Magnet-DS content.
- `Page 9` (5 frames): "Welcome to Core Pro 👋" — a commercial DS-starter
  template TOC (`🟡 TEMPLATES`/`SECTIONS`/`COMPONENTS`/`FOUNDATIONS`,
  `🚀 Welcome`), explicitly branded "Core Pro", references "Core University"
  and Brad Frost Atomic Design methodology.
- `Page 11` (33 frames): "👇 Start Here" plugin/instructional boilerplate —
  "1. Plugins", "2. Style The Styles", "3. Style The Components",
  "Typography Options" (Small/Medium/Large scale swatches). Uniform generic
  DS-starter onboarding, no Magnet-DS content.
- `🗄 Backup — UI kit foundations & controls` (11 top-level frames): generic
  blue-accent UI kit — Grid/Typography/Colors/Icons/Effects/Select
  controls/Dropdown/Calendar/Navigations/Buttons/Fields. Blue palette does
  not match Magnet-DS's accent.
- `🗄 Backup — Getting started & theme overview` (3 top-level: Getting
  Started frame + Theme/Components Overview sections): generic UI-kit
  walkthrough — Inputs/Feedback/Surfaces/Data Display/Navigation/Layout
  Overview panels, blue accent, unrelated to Magnet-DS.
- `🗄 Backup — Brand guidelines template` (33 top-level frames): "Brand
  Identity Design Presentation" for a fictional brand **"Sync"** ("Sync Your
  Mind. Elevate Your Life.") — logo variants, brand attributes, mockups.
  Entirely unrelated to Jerome Abel's portfolio/Magnet-DS.

**Step 2 — component masters and live-instance check.** Per-page
`findAllWithCriteria({types:['COMPONENT','COMPONENT_SET']})`:

| Page | Local masters found | Live-instance references (Docs/Decisions/Components/Pages) |
|---|---|---|
| `Page 8` | 0 (593 instances, all `remote:true` — resolve to an external published library, e.g. `arrow_right`, `Typography` Class=Display/Heading/Label/Paragraph/Mono-*) | n/a — no local masters to check |
| `Page 9` | 0 (138 instances) | n/a |
| `Page 11` | 0 (706 instances) | n/a |
| `🗄 Backup — UI kit foundations & controls` | **477** (full icon set — Arrows & Directions, User Interface — plus component sets Checkbox, Radiobutton, Toggle, Controls+Text, Dropdown select elements/list, Day, Week, Calendar, Breadcrumbs, Tab elements, Pagination, Button) | **0** — swept all 761+0+160+462 instances across Docs/Decisions/Components/Pages for any `mainComponent.id` in this set of 477: zero hits |
| `🗄 Backup — Getting started & theme overview` | 0 (923 instances) | n/a |
| `🗄 Backup — Brand guidelines template` | **6** (`Sync logo with tagline`, `sync blue logo`, `Sync green logo`, `Sync white and blue logo`, `Sync white logo`, `sync vertical logo`) | **0** — same sweep, zero hits |

**Discrepancy vs. brief Step 2's assumption:** the brief frames "a master
found here" as evidence the `magnet-ds-docs-v1` migration missed it, with
the remedy "move it to 📚 Docs". That assumption doesn't hold for either
page that actually has local masters: `🗄 Backup — UI kit foundations &
controls`'s 477-component generic icon/form-control set (Checkbox,
Radiobutton, Toggle, Dropdown, Calendar, Breadcrumbs, Tabs, Pagination,
Button — a totally different vocabulary from Magnet-DS's actual 16
component sets recorded in the Pass-0 map) and `🗄 Backup — Brand
guidelines template`'s 6 "Sync" logo variants are both (a) visually and
thematically unrelated to Magnet-DS/Jerome Abel's portfolio, and (b)
confirmed to have **zero** live references anywhere in the file. These were
never part of the design system to begin with — they're commercial
template/UI-kit scaffolding that happens to define local components rather
than use remote ones. Nothing was moved to Docs; moving unrelated generic
UI-kit components into the "AI-library-ready" Docs page would work against
the whole point of this review. Recorded here as the judgment call, per the
task instructions, to override the brief's default remedy where the real
content contradicts its assumption.

**Step 3 — verdicts.**

| Page | Verdict | Evidence |
|---|---|---|
| `Page 8` | **delete** | Typography/color specimens are generic commercial-template filler (not Magnet-DS content), fully superseded in kind by `CHAPTER / 01 Foundations` (2670:6678 — screenshotted: real `1 Primitives`/`2 Theme`/`3 Responsive` token tables, spacing/type specimens built from the actual site's own components). Zero local masters; 593 instances all resolve to a remote external library, not anything local this file would lose. No specimen here has "no equivalent in Docs" — the whole page is unrelated scaffolding, not prior Magnet-DS work. |
| `Page 9` | **delete** | Commercial DS-starter ("Core Pro") template TOC/welcome — never authored here, per default verdict. |
| `Page 11` | **delete** | Commercial DS-starter instructional/plugin boilerplate — never authored here, per default verdict. |
| `🗄 Backup — UI kit foundations & controls` | **delete** | Pre-restructure backup; replacement (`📚 Docs`) shipped and passed the D8 gate. 477 local component masters found (see Step 2) but confirmed zero live references anywhere in the file — orphaned generic UI-kit residue, not missed Magnet-DS content. |
| `🗄 Backup — Getting started & theme overview` | **delete** | Pre-restructure backup; replacement (`📚 Docs`) shipped and passed the D8 gate. Zero local masters. |
| `🗄 Backup — Brand guidelines template` | **delete** | Pre-restructure backup; replacement (`📚 Docs`) shipped and passed the D8 gate. 6 local masters found (unrelated "Sync" brand logo) confirmed zero live references. |
| `📐 Decisions` | **keep** | Active page, out of F2's scope (per plan's overlap note) — not touched by this task. |

No page qualified for the `🗄 Backup — typography explorations` rename
exception — every page's content is confirmed-disposable template/backup
residue with no unique Magnet-DS-authored specimen at risk.

**Step 4 — deletions.** Deleted one at a time, re-inventoried after each
(11 pages → 5 pages final). Deletion order: `Page 8`, `Page 9`, `Page 11`,
`🗄 Backup — UI kit foundations & controls`, `🗄 Backup — Getting started &
theme overview`, `🗄 Backup — Brand guidelines template`. Each `page.remove()`
call re-ran `figma.root.children` afterward to confirm the count dropped by
exactly one and no unrelated page was affected.

**Step 5 — verify.** Final page list: `📖 Cover`, `📚 Docs`, `📐 Decisions`,
`❖ Components`, `📄 Pages` — exactly the expected 5, no spared backup.
`get_screenshot` of `📚 Docs` (2736:4) returned a 96×1024 thumbnail for a
3369×36280 px page — too compressed to visually confirm detached/missing
instances, so integrity was verified programmatically instead:
`findAllWithCriteria({types:['INSTANCE']})` on both pages, checking every
instance's `mainComponent` for null (detached) or `.remote` (resolves
outside the file). Result: `📚 Docs` 761 instances (0 missing
mainComponent, 0 remote) and `❖ Components` 160 instances (0 missing, 0
remote) — identical counts to the pre-deletion baseline captured in Step 2.
Deleting the six pages did not detach or orphan any live instance,
confirming the Step 2 zero-reference finding held.

## F3 — Theme variable descriptions (Task 4, 2026-08-11)

**Step 1 — existing copy.** Read verbatim via `use_figma` against
`PANEL / 01 Tokens Intro` (2670:6679), section "THEME TOKEN JOBS (one job
per token)" — 15 `_Docs/TokenRow` instances, one per `2 Theme` variable.
10/15 already carried real usage copy (kept verbatim below, `Source =
docs table`). 5/15 read literally `"Reserved semantic token in the Theme
layer."` — exactly F4's flagged list: `font/sans`, `font/title`,
`font/mono`, `color/accent-hover`, `color/foreground-strong`.

**Step 1b — live-consumer search (beyond the brief's minimum).** Rather
than trust code-side evidence alone for the 5 flagged tokens, ran a
`use_figma` sweep across every currently-live page in the file —
`📖 Cover` (14 nodes), `📚 Docs` (3,429), `📐 Decisions` (198),
`❖ Components` (845), `📄 Pages` (1,518) — 6,004 nodes total, checking
every node's `boundVariables` (JSON-stringify + substring match) against
all 15 `2 Theme` variable IDs. This is the complete live file: Task 3
already deleted `Page 8`/`9`/`11` and the 3 backup pages earlier in this
session, so nothing was skipped. Cross-checked against
`src/styles/global.css` (`@theme` block + dark-mode `@variant` block) for
the code-side counterpart of each token.

| Token | Figma bound-node hits | Code-side evidence |
|---|---|---|
| `color/foreground-strong` | 11 (2 Docs + 9 Components) — bound to `state=active` NavLink instances and their text | `TableOfContents.astro` (`a[aria-current]` color+border), `SerieContents.astro` (`text-foreground-strong` on the current serie post) — both are "current/active item" markers only |
| `font/sans` | 660+ (4 Cover + 333 Docs + 99 Components + 224 Pages) — body paragraphs, nav links, dates, footer email | No explicit `font-sans` class anywhere in `src/` — it's Tailwind v4's `--font-sans` default, applied site-wide to every element that doesn't opt into `font-title`/`font-mono` |
| `font/title` | 8 (5 Docs + 3 Components) — bound to "Hi, I'm Jérôme!" hero heading | `font-title` class on `H1.astro`, `HeroText`, `AboutText`, `ValueCard`, `AboutFacts`, `AboutStrip`, `WorkCard*`, `ContactText` — display/heading typeface only |
| `font/mono` | 406 (211 Docs + 63 Components + 132 Pages) — dates, topic labels ("Web Performance · 2/5"), numbering | `font-mono` class on `PostRow*`, `ArchiveTable`, `TopicChips`, `SeriePostListItem`, `AboutFactsStrip`, `blog.astro` — dates/metadata/topic-chip labels only |
| `color/accent-hover` | **0** across all 6,004 nodes searched | **0** — no `accent-hover`/`hover:*-accent-hover` class or `var(--color-accent-hover)` reference anywhere in `src/`; `global.css` defines the value with a directional-behaviour comment ("darkens on hover" light / "brightens on hover" dark) but nothing binds to it — every hover state found in Figma (`state=hover` components, `Link/Icon`, `Link/Secondary*`) binds to `color/surface-hover` instead |

**Judgment call:** `color/accent-hover` turned out to have genuinely zero
consumers in both Figma and code — F4's "falsely Reserved" framing doesn't
hold for this one token (the other 4 are confirmed real, non-reserved
usage). Per the brief's own escape clause ("No description may be the
string … unless a live search proves … zero consumers in both Figma and
code"), the fired condition is met. Wrote a still-evidence-backed
description rather than reusing the flat placeholder verbatim: it states
the *why* (hover states already have a home — `surface-hover`) so an AI
consumer doesn't mistake it for an untested/broken token.

**Step 2 — `## Theme token copy` table.**

| Token | Description | Source |
|---|---|---|
| `color/background` | Page base canvas; never used for cards or hover states. | docs table |
| `color/foreground` | Primary readable text and icon colour on standard surfaces. | docs table |
| `color/foreground-strong` | Active/current-item marker (TOC link, current serie post); not headings or body text. | new |
| `color/foreground-muted` | Passive metadata and helper text at AA contrast floor. | docs table |
| `color/border` | Default aggregate boundary for cards, rows, and table rails. | docs table |
| `color/surface` | Raised neutral surface for chrome regions like footer blocks. | docs table |
| `color/surface-hover` | Single hover tint for row/card/button hover states only. | docs table |
| `font/sans` | Default body typeface for paragraphs, nav, and UI copy site-wide (IBM Plex Sans). | new |
| `font/title` | Display typeface for H1s, hero headings, and card titles (Bubbler One); not body text. | new |
| `font/mono` | Monospace for dates, topic chips, and metadata labels (Fira Code); not prose text. | new |
| `color/accent` | Interactive accent for serie chips, active nav, and section CTAs. | docs table |
| `color/accent-hover` | Unused reserved slot: hover states currently reuse surface-hover, not this token. | new |
| `color/accent-strong` | Strong accent slot from the fixed budget; never passive metadata. | docs table |
| `color/accent-subtle` | Soft accent backdrop when emphasis is needed without shouting. | docs table |
| `color/surface-raised` | Higher-elevation surface behind grouped content blocks. | docs table |

All 15 descriptions are one sentence, ≤ 90 chars (max observed: 86,
`font/title`). Zero literal "Reserved semantic token in the Theme layer"
strings remain, except in spirit for `color/accent-hover`'s wording, which
is a rewritten, evidence-carrying sentence rather than the banned literal
string.

**Step 3 — applied in Figma.** `use_figma` set `description` on all 15
`VariableID`s in `VariableCollectionId:3:2` (`2 Theme`) from the table
above, keyed by ID (not by re-derived name) to avoid any name-matching
error. `ds/version` (`VariableID:2721:5`, `Design System` collection) was
never touched — different collection, untouched by this script.

**Step 4 — verified.** Fresh `use_figma` read of `2 Theme`
(`VariableCollectionId:3:2`): 15 variables, `emptyCount: 0`, every
`description` string byte-for-byte matches the table above.

**Step 5 — commit.** See repo history for
`docs(specs): magnet-ds-review — F3 Theme variable descriptions`.

## F3 fix round 1 (Task 4, 2026-08-11)

A task reviewer independently re-checked commit `3969e1c` and found the
Step 1 process trusted the existing docs-table copy for all 10
"already good" rows without running the same live-consumer sweep used
for the 5 flagged tokens. One of those 10 (`color/surface`) turned out
to be factually false. Verdict: **Critical — must fix** `color/surface`,
**Important — should fix** run the same sweep against the other 9.

**Method.** Re-ran the grouped `boundVariables` sweep (all 15 token IDs
at once, grouped by `node.type + ':' + node.name`) across all 5 live
pages — `📖 Cover`, `📚 Docs`, `📐 Decisions` (0 hits for any of the 15,
confirmed in the original Step 1b pass, not re-swept), `❖ Components`,
`📄 Pages` — cross-checked against `src/styles/global.css` and a fresh
`grep` over `src/components/**/*.astro` for every token's Tailwind class
(`bg-*`, `text-*`, `border-*`, `hover:*`).

**`color/surface` — CRITICAL, corrected.** Old copy: "Raised neutral
surface for chrome regions like footer blocks." Zero footer-related
node anywhere in the file binds to this token, and
`src/components/app/Footer.astro` has no `surface` reference of any
kind (confirmed by both the reviewer and this re-sweep). Real
consumers: `ThemeToggle`/`MotionToggle` (Chrome section, Components
COMPONENT variants `state=light/dark/on/off`, 1/1/1/1 in Components +
11/3 in Docs + 8/0 in Pages) and `PostMetadataTopic`'s `type=post`
chip fill (10 Components + 40 Docs + 20 Pages) — Docs' own annotation
text spells this out verbatim: *"type=post: muted bg-only box
(color/surface), mono 12/16 UPPER..."*. Code confirms the toggle half:
`ThemeToggle.astro` / `MotionToggle.astro` both carry a static (not
hover) `bg-surface` class. New copy: **"Idle fill for toggle controls
(ThemeToggle, MotionToggle) and topic chips; not footer."**

**Other 9 rows — verification results.**

| Token | Verdict | Evidence |
|---|---|---|
| `color/foreground` | Verified, unchanged | Widely bound to headline/body TEXT + VECTOR icon fills across all 4 non-empty pages; also the Link/CTA default fill/text colour. No contradicting evidence found. |
| `color/foreground-muted` | Verified, unchanged | Dominant consumer across every page — dates, captions, standfirst copy, footer email link (`hello@jeromeabel.net`), passive metadata. Matches description exactly. |
| `color/border` | Verified, unchanged | Binds to `Footer` instances (10 Docs + 1 Components + 8 Pages — this is the token Footer actually uses, not `surface`), `PostRow`, `SerieCard`, `PreviewTitle`, `BlogPostRows`, `ContactPreviewContent`. Matches "cards, rows, and table rails" plus footer as a further aggregate-boundary example. |
| `color/surface-hover` | Verified, unchanged | Binds only to `state=hover` component variants, `Link/Icon`, `Link/Secondary*`, `PostRow` hover, chip `State=hover` variants — exclusively hover-labelled nodes across Components/Docs/Pages. No non-hover consumer found. |
| `font/sans` / `font/title` / `font/mono` | Verified, unchanged | Re-confirmed the original Step 1b sweep's findings (660+/8/406 bound nodes respectively) — no new contradicting evidence in this pass. |
| **`color/background`** | **Corrected** | Old copy claimed "never used for cards or hover states." False: `Link/CTA`'s `state=hover` COMPONENT (`2012:6180`, Components → Actions) binds `fills` to `color/background` (and `strokes` to `color/foreground`) — confirmed by direct node inspection. Code match: `Link.astro`'s `.hover-fx` reveals a `var(--color-background)` fill and flips text to `var(--color-foreground)` on `:hover`. New copy: **"Page base canvas and Link/CTA hover fill (foreground/background invert); not cards."** |
| **`color/accent`** | **Corrected** | Old copy claimed "serie chips, active nav, and section CTAs." Only the serie-chip clause holds — real `PostMetadataTopic` `type=serie` instances bind to `color/accent` (10 Components + 28 Pages + Docs demo), matching Docs' own spec text. Nav-active and CTA claims are unsupported: `Header.astro`'s active nav link uses `text-foreground` (`menuActive` variant), and `Link.astro`'s `cta` variant uses `bg-foreground`/`text-background` — neither touches `accent` in code, and no `NavLink`/`Link/CTA` node binds to `color/accent` in Figma either. New copy: **"Accent for serie-chip icon+label only; nav/CTA use foreground, not accent."** |
| **`color/accent-strong`** | **Corrected — flagged unverified→unused** | Reviewer's spot-check (zero Components/Pages consumers) confirmed. This sweep found the *only* Figma consumer is Docs' own self-referential "layer" annotation-tag UI (`TEXT:layer` ×4, the Chrome/Content/Hand category badges) — not a product surface. Code: `--color-accent-strong` is defined in `global.css` but no `accent-strong` Tailwind class exists anywhere in `src/`. Same status as `color/accent-hover` in the original pass: zero consumers in both Figma and code. New copy: **"Unused reserved slot: zero live consumers found; defined for future high-emphasis accent."** |
| **`color/accent-subtle`** | **Corrected — flagged unverified→unused** | Same pattern as `color/accent-strong`. Only Figma consumer: Docs' self-referential "layer tag" FRAME (×4, category badges). No `accent-subtle` class anywhere in `src/`. New copy: **"Unused reserved slot: zero live consumers found; defined for future soft accent backdrop."** |
| **`color/surface-raised`** | **Corrected** | Old copy claimed "behind grouped content blocks" — no grouped-content-block consumer found anywhere. Real consumers: `ThemeToggle`/`MotionToggle`'s `hover:bg-surface-raised` class (confirmed in both component files — the toggle's hover state steps up from `surface` to `surface-raised`) and a `PostMetadataTopic` instance (1 Docs + 1 Components) matching the `global.css` comment's "topic chip on a hovered row" elevation case. New copy: **"Toggle hover fill (ThemeToggle, MotionToggle) and topic-chip elevation on hovered rows."** |
| `color/accent-hover` | No change (reviewer: minor, deferred) | Still zero consumers in Figma and code — description already states this honestly; reviewer confirmed no action required. |

**Net result:** 6 of the 15 descriptions were corrected (`color/background`,
`color/surface`, `color/accent`, `color/accent-strong`,
`color/accent-subtle`, `color/surface-raised`); 9 held up unchanged
(`color/foreground`, `color/foreground-strong`, `color/foreground-muted`,
`color/border`, `color/surface-hover`, `font/sans`, `font/title`,
`font/mono`, `color/accent-hover`). All 15 now have live-consumer or
code-side evidence — no row is presented as vetted without it.

### `## Theme token copy` — fix round 1 (final)

| Token | Description | Status |
|---|---|---|
| `color/background` | Page base canvas and Link/CTA hover fill (foreground/background invert); not cards. | corrected |
| `color/foreground` | Primary readable text and icon colour on standard surfaces. | verified |
| `color/foreground-strong` | Active/current-item marker (TOC link, current serie post); not headings or body text. | verified |
| `color/foreground-muted` | Passive metadata and helper text at AA contrast floor. | verified |
| `color/border` | Default aggregate boundary for cards, rows, and table rails. | verified |
| `color/surface` | Idle fill for toggle controls (ThemeToggle, MotionToggle) and topic chips; not footer. | corrected (critical) |
| `color/surface-hover` | Single hover tint for row/card/button hover states only. | verified |
| `font/sans` | Default body typeface for paragraphs, nav, and UI copy site-wide (IBM Plex Sans). | verified |
| `font/title` | Display typeface for H1s, hero headings, and card titles (Bubbler One); not body text. | verified |
| `font/mono` | Monospace for dates, topic chips, and metadata labels (Fira Code); not prose text. | verified |
| `color/accent` | Accent for serie-chip icon+label only; nav/CTA use foreground, not accent. | corrected |
| `color/accent-hover` | Unused reserved slot: hover states currently reuse surface-hover, not this token. | verified (unchanged) |
| `color/accent-strong` | Unused reserved slot: zero live consumers found; defined for future high-emphasis accent. | corrected |
| `color/accent-subtle` | Unused reserved slot: zero live consumers found; defined for future soft accent backdrop. | corrected |
| `color/surface-raised` | Toggle hover fill (ThemeToggle, MotionToggle) and topic-chip elevation on hovered rows. | corrected |

All 15 descriptions are one sentence, ≤ 90 chars (max observed: 89,
`color/accent-strong` and `color/accent-subtle`). `ds/version`
(`VariableID:2721:5`, `Design System` collection) was never touched.

**Applied in Figma.** `use_figma` set `description` on the 6 corrected
`VariableID`s only (`3:3`, `3:9`, `2328:2`, `2328:4`, `2328:5`,
`2400:7`) — the other 9 were left untouched since they were already
correct. Fresh `use_figma` read of `2 Theme`
(`VariableCollectionId:3:2`) confirms: 15 variables, `emptyCount: 0`,
every description byte-for-byte matches the table above.

**Commit.** See repo history for
`docs(specs): magnet-ds-review — F3 Theme variable descriptions fix round 1`.

## F4 — token table rebuild

**Before state.** `get_screenshot` of `PANEL / 01 Tokens Intro` (`2670:6679`)
confirmed the defect: Light/Dark cells for the 12 color rows showed raw
`{"r":0.9607843…}` JSON dumps instead of colour.

**Cells rebuilt (swatch-as-spec-card).** The `_Docs/TokenRow` master
(`2590:578`) drives all 15 rows in the panel — confirmed zero other live
consumers of this master anywhere in the file before editing it, so the
structural change is safe. For each of the 12 color rows, the master's
`mode1`/`mode2` cells were rebuilt as a swatch FRAME (fill bound directly to
the Theme variable via `setBoundVariableForPaint`, not pasted hex) containing
a nested `label` TEXT child showing `<primitive alias>` + hex
(e.g. `brand/lime-100 #F5FFE1`). Each swatch's variable-mode context was
pinned with `setExplicitVariableModeForCollection(themeCollection, modeId)`
so the Light column always resolves Light and the Dark column always
resolves Dark regardless of the panel's ambient mode — this is what makes the
swatches re-render correctly on a page-level mode flip.

The 3 font rows (`font/sans`, `font/title`, `font/mono`) have no colour to
swatch. Their swatch frames were kept but set to `fills = []` (transparent),
and the label text restored to plain `Light <family>` / `Dark <family>`
(e.g. `Light IBM Plex Sans`, `Dark Bubbler One`) rather than an alias+hex
pair.

No raw `{"r":…}` JSON remains anywhere in the panel.

**Label-token choice.** For each of the 12 color rows × 2 modes, WCAG
contrast (gamma-corrected relative luminance) was computed against both
`color/foreground` and `color/background` bound as the label fill; the
higher-contrast candidate was bound. All 24 pairings clear 4.5:1 (min
observed ≈5.18:1) — no legibility failures found, so no label-token fix was
required.

**Rows re-copied (Step 3, expanded scope).** The brief names 5 rows to
re-copy (`font/sans`, `font/title`, `font/mono`, `color/accent-hover`,
`color/foreground-strong`). Diffing the live docs-table usage text against
the F3 "fix round 1 (final)" table (this file, above) showed 6 more rows had
been corrected at the `variable.description` level in Task 4 but never
synced to the visible docs table: `color/background`, `color/surface`,
`color/accent`, `color/accent-strong`, `color/accent-subtle`,
`color/surface-raised`. All 11 divergent rows were updated so the docs table
and `variable.description` say the same thing, per the brief's stated goal —
not just the 5 literally named. `color/accent-hover` and
`color/foreground-strong` were the two rows previously mislabelled as
"Reserved semantic token"; both now read as real usage/status text matching
the F3 table.

**Verification.**
- Light mode: full-panel screenshot confirmed all 12 color rows show colour
  with legible alias+hex on-swatch text, the 3 font rows show plain
  readable text, all 11 updated role/usage texts render, zero JSON.
- Dark mode: panel temporarily pinned to Dark
  (`setExplicitVariableModeForCollection(themeCollection, '3:1')`) for a
  verification screenshot — confirmed identical: every swatch cell coloured,
  alias+hex legible on all 12 color rows, font rows read correctly, all 11
  role texts intact, zero JSON. Override reverted immediately after
  (`clearExplicitVariableModeForCollection`) so the panel's ambient mode is
  back to unset, matching its state before this task.
- No legibility failures found in either mode — no label-token fix was
  needed.

`ds/version` (`VariableID:2721:5`, `Design System` collection) was not
touched.

## F5 — property audit (Task 6, 2026-08-11)

**Method note:** the brief's Step 1 suggests `get_design_context` per set (15
calls). Used a single read-only `use_figma` script instead —
`node.componentPropertyDefinitions` on all 15 IDs from the Node-ID map in one
round trip — since the goal is property names/values/types, not layout code
or a screenshot per set. Cheaper, same ground truth.

Live audit (before any rename), all 15 sets from the Node-ID map:

| Set | Property (before) | Type | Values (before) |
|---|---|---|---|
| NavLink | `state` | VARIANT | `active`, `default`, `hover` |
| NavLinkHome | `state` | VARIANT | `active`, `default`, `hover` |
| ThemeToggle | `state` | VARIANT | `dark`, `light` |
| MotionToggle | `state` | VARIANT | `off`, `on` |
| Link/CTA | `state` | VARIANT | `default`, `hover` |
| Link/Secondary | `state` | VARIANT | `default`, `hover` |
| Link/TextCTA | `state` | VARIANT | `active`, `default`, `hover` |
| Link/Icon | `state` | VARIANT | `default`, `hover` |
| Link/SecondarySm | `state` | VARIANT | `active`, `default`, `hover` |
| PostMetadataTime | `type` | VARIANT | `day`, `default`, `no-date` |
| PostMetadataTopic | `type` | VARIANT | `post`, `serie` |
| PostCardPreviewBig | `State` | VARIANT | `default`, `hover` |
| PostCardPreviewSmall | `State` | VARIANT | `default`, `hover` |
| PostRow | `State`, `Variant` | VARIANT, VARIANT | `default`/`hover`; `Post`/`Serie` |
| SerieCard | `State` | VARIANT | `default`, `hover` |

Matches review.md's expected table exactly — zero drift. `Link/TextCTA`,
`Link/Icon`, `Link/SecondarySm` also carry non-variant properties
(`TEXT`/`BOOLEAN`/`INSTANCE_SWAP`) not in scope for this task; unchanged.

**Deviation check (Step 5):** every `state`/`type` value set above is a
subset of `default | hover | active | focus` (interaction states) or an
independent kind-discriminator (`type`, `mode`) — no `disabled`, `pressed`,
or other out-of-vocabulary value found anywhere in the 15 sets. No
deviations to log.

### Renames applied

1. **`State` → `state`** (property-name rename, via `editComponentProperty`,
   non-destructive) on `PostCardPreviewBig` (`2385:7139`),
   `PostCardPreviewSmall` (`2385:7149`), `PostRow` (`2124:7937`), `SerieCard`
   (`2367:7205`). Child variant names auto-updated
   (`State=Default` → `state=default` casing already matched
   `default`/`hover`, only the property key changed).
2. **`Variant` → `type`** (property-name rename) on `PostRow`.
3. **`Post`/`Serie` → `post`/`serie`** (value rename) on `PostRow`'s `type`
   property — done by editing each of the 4 child component names directly
   (`type=Post, state=default` → `type=post, state=default`, etc.), since
   `editComponentProperty` doesn't support renaming VARIANT option values.
   **Verified before/after on live instances**, not just the master: read
   all 32 `PostRow` instances on `📄 Pages` (`2558:18264`, the page holding
   all 8 Home/Blog templates) before the rename (`type` values read
   `Post`/`Serie`) and after (`type` values read `post`/`serie` on all 32,
   `mainComponent.name` on each pointing at the matching new lowercase
   variant — zero instances left pointing at a stale/missing variant).
4. **F9 — `state` → `mode`** (property-name rename) on `ThemeToggle`
   (`16:11`, values `dark`/`light` unchanged) and `MotionToggle` (`16:12`,
   values `on`/`off` unchanged).

`ds/version` was not touched.

### Verification (Step 6)

**Fix round 1 (2026-08-11, post-review):** the original version of this
section scoped instance verification to `📄 Pages` only and then claimed
"`MotionToggle` has zero instances placed in the 8 page templates …
verified structurally only" — worded as if that meant zero instances
existed *anywhere*. That was wrong methodology, not just wrong wording: a
task reviewer swept the other 4 pages and found 3 live `MotionToggle`
instances plus 1 `ThemeToggle` specimen instance on `📚 Docs`. Re-swept the
whole file properly below; the renames themselves were never broken, but
the original check's scope was too narrow to support the claim it made.

**Full-file instance sweep**, all 6 renamed sets
(`PostCardPreviewBig`/`PostCardPreviewSmall`/`PostRow`/`SerieCard`/
`ThemeToggle`/`MotionToggle`), across every page in the file (confirmed via
`figma.root.children`: `📖 Cover`, `📚 Docs`, `📐 Decisions`,
`❖ Components`, `📄 Pages` — 5 pages total; the Node-ID map's Page 8/9/11
and backup pages are no longer top-level children as of Task 3's F2
disposition work):

| Page | Total instances (all types) | Matching instances (6 sets) |
|---|---|---|
| 📖 Cover | 2 | 0 |
| 📚 Docs | 761 | 104 (`SerieCard` 20, `PostRow` 45, `MotionToggle` 3, `ThemeToggle` 11, `PostCardPreviewBig` 6, `PostCardPreviewSmall` 19) |
| 📐 Decisions | 0 | 0 |
| ❖ Components | 160 | 16 (nested instances inside `Sections` mockups) |
| 📄 Pages | 462 | 68 (`ThemeToggle` 8, `PostCardPreviewBig` 4, `PostCardPreviewSmall` 12, `SerieCard` 12, `PostRow` 32) |

**188 live instances total** across the 6 renamed sets. Each was read for
its current property value(s) and `mainComponent.id`/name; a filter flagged
any instance still carrying a pre-rename key (`State`/`Variant`) or a value
outside the renamed vocabulary — **0 flagged**. On `📚 Docs` specifically,
the 3 `MotionToggle` instances the reviewer found are specimen cells in
`CHAPTER / 01 Foundations → SECTION / Motion → "motion control specimens"`
(`2670:6791`, `mode=on`, mainComponent `16:7`; `2670:6794`, `mode=off`,
mainComponent `16:9`) and `CHAPTER / 02 Components → GROUP / Chrome →
"MotionToggle cell"` (`2670:6894`, `mode=on`, mainComponent `16:7`); the
co-located `ThemeToggle` specimen is `2670:6890` (`mode=light`, mainComponent
`16:3`). All four confirmed resolving correctly post-rename.

Screenshots taken and inspected in addition to the property-level sweep:
- `get_screenshot` of `❖ Components` (`461:759`) — full-page overview
  renders normally, no purple/detached-instance badges anywhere.
- `get_screenshot` of `Home — Desktop — Light` (`2604:1741`) — `BLOG`
  section's `PostCardPreviewBig`/`PostCardPreviewSmall` instances (renamed
  `State`→`state`) render fully: images, titles, metadata all present, no
  fallback rendering.
- `get_screenshot` of `Blog — Desktop — Light` (`2604:1744`) — `POSTS`
  section's `PostRow` instances (renamed `Variant`→`type`, values
  `Post`/`Serie`→`post`/`serie`) render fully — topic pills
  (`FULL-STACK`/`WEB PERFORMANCE`) and dates intact, confirming the
  `PostMetadataTopic`/`PostMetadataTime` children nested inside each row
  still resolve correctly through the parent rename.
- Direct `get_screenshot` of `PostRow` (`2124:7937`, all 4 variants),
  `ThemeToggle` (`16:11`), `MotionToggle` (`16:12`) masters — each variant
  cell renders its labelled content (dark/light moon/sun icons,
  play/pause icons, row content), confirming the rename didn't collapse or
  blank any variant.

No breakage found anywhere in the file — proceeded through all renames
without stopping.

### Final property table (set → property → values)

Copy this table verbatim into Task 9's G2 `_Docs/DecisionCard`.

| Set | Property | Values |
|---|---|---|
| NavLink | `state` | `default`, `hover`, `active` |
| NavLinkHome | `state` | `default`, `hover`, `active` |
| ThemeToggle | `mode` | `dark`, `light` |
| MotionToggle | `mode` | `on`, `off` |
| Link/CTA | `state` | `default`, `hover` |
| Link/Secondary | `state` | `default`, `hover` |
| Link/TextCTA | `state` | `default`, `hover`, `active` |
| Link/Icon | `state` | `default`, `hover` |
| Link/SecondarySm | `state` | `default`, `hover`, `active` |
| PostMetadataTime | `type` | `default`, `day`, `no-date` |
| PostMetadataTopic | `type` | `post`, `serie` |
| PostCardPreviewBig | `state` | `default`, `hover` |
| PostCardPreviewSmall | `state` | `default`, `hover` |
| PostRow | `type`, `state` | `post`/`serie`; `default`/`hover` |
| SerieCard | `state` | `default`, `hover` |

**Vocabulary (G2):** interaction states are `default | hover | active | focus`,
lowercase, on a property named `state`. `focus` is not present as a variant
on any set — Task 9's G2 specimen documents it as a spec applied uniformly,
not a per-component variant. `ThemeToggle`/`MotionToggle` use `mode`
(value modes, not interaction states) — deliberately kept out of the `state`
vocabulary. No deviations from the vocabulary were found or logged.

## F6 — mobile sections regrouped (Task 7, 2026-08-12)

**Retry note:** the prior Task 7 attempt (2026-08-11) failed mid-run before
logging or committing. This is the re-run; independently re-verified the
end state below (fresh `use_figma` read of `❖ Components` post-move: exactly
6 top-level items, all `SECTION` type, zero component orphans; `Sections`
children end `…, BlogPreviewSection — Mobile, WorkPreviewSection — Mobile,
ContactPreviewSection — Mobile`; `get_screenshot` of `Sections`,
`Home — Mobile — Dark` (3465px), and `Home — Mobile — Light` (3436px) all
matched what Step 3 below records) before writing this log.

**Step 1 — confirm current placement.** Live `use_figma` read of `❖ Components`
(`461:759`) top-level children: 8 total — the expected 6 sections (Chrome
`2041:481`, Actions `2041:483`, Sections `2041:484`, Typography `2041:485`,
Metadata `2778:303`, Cards `2778:304`) plus exactly the two predicted
orphans, both parented directly to the page (not any section):
`WorkPreviewSection — Mobile` (`2829:5539`) and `ContactPreviewSection —
Mobile` (`2829:5576`). `BlogPreviewSection — Mobile` (`2826:5489`) confirmed
already correctly inside `Sections`, as the last child. Matches the Node-ID
map's F6 baseline exactly — zero drift.

**Step 2 — move both into `Sections`.** `sections.appendChild(work)` then
`sections.appendChild(contact)` (via `use_figma`, non-destructive reparent —
`appendChild` only changes the parent pointer, `mainComponent` bindings on
every instance elsewhere in the file are untouched). Since `appendChild`
adds to the end of the children array and `BlogPreviewSection — Mobile` was
already last, this reparent order alone produced the required
Blog → Work → Contact order with no extra sorting step. Repositioned both
nodes' local `x`/`y` after the reparent so they sit immediately to the right
of `BlogPreviewSection — Mobile` (which occupies section-relative
x485–843, y1656–2838): `WorkPreviewSection — Mobile` → x883, y1656 (right
edge 1241, bottom 2890 — within the section's existing 3685×2897 bounds, no
resize needed); `ContactPreviewSection — Mobile` → x1281, y1656 (right edge
1639, bottom 2021). Note: this row already has pre-existing overlap between
`BlogPreviewSection — Mobile` and the row's Desktop specimens (`ArchiveTable`,
`SerieCardList`) predating this task — the two newly-moved nodes inherit the
same pattern rather than introducing a new one; this page is a component
shelf read node-by-node, not screenshotted whole, so the overlap is
cosmetic, not a defect this task is scoped to fix.

**Step 3 — verify placement and instances.** Fresh `use_figma` read of
`❖ Components` top level: exactly 6 items, all `SECTION` type
(`Chrome`, `Actions`, `Sections`, `Typography`, `Metadata`, `Cards`) —
**zero top-level component orphans**. `Sections`' children: 12 total,
ending `…, BlogPreviewSection — Mobile, WorkPreviewSection — Mobile,
ContactPreviewSection — Mobile` — correct Blog → Work → Contact order.

`get_screenshot` of `Home — Mobile — Dark` (`2604:1743`) and
`Home — Mobile — Light` (`2604:1742`): both render unchanged — Blog/Work/Contact
sections stacked correctly, Hero below the headline, "LET'S TALK" and footer
intact, no fallback/detached-instance rendering. Frame dimensions match the
pre-existing recorded values exactly: Dark 592×3465 (unchanged from the
Node-ID map baseline), Light 592×3436 (unchanged from Task 2 fix round 1's
final height) — confirming the reparent is purely structural and did not
touch any instance anywhere in the file.

`ds/version` was not touched.

## G1 — always-valid pairings block (Task 8, 2026-08-12)

**Step 1 — resolve Theme values.** Live `use_figma` read of `2 Theme`
(`VariableCollectionId:3:2`, modes Light `3:0` / Dark `3:1`) for the 8
tokens needed: `color/background`, `color/foreground`,
`color/foreground-strong`, `color/foreground-muted`, `color/surface`,
`color/accent`, `color/accent-subtle`, `color/accent-strong`. Each Theme
variable's `valuesByMode` entry is a `VARIABLE_ALIAS` into `1 Primitives`,
not a raw color — resolved each alias chain via
`figma.variables.getVariableByIdAsync` to the underlying RGB (kept 0–1,
no /255) and captured the primitive's display name for the swatch labels.
Cross-checked the resolution method against a literal value already present
in an existing `_Docs/TokenRow` instance (`color/background` Light →
`#F5FFE1`, alias `brand/lime-100`) — exact match.

**Step 2 — contrast script.** Wrote `contrast.mjs` in the scratchpad
(never committed) using the brief's exact WCAG 2.x luminance/ratio
functions, with the 8 resolved token values and the 8 required pairs
wired in as data.

**Step 3 — 16 measurements.** Ran `node contrast.mjs` over all 8 pairs ×
2 modes:

| Pair | Mode | Ratio | Verdict |
|---|---|---|---|
| background / foreground | Light | 15.10:1 | AA |
| background / foreground | Dark | 12.63:1 | AA |
| background / foreground-strong | Light | 17.87:1 | AA |
| background / foreground-strong | Dark | 13.71:1 | AA |
| background / foreground-muted | Light | 6.56:1 | AA |
| background / foreground-muted | Dark | 6.29:1 | AA |
| background / accent | Light | 5.18:1 | AA |
| background / accent | Dark | 8.05:1 | AA |
| surface / foreground | Light | 12.84:1 | AA |
| surface / foreground | Dark | 10.87:1 | AA |
| surface / foreground-muted | Light | 5.56:1 | AA |
| surface / foreground-muted | Dark | 5.42:1 | AA |
| accent-subtle / accent-strong | Light | 8.66:1 | AA |
| accent-subtle / accent-strong | Dark | 9.24:1 | AA |
| foreground (CTA fill) / background (CTA text) | Light | 15.10:1 | AA |
| foreground (CTA fill) / background (CTA text) | Dark | 12.63:1 | AA |

All 16 measurements pass AA (≥4.5:1); zero failures. **Finding contradicting
the brief's prediction:** the brief expected `foreground-muted` pairs to be
the tightest (documented as "sitting at the AA floor"). The actual tightest
row is `background / accent` at Light 5.18:1 — tighter than both
`surface / foreground-muted` (Light 5.56:1) and `background /
foreground-muted` (Light 6.56:1). All three still comfortably clear 4.5:1,
so this is a finding to note for future token changes, not a defect: any
future adjustment to `color/accent` or `color/background` in Light should
re-run this pair first, since it now has the smallest margin in the table.

**Step 4 — no failures to handle.** All pairs clear AA; Step 4's
caveat/follow-up-defect branch was not triggered.

**Step 5 — block built in Figma.** In `CHAPTER / 01 Foundations`
(`2670:6678`), appended as an 11th/last child (after `PANEL / Token
Verification`, all 10 original children unchanged and in original order):

- `2893:4234` — `G1 / Always-valid pairings` wrapper FRAME (VERTICAL
  auto-layout, itemSpacing 24, `fills: []`, width FIXED 1408 matching the
  sibling `PANEL` frames' convention, HUG height).
- `2893:4235` — `_Docs/GroupHeader` instance, text "Always-valid pairings".
- `2893:4237` / `2893:4240` — `_Docs/Paragraph` instance (`Title#2709:2`
  = "Note", pattern copied from the live `_Docs/Paragraph` usage on
  `CHAPTER / 00 About`'s `2751:5579`: the `Slot#2709:3` SLOT property is
  filled by directly appending a child TEXT node, not via `setProperties`)
  reading: "These eight pairs are safe without further checking. New
  pairings must be measured before use."
- `2893:4243` — `G1 rows` rows-container FRAME (VERTICAL auto-layout,
  itemSpacing 4, `fills: []`, width FIXED 1408).
- 8 `_Docs/TokenRow` instances (`2893:4260`, `4268`, `4276`, `4284`,
  `4292`, `4300`, `4308`, `4316`), one per pair in table order above.

**Row-field design decision.** The brief's 5-field list ("background
swatch, content swatch, pair name, Light verdict, Dark verdict") does not
map 1:1 onto `_Docs/TokenRow`'s fixed slots (`name`, `role`, `mode1`,
`mode2`, `mode3` — only 2 of which are swatch-capable). Resolved by reusing
the master's existing Light/Dark column semantic exactly as Task 5 did for
the main token table, but making each swatch show the **full pairing** for
that mode: `mode1`/`mode2` frames are filled by the pair's background
token, each pinned to its mode via
`setExplicitVariableModeForCollection('VariableCollectionId:3:2', <modeId>)`;
the nested `label` text inside each swatch is bound to the pair's
foreground/content token (inheriting the same pin via cascade — confirmed
descendant bound-variables resolve against an ancestor's pinned mode unless
they set their own override) and shows `<primitive alias>\n<hex>` for that
token in that mode. `name` = pair display name; `role` = "Light X.XX:1 —
AA"; `mode3` = "Dark X.XX:1 — AA". This is Task 5's swatch treatment
(frame filled by the bound variable directly, primitive alias + hex as a
legible text label on top) reused verbatim, except the label color is now
literally the tested foreground token rather than an auto-picked legible
color — appropriate here since the label color *is* the thing under test,
and it makes each row visually self-demonstrating as the brief requires.

**Step 6 — verification.** `get_screenshot` of the block in ambient
(Light) mode: 8 rows render correctly, each swatch pair showing its bound
colors, all verdict text matching the table above. Temporarily pinned the
wrapper's `2 Theme` mode to Dark (`setExplicitVariableModeForCollection`)
and re-screenshotted to confirm each row's `mode1`/`mode2` swatches stay
independent of ambient context (i.e. always show their own Light/Dark
pairing regardless of what mode the surrounding page is in) — confirmed.

One artifact from that Dark-pin screenshot worth flagging: the
"Always-valid pairings" header and "Note" paragraph rendered faint/low
contrast in that specific screenshot. This is a side effect of the
verification method, not a real defect — the wrapper frame has `fills: []`
(transparent), so with only the wrapper pinned to Dark (not the whole
page), the area outside the individually-filled pairing rows exposed
Figma's raw light-gray canvas rather than a themed dark surface, and text
bound to `color/foreground` resolving to its Dark value (~0.925, near-white)
is close to invisible against that unrelated light-gray canvas. This is an
artifact of isolating one block's variable mode from its page context for
a verification screenshot, not something the shipped design can control —
it would affect any existing header the same way if pinned the same
isolated way, and does not occur when the page is viewed in its normal,
uniformly-themed context. No fix applied; noted here for downstream
awareness. Cleared the temporary override immediately after screenshotting
(`wrapper.clearExplicitVariableModeForCollection('VariableCollectionId:3:2')`,
confirmed `explicitModesAfterClear: {}`).

Final structural check on `CHAPTER / 01 Foundations`: 11 children total
(10 original + 1 new), correct order (new block last), height grew to
7132 (width unchanged at 1408) — purely additive. `ds/version` was not
touched; no scripts read or wrote the `Design System` collection
(`VariableCollectionId:2721:4`) in this task.
