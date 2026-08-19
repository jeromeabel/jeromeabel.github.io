---
shipped: 2026-08-20
title: Magnet-DS final state — docs, foundations, components, pages
created: 2026-08-17
status: design — approved section by section in brainstorming session; verified against live Figma 2026-08-17 (MCP Pass-0 inventory + variables dump)
sources:
  - TODO_ContainerPatternAnalysis.md (absorbed)
  - TODO_MagnetDS_ComponentArchitecture.md (absorbed)
  - "TODO - WorkCard — final spec (post-exploration round).md" (referenced, owns card anatomy)
---

# Magnet-DS — final state

Defines the target end-state of the Figma design system (`Magnet-DS`, file key
`ihWIWmvtQPTWgUxlrVjC2c`): file structure, foundations, component inventory with final
names, and page masters. Container spacing and structure mirror the codebase; component
hierarchy and naming follow one canonical scheme.

**Direction of truth:** the Figma DS is ahead of code. This spec finalizes the DS; code
converges later via the code-debt list (§7). Exceptions where code is the reference:
container geometry (16 / 1280 / centered) and route inventory, which code already gets
right.

## Locked decisions (from session Q&A)

| Decision          | Choice                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page scope        | Full site — all 8 content routes as page masters (`404.astro` excluded: plain error page, no master)                                                    |
| Container         | One recipe everywhere: pad-x 16 / max-w 1280 / centered. Header + Contact 32→16 normalized                                                              |
| Naming            | `domain/Component`, Figma-canon, suffixes become variant axes, code follows via debt list                                                               |
| Dark mode         | Keep `[Dark]` instance frames per master (no mode-only strategy)                                                                                        |
| File organization | Keep 5 Figma pages; Components page holds 7 domain sections — domains are feature areas, never pages (no `home/`)                                       |
| Docs vs Decisions | Docs = what (current state, edited in place); Decisions = why (dated, append-only). Any table lives in exactly one page; links go Docs → Decisions only |
| Home = 4 sections | `AboutStrip` (live 5th section) dropped from final Home — archived, not deleted. About page carries the content                                         |
| Retirement policy | Retired components/explorations are **archived, never deleted** — Figma: archive section; code: file kept, marked retired                               |

---

## 1 · File structure

```
📖 Cover        — unchanged
📐 Decisions    — 🆕 fresh page (created in migration step 1); records:
                  container-16, naming-domain-component, dark-instances,
                  docs-decisions-boundary. Prior decisions round lives in
                  `🗄️ Archive — Decisions` — intentionally archived, stays untouched
📚 Docs         — Getting Started + 5 foundation docs (§2); also hosts the active
                  _Docs/* doc-tooling masters (DecisionCard, DoDont, Date, Status) —
                  doc infrastructure, out of DS component scope
❖ Components   — 7 domain sections: app · ui · blog · work · hero · contact · about (§3)
                  (today: 6 functional sections — restructured in migration step 3)
📄 Pages        — 8 route masters × Desktop/Mobile + [Dark] instances (§4)
🗄️ Archives     — completed archiving tasks, persist per retirement policy — never
                  reopened: `Archive — Decisions` (holds the prior decisions round),
                  `Archive — Docs v1`
                  (holds 7 archived _Docs/* masters); `XP - WorkCard` exploration
                  page joins them at cleanup (step 9)
```

### Docs / Decisions boundary

- **📐 Decisions = why.** ADR-style, dated, append-only. Superseded records get a
  `superseded by →` stamp, never edits.
- **📚 Docs = what.** Current-state reference only — token tables, breakpoint table,
  container recipe, usage rules. Rationale appears as one line + link to the decision
  record, never restated prose.
- Dedup rule: normative tables (breakpoints, 18 responsive vars, container recipe,
  container-ownership table) live in Docs; the narrative of why lives in Decisions.
  The current "accepted exceptions" rationale moves to a Decisions record; the
  exceptions list itself stays in Docs.

---

## 2 · Foundations

### Variables — 3 collections, final

| Collection     | Final state                                                                                  | Change                                                                                                                                                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1 Primitives` | Generated from installed Tailwind, **minus unused stock palettes** (`pnpm figma:primitives`) | audit pass: drop `mauve/mist/olive/taupe` — Tailwind 4.3 stock palettes this project never uses, excluded at generation via `DROPPED_HUES` in `build-primitives.mjs` so the prune stays closed on every regenerate; keep + document `color/brand/*` (gray incl. 300/650/750, lime incl. 150/250) as the brand extension; normalize dash→slash naming |
| `2 Theme`      | Semantic tokens, light/dark modes                                                            | audit pass: kill orphans / unbound duplicates + naming-clarity review — renames allowed where they improve semantics (rebind instances)                                                                                                                                                                                                              |
| `3 Responsive` | 18 vars, Desktop/Tablet/Mobile modes                                                         | none — settled by archived responsive-architecture work                                                                                                                                                                                                                                                                                              |

No fourth **token** collection. The live `Design System` collection (2 meta vars:
`ds/version`, `ds/last-updated`) is exempt file metadata — components never bind to
it. Components bind to `2 Theme` / `3 Responsive` only; raw values allowed only where
`scripts/figma/named-debt.json` allowlists them.

### Docs page — Getting Started + 5 foundation docs

`DOC / Getting Started` exists and stays as the entry point (not counted in the 5).

1. **Color** — primitives ramp + theme mapping table, both modes side by side.
2. **Typography** — IBM Plex Sans / Bubbler One / Fira Code; roles + scale bound to
   variables.
3. **Spacing & Layout** — container recipe (**16 / 1280 / centered — one recipe, zero
   exceptions**), section-rhythm tokens, breakpoint table, and the **Container
   Ownership** section (normative successor of `TODO_ContainerPatternAnalysis.md`):
   - _Rule:_ Home-type pages → each section owns the container. Document-type pages
     (Blog, Work, About, all detail routes) → the `PageContent` frame owns one
     page-level container; sections inside are bare. Mirrors `src/pages/index.astro`
     (per-section `container`) vs `src/pages/blog.astro:25` (`main.container`).
   - Three-tier ownership table: owns container / must not (nested) / not applicable
     (atoms).
4. **Responsive Architecture** — exists; keeps the 18-var table + masters rule;
   exception rationale moves to a Decisions record.
5. **Motion** — exists (`DOC / Foundations — Motion`, verified 2026-08-17). Content
   audit against: hover grammar (one verb per component), reveal animation,
   reduced-motion behavior.

Icons get no separate doc: `ui/Icon` master is self-documenting plus one annotation
line (24×24 grid, stroke rules).

---

## 3 · Component inventory (❖ Components)

Naming rules:

1. Canonical name = `domain/Component`; domain = lowercase code-folder name; Figma name
   maps to code path (`blog/PostCard` ↔ `src/components/blog/PostCard.astro`). Domains
   are **feature areas, never pages** — Home is a composition of components from
   several domains, not a domain itself (no `home/`). `styleguide/` is a code-only dev
   folder, out of DS scope.
2. Leaf = PascalCase, globally unique, zero role suffixes — `Big/Small/Section` become
   variant axes, never name parts. **Documented exception:** `Preview` in
   `BlogPreview` / `WorkPreview` / `ContactPreview` is the component's semantic role
   (the Home teaser of its domain), not a size axis — it stays a name part.
3. Figma-only atoms use the same scheme and are flagged 📎 (inline markup in code, no
   file).
4. Variant vocabulary is Figma-canon (`primary/secondary/inline/textLink/iconOnly`);
   code CVA renames go on the debt list (§7).
5. Shared pieces get a neutral home (`ui/SectionTitle`).

Legend: 🆕 new master · ♻ rename/merge · 📎 Figma-only · container ✅ owns / ❌ nested /
⬜ n/a.

### Canvas hygiene (normative — ❖ Components and 📄 Pages)

Every component must be fully visible on canvas, bug-free:

- **No cropping:** a master's bounds are never clipped by its section or by any
  neighboring node.
- **No overlap:** masters never overlap or hide one another — every master is
  entirely visible without moving anything.
- **Relevant position:** each master sits inside its domain section, ordered as in
  the inventory tables below; consistent gap between masters (one grid per section,
  no free-floating strays outside sections).
- **Clean sections:** section bounds hug their content with even padding; section
  order on the page follows §3 domain order.

Violations are migration findings, same rank as naming drift — fixed in step 3
(re-sectioning) and re-checked in the final verification sweep (§6).

### app/ — chrome

| Final name         | Variants                                          | Ctr   | Notes                              |
| ------------------ | ------------------------------------------------- | ----- | ---------------------------------- |
| `app/Header`       | `breakpoint=desktop\|mobile`                      | ✅ 16 | 32→16 normalization                |
| `app/Footer`       | `breakpoint`                                      | ✅ 16 |                                    |
| `app/NavLink` ♻    | `type=page\|brand × state=default\|hover\|active` | ⬜ 📎 | merges NavLinkHome as `type=brand` |
| `app/HeaderDrawer` | `state=closed\|open`                              | ⬜ 📎 |                                    |
| `app/ThemeToggle`  | `mode=light\|dark`                                | ⬜    |                                    |
| `app/MotionToggle` | `mode=on\|off`                                    | ⬜    |                                    |

### ui/ — primitives

| Final name           | Variants                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `ui/Link/*`          | 6 sub-sets, each `× state`: `primary` (filled pill; was Primary / code `cta`) · `secondary` (outline pill) · `external` 🆕 (dashed pill — no live master, new build) · `inline` (dashed-underline text; was SecondarySmall / code `default`) · `textLink` (text + arrow) · `iconOnly` (`size=normal\|small`) | final vocabulary; code renames in §7                                                                                        |
| `ui/Icon`            | `icon=…` (24)                                                                                                                                                                                                                                                                                                | annotation: 24×24 grid, stroke rules                                                                                        |
| `ui/H1`, `ui/H2`     | —                                                                                                                                                                                                                                                                                                            |                                                                                                                             |
| `ui/PageDescription` | —                                                                                                                                                                                                                                                                                                            | 📎 code = `P` usage                                                                                                         |
| `ui/SectionTitle` ♻  | —                                                                                                                                                                                                                                                                                                            | was PreviewTitle; H2 + textLink row                                                                                         |
| `ui/Prose` 🆕        | —                                                                                                                                                                                                                                                                                                            | markdown-body specimen for detail pages                                                                                     |
| `ui/SocialShare` 🆕  | —                                                                                                                                                                                                                                                                                                            | detail pages                                                                                                                |
| `ui/CustomImage`     | —                                                                                                                                                                                                                                                                                                            | **no Figma master** — code-only behavior wrapper (LQIP, fade-in); images appear as plain fills/content inside other masters |

### blog/

| Final name                | Variants                               | Ctr   | Notes                                                                                                                                                       |
| ------------------------- | -------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blog/PostCard` ♻         | `size=big\|small × state × breakpoint` | ❌    | merges PostCardPreviewBig + Small; `big` identical across breakpoints                                                                                       |
| `blog/PostRow`            | `type=post\|serie × state`             | ❌    | absorbs code `PostListItem` (live /blog archive rows → `type=post`) and `SeriePostListItem` (live serie landing rows → `type=serie`); see §7                |
| `blog/SerieCard`          | `state`                                | ❌    |                                                                                                                                                             |
| `blog/BlogPreview` ♻      | `breakpoint`                           | ✅ 16 | Home section; was BlogPreviewSection                                                                                                                        |
| `blog/SerieList` ♻        | `breakpoint`                           | ❌    | was SerieCardList; wrapper of `blog/SerieCard` instances. Code `SerieList.astro` exists but is unused and renders retired `SerieListItem` — converges in §7 |
| `blog/PostList` ♻         | `breakpoint`                           | ❌    | was PostArchiveList; wrapper of `blog/PostRow type=post` instances. Live `blog.astro` renders `PostListItem` directly — converges in §7                     |
| `blog/PostMetadataTime`   | `type=default\|no-date\|day`           | ⬜ 📎 |                                                                                                                                                             |
| `blog/PostMetadataTopic`  | `type=post\|serie`                     | ⬜    | not 📎 — code file exists as `TopicChips.astro`; renames in §7                                                                                              |
| `blog/SerieMeta`          | —                                      | ⬜ 📎 |                                                                                                                                                             |
| `blog/TableOfContents` 🆕 | —                                      | ❌    | rebuild — master pruned with the detail templates (absent from live inventory, verified 2026-08-17)                                                         |
| `blog/SerieContents` 🆕   | —                                      | ❌    | rebuild — master pruned with the detail templates                                                                                                           |
| `blog/PostNav` 🆕         | —                                      | ❌    | rebuild — `LinkNavPost` master pruned; code `ui/LinkNavPost` renames + moves                                                                                |
| `blog/RelatedWork` 🆕     | —                                      | ❌    | rebuild — master pruned with the detail templates                                                                                                           |

### work/

| Final name               | Variants                          | Ctr   | Notes                                                                                                                                                                             |
| ------------------------ | --------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `work/WorkCard` ♻        | `variant=catalogue\|case × state` | ❌    | anatomy owned by the WorkCard final spec (incl. sub `WorkCardImage`); hover gap closed. Rename source = live `WorkCardPreviewSmall` master (absorbed as `variant=catalogue` base) |
| `work/WorkPreview` ♻     | `breakpoint`                      | ✅ 16 | Home section; code `WorksPreview` rename                                                                                                                                          |
| `work/ArchiveTable` 🆕   | `breakpoint`                      | ❌    | /work ledger                                                                                                                                                                      |
| `work/WorkHeader` 🆕     | —                                 | ❌    | rebuild — master pruned with the detail templates                                                                                                                                 |
| `work/RelatedWriting` 🆕 | —                                 | ❌    | rebuild — master pruned with the detail templates                                                                                                                                 |

### hero/

| Final name                            | Variants     | Ctr   | Notes                                                                                                               |
| ------------------------------------- | ------------ | ----- | ------------------------------------------------------------------------------------------------------------------- |
| `hero/Hero`                           | `breakpoint` | ✅ 16 |                                                                                                                     |
| `hero/HeroText`, `hero/HeroAnimation` | —            | ❌    | subs — live masters                                                                                                 |
| `hero/HeroImage`, `hero/HeroSocials`  | —            | ❌    | code-only subs — render as layers inside `Hero`, no Figma masters (same treatment as `ContactImage`/`ContactNoise`) |

### contact/

| Final name                 | Variants                 | Ctr   | Notes                                                                                                                 |
| -------------------------- | ------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------- |
| `contact/ContactPreview` ♻ | `breakpoint` (🆕 mobile) | ✅ 16 | 32→16; mobile-variant gap closed; code `Contact` renames (§7)                                                         |
| `contact/ContactContent`   | —                        | ❌    | sub; code `ContactText` converges (§7). `ContactImage` + `ContactNoise` render as layers inside — no separate masters |

### about/

`about/AboutText` 🆕 (composes `about/AboutFacts` 🆕 + `about/AboutFactsStrip` 🆕) —
mirrors the live import graph (`about.astro → AboutText → AboutFacts/AboutFactsStrip`).
Document-page container rule.

### Retired (archived, never deleted — marked in Decisions)

Explorations: `WorkOverlayCard`, `WorkGalleryCard`, WorkCard exploration boards.
~~`WorkMiniCard`~~, ~~`PostRowCalm`~~ — **struck at R3.2/P3-T11**: both were retired on paper
but phase 2 built Figma masters for them anyway, because `blog/RelatedWork` composes
`work/WorkMiniCard` (P2-T08) and `work/RelatedWriting` composes `blog/PostRowCalm` (P2-T09).
P3-T11's live roster confirms both. They are sub-components of a canon master, not explorations.
Code orphans (imported by nothing): `AboutValues`, `ValueCard`, `Skills`, `SkillsText`;
transitively unused: `SerieListItem` (only reachable via unused `SerieList` chain),
`SeriePostCard` (only used by the archived `BlogPreview` twin).
Dropped from Home: `AboutStrip`.
Code duplicates collapsing to canon names: `SelectedWriting` → `blog/BlogPreview`,
`WorksStrip` → `work/WorkPreview` (code today renders the Strip variants on Home; the
canon name survives, the twin is archived); `PostListItem` → `blog/PostRow type=post`
and `SeriePostListItem` → `blog/PostRow type=serie` (live rows fold into the PostRow
axes).

Total 45 masters across 7 domains (`ui/Link/*` counted as 6 masters; 📎 Figma-only
atoms counted; code-only pieces without masters not counted).

---

## 4 · Page masters (📄 Pages)

### Shell — every master

```
<Route> — <Breakpoint>          vertical auto-layout; mobile width 390
  ├─ app/Header (instance)
  ├─ PageContent                gap bound to 3 Responsive/section/rhythm-y
  └─ app/Footer (instance)
```

### Two PageContent recipes (mirrors code)

- **Home type** (`/` only): `PageContent` pad-x 0, full bleed; each section instance
  owns its container (`hero/Hero → blog/BlogPreview → work/WorkPreview →
contact/ContactPreview`).
- **Document type** (all 7 others): `PageContent` itself carries the container recipe
  (pad-x 16, max-w 1280, centered) = code `main.container`. The current
  `PageContentContainer` extra wrapper level is removed — one frame fewer, 1:1 with
  `src/pages/blog.astro:25`. Sections inside are bare.

### Masters — content stacks

| Master        | PageContent children                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Home          | 4 section instances (above)                                                                                                         |
| Blog          | PageIntro (H1 + PageDescription) → Archive (`blog/PostList` per year) → Series (H2 + `blog/SerieList`)                              |
| Work 🆕       | PageIntro → Selected: 4× `work/WorkCard variant=case` zigzag → `work/ArchiveTable`                                                  |
| About 🆕      | `about/AboutText` (facts strips inside, per live import graph)                                                                      |
| Post detail   | PostHeader (H1 + metadata + `ui/SocialShare`) → `ui/Prose` → `blog/RelatedWork` → `blog/PostNav` → `ui/Link/secondary` (`All blog`) |
| Serie landing | SerieHeader → `blog/SerieContents` (post rows = `blog/PostRow type=serie`)                                                          |
| Serie post    | Post-detail stack **minus `blog/RelatedWork`** + `blog/SerieContents` (position mirrors the live route)                             |
| Work detail   | `work/WorkHeader` → `ui/Prose` → `work/RelatedWriting`                                                                              |

The Blog and Post-detail orders above are the **live** orders (amended at R3.1: Series follows
Archive; `ui/SocialShare` sits in the `PostHeader` meta row, `blog/RelatedWork` precedes
`blog/PostNav`, and a trailing `ui/Link/secondary` closes the page). Live wins on order. The
Serie-post row subtracts `blog/RelatedWork` from that stack: `blog/[serie]/[post].astro` never
imports it (removed from the masters at P3-T09).

`PageIntro`, `PostHeader`, `SerieHeader` are **named layout frames** local to each page
master (grouping H1 / `ui/PageDescription` / metadata instances) — not component
masters; they appear nowhere in §3.

Detail masters = **rebuilds**, not promotions: the 2026-07 detail templates
(`PAGE/POST` etc.) were pruned from the file (confirmed 2026-08-13 — node IDs return
null; 📄 Pages holds only Home/Blog frames; re-verified 2026-08-17 via live MCP
inventory). The pruning also took the 6 detail components with it —
`TableOfContents`, `SerieContents`, `LinkNavPost`, `RelatedWork`, `WorkHeader`,
`RelatedWriting` are absent from the 49-master live inventory and are 🆕 rebuilds in
§3, not renames. The archived build knowledge
(`.claude/skills/figma-verify/knowledge/figma-ds-file.md`, `named-debt.json` entries)
feeds the rebuild; layouts are not redesigned, they mirror the live routes.

### Canvas layout & rules

- One row per route, fixed order: `Desktop · Mobile · Desktop [Dark] · Mobile [Dark]`.
  8 rows × 4 = 32 frames. Dark = instances of the master with theme overrides.
- Masters contain **instances and named layout frames only** (`PageContent`,
  `PageIntro`, …) — no detached component copies, no local overrides of container
  geometry.
- Pixel disagreements resolve master-side, then `pnpm geometry:web` re-proves against
  live routes.
- Canvas hygiene rules (§3) apply here too: no cropped frames, no overlaps, rows
  aligned on one grid.

---

## 5 · Container ownership (normative)

Successor of `TODO_ContainerPatternAnalysis.md`; that file dies once this ships.

- **One recipe:** pad-x 16 / max-w 1280 / centered — no 32px exceptions anywhere
  (Header, ContactPreview normalized).
- **Owns container (✅):** `app/Header`, `app/Footer`, `hero/Hero`, `blog/BlogPreview`,
  `work/WorkPreview`, `contact/ContactPreview` — the Home-type section masters — plus the
  `PageContent` frame of every document-type page master.
- **Must not own (❌):** anything nested in an owner — cards, lists, subs, detail
  components.
- **Not applicable (⬜):** atoms; their internal padding (buttons, badges) is
  component-internal, never container.

---

## 6 · Figma migration order

0. Inventory validation: **done 2026-08-17** via live MCP Pass-0 (pages, 49 masters,
   4 variable collections) — this spec's naming is now verified against the live file.
   Optional cross-check before executing: fresh Figma **File > Export** →
   `pnpm figma:dump <file.fig>`.
1. Decisions records: `container-16`, `naming-domain-component`, `dark-instances`,
   `docs-decisions-boundary`. Includes creating the fresh 📐 Decisions **page**.
   `🗄️ Archive — Decisions` is the prior round, intentionally archived — leave it
   untouched, do not rename or repurpose it.
2. Variables audit: `2 Theme` orphans/unbound + naming-clarity pass (semantic renames
   allowed; `pnpm figma:verify` re-run after to catch broken bindings). `1 Primitives`
   prune: drop `mauve/mist/olive/taupe` (Tailwind 4.3 stock palettes, unused
   here — also excluded from the generator), keep + document `color/brand/*`. `Design System` meta collection stays, exempt.
3. Mechanical renames → `domain/Name` (instances follow), and re-section
   ❖ Components: 6 functional sections (Chrome/Actions/Sections/Typography/Metadata/
   Cards) → 7 domain sections. Already canon in Figma, skip: `PostRow`,
   `PostMetadataTopic`, `ContactContent`.
4. Merges: NavLink + NavLinkHome (`type` axis) · PostCard big/small (`size` axis) ·
   Link family → `ui/Link/*` vocabulary (`external` is a new build, not a merge).
5. Container normalization: Header + Contact 32→16.
6. New masters: `work/WorkCard` catalogue/case (+ hover; absorbs
   `WorkCardPreviewSmall`), `work/ArchiveTable`, `contact/ContactPreview` mobile,
   `ui/Prose`, `ui/SocialShare`, `ui/Link/external`, the 6 detail-component rebuilds
   (`blog/TableOfContents`, `blog/SerieContents`, `blog/PostNav`, `blog/RelatedWork`,
   `work/WorkHeader`, `work/RelatedWriting`), `about/*`.
7. Page masters: Work + About built; 4 detail masters rebuilt (templates were pruned —
   use archived build knowledge in `figma-ds-file.md`); `PageContentContainer` wrapper
   removed; dark rows rebuilt.
8. Docs: 5 final docs; rationale prose moved to Decisions.
9. Cleanup: explorations archived (incl. the `XP - WorkCard` page → 🗄️ archive),
   debris deleted.

Verification after migration: manual Figma **File > Export** of a local `.fig` →
`pnpm figma:dump <file.fig>` → `pnpm figma:verify` → `pnpm figma:verify-raw` →
`pnpm geometry:web`; refresh pixel-manifest selectors. Plus a **canvas-hygiene
sweep** (§3 rules): screenshot every ❖ Components section and 📄 Pages row —
zero cropped, overlapping, or hidden masters; sections clean and ordered.

---

## 7 · Code-debt list (code follows Figma — future plan, not this spec)

- `Link` CVA vocabulary: `cta→primary`, `icon→iconOnly`, `iconSmall→iconOnly
size=small`, `default→inline`; `menuActive/menuInactive` express NavLink states;
  `bold` (single use, `ContactText`) folds into `textLink`.
- Row collapses: `PostListItem` → `PostRow type=post`, `SeriePostListItem` →
  `PostRow type=serie`; `SerieList.astro`/`PostList.astro` wrappers adopt canon
  children (`SerieCard` / `PostRow`) and get wired into `blog.astro` (which today
  renders items directly).
- `TopicChips → PostMetadataTopic`.
- Contact renames: `Contact → ContactPreview`, `ContactText → ContactContent`
  (`ContactImage`/`ContactNoise` stay as internal pieces).
- Collapse Home-section duplicates to canon names: `SelectedWriting`/`BlogPreview` →
  `BlogPreview`, `WorksStrip`/`WorksPreview` → `WorkPreview` (canon name keeps the
  currently-rendered markup).
- `LinkNavPost → PostNav` (moves ui→blog).
- Remove `AboutStrip` from Home page composition.
- Archive (not delete) retired components: `WorkOverlayCard`, `WorkGalleryCard`,
  `PostListItem`, `SeriePostListItem`,
  `SelectedWriting`, `WorksStrip`, `AboutStrip`, `AboutValues`, `ValueCard`,
  `Skills`, `SkillsText`, `SerieListItem`, `SeriePostCard`.
- WorkCard catalogue/case + `getFeaturedWorks(limit)` — already specced in the WorkCard
  final spec.

## Out of scope

Editorial content and selected-work ranking (editorial loop owns), cover-studio, code
implementation itself, `404.astro` (no page master), the `styleguide/` dev folder.
