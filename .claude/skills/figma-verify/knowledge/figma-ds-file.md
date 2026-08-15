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
| 📐 Decisions | `2716:4244` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2716-4244&m=dev) | decision cards |
| 📚 Docs | `2736:4` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2736-4&m=dev) | shareable documentation spine |
| ❖ Components | `461:759` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=461-759&m=dev) | library masters |
| 📄 Pages | `2558:18264` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2558-18264&m=dev) | assembled page templates |

## Component masters (49 total)

Live Pass-0 re-count, 2026-08-15 (the prior 33 roster was dated 2026-08-06 and
predates the responsive-architecture refactor). Counts top-level masters only —
COMPONENT / COMPONENT_SET not nested inside a set. ⬍ marks the seven sets
carrying the `breakpoint=Desktop|Mobile` axis.

### 📚 Docs (11) — documentation-only primitives

- \_Docs/ChapterHeader (`2590:537`)
- \_Docs/SpecimenCell (`2590:542`)
- \_Docs/DecisionCard (`2590:571`, SET)
- \_Docs/TokenRow (`2590:578`)
- \_Docs/DoDont (`2590:588`)
- \_Docs/Date (`2693:9890`, SET)
- \_Docs/Status (`2693:9897`, SET)
- \_Docs/Headline (`2708:21413`)
- \_Docs/Paragraph (`2709:21540`)
- \_Docs/Divider (`2709:21527`)
- \_Docs/GroupHeader (`2766:4212`)

### ❖ Components (34)

**Chrome (8)**

- NavLink (`2001:1309`, SET)
- NavLinkHome (`2001:1312`, SET)
- ThemeToggle (`16:11`, SET)
- MotionToggle (`16:12`, SET)
- Icon (`461:6204`, SET)
- ⬍ Footer (`2969:432`, SET)
- ⬍ Header (`2981:546`, SET)
- HeaderDrawer (`2981:4486`, SET — `state=closed|open`)

**Actions (5)**

- Link/CTA (`2012:6179`, SET)
- Link/Secondary (`2041:275`, SET)
- Link/TextCTA (`2041:313`, SET)
- Link/Icon (`2093:6332`, SET)
- Link/SecondarySm (`2350:737`, SET)

**Sections (9)**

- HeroText (`2012:6142`)
- HeroAnimation (`2012:315`)
- BlogPreviewSection (`2041:560`)
- ContactContent (`131:101`)
- ContactPreviewSection (`2114:7281`)
- ⬍ Hero (`2969:412`, SET)
- ⬍ WorkPreviewSection (`2970:4368`, SET)
- ⬍ PostArchiveList (`2977:4382`, SET — was `ArchiveTable`)
- ⬍ SerieCardList (`2980:499`, SET)

**Typography (4)**

- H2 (`2034:213`)
- PreviewTitle (`2041:465`)
- H1 (`2119:7406`)
- PageDescription (`2119:7440`)

**Metadata (3)**

- PostMetadataTime (`2040:482`, SET)
- PostMetadataTopic (`2371:10414`, SET)
- SerieMeta (`2375:10662`)

**Cards (5)**

- PostCardPreviewBig (`2385:7139`, SET)
- ⬍ PostCardPreviewSmall (`2385:7149`, SET — `state` × `breakpoint`)
- WorkCardPreviewSmall (`2045:378`)
- PostRow (`2124:7937`, SET)
- SerieCard (`2367:7205`, SET)

### 📄 Pages (4) — page masters, each with a Dark instance beside it

- Home — Desktop (`2604:1741`)
- Home — Mobile (`2604:1742`)
- Blog — Desktop (`2604:1744`)
- Blog — Mobile (`2604:1745`)

`BlogPreviewSection` and `ContactPreviewSection` are the two section masters with
no Mobile variant — they render Desktop-width internals inside the 390 frames.
Tracked in `.specs/00_backlog/figma-mobile-section-variants.md`.

## Tokens

Three collections power the file:

| Collection | ID | Modes | Variables |
| --- | --- | --- | --- |
| 1 Primitives | `VariableCollectionId:2013:2` | Mode 1 (`2013:0`) | 451 |
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
