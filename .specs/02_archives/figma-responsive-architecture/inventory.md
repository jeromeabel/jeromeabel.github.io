# Figma responsive architecture — live inventory (2026-08-15)

Pass-0 `use_figma` batched call against `ihWIWmvtQPTWgUxlrVjC2c` (Magnet-DS). `get_metadata` not
used for the page list per Global Constraints — it returns only `Cover` on this file.

## §Pages

| Name         | ID           | childCount |
| ------------ | ------------ | ---------- |
| 📖 Cover     | `0:1`        | 1          |
| 📐 Decisions | `2716:4244`  | 1          |
| 📚 Docs      | `2736:4`     | 21         |
| ❖ Components | `461:759`    | 28         |
| 📄 Pages     | `2558:18264` | 8          |

## §Masters

**49 top-level masters** (COMPONENT / COMPONENT_SET not nested in a set). The knowledge-file
roster's 33 (dated 2026-08-06) is stale; the agent report's 56 does not match a live re-count
either — 49 is what this Pass-0 call returns right now.

Sorted by page → section → name.

### 📚 Docs (11)

| Name                | ID           | Type          |
| ------------------- | ------------ | ------------- |
| _Docs/ChapterHeader | `2590:537`   | COMPONENT     |
| _Docs/SpecimenCell  | `2590:542`   | COMPONENT     |
| _Docs/DecisionCard  | `2590:571`   | COMPONENT_SET |
| _Docs/TokenRow      | `2590:578`   | COMPONENT     |
| _Docs/DoDont        | `2590:588`   | COMPONENT     |
| _Docs/Date          | `2693:9890`  | COMPONENT_SET |
| _Docs/Status        | `2693:9897`  | COMPONENT_SET |
| _Docs/Headline      | `2708:21413` | COMPONENT     |
| _Docs/Paragraph     | `2709:21540` | COMPONENT     |
| _Docs/Divider       | `2709:21527` | COMPONENT     |
| _Docs/GroupHeader   | `2766:4212`  | COMPONENT     |

### ❖ Components (34)

**Chrome (8)**

| Name         | ID          | Type          |
| ------------ | ----------- | ------------- |
| NavLink      | `2001:1309` | COMPONENT_SET |
| NavLinkHome  | `2001:1312` | COMPONENT_SET |
| ThemeToggle  | `16:11`     | COMPONENT_SET |
| MotionToggle | `16:12`     | COMPONENT_SET |
| Icon         | `461:6204`  | COMPONENT_SET |
| Footer       | `2969:432`  | COMPONENT_SET |
| Header       | `2981:546`  | COMPONENT_SET |
| HeaderDrawer | `2981:4486` | COMPONENT_SET |

**Actions (5)**

| Name             | ID          | Type          |
| ---------------- | ----------- | ------------- |
| Link/CTA         | `2012:6179` | COMPONENT_SET |
| Link/Secondary   | `2041:275`  | COMPONENT_SET |
| Link/TextCTA     | `2041:313`  | COMPONENT_SET |
| Link/Icon        | `2093:6332` | COMPONENT_SET |
| Link/SecondarySm | `2350:737`  | COMPONENT_SET |

**Sections (9)**

| Name                  | ID          | Type          |
| --------------------- | ----------- | ------------- |
| HeroText              | `2012:6142` | COMPONENT     |
| HeroAnimation         | `2012:315`  | COMPONENT     |
| BlogPreviewSection    | `2041:560`  | COMPONENT     |
| ContactContent        | `131:101`   | COMPONENT     |
| ContactPreviewSection | `2114:7281` | COMPONENT     |
| Hero                  | `2969:412`  | COMPONENT_SET |
| WorkPreviewSection    | `2970:4368` | COMPONENT_SET |
| PostArchiveList       | `2977:4382` | COMPONENT_SET |
| SerieCardList         | `2980:499`  | COMPONENT_SET |

**Typography (4)**

| Name            | ID          | Type      |
| --------------- | ----------- | --------- |
| H2              | `2034:213`  | COMPONENT |
| PreviewTitle    | `2041:465`  | COMPONENT |
| H1              | `2119:7406` | COMPONENT |
| PageDescription | `2119:7440` | COMPONENT |

**Metadata (3)**

| Name              | ID           | Type          |
| ----------------- | ------------ | ------------- |
| PostMetadataTime  | `2040:482`   | COMPONENT_SET |
| PostMetadataTopic | `2371:10414` | COMPONENT_SET |
| SerieMeta         | `2375:10662` | COMPONENT     |

**Cards (5)**

| Name                 | ID          | Type          |
| -------------------- | ----------- | ------------- |
| PostCardPreviewBig   | `2385:7139` | COMPONENT_SET |
| PostCardPreviewSmall | `2385:7149` | COMPONENT_SET |
| WorkCardPreviewSmall | `2045:378`  | COMPONENT     |
| PostRow              | `2124:7937` | COMPONENT_SET |
| SerieCard            | `2367:7205` | COMPONENT_SET |

### 📄 Pages (4)

| Name           | ID          | Type      |
| -------------- | ----------- | --------- |
| Home — Desktop | `2604:1741` | COMPONENT |
| Home — Mobile  | `2604:1742` | COMPONENT |
| Blog — Desktop | `2604:1744` | COMPONENT |
| Blog — Mobile  | `2604:1745` | COMPONENT |

## §Responsive variables

All **18** target variables from design §2 are already present in `3 Responsive`, across all
three modes (Desktop/Tablet/Mobile), and every value matches `scripts/figma/responsive-expected.json`
committed in Task 3 exactly — Task 2's write already happened, contrary to the missing repo-side
`progress.md` trail. `container/gutter` now reads 16/16/16 (was 32/24/16) and `section/rhythm-y`
reads 96/32/32 (was 96/64/48) — both corrected per design §2.

| Variable            | Desktop | Tablet | Mobile |
| ------------------- | ------- | ------ | ------ |
| text/page-title     | 60      | 48     | 36     |
| text/section-title  | 30      | 24     | 20     |
| text/hero-title     | 48      | 36     | 24     |
| text/hero-body      | 24      | 20     | 18     |
| text/nav-link       | 20      | 20     | 16     |
| leading/hero-body   | 30      | 28     | 28     |
| header/padding-y    | 24      | 16     | 16     |
| header/nav-gap      | 40      | 24     | 16     |
| footer/padding-y    | 64      | 64     | 32     |
| footer/gap          | 32      | 32     | 24     |
| footer/link-gap     | 24      | 24     | 8      |
| footer/inner-gap    | 32      | 32     | 16     |
| hero/text-gap       | 16      | 16     | 8      |
| serie-list/gap      | 32      | 16     | 16     |
| container/gutter    | 16      | 16     | 16     |
| section/rhythm-y    | 96      | 32     | 32     |
| container/max-width | 1280    | 1280   | 1280   |
| viewport/width      | 1280    | 768    | 390    |

## §Gate A — Footer illustration

`gateA.found` is **false**. Footer has no illustration. Design §3 "Illustrations" applies to
`HeroAnimation` alone; Task 12 drops the Footer half. Footer's two top-level children are both
`COMPONENT:breakpoint=Desktop` / `COMPONENT:breakpoint=Mobile` — no vector/boolean/image fill
anywhere in the subtree.

## §Gate B — section merge

All four `mobileId` come back `null` — no `<Base> — Mobile` master exists anywhere in the current
49-master roster. This is expected: the report's Tasks 8–11 already deleted the four `— Mobile`
masters and swapped instances to variant-based masters (`PostCardPreviewSmall` and
`WorkPreviewSection` now carry a `breakpoint=Desktop|Mobile` axis directly; `BlogPreviewSection`
and `ContactPreviewSection` remain single COMPONENTs with no Mobile counterpart at all).

| Pair                  | desktopId   | mobileId | Verdict                                                    |
| --------------------- | ----------- | -------- | ---------------------------------------------------------- |
| PostCardPreviewSmall  | `2385:7149` | `null`   | N/A — already merged (variant axis `state` × `breakpoint`) |
| BlogPreviewSection    | `2041:560`  | `null`   | N/A — no Mobile master exists                              |
| WorkPreviewSection    | `2970:4368` | `null`   | N/A — already merged (variant axis `breakpoint`)           |
| ContactPreviewSection | `2114:7281` | `null`   | N/A — no Mobile master exists                              |

## §Gate C — work list master name

No separate work-list master exists. `gateC` returns only `WorkPreviewSection` (`2970:4368`,
COMPONENT_SET) and `WorkCardPreviewSmall` (`2045:378`, COMPONENT). `WorkPreviewSection`'s
`breakpoint=Desktop` variant holds three `WorkCardPreviewSmall` instances directly inside a
`WorkPreviewSmallList` frame (not a master) — confirmed by the Desktop tree dump. Per plan
Step 3.6: the axis is already on `WorkPreviewSection`, and Gate B's `WorkPreviewSection` verdict
is moot (no separate list master to diff against).

## §Sanity check (Step 5)

All twelve named masters from the design exist, with one acknowledged rename already documented
in the plan's own Deviations section:

| Expected             | Found as                           | Status                                                                                |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| H1                   | H1 (`2119:7406`)                   | OK                                                                                    |
| H2                   | H2 (`2034:213`)                    | OK                                                                                    |
| HeroText             | HeroText (`2012:6142`)             | OK                                                                                    |
| HeroAnimation        | HeroAnimation (`2012:315`)         | OK                                                                                    |
| Hero                 | Hero (`2969:412`)                  | OK                                                                                    |
| Header               | Header (`2981:546`)                | OK                                                                                    |
| Footer               | Footer (`2969:432`)                | OK                                                                                    |
| NavLink              | NavLink (`2001:1309`)              | OK                                                                                    |
| NavLinkHome          | NavLinkHome (`2001:1312`)          | OK                                                                                    |
| SerieCardList        | SerieCardList (`2980:499`)         | OK                                                                                    |
| ArchiveTable         | **PostArchiveList** (`2977:4382`)  | Renamed — plan's own note: "PostArchiveList replaces ArchiveTable from Task 8 onward" |
| PostCardPreviewSmall | PostCardPreviewSmall (`2385:7149`) | OK                                                                                    |

No STOP. No missing name outside the plan's own acknowledged rename.
