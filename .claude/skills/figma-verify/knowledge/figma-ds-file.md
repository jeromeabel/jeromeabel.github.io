# Figma DS file — reference map (Magnet-DS)

File key: ihWIWmvtQPTWgUxlrVjC2c
URL: https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS

Node IDs are volatile. Treat every ID below as a hint, not truth. Before any write,
re-inventory by name (figma-verify Pass 0) and fail loudly if expected names are missing.

## MCP gotcha — get_metadata page-list is unreliable

get_metadata without nodeId may return a stale page subset. Do not use it as the
source of truth for document structure. For reliable inventory, run a use_figma
Pass 0 that enumerates figma.root.children and loads each page.

## Pages

Base URL for links:
https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=<ID>&m=dev
(ID uses ":" in Figma and "-" in URL)

| Page | ID | Link | Notes |
| --- | --- | --- | --- |
| 📖 Cover | `0:1` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=0-1&m=dev) | public entry card |
| 📐 Decisions | `3067:4` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=3067-4&m=dev) | decision cards (4 records) |
| 📚 Docs | `2736:4` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2736-4&m=dev) | shareable documentation spine |
| ❖ Components | `461:759` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=461-759&m=dev) | library masters |
| 📄 Pages | `2558:18264` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2558-18264&m=dev) | assembled page templates |
| XP - WorkCard | `3034:5541` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=3034-5541&m=dev) | scratch exploration, no masters |
| 🗄️ Archive — Decisions | `2716:4244` | — | empty; immutable |
| 🗄️ Archive — Docs v1 | `3039:4341` | — | 7 `_Docs/*` masters; immutable |
| 🗄️ Archive — Components | `3107:765` | — | 1 `zz/*` retired master; immutable |

Pages whose name starts with 🗄️ are **immutable** — never rename, move, reopen or delete
anything inside them.

## Component masters (62 total)

Live Pass-0 re-count at the **phase-2 gate, 2026-08-19** (P2-T11 / P2-T11b). Counts top-level
masters only — COMPONENT / COMPONENT_SET not nested inside a set — and counts `_Docs/*`
**document-wide**, which is why the seven archived ones are inside the 11. ⬍ marks a set carrying
the `breakpoint` axis.

Phase 2 built **15** masters and retired one (`work/WorkCardPreviewSmall` → `zz/` on
`🗄️ Archive — Components`, superseded by `work/WorkCard`), so ❖ Components went 32 → **46**.
Formula: `46 + 11 + 4 + 1 zz/ = 62`.

**Every ❖ Components master carries a domain prefix** matching its code folder:
`app|ui|blog|work|hero|contact|about`. The prefix is also its SECTION name — name and home always
agree. Full roster with the before→after mapping:
`.specs/01_active/magnet-ds-final-state/rename-map.md`.

### ❖ Components (46) — 7 domain sections

**app (6)**

- ⬍ app/Header (`2981:546`, SET) · ⬍ app/Footer (`2969:432`, SET)
- app/NavLink (`3093:553`, SET) · app/HeaderDrawer (`2981:4486`, SET)
- app/ThemeToggle (`16:11`, SET) · app/MotionToggle (`16:12`, SET)

**ui (13)**

- ui/Icon (`461:6204`, SET — 25 glyphs; `chevron-down` is real since P2-T11)
- ui/H1 (`2119:7406`) · ui/H2 (`2034:213`)
- ui/SectionTitle (`2041:465`) · ui/PageDescription (`2119:7440`)
- ui/Link/primary (`2012:6179`, SET) · ui/Link/secondary (`2041:275`, SET)
- ui/Link/inline (`2350:737`, SET) · ui/Link/textLink (`2041:313`, SET)
- ui/Link/iconOnly (`2093:6332`, SET — `small` is 32×32 since P2-T11)
- **ui/Link/external** (`3103:513`, SET — `state` × `iconSide`) · **ui/Prose** (`3106:2126`)
- **ui/SocialShare** (`3106:2141`)

**blog (14)**

- ⬍ blog/PostCard (`3093:5376`, SET) · ⬍ blog/BlogPreview (`3041:1977`, SET)
- ⬍ blog/PostList (`2977:4382`, SET) · ⬍ blog/SerieList (`2980:499`, SET)
- blog/PostRow (`2124:7937`, SET) · blog/SerieCard (`2367:7205`, SET)
- blog/PostMetadataTime (`2040:482`, SET) · blog/PostMetadataTopic (`2371:10414`, SET)
- blog/SerieMeta (`2375:10662`)
- ⬍ **blog/TableOfContents** (`3113:5417`, SET) · **blog/SerieContents** (`3113:5418`)
- **blog/RelatedWork** (`3117:662`) · **blog/PostNav** (`3117:705`, SET)
- **blog/PostRowCalm** (`3118:5416`, SET)

**work (6)**

- ⬍ work/WorkPreview (`2970:4368`, SET)
- **work/WorkCard** (`3107:654`, SET — 8 variants; absorbed `work/WorkCardPreviewSmall`)
- ⬍ **work/ArchiveTable** (`3111:5650`, SET — 3 breakpoints)
- **work/WorkMiniCard** (`3117:659`) · **work/WorkHeader** (`3118:680`)
- **work/RelatedWriting** (`3118:5417`)

**hero (3)**

- ⬍ hero/Hero (`2969:412`, SET) · hero/HeroText (`2012:6142`) · hero/HeroAnimation (`2012:315`)

**contact (2)**

- ⬍ contact/ContactPreview (`3112:690`, SET — gained `breakpoint` in P2-T06; the id moved from
  `2114:7281`) · contact/ContactContent (`131:101`)

**about (2)**

- **about/AboutFacts** (`3119:2210`, SET) · **about/AboutText** (`3119:2211`)

Bold = built in phase 2.

### 📚 Docs — `_Docs/*` (11 document-wide)

Live on 📚 Docs (4): \_Docs/DecisionCard (`2590:571`, SET) · \_Docs/DoDont (`2590:588`) ·
\_Docs/Date (`2693:9890`, SET) · \_Docs/Status (`2693:9897`, SET). The last two carry lowercase
axes (`variant`, `status`) since P2-T11.

Archived on 🗄️ Archive — Docs v1 (7): \_Docs/ChapterHeader (`2590:537`) ·
\_Docs/SpecimenCell (`2590:542`) · \_Docs/TokenRow (`2590:578`) · \_Docs/Headline
(`2708:21413`) · \_Docs/Paragraph (`2709:21540`) · \_Docs/Divider (`2709:21527`) ·
\_Docs/GroupHeader (`2766:4212`).

### 📄 Pages (4) — page masters, each with a Dark instance beside it

- Home — Desktop (`2604:1741`)
- Home — Mobile (`2604:1742`)
- Blog — Desktop (`2604:1744`)
- Blog — Mobile (`2604:1745`)

Phase 3 (P3-T02 … P3-T08) builds the remaining page masters against these four.

### 🗄️ Archive — Components — `zz/*` (1)

- zz/WorkCardPreviewSmall (`2045:378`) — superseded by `work/WorkCard`, 2026-08-18.

Retired masters keep a `zz/` prefix and move to the archive page. They are never deleted, and they
count toward the 62.

### Container recipe

Every layout master reads `padding-x = 16` bound to `container/gutter`, `align = CENTER`, and
caps **every** direct content child at `maxWidth = 1280` bound to `container/max-width`, sized
FILL. Two accepted exceptions: `app/Header` Mobile has no content band at all (TEXT brand +
fixed-size menu button), and `ui/SectionTitle` instances are headings, not bands.

## Tokens

Three collections power the file:

| Collection | ID | Modes | Variables |
| --- | --- | --- | --- |
| 1 Primitives | `VariableCollectionId:2013:2` | Mode 1 (`2013:0`) | 407 |
| 2 Theme | `VariableCollectionId:3:2` | Light, Dark (`3:1`) | 15 |
| 3 Responsive | `VariableCollectionId:2245:42` | Desktop (`2245:0`), Tablet (`2245:1`), Mobile (`2245:2`) | 18 |

### Responsive resolved values

Source of truth: `scripts/figma/responsive-expected.json`, checked by
`pnpm figma:verify-responsive`.

| Variable | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| text/page-title | 60 | 48 | 36 |
| text/section-title | 30 | 24 | 20 |
| text/hero-title | 48 | 36 | 24 |
| text/hero-body | 24 | 20 | 18 |
| text/nav-link | 20 | 20 | 16 |
| leading/hero-body | 30 | 28 | 28 |
| header/padding-y | 24 | 16 | 16 |
| header/nav-gap | 40 | 24 | 16 |
| footer/padding-y | 64 | 64 | 32 |
| footer/gap | 32 | 32 | 24 |
| footer/link-gap | 24 | 24 | 8 |
| footer/inner-gap | 32 | 32 | 16 |
| hero/text-gap | 16 | 16 | 8 |
| serie-list/gap | 32 | 16 | 16 |
| container/gutter | 16 | 16 | 16 |
| section/rhythm-y | 96 | 32 | 32 |
| container/max-width | 1280 | 1280 | 1280 |
| viewport/width | 1280 | 768 | 390 |

Mechanism: page frames pin explicit (Theme, Responsive) mode pairs. Mobile views are
mode switches over the same component graph, not hand-resized duplicate builds.
**Numbers = tokens. Direction = variants.** Anything a number can express rides
`3 Responsive`; a `layoutMode` flip (which no variable type can express) rides the
`breakpoint` axis on the **11** ⬍ masters above, switched manually. `work/ArchiveTable`
carries three breakpoints, not two; the rest are `Desktop|Mobile`.

`footer/link-gap` has no binding target: code nests two `<ul>` link lists
(`gap-2 md:gap-6`), Figma keeps all four links flat inside `FooterRight`. The
variable is correct and unbound until the Footer is restructured.

## Change log

- 2026-08-19 — **Phase-2 gate passed** (P2-T01→T11b + R2.4). ❖ Components **32 → 46**: fifteen
  masters built (`ui/Link/external` `ui/Prose` `ui/SocialShare` `work/WorkCard` `work/ArchiveTable`
  `blog/TableOfContents` `blog/SerieContents` `work/WorkMiniCard` `blog/RelatedWork` `blog/PostNav`
  `work/WorkHeader` `blog/PostRowCalm` `work/RelatedWriting` `about/AboutFacts` `about/AboutText`)
  and `work/WorkCardPreviewSmall` retired to `zz/` on the new `🗄️ Archive — Components` page
  (`3107:765`). Document total **62** = 46 + 11 `_Docs/*` + 4 📄 Pages + 1 `zz/`.
  `contact/ContactPreview` was rebuilt as a SET with a `breakpoint` axis and moved to `3112:690`.
  `ui/Icon` gained a real `chevron-down` (25 glyphs); `ui/Link/iconOnly size=small` is 32×32.
  Hairlines are per-side strokes with `strokesIncludedInLayout: true` across 27 masters — a CSS
  border grows an auto-height box, so a rectangle standing in for one is wrong by construction.
  **224 default-white frame fills cleared**: `figma.createAutoLayout()` returns an opaque white
  fill, and the `F()` prelude helper never dropped it, so every layout frame built in phase 2
  carried one — invisible on a light canvas, a wall of white in dark mode. Fixed at source in
  `ad95a17`. Unbound raw values document-wide are now **1086 rows / 55 fills / 0 white**: 54 are
  VECTOR paths inside the contact icons (path fills cannot bind to variables) and 1 is the
  `prose-link-annotation` doc label. `figma:verify` clean, `pnpm test` 57/57.
- 2026-08-18 — **Phase-1 gate passed** (`.specs/01_active/magnet-ds-final-state/`, P1-T01→T09).
  Masters re-counted live: **47** (32 ❖ Components + 11 `_Docs/*` + 4 📄 Pages). Every DS master
  renamed to `domain/Component` and re-sectioned into seven domain SECTIONs named for the code
  folder that owns it — the six type-based sections (Chrome / Actions / Sections / Typography /
  Metadata / Cards) are gone. Two merges: `NavLink` + `NavLinkHome` → `app/NavLink` (6 variants,
  `type` × `state`), `PostCardPreviewBig` + `PostCardPreviewSmall` → `blog/PostCard` (8 variants,
  `size` × `breakpoint` × `state`). `1 Primitives` **451 → 407**: 44 unused Tailwind stock ramps
  pruned, 25 dash separators converted to slash (a dash before *letters* is a separator, a dash
  before *digits* is a ramp step — `color/brand/gray-650` is correct as-is). `2 Theme` stays 15;
  the orphan `color/accent-hover` is retired to `zz/color/accent-hover` (still declared in
  `global.css:59,82`, consumed nowhere — logged as code debt). `3 Responsive` frozen at 18.
  Container recipe normalized to 16px gutters and 1280 bands across all layout masters. 📐
  Decisions page carries 4 records (CONTAINER-16, NAMING-DOMAIN-COMPONENT, DARK-INSTANCES,
  DOCS-DECISIONS-BOUNDARY) and moved to `3067:4`; `2716:4244` is now the empty Decisions archive.
  `work/WorkCardPreviewSmall` survives as the 32nd master until P2-T04 absorbs it.
- 2026-08-15 — Responsive architecture landed
  (`.specs/02_archives/figma-responsive-architecture/`). 📄 Pages went from 8 page
  frames to **4 masters + 4 dark instances** (each Dark instance now inherits its
  Light master's height exactly — the divergence bug is structurally gone).
  `3 Responsive` grew **4 → 18** variables: six type ramps bound directly on the
  text node via `setRangeBoundVariable` (flat `Tailwind/text-*` styles detached
  first — a text style cannot bind to a variable), eight spacing values bound on
  auto-layout fields, plus corrected `container/gutter` (was 32/24/16) and
  `section/rhythm-y` (was 96/64/48). Seven masters given a
  `breakpoint=Desktop|Mobile` axis (Header, Footer, Hero, WorkPreviewSection,
  PostArchiveList, SerieCardList, PostCardPreviewSmall). `ArchiveTable` renamed
  **PostArchiveList**. The four `— Mobile` section masters were deleted and their
  instances swapped onto base-master variants. `HeaderDrawer` added
  (`state=closed|open`). Master roster re-counted live: **49**.
- 2026-08-06 — Docs page renamed 📚 Design system and restructured onto a
  smallest-to-largest spine (00 Read me → 01 Tokens → 02 Elements → 03 Components →
  04 Pages); the 12 property sections were re-homed, not deleted. Atomic-design labels
  were dropped after a web-research review (no major system uses them). Wired
  3 Responsive so container/gutter (32/24/16) and section/rhythm-y (96/64/48)
  differ per mode; previously they aliased one primitive in all three modes,
  making Mobile equivalent to a narrower Desktop frame. Home and Blog each ship
  four frames (Desktop 1280 / Mobile 390 × Light / Dark) driven by pinned mode
  pairs. Token audit on 697 Components-page nodes: bound off-ladder itemSpacing
  and unbound radii, assigned text styles where exact matches existed, logged
  remaining gaps as named debt. 🎨 Foundations renamed to
  🎨 Color & Type (deep dive); Tailwind Font Sizes dump removed (regenerable
  through pnpm figma:primitives).
