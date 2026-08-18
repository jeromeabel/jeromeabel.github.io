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

Pages whose name starts with 🗄️ are **immutable** — never rename, move, reopen or delete
anything inside them.

## Component masters (47 total)

Live Pass-0 re-count at the **phase-1 gate, 2026-08-18** (P1-T09). The prior 49 roster was dated
2026-08-15 and predates the domain renames and the two merges. Counts top-level masters only —
COMPONENT / COMPONENT_SET not nested inside a set. ⬍ marks a set carrying the
`breakpoint=Desktop|Mobile` axis.

**Every ❖ Components master carries a domain prefix** matching its code folder:
`app|ui|blog|work|hero|contact|about`. The prefix is also its SECTION name — name and home always
agree. Full roster with the before→after mapping:
`.specs/01_active/magnet-ds-final-state/rename-map.md`.

### ❖ Components (32) — 7 domain sections

**app (6)**

- ⬍ app/Header (`2981:546`, SET)
- ⬍ app/Footer (`2969:432`, SET)
- app/NavLink (`3093:553`, SET — `type=page|brand` × `state=default|hover|active`)
- app/HeaderDrawer (`2981:4486`, SET — `state=closed|open`)
- app/ThemeToggle (`16:11`, SET)
- app/MotionToggle (`16:12`, SET)

**ui (10)**

- ui/Icon (`461:6204`, SET — 24 icons)
- ui/H1 (`2119:7406`) · ui/H2 (`2034:213`)
- ui/SectionTitle (`2041:465`) · ui/PageDescription (`2119:7440`)
- ui/Link/primary (`2012:6179`, SET) · ui/Link/secondary (`2041:275`, SET)
- ui/Link/inline (`2350:737`, SET) · ui/Link/textLink (`2041:313`, SET)
- ui/Link/iconOnly (`2093:6332`, SET)

**blog (9)**

- ⬍ blog/PostCard (`3093:5376`, SET — `size=big|small` × `breakpoint` × `state`)
- blog/PostRow (`2124:7937`, SET) · blog/SerieCard (`2367:7205`, SET)
- ⬍ blog/BlogPreview (`3041:1977`, SET) · ⬍ blog/PostList (`2977:4382`, SET)
- ⬍ blog/SerieList (`2980:499`, SET)
- blog/PostMetadataTime (`2040:482`, SET) · blog/PostMetadataTopic (`2371:10414`, SET)
- blog/SerieMeta (`2375:10662`)

**work (2)**

- ⬍ work/WorkPreview (`2970:4368`, SET)
- work/WorkCardPreviewSmall (`2045:378`) — legacy, absorbed into `work/WorkCard` by P2-T04

**hero (3)**

- ⬍ hero/Hero (`2969:412`, SET) · hero/HeroText (`2012:6142`) · hero/HeroAnimation (`2012:315`)

**contact (2)**

- contact/ContactPreview (`2114:7281`) · contact/ContactContent (`131:101`)

**about (0)** — section exists, empty until P2-T10.

### 📚 Docs — `_Docs/*` (11 document-wide)

Live on 📚 Docs (4): \_Docs/DecisionCard (`2590:571`, SET) · \_Docs/DoDont (`2590:588`) ·
\_Docs/Date (`2693:9890`, SET) · \_Docs/Status (`2693:9897`, SET).

Archived on 🗄️ Archive — Docs v1 (7): \_Docs/ChapterHeader (`2590:537`) ·
\_Docs/SpecimenCell (`2590:542`) · \_Docs/TokenRow (`2590:578`) · \_Docs/Headline
(`2708:21413`) · \_Docs/Paragraph (`2709:21540`) · \_Docs/Divider (`2709:21527`) ·
\_Docs/GroupHeader (`2766:4212`).

### 📄 Pages (4) — page masters, each with a Dark instance beside it

- Home — Desktop (`2604:1741`)
- Home — Mobile (`2604:1742`)
- Blog — Desktop (`2604:1744`)
- Blog — Mobile (`2604:1745`)

`blog/BlogPreview` gained its Mobile variant in the responsive work; `contact/ContactPreview` is
still the one section master without one (P2-T06 builds it).

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
`breakpoint=Desktop|Mobile` axis on the seven ⬍ masters above, switched manually.

`footer/link-gap` has no binding target: code nests two `<ul>` link lists
(`gap-2 md:gap-6`), Figma keeps all four links flat inside `FooterRight`. The
variable is correct and unbound until the Footer is restructured.

## Change log

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
