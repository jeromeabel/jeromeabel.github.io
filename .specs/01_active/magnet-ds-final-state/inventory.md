---
title: Magnet-DS live Pass-0 inventory (phase 1, Task 1)
created: 2026-08-18
source: Figma file ihWIWmvtQPTWgUxlrVjC2c, read live 2026-08-18
---

# Magnet-DS — live Pass-0 inventory

Every task in phases 1–3 resolves its targets **by name** from §Masters below.
Node IDs are recorded for traceability only; they are hints, never the lookup key.

Read with a single batched `use_figma` call (plus two follow-ups: an
absolute-bounding-box recompute for Gate D, and a bound-variable resolve for
Gate C). `get_metadata` was not used for the page list, per §Global Constraints.

## §Pages

| Page                            | id           | children | Top-level children                                                                                                                                                                                                                                |
| ------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📖 Cover                        | `0:1`        | 1        | `FRAME:Cover`                                                                                                                                                                                                                                     |
| 📚 Docs                         | `2736:4`     | 11       | `COMPONENT_SET:_Docs/DecisionCard`, `COMPONENT:_Docs/DoDont`, `COMPONENT_SET:_Docs/Date`, `COMPONENT_SET:_Docs/Status`, `TEXT:— _Docs components (active) —`, 6 × `FRAME:DOC / …`                                                                 |
| ❖ Components                    | `461:759`    | 6        | `SECTION:Chrome`, `SECTION:Actions`, `SECTION:Sections`, `SECTION:Typography`, `SECTION:Metadata`, `SECTION:Cards`                                                                                                                                |
| XP - WorkCard                   | `3034:5541`  | 20       | `FRAME:workcard-variations`, `FRAME:workcard-type-explorations`, `FRAME:blogpostcard-variations`, 14 × loose `RECTANGLE:image …`, `SECTION:Inspirations`, `FRAME:Portfolio Explorations Canvas`, `SECTION:WorkCard Layouts — Polished Variations` |
| 📄 Pages                        | `2558:18264` | 8        | `COMPONENT:Home — Desktop`, `COMPONENT:Home — Mobile`, `COMPONENT:Blog — Desktop`, `COMPONENT:Blog — Mobile`, 4 × `INSTANCE: … [Dark]`                                                                                                            |
| 🗄️ Archive — Decisions (empty)  | `2716:4244`  | 1        | `FRAME:design-decisions`                                                                                                                                                                                                                          |
| 🗄️ Archive — Docs v1 (CHAPTERs) | `3039:4341`  | 12       | 5 × `FRAME:CHAPTER / …`, 7 × `COMPONENT:_Docs/…`                                                                                                                                                                                                  |

**7 pages.** Findings vs. the plan's assumptions:

- **No `📐 Decisions` page exists.** The id the plan lists as a hint (`2716:4244`)
  is now `🗄️ Archive — Decisions (empty)`, i.e. the prior round was already
  archived — Task 2's precondition holds and Task 2 creates the page fresh.
- **`XP - WorkCard` (`3034:5541`) is a live page the spec's page list does not
  mention.** It is a WorkCard exploration canvas (feeds the `work-card-redesign`
  topic), holds zero component masters, and carries 14 loose `RECTANGLE:image …`
  nodes at the page top level. Out of scope for phase 1; noted so phase 3's
  cleanup task decides its fate deliberately rather than by omission.

## §Masters — 49 total

Sorted by page → section → name. Count matches the knowledge-file roster
(11 `_Docs/*` + 34 components + 4 page masters = 49).

### 📚 Docs — 4 (`_Docs/*`, active)

| Name                 | id          | type          |
| -------------------- | ----------- | ------------- |
| `_Docs/DecisionCard` | `2590:571`  | COMPONENT_SET |
| `_Docs/DoDont`       | `2590:588`  | COMPONENT     |
| `_Docs/Date`         | `2693:9890` | COMPONENT_SET |
| `_Docs/Status`       | `2693:9897` | COMPONENT_SET |

### ❖ Components — 34

| Section    | Name                    | id           | type          | w × h       |
| ---------- | ----------------------- | ------------ | ------------- | ----------- |
| Chrome     | `Footer`                | `2969:432`   | COMPONENT_SET | 1654 × 410  |
| Chrome     | `Header`                | `2981:546`   | COMPONENT_SET | 1320 × 256  |
| Chrome     | `HeaderDrawer`          | `2981:4486`  | COMPONENT_SET | 390 × 320   |
| Chrome     | `Icon`                  | `461:6204`   | COMPONENT_SET | 360 × 152   |
| Chrome     | `MotionToggle`          | `16:12`      | COMPONENT_SET | 144 × 84    |
| Chrome     | `NavLink`               | `2001:1309`  | COMPONENT_SET | 203 × 76    |
| Chrome     | `NavLinkHome`           | `2001:1312`  | COMPONENT_SET | 428 × 76    |
| Chrome     | `ThemeToggle`           | `16:11`      | COMPONENT_SET | 144 × 84    |
| Actions    | `Link/IconOnly`         | `2093:6332`  | COMPONENT_SET | 90 × 242    |
| Actions    | `Link/Primary`          | `2012:6179`  | COMPONENT_SET | 220 × 172   |
| Actions    | `Link/Secondary`        | `2041:275`   | COMPONENT_SET | 192 × 172   |
| Actions    | `Link/SecondarySmall`   | `2350:737`   | COMPONENT_SET | 185 × 31    |
| Actions    | `Link/TextLink`         | `2041:313`   | COMPONENT_SET | 138 × 146   |
| Sections   | `BlogPreviewSection`    | `3041:1977`  | COMPONENT_SET | 1536 × 2442 |
| Sections   | `ContactContent`        | `131:101`    | COMPONENT     | 192 × 237   |
| Sections   | `ContactPreviewSection` | `2114:7281`  | COMPONENT     | 1280 × 493  |
| Sections   | `Hero`                  | `2969:412`   | COMPONENT_SET | 1320 × 1376 |
| Sections   | `HeroAnimation`         | `2012:315`   | COMPONENT     | 608 × 500   |
| Sections   | `HeroText`              | `2012:6142`  | COMPONENT     | 576 × 124   |
| Sections   | `PostArchiveList`       | `2977:4382`  | COMPONENT_SET | 1684 × 1256 |
| Sections   | `SerieCardList`         | `2980:499`   | COMPONENT_SET | 1718 × 1175 |
| Sections   | `WorkPreviewSection`    | `2970:4368`  | COMPONENT_SET | 1320 × 1602 |
| Typography | `H1`                    | `2119:7406`  | COMPONENT     | 361 × 60    |
| Typography | `H2`                    | `2034:213`   | COMPONENT     | 87 × 32     |
| Typography | `PageDescription`       | `2119:7440`  | COMPONENT     | 576 × 78    |
| Typography | `PreviewTitle`          | `2041:465`   | COMPONENT     | 1280 × 80   |
| Metadata   | `PostMetadataTime`      | `2040:482`   | COMPONENT_SET | 194 × 130   |
| Metadata   | `PostMetadataTopic`     | `2371:10414` | COMPONENT_SET | 205 × 102   |
| Metadata   | `SerieMeta`             | `2375:10662` | COMPONENT     | 71 × 16     |
| Cards      | `PostCardPreviewBig`    | `2385:7139`  | COMPONENT_SET | 600 × 1044  |
| Cards      | `PostCardPreviewSmall`  | `2385:7149`  | COMPONENT_SET | 648 × 1176  |
| Cards      | `PostRow`               | `2124:7937`  | COMPONENT_SET | 940 × 330   |
| Cards      | `SerieCard`             | `2367:7205`  | COMPONENT_SET | 800 × 357   |
| Cards      | `WorkCardPreviewSmall`  | `2045:378`   | COMPONENT     | 300 × 334   |

### 📄 Pages — 4

| Name             | id          | type      | w × h       |
| ---------------- | ----------- | --------- | ----------- |
| `Home — Desktop` | `2604:1741` | COMPONENT | 1280 × 2741 |
| `Home — Mobile`  | `2604:1742` | COMPONENT | 390 × 4053  |
| `Blog — Desktop` | `2604:1744` | COMPONENT | 1280 × 1801 |
| `Blog — Mobile`  | `2604:1745` | COMPONENT | 390 × 4478  |

### 🗄️ Archive — Docs v1 — 7 (`_Docs/*`, archived; never touched)

`_Docs/ChapterHeader` `2590:537` · `_Docs/SpecimenCell` `2590:542` ·
`_Docs/TokenRow` `2590:578` · `_Docs/Headline` `2708:21413` ·
`_Docs/Paragraph` `2709:21540` · `_Docs/Divider` `2709:21527` ·
`_Docs/GroupHeader` `2766:4212`

### §Sections — ❖ Components layout (absolute bounds)

| Section    | x, y       | w × h       | children |
| ---------- | ---------- | ----------- | -------- |
| Typography | 0, 0       | 1480 × 1004 | 4        |
| Chrome     | 1580, 0    | 1854 × 1249 | 8        |
| Actions    | 3534, 0    | 1280 × 962  | 5        |
| Metadata   | 4914, 0    | 750 × 330   | 3        |
| Cards      | 0, 1349    | 1980 × 1645 | 5        |
| Sections   | 2080, 1349 | 6583 × 5774 | 9        |

## §Variable collections

| Collection      | id                             | vars | modes                      |
| --------------- | ------------------------------ | ---- | -------------------------- |
| `1 Primitives`  | `VariableCollectionId:2013:2`  | 451  | Mode 1                     |
| `2 Theme`       | `VariableCollectionId:3:2`     | 15   | Light, Dark                |
| `3 Responsive`  | `VariableCollectionId:2245:42` | 18   | Desktop, Tablet, Mobile    |
| `Design System` | `VariableCollectionId:2721:4`  | 2    | Mode 1 (exempt from audit) |

All four counts match the spec's assumptions.

## §Primitives-audit

`1 Primitives` holds **451** variables in a single `Mode 1`. The prune
candidates named by the spec are the four unused ramps below (Gate A).

## §Theme-audit — `2 Theme`, 15 variables

| Name                      | id                  | type   | Light → primitive      | Dark → primitive       |
| ------------------------- | ------------------- | ------ | ---------------------- | ---------------------- |
| `color/background`        | `VariableID:3:3`    | COLOR  | `color/brand/lime-100` | `color/brand/gray-800` |
| `color/foreground`        | `VariableID:3:4`    | COLOR  | `color/brand/gray-800` | `color/brand/gray-100` |
| `color/foreground-strong` | `VariableID:3:6`    | COLOR  | `color/brand/gray-900` | `color/brand/gray-50`  |
| `color/foreground-muted`  | `VariableID:3:7`    | COLOR  | `color/brand/gray-500` | `color/brand/gray-300` |
| `color/border`            | `VariableID:3:8`    | COLOR  | `color/brand/lime-300` | `color/brand/gray-600` |
| `color/surface`           | `VariableID:3:9`    | COLOR  | `color/brand/lime-200` | `color/brand/gray-700` |
| `color/surface-hover`     | `VariableID:3:10`   | COLOR  | `color/brand/lime-150` | `color/brand/gray-750` |
| `color/surface-raised`    | `VariableID:2400:7` | COLOR  | `color/brand/lime-250` | `color/brand/gray-650` |
| `color/accent`            | `VariableID:2328:2` | COLOR  | `color/teal/700`       | `color/teal/500`       |
| `color/accent-hover`      | `VariableID:2328:3` | COLOR  | `color/teal/800`       | `color/teal/400`       |
| `color/accent-strong`     | `VariableID:2328:4` | COLOR  | `color/teal/900`       | `color/teal/300`       |
| `color/accent-subtle`     | `VariableID:2328:5` | COLOR  | `color/teal/50`        | `color/teal/950`       |
| `font/sans`               | `VariableID:2006:2` | STRING | `IBM Plex Sans` (raw)  | `IBM Plex Sans` (raw)  |
| `font/title`              | `VariableID:2006:3` | STRING | `Bubbler One` (raw)    | `Bubbler One` (raw)    |
| `font/mono`               | `VariableID:2006:4` | STRING | `Fira Code` (raw)      | `Fira Code` (raw)      |

Scopes: every COLOR var is `["ALL_FILLS","STROKE_COLOR"]`; the three fonts are
`["FONT_FAMILY"]`. **Every colour var aliases a primitive in both modes — zero
raw colour values.** The three `font/*` vars hold raw strings in both modes
(Figma has no `FONT_FAMILY` primitive to alias), identical across Light and Dark.

Observations for Task 4:

- No orphans by the "unreferenced by any node" definition were computed here —
  Task 4 must re-check consumption per variable before proposing any removal.
- No duplicate name/value pair found: all 15 names are distinct, and no two
  colour vars alias the same Light+Dark pair.
- `color/surface-raised` and `color/surface-hover` depend on primitives
  (`lime-150`, `lime-250`, `gray-650`, `gray-750`) that are **not** on the
  Tailwind ramp — they are hand-added brand steps. Confirmed present; do not
  prune them as "off-ramp debris".

## §Gate A — prune safety (mauve / mist / olive / taupe)

**44 variables, all `referenced: false`. Zero BLOCKED. All PRUNE-SAFE.**

| Ramp    | Variables                                   | Count | Verdict    |
| ------- | ------------------------------------------- | ----- | ---------- |
| `mauve` | `color/mauve-{50,100…900,950}` `2015:20–30` | 11    | PRUNE-SAFE |
| `mist`  | `color/mist-{50,100…900,950}` `2015:31–41`  | 11    | PRUNE-SAFE |
| `olive` | `color/olive-{50,100…900,950}` `2015:53–63` | 11    | PRUNE-SAFE |
| `taupe` | `color/taupe-{50,100…900,950}` `2016:41–51` | 11    | PRUNE-SAFE |

No `2 Theme` or `3 Responsive` variable aliases any of them, so Task 3 needs no
rebinding pass before pruning. Node-level consumption is still unproven by this
gate — Task 3 must confirm no canvas node binds them before deleting.

## §Gate B — merge sources

| Spec name              | Live? | Live master            | id          | type          |
| ---------------------- | ----- | ---------------------- | ----------- | ------------- |
| `NavLink`              | ✅    | `NavLink`              | `2001:1309` | COMPONENT_SET |
| `NavLinkHome`          | ✅    | `NavLinkHome`          | `2001:1312` | COMPONENT_SET |
| `PostCardPreviewBig`   | ✅    | `PostCardPreviewBig`   | `2385:7139` | COMPONENT_SET |
| `PostCardPreviewSmall` | ✅    | `PostCardPreviewSmall` | `2385:7149` | COMPONENT_SET |
| `Link/CTA`             | ❌    | `Link/Primary`         | `2012:6179` | COMPONENT_SET |
| `Link/Secondary`       | ✅    | `Link/Secondary`       | `2041:275`  | COMPONENT_SET |
| `Link/SecondarySm`     | ❌    | `Link/SecondarySmall`  | `2350:737`  | COMPONENT_SET |
| `Link/TextCTA`         | ❌    | `Link/TextLink`        | `2041:313`  | COMPONENT_SET |
| `Link/Icon`            | ❌    | `Link/IconOnly`        | `2093:6332` | COMPONENT_SET |

**Finding — the four `Link/*` misses are stale plan aliases, not missing masters.**
All five Link sets exist; the plan fragments (`plan-1a` Gate B list, `plan-1c`
rename-map keys) carry an older naming vintage. `design.md` §ui already names the
live masters explicitly — "`primary` (filled pill; was Primary)", "`inline`
(dashed-underline text; was SecondarySmall)" — so the mapping is unambiguous and
no merge is dropped. Corrected rename-map keys for Task 5 / Task 7:

| Live name             | Canon name          |
| --------------------- | ------------------- |
| `Link/Primary`        | `ui/Link/primary`   |
| `Link/Secondary`      | `ui/Link/secondary` |
| `Link/SecondarySmall` | `ui/Link/inline`    |
| `Link/TextLink`       | `ui/Link/textLink`  |
| `Link/IconOnly`       | `ui/Link/iconOnly`  |

`ui/Link/external` remains a phase-2 new build (no live master), keeping the
final family at 6.

## §Gate C — container debt

Both suspects sit at **pad-x 32, bound to `1 Primitives/spacing/8`** — bound, but
to the wrong variable. Task 8 is real work, not a no-op verification.

| Master                  | Variant              | pad-l / pad-r | bound to    | width | maxWidth |
| ----------------------- | -------------------- | ------------- | ----------- | ----- | -------- |
| `Header`                | `breakpoint=Desktop` | 32 / 32       | `spacing/8` | 1280  | 1280     |
| `Header`                | `breakpoint=Mobile`  | 32 / 32       | `spacing/8` | 1280  | 1280     |
| `ContactPreviewSection` | (single)             | 32 / 32       | `spacing/8` | 1280  | 1280     |

Target for Task 8: rebind `paddingLeft` / `paddingRight` to
`3 Responsive/container/gutter` (`VariableID:2245:44` → `spacing/4` = 16 in all
three modes). Leave the other bindings alone —
`Header.paddingTop/Bottom → header/padding-y`, `itemSpacing → spacing/2`,
`ContactPreviewSection.paddingTop → spacing/24` are not container debt.

Note: `width` on both `Header` variants is bound to `breakpoint/2xl` (1536)
while the resolved width reads 1280 and `maxWidth` is 1280 — worth a second look
in Task 8, but the spec's container recipe only names pad-x, max-w and centering.

## §Gate D — hygiene baseline (the "before" list Task 6 must empty)

Overlaps computed from `absoluteBoundingBox`. The naive section-relative `x`/`y`
comparison in the plan's script yields ~79 false pairs, because a SECTION child's
`x`/`y` is section-relative — the table below is the corrected result.

**5 overlapping master pairs:**

| Page         | Pair                                                  |
| ------------ | ----------------------------------------------------- |
| ❖ Components | `Chrome/NavLinkHome` ∩ `Chrome/HeaderDrawer`          |
| ❖ Components | `Chrome/Header` ∩ `Chrome/HeaderDrawer`               |
| ❖ Components | `Sections/PostArchiveList` ∩ `Sections/SerieCardList` |
| ❖ Components | `Cards/PostCardPreviewSmall` ∩ `Cards/PostRow`        |
| ❖ Components | `Cards/PostCardPreviewSmall` ∩ `Cards/SerieCard`      |

**Strays (section-less masters on ❖ Components): none.** All 34 are inside one of
the 6 sections.

**Section overlaps: none.** The 6 sections are mutually disjoint.

**Masters overflowing their section bounds: 1.**

| Master               | Section  | Master box (x, y, w, h) | Section box (x, y, w, h) | Overflow         |
| -------------------- | -------- | ----------------------- | ------------------------ | ---------------- |
| `WorkPreviewSection` | Sections | 3787, 5611, 1320, 1602  | 2080, 1349, 6583, 5774   | 90px past bottom |

## §Sanity check vs. the spec's assumptions

**Present as expected (30 of 34):** `Header` `Footer` `NavLink` `NavLinkHome`
`HeaderDrawer` `ThemeToggle` `MotionToggle` `Icon` `H1` `H2` `PreviewTitle`
`PageDescription` `Hero` `HeroText` `HeroAnimation` `BlogPreviewSection`
`WorkPreviewSection` `ContactPreviewSection` `ContactContent` `PostArchiveList`
`SerieCardList` `PostCardPreviewBig` `PostCardPreviewSmall` `PostRow` `SerieCard`
`PostMetadataTime` `PostMetadataTopic` `SerieMeta` `WorkCardPreviewSmall`
`Link/Secondary`.

**Present under a different name (4):** the `Link/*` rows in §Gate B.

**Confirmed absent, as the spec requires (6 phase-2 rebuilds):**
`TableOfContents` `SerieContents` `LinkNavPost` `RelatedWork` `WorkHeader`
`RelatedWriting`. No phase-2 rebuild is secretly a rename.
