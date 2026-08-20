# Figma DS file — reference map (Magnet-DS)

File key: ihWIWmvtQPTWgUxlrVjC2c
URL: https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS

**Final state as of 2026-08-19** — the `magnet-ds-final-state` migration is shipped
(`.specs/02_archives/magnet-ds-final-state/`). Every count below was **live-counted** at the
P3-T11 sweep, not carried forward by arithmetic. A previous version of this file shipped a stale
derived number (`1 Primitives` 451) straight into a docs card; **re-count, never re-derive**.

Node IDs are volatile. Treat every ID below as a hint, not truth. Before any write,
re-inventory by name (figma-verify Pass 0) and fail loudly if expected names are missing.

## MCP gotcha — get_metadata page-list is unreliable

get_metadata without nodeId may return a stale page subset. Do not use it as the
source of truth for document structure. For reliable inventory, run a use_figma
Pass 0 that enumerates figma.root.children and loads each page.

## Pages (8)

Base URL for links:
https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=<ID>&m=dev
(ID uses ":" in Figma and "-" in URL)

| Page | ID | Link | Contents |
| --- | --- | --- | --- |
| 📖 Cover | `0:1` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=0-1&m=dev) | public entry card |
| 📚 Docs | `2736:4` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2736-4&m=dev) | **7 DOC frames** (6 foundations + `DOC / Decision Log` `3205:74`) + 4 `_Docs/*` masters + 1 label TEXT |
| ❖ Components | `461:759` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=461-759&m=dev) | **7 sections, 46 masters** |
| 📄 Pages | `2558:18264` | [open](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Magnet-DS?node-id=2558-18264&m=dev) | **32 frames** = 8 routes × 4 columns |
| 🗄️ Archive — Decisions | `2716:4244` | — | empty; immutable |
| 🗄️ Archive — Docs v1 | `3039:4341` | — | 7 `_Docs/*` masters; immutable |
| 🗄️ Archive — Components | `3107:765` | — | 1 `zz/*` retired master; immutable |
| 🗄️ Archive — XP - WorkCard | `3034:5541` | — | WorkCard exploration scratch, no masters; immutable |

Pages whose name starts with 🗄️ are **immutable** — never rename, move, reopen or delete
anything inside them. `XP - WorkCard` was renamed into the archive at P3-T11; nothing was deleted
anywhere in the migration.

**Current-state vs rationale boundary.** The split is by *frame*, not by page — both live on
📚 Docs since 2026-08-20 (record `decision-log-in-docs`, superseding `docs-decisions-boundary`).
The six foundation DOC frames are **current-state reference, edited in place**: they hold what is
true now. `DOC / Decision Log` (`3205:74`) is **append-only and dated**: it holds why a call was
made and when. Never restate a rule in the log; never leave dated rationale in a foundation frame.
A reversal is a **new record that supersedes** the old one — the superseded record stays on canvas
with its `record-meta` line switched to `SUPERSEDED by <slug>`, never edited or deleted.

## Component masters — ❖ Components (46), 7 domain sections

Live Pass-0 re-count at the **phase-3 close, 2026-08-19** (P3-T11). Counts top-level masters only
— COMPONENT / COMPONENT_SET not nested inside a set. ⬍ marks a set carrying the `breakpoint` axis
(**11** masters).

**Every ❖ Components master carries a domain prefix** matching its code folder:
`app|ui|blog|work|hero|contact|about`. The prefix is also its SECTION name — name and home always
agree. Full before→after mapping: `.specs/02_archives/magnet-ds-final-state/rename-map.md`.

**app (6)**

- ⬍ app/Header (`2981:546`, SET) · ⬍ app/Footer (`2969:432`, SET)
- app/NavLink (`3093:553`, SET) · app/HeaderDrawer (`2981:4486`, SET)
- app/ThemeToggle (`16:11`, SET) · app/MotionToggle (`16:12`, SET)

**ui (13)**

- ui/Icon (`461:6204`, SET — 25 glyphs; 24×24, **2px** stroke, round cap/join, stroke bound to
  `color/foreground`, 0 raw across 32 strokes)
- ui/H1 (`2119:7406`) · ui/H2 (`2034:213`)
- ui/SectionTitle (`2041:465`) · ui/PageDescription (`2119:7440`)
- ui/Link/primary (`2012:6179`, SET) · ui/Link/secondary (`2041:275`, SET)
- ui/Link/inline (`2350:737`, SET) · ui/Link/textLink (`2041:313`, SET)
- ui/Link/iconOnly (`2093:6332`, SET — `size=small` is 32×32)
- ui/Link/external (`3103:513`, SET — `state` × `iconSide`) · ui/Prose (`3106:2126`)
- ui/SocialShare (`3106:2141`)

**blog (14)**

- ⬍ blog/PostCard (`3093:5376`, SET) · ⬍ blog/BlogPreview (`3041:1977`, SET)
- ⬍ blog/PostList (`2977:4382`, SET) · ⬍ blog/SerieList (`2980:499`, SET)
- blog/PostRow (`2124:7937`, SET) · blog/SerieCard (`2367:7205`, SET)
- blog/PostMetadataTime (`2040:482`, SET) · blog/PostMetadataTopic (`2371:10414`, SET)
- blog/SerieMeta (`2375:10662` — two icon+text pairs, `layers`+parts / `clock`+read)
- ⬍ blog/TableOfContents (`3113:5417`, SET) · blog/SerieContents (`3113:5418`)
- blog/RelatedWork (`3117:662`) · blog/PostNav (`3117:705`, SET)
- blog/PostRowCalm (`3118:5416`, SET)

**work (6)**

- ⬍ work/WorkPreview (`2970:4368`, SET)
- ⬍ work/WorkCard (`3107:654`, SET — **16 variants**, `variant` × `state` × `side` × `breakpoint`;
  Mobile is 358 wide, `case` goes VERTICAL with `side` inert)
- ⬍ work/ArchiveTable (`3111:5650`, SET — 3 breakpoints)
- work/WorkMiniCard (`3117:659`) · work/WorkHeader (`3118:680`)
- work/RelatedWriting (`3118:5417`)

**hero (3)**

- ⬍ hero/Hero (`2969:412`, SET) · hero/HeroText (`2012:6142`) · hero/HeroAnimation (`2012:315`)

**contact (2)**

- ⬍ contact/ContactPreview (`3112:690`, SET) · contact/ContactContent (`131:101`)

**about (2)**

- about/AboutFacts (`3119:2210`, SET) · about/AboutText (`3119:2211`)

`blog/RelatedWork` composes `work/WorkMiniCard`; `work/RelatedWriting` composes
`blog/PostRowCalm`. Those two are **sub-components of canon masters, not explorations** — an
earlier "Retired" list was wrong about them and was amended.

One non-master node lives inside a section: `prose-link-annotation` (TEXT, `ui`) — an annotation
label, counted among `ui`'s 14 children but not among its 13 masters. Local styles: 17 text ·
0 paint · 2 effect.

### Other COMPONENT populations (outside the 46)

- **📚 Docs — `_Docs/*` (4)**: `_Docs/DecisionCard` (`2590:571`, SET) · `_Docs/DoDont`
  (`2590:588`) · `_Docs/Date` (`2693:9890`, SET) · `_Docs/Status` (`2693:9897`, SET).
- **🗄️ Archive — Docs v1 — `_Docs/*` (7)**: ChapterHeader (`2590:537`) · SpecimenCell
  (`2590:542`) · TokenRow (`2590:578`) · Headline (`2708:21413`) · Paragraph (`2709:21540`) ·
  Divider (`2709:21527`) · GroupHeader (`2766:4212`).
- **📄 Pages (16)**: the light route masters listed below.
- **🗄️ Archive — Components — `zz/*` (1)**: zz/WorkCardPreviewSmall (`2045:378`), superseded by
  `work/WorkCard`, 2026-08-18. Retired masters keep a `zz/` prefix and move to the archive page.
  They are never deleted.

P3-T11 reported **no document-wide master total** — it counted the ❖ Components roster (46), the
📄 Pages frame count (32) and the archive populations separately. Do not sum these into a
"document total" and quote it as measured; the last file-wide formula here went stale unnoticed.
Re-count live if a total is ever needed.

## 📄 Pages — 8 routes × 4 columns = 32 frames

16 COMPONENT **light masters** + 16 mode-pinned `[Dark]` **INSTANCE** mirrors. Every row reads
Desktop · Mobile · Desktop [Dark] · Mobile [Dark]. Dark frames are instances of the light master
with a single name override plus pinned `2 Theme=Dark` — so a dark row can never diverge in height
from its light master. Light masters pin `3 Responsive=Desktop|Mobile`.

| Route | Desktop | Mobile | Desktop [Dark] | Mobile [Dark] |
| --- | --- | --- | --- | --- |
| Home | `2604:1741` | `2604:1742` | `3151:7319` | `3151:7530` |
| Blog | `2604:1744` | `2604:1745` | `3151:7700` | `3151:7880` |
| Work | `3151:7307` | `3151:7308` | `3151:8048` | `3151:8288` |
| About | `3151:7309` | `3151:7310` | `3151:8480` | `3151:8570` |
| Post | `3151:7311` | `3151:7312` | `3151:8648` | `3151:8798` |
| Serie | `3151:7313` | `3151:7314` | `3151:8939` | `3151:9018` |
| Serie post | `3151:7315` | `3151:7316` | `3151:9085` | `3151:9240` |
| Work detail | `3151:7317` | `3151:7318` | `3151:9386` | `3151:9508` |

Grid: columns `x = 0 / 1440 / 1990 / 3430` (gap 160); rows `y = 0` Home · `4476` Blog · `7052`
Work · `10934` About · `13510` Post · `17239` Serie · `18489` Serie post · `22148` Work detail
(gap 192). Rows were re-spaced at the R3.6-prep repair — the Mobile case cards made the Work /
Post / Serie post / Work detail rows taller.

## Responsive — how the file answers mobile

Two defects lived here until the R3.6-prep repair (2026-08-19); both are **fixed**. Kept as a
method note, because the check that found them is not the one you would reach for by default.

**Run the strict out-of-root-bounds sweep, not Gate D, when auditing 📄 Pages.** Gate D is
section-relative, and 📄 Pages has no sections — so it reports vacuously clean there. The strict
sweep found **103** out-of-bounds nodes across 9 of the 16 light masters where Gate D found 0.
After the repair: **1**, and that one is deliberate — `Home — Desktop > contact/ContactPreview >
ContactImage > layer1` (`I2586:1143;2114:7231`) at +24 right is decorative art already bleeding
intentionally at `y = −168`. Horizontal bleed is the same intent, not a layout bug.

**One root cause explained most of it.** `ProseImage` (`3106:2125`) was FIXED 720 inside
`ui/Prose`; at mobile content `x = 16` in a 390 root that is exactly `16 + 720 − 390 = +346`, on
every mobile document page. Fixed with `lockAspectRatio()` (720×405 is exactly 16:9) plus
`layoutSizingHorizontal = FILL`. `inline-code-example` (`3106:2120`) was FILL but its three HUG
children summed past 358 → `layoutWrap = WRAP` (inert at 720). Those two edits cleared +346 and
+93 across four masters at once. **Chase the root cause before the symptoms** — the remaining
fixes were all the same family: HUG text in a narrower FILL parent → FILL + `textAutoResize =
HEIGHT` (`blog/PostNav` titles, `about/AboutFacts` columns, `ui/H1`, WorkCard's stack line), or
NO_WRAP rows that needed WRAP (`blog/PostRowCalm` title-row, `about/AboutText > links`).

**`work/WorkCard` gained a `breakpoint` axis** (8 → 16 variants), built to
`.specs/…/work-card-redesign/spec.md`: Mobile 358 wide, `case` root HORIZONTAL → VERTICAL with
children reordered `[cover, text]` on **both** sides (so `side` is inert on Mobile, mirroring how
it is already inert on `catalogue`), cover FILL + aspect-locked, stack and links merged into one
wrapping mono row. Hover on Mobile is title-underline only — a FILL cover has no fixed geometry
to scale, and the spec requires that nothing depend on hover there.

**`work/WorkPreview` had the same defect one level up**: it already carried a `breakpoint` axis,
but its `breakpoint=Mobile` variant still nested three `breakpoint=Desktop` WorkCards. Masked
only because the Desktop `catalogue` anatomy happens to be all-FILL. **When a set carries a
`breakpoint` axis, check that its nested instances are pointed at the matching breakpoint** —
the axis existing is not evidence it is wired.

**There is still no single responsive convention.** `work/ArchiveTable`, `contact/ContactPreview`,
`blog/TableOfContents`, `work/WorkCard` and `work/WorkPreview` carry breakpoint axes;
`blog/PostNav`, `work/WorkHeader`, `work/RelatedWriting` stay 720–832 FIXED and rely on flexible
children. Settling this belongs to `magnet-ds-code-convergence`.

## Container recipe and ownership

Every layout master reads `padding-x = 16` bound to `container/gutter`, `align = CENTER`, and
caps **every** direct content child at `maxWidth = 1280` bound to `container/max-width`, sized
FILL. Rhythm 96/32/32 binds `section/rhythm-y`. Two accepted exceptions: `app/Header` Mobile has
no content band at all (TEXT brand + fixed-size menu button), and `ui/SectionTitle` instances are
headings, not bands.

**`PageContentContainer` was removed file-wide at P3-T03.** Container ownership is now normative
(design.md §5, and the 📚 Docs "Container Ownership" card `3157:109`): **Home-type sections own
their own container; document-type pages own it once via `PageContent`.** Never reintroduce a
standalone container wrapper.

**Layout frames carry no fill.** `figma.createAutoLayout()` / `createFrame` return an opaque white
fill, and the prelude helpers never dropped it — invisible on a light canvas, a wall of white in
dark mode. Two sweeps cleared it (224 fills at P2-T11b, 50 more at P3-T09); the P3-T11 regression
check found **0** on 📄 Pages and **0** on ❖ Components. Rule, recorded as `DecisionCard 3157:134`:
_only a page root or a deliberately tinted surface carries a fill, and that fill binds a `2 Theme`
token — never a literal colour._ Any new frame-building helper must clear the default.

Hairlines are per-side strokes with `strokesIncludedInLayout: true` — a CSS border grows an
auto-height box, so a rectangle standing in for one is wrong by construction.

## Tokens

| Collection | ID | Modes | Variables |
| --- | --- | --- | --- |
| 1 Primitives | `VariableCollectionId:2013:2` | Mode 1 (`2013:0`) | **407** |
| 2 Theme | `VariableCollectionId:3:2` | Light, Dark (`3:1`) | 15 |
| 3 Responsive | `VariableCollectionId:2245:42` | Desktop (`2245:0`), Tablet (`2245:1`), Mobile (`2245:2`) | 18 |
| Design System | `VariableCollectionId:2721:4` | 1 mode | 2 — **audit-exempt** |

`Design System` is **file metadata, not a token layer**: two STRING variables (`ds/version`,
`ds/last-updated`, scope `TEXT_CONTENT`) bound to the 📖 Cover chips via *character* bindings, so
the cover cannot drift from the file. Never bind a component to them; never add design values
there. Documented on canvas in `DOC / Getting Started` → Token Architecture (card
`DESIGN SYSTEM — metadata, not a token layer`) and in each variable's description.

`1 Primitives` is **407, not 451** — 451 is the pre-prune figure and it survived in a 📚 Docs card
until P3-T11 corrected it. Recount, not carry-forward.

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

## Unbound raw values

The **single genuine unbound value file-wide** is `prose-link-annotation` (TEXT, `ui` section)
fill `#999999` — an annotation label, not a component. Everything else falls under a documented
exception class:

| Page | Paints | Verdict |
| --- | --- | --- |
| ❖ Components | 92 | 66 decorative `hero/*` + `contact/*` art layers · 14 SECTION chrome · 11 `#8A38F5` COMPONENT_SET dashed borders (Figma's own, not authored, not bindable) · **1 genuine** |
| 📄 Pages | 66 | 100% the same decorative art layers. **Zero** on any product surface; raw `#FFFFFF` count 0 |
| 📚 Docs | 825 / 614 distinct | all doc chrome — the docs are an annotation layer, not a themed artifact |

⚠️ The 825 figure dwarfs the older "46 white fills" because that number counted `#FFFFFF` only.
**Do not paste 825 into `named-debt.json` as component debt.**

VECTOR path fills inside the contact icons cannot bind to variables at all — that is a Figma
limitation, not debt.

## 📚 Docs — Getting Started + 5 foundations

Six doc frames, `x = -18000 + i*1508`, `y = -900`, all 1408 wide:

| # | Doc | Id | Sections |
| --- | --- | --- | --- |
| 1 | Getting Started | `2942:4308` | Mission, Audience, Three Layers, Core Rules, Token Architecture, File Navigation |
| 2 | Foundations — Color | `2942:4406` | Theme Tokens, Contrast Pairings, Brand Grays, Brand Limes, Design Decisions |
| 3 | Foundations — Typography | `2942:4543` | Font Families, Type Scale, Responsive Roles, Design Decisions |
| 4 | Foundations — Spacing & Layout | `2942:4642` | Spacing, Radius, Responsive, Effects, Container Recipe (`3157:84`), Container Ownership (`3157:109`), Design Decisions |
| 5 | Foundations — Responsive Architecture | `3016:4343` | The rule, Responsive tokens, Style mapping, Accepted exceptions, Design Decisions |
| 6 | Foundations — Motion | `3039:5146` | Duration Scale, Easing, Hover Verbs, Reveal, Reduced Motion, Design Decisions |

Doc recipe: auto-layout frames + tables. `_Docs/DecisionCard` appears **only** in Design Decisions
blocks. `_Docs/SpecimenCell` and `_Docs/TokenRow` are archived (Docs v1) — do not follow older
briefs that still name them.

`DOC / Decision Log` (`3205:74`) holds a `Records` wrapper (`3206:74`) with **10** records.
Each record is a `record-meta` line (Fira Code 12, `YYYY-MM-DD · STATUS · slug`) above a FILL
`_Docs/DecisionCard`: container-16 (`3067:6`), naming-domain-component (`3067:5276`),
dark-instances (`3067:5288`), docs-decisions-boundary (`3067:5300`, **superseded**),
related-block-children (`3117:706`), theme-modes-two-only (`3160:39`),
text-styles-detached (`3160:51`), interaction-states-four (`3160:63`),
responsive-exceptions (`3160:75`), decision-log-in-docs (`3207:110`). The
layout-frames-carry-no-fill card (`3157:134`) stays homed in Spacing & Layout.

The card's `layer tag` is **hidden on records** — it names which layer a rule governs
(CHROME / CONTENT / HAND / ALL, baked per variant) and must never be overridden to carry a record
slug; the slug belongs in `record-meta`. `_Docs/Date` and `_Docs/Status` are **cover-only** (one
instance each on 📖 Cover, IBM Plex Sans Medium 30) — never use them for record metadata, which is
the mono-12 metadata layer.

No doc references page-master ids or grid counts, so page renumbering invalidates nothing.

## Change log

- 2026-08-20 — **📐 Decisions folded into 📚 Docs.** The page was removed; its `Records` frame moved
  in as `DOC / Decision Log` (`3205:74`), the file's 7th DOC frame. Pages 9 → 8. Three defects
  repaired at the source: the `_Docs/DecisionCard` `layer` TEXT was `FIXED` at 22px so any slug
  longer than `ALL` wrapped into a vertical column (now HUG); records were overriding that layer
  tag with record slugs, overloading one slot with two meanings (tag hidden on records, slug moved
  to a mono-12 `record-meta` line); and each record carried cover-scale `_Docs/Date` + `_Docs/Status`
  chips at 30px, which are file-metadata stamps, not record metadata (removed — those components
  are now cover-only). New record `decision-log-in-docs` (`3207:110`) supersedes
  `docs-decisions-boundary`, which is the first live use of the supersede mechanism.

- 2026-08-19 — **Magnet-DS final state shipped**
  (`.specs/02_archives/magnet-ds-final-state/`). Three phases: foundations
  (variables audit, renames, 7 domain sections, merges, container 16),
  components (15 new masters), pages (8 route masters × 4 frames = 32).
  `PageContentContainer` removed; container ownership normative (Home-type
  sections own, document-type `PageContent` owns). Docs finalized to
  Getting Started + 5 foundations; rationale lives in 📐 Decisions.
  Explorations archived. Master roster re-counted live: **46**.
  `1 Primitives` re-counted live at **407** (a stale 451 was found shipping in a Docs card and
  corrected). Canvas cleaned at three levels — 6 COMPONENT_SETs had every variant stacked at
  (0,0) and two ❖ Components SECTIONs overlapped, neither visible to the section-relative Gate D;
  all 7 sections repacked. `XP - WorkCard` renamed into the archive. Two defects found at the
  phase-3 gate were **repaired before ship**: `work/WorkCard` gained a `breakpoint` axis (8 → 16
  variants) and the strict out-of-root-bounds sweep went **103 → 1** across the 16 light masters,
  mostly from one root cause — a FIXED-width prose child that never got FILL. 📄 Pages rows and
  ❖ Components sections were re-spaced to fit the taller Mobile cards.
- 2026-08-19 — **Phase-2 gate passed** (P2-T01→T11b + R2.4). ❖ Components **32 → 46**: fifteen
  masters built (`ui/Link/external` `ui/Prose` `ui/SocialShare` `work/WorkCard` `work/ArchiveTable`
  `blog/TableOfContents` `blog/SerieContents` `work/WorkMiniCard` `blog/RelatedWork` `blog/PostNav`
  `work/WorkHeader` `blog/PostRowCalm` `work/RelatedWriting` `about/AboutFacts` `about/AboutText`)
  and `work/WorkCardPreviewSmall` retired to `zz/` on the new `🗄️ Archive — Components` page
  (`3107:765`). `contact/ContactPreview` was rebuilt as a SET with a `breakpoint` axis and moved to
  `3112:690`. `ui/Icon` gained a real `chevron-down` (25 glyphs); `ui/Link/iconOnly size=small` is
  32×32. Hairlines made per-side strokes with `strokesIncludedInLayout: true` across 27 masters.
  **224 default-white frame fills cleared** (fixed at source in `ad95a17`). `figma:verify` clean,
  `pnpm test` 57/57.
- 2026-08-18 — **Phase-1 gate passed** (P1-T01→T09). Masters re-counted live: **47**. Every DS
  master renamed to `domain/Component` and re-sectioned into seven domain SECTIONs named for the
  code folder that owns it — the six type-based sections (Chrome / Actions / Sections / Typography
  / Metadata / Cards) are gone. Two merges: `NavLink` + `NavLinkHome` → `app/NavLink` (6 variants,
  `type` × `state`), `PostCardPreviewBig` + `PostCardPreviewSmall` → `blog/PostCard` (8 variants,
  `size` × `breakpoint` × `state`). `1 Primitives` **451 → 407**: 44 unused Tailwind stock ramps
  pruned, 25 dash separators converted to slash (a dash before *letters* is a separator, a dash
  before *digits* is a ramp step — `color/brand/gray-650` is correct as-is). `2 Theme` stays 15;
  the orphan `color/accent-hover` retired to `zz/color/accent-hover` (still declared in
  `global.css:59,82`, consumed nowhere — code debt). `3 Responsive` frozen at 18. Container recipe
  normalized to 16px gutters and 1280 bands. 📐 Decisions moved to `3067:4`; `2716:4244` became the
  empty Decisions archive.
- 2026-08-15 — Responsive architecture landed
  (`.specs/02_archives/figma-responsive-architecture/`). 📄 Pages went from 8 page
  frames to **4 masters + 4 dark instances** (each Dark instance inherits its
  Light master's height exactly — the divergence bug is structurally gone).
  `3 Responsive` grew **4 → 18** variables: six type ramps bound directly on the
  text node via `setRangeBoundVariable` (flat `Tailwind/text-*` styles detached
  first — a text style cannot bind to a variable), eight spacing values bound on
  auto-layout fields, plus corrected `container/gutter` (was 32/24/16) and
  `section/rhythm-y` (was 96/64/48). Seven masters given a
  `breakpoint=Desktop|Mobile` axis. `ArchiveTable` renamed **PostArchiveList**.
  The four `— Mobile` section masters were deleted and their instances swapped onto
  base-master variants. `HeaderDrawer` added (`state=closed|open`).
  Master roster re-counted live: **49**.
- 2026-08-06 — Docs page renamed 📚 Design system and restructured onto a
  smallest-to-largest spine (00 Read me → 01 Tokens → 02 Elements → 03 Components →
  04 Pages); the 12 property sections were re-homed, not deleted. Atomic-design labels
  were dropped after a web-research review (no major system uses them). Wired
  3 Responsive so container/gutter (32/24/16) and section/rhythm-y (96/64/48)
  differ per mode; previously they aliased one primitive in all three modes,
  making Mobile equivalent to a narrower Desktop frame. Home and Blog each ship
  four frames (Desktop 1280 / Mobile 390 × Light / Dark) driven by pinned mode
  pairs. Token audit on 697 Components-page nodes. 🎨 Foundations renamed to
  🎨 Color & Type (deep dive); Tailwind Font Sizes dump removed (regenerable
  through pnpm figma:primitives).
