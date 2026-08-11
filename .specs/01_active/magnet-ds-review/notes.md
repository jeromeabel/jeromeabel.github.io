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

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|

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

| Item | Node ID | Section | Confirmed? |
|---|---|---|---|
| NavLink | `2001:1309` | Chrome | ✅ (new) |
| NavLinkHome | `2001:1312` | Chrome | ✅ (new) |
| ThemeToggle | `16:11` | Chrome | ✅ (new) |
| MotionToggle | `16:12` | Chrome | ✅ (new) |
| Link/CTA | `2012:6179` | Actions | ✅ (new) |
| Link/Secondary | `2041:275` | Actions | ✅ (new) |
| Link/TextCTA | `2041:313` | Actions | ✅ (new) |
| Link/Icon | `2093:6332` | Actions | ✅ (new) |
| Link/SecondarySm | `2350:737` | Actions | ✅ (new) |
| PostMetadataTime | `2040:482` | Metadata | ✅ (new) |
| PostMetadataTopic | `2371:10414` | Metadata | ✅ (new) |
| PostCardPreviewBig | `2385:7139` | Cards | ✅ (new) |
| PostCardPreviewSmall | `2385:7149` | Cards | ✅ (new) |
| PostRow | `2124:7937` | Cards | ✅ (new) |
| SerieCard | `2367:7205` | Cards | ✅ (new) |

**Extra, not in F5's scope:** `Icon` component set, `461:6204`, in Chrome.
Distinct from `Link/Icon` — not a target of Task 6, recorded here only so a
later `❖ Components` sweep isn't surprised by 16 sets instead of 15.

### Docs nodes (4)

| Item | Node ID | Page | Confirmed? |
|---|---|---|---|
| PANEL / 01 Tokens Intro | `2670:6679` | 📚 Docs → CHAPTER / 01 Foundations | ✅ |
| CHAPTER / 01 Foundations | `2670:6678` | 📚 Docs | ✅ (new) |
| CHAPTER / 02 Components | `2670:6860` | 📚 Docs | ✅ (new) |
| `_Docs/*` masters — `TokenRow` `2590:578`, `DecisionCard` `2590:571` (COMPONENT_SET), `SpecimenCell` `2590:542`, `GroupHeader` `2766:4212` | 📚 Docs | ✅ (new) |

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
