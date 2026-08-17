---
title: Magnet-DS final state — docs, foundations, components, pages
created: 2026-08-17
status: design — approved section by section in brainstorming session
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

| Decision | Choice |
| --- | --- |
| Page scope | Full site — all 8 code routes as page masters |
| Container | One recipe everywhere: pad-x 16 / max-w 1280 / centered. Header + Contact 32→16 normalized |
| Naming | `domain/Component`, Figma-canon, suffixes become variant axes, code follows via debt list |
| Dark mode | Keep `[Dark]` instance frames per master (no mode-only strategy) |
| File organization | Keep 5 Figma pages; Components page holds 6 domain sections |
| Docs vs Decisions | Docs = what (current state, edited in place); Decisions = why (dated, append-only). Any table lives in exactly one page; links go Docs → Decisions only |
| Home = 4 sections | `AboutStrip` (live 5th section) dropped from final Home — archived, not deleted. About page carries the content |
| Retirement policy | Retired components/explorations are **archived, never deleted** — Figma: archive section; code: file kept, marked retired |

---

## 1 · File structure

```
📖 Cover        — unchanged
📐 Decisions    — decision records; new: container-16, naming-domain-component,
                  dark-instances, docs-decisions-boundary
📚 Docs         — 5 foundation docs (§2)
❖ Components   — 6 domain sections: app · ui · blog · work · home · about (§3)
📄 Pages        — 8 route masters × Desktop/Mobile + [Dark] instances (§4)
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

| Collection | Final state | Change |
| --- | --- | --- |
| `1 Primitives` | Generated from installed Tailwind (`pnpm figma:primitives`) | none — canonical |
| `2 Theme` | Semantic tokens, light/dark modes | audit pass: kill orphans / unbound duplicates; no renames |
| `3 Responsive` | 18 vars, Desktop/Tablet/Mobile modes | none — settled by archived responsive-architecture work |

No fourth collection. Components bind to `2 Theme` / `3 Responsive` only; raw values
allowed only where `scripts/figma/named-debt.json` allowlists them.

### Docs page — 5 foundation docs

1. **Color** — primitives ramp + theme mapping table, both modes side by side.
2. **Typography** — IBM Plex Sans / Bubbler One / Fira Code; roles + scale bound to
   variables.
3. **Spacing & Layout** — container recipe (**16 / 1280 / centered — one recipe, zero
   exceptions**), section-rhythm tokens, breakpoint table, and the **Container
   Ownership** section (normative successor of `TODO_ContainerPatternAnalysis.md`):
   - *Rule:* Home-type pages → each section owns the container. Document-type pages
     (Blog, Work, About, all detail routes) → the `PageContent` frame owns one
     page-level container; sections inside are bare. Mirrors `src/pages/index.astro`
     (per-section `container`) vs `src/pages/blog.astro:25` (`main.container`).
   - Three-tier ownership table: owns container / must not (nested) / not applicable
     (atoms).
4. **Responsive Architecture** — exists; keeps the 18-var table + masters rule;
   exception rationale moves to a Decisions record.
5. **Motion** — new. Hover grammar (one verb per component), reveal animation,
   reduced-motion behavior.

Icons get no separate doc: `ui/Icon` master is self-documenting plus one annotation
line (24×24 grid, stroke rules).

---

## 3 · Component inventory (❖ Components)

Naming rules:

1. Canonical name = `domain/Component`; domain = lowercase code-folder name; Figma name
   maps to code path (`blog/PostCard` ↔ `src/components/blog/PostCard.astro`).
2. Leaf = PascalCase, globally unique, zero role suffixes — `Big/Small/Preview/Section`
   become variant axes, never name parts.
3. Figma-only atoms use the same scheme and are flagged 📎 (inline markup in code, no
   file).
4. Variant vocabulary is Figma-canon (`primary/secondary/inline/textLink/iconOnly`);
   code CVA renames go on the debt list (§7).
5. Shared pieces get a neutral home (`ui/SectionTitle`).

Legend: 🆕 new master · ♻ rename/merge · 📎 Figma-only · container ✅ owns / ❌ nested /
⬜ n/a.

### app/ — chrome

| Final name | Variants | Ctr | Notes |
| --- | --- | --- | --- |
| `app/Header` | `breakpoint=desktop\|mobile` | ✅ 16 | 32→16 normalization |
| `app/Footer` | `breakpoint` | ✅ 16 | |
| `app/NavLink` ♻ | `type=page\|brand × state=default\|hover\|active` | ⬜ 📎 | merges NavLinkHome as `type=brand` |
| `app/HeaderDrawer` | `state=closed\|open` | ⬜ 📎 | |
| `app/ThemeToggle` | `mode=light\|dark` | ⬜ | |
| `app/MotionToggle` | `mode=on\|off` | ⬜ | |

### ui/ — primitives

| Final name | Variants | Notes |
| --- | --- | --- |
| `ui/Link/*` | 6 sub-sets, each `× state`: `primary` (filled pill; was Primary / code `cta`) · `secondary` (outline pill) · `external` (dashed pill) · `inline` (dashed-underline text; was SecondarySmall / code `default`) · `textLink` (text + arrow) · `iconOnly` (`size=normal\|small`) | final vocabulary; code renames in §7 |
| `ui/Icon` | `icon=…` (24) | annotation: 24×24 grid, stroke rules |
| `ui/H1`, `ui/H2` | — | |
| `ui/PageDescription` | — | 📎 code = `P` usage |
| `ui/SectionTitle` ♻ | — | was PreviewTitle; H2 + textLink row |
| `ui/Prose` 🆕 | — | markdown-body specimen for detail pages |
| `ui/SocialShare` 🆕 | — | detail pages |

### blog/

| Final name | Variants | Ctr | Notes |
| --- | --- | --- | --- |
| `blog/PostCard` ♻ | `size=big\|small × state × breakpoint` | ❌ | merges PostCardPreviewBig + Small; `big` identical across breakpoints |
| `blog/PostRow` | `type=post\|serie × state` | ❌ | |
| `blog/SerieCard` | `state` | ❌ | |
| `blog/BlogPreview` ♻ | `breakpoint` | ✅ 16 | Home section; was BlogPreviewSection |
| `blog/SerieList` ♻ | `breakpoint` | ❌ | was SerieCardList |
| `blog/PostList` ♻ | `breakpoint` | ❌ | was PostArchiveList |
| `blog/PostMetadataTime` | `type=default\|no-date\|day` | ⬜ 📎 | |
| `blog/PostMetadataTopic` | `type=post\|serie` | ⬜ 📎 | |
| `blog/SerieMeta` | — | ⬜ 📎 | |
| `blog/TableOfContents` 🆕 | — | ❌ | promote from detail template |
| `blog/SerieContents` 🆕 | — | ❌ | promote from detail template |
| `blog/PostNav` ♻🆕 | — | ❌ | prev/next; code `ui/LinkNavPost` renames + moves |
| `blog/RelatedWork` 🆕 | — | ❌ | |

### work/

| Final name | Variants | Ctr | Notes |
| --- | --- | --- | --- |
| `work/WorkCard` ♻ | `variant=catalogue\|case × state` | ❌ | anatomy owned by the WorkCard final spec; hover gap closed |
| `work/WorkPreview` ♻ | `breakpoint` | ✅ 16 | Home section; code `WorksPreview` rename |
| `work/ArchiveTable` 🆕 | `breakpoint` | ❌ | /work ledger |
| `work/WorkHeader` 🆕 | — | ❌ | detail page |
| `work/RelatedWriting` 🆕 | — | ❌ | detail page |

### home/

| Final name | Variants | Ctr | Notes |
| --- | --- | --- | --- |
| `home/Hero` | `breakpoint` | ✅ 16 | |
| `home/HeroText`, `home/HeroAnimation` | — | ❌ | subs |
| `home/ContactPreview` ♻ | `breakpoint` (🆕 mobile) | ✅ 16 | 32→16; mobile-variant gap closed |
| `home/ContactContent` | — | ❌ | sub |

### about/

`about/AboutText` 🆕 (composes `about/AboutFacts` 🆕 + `about/AboutFactsStrip` 🆕) —
mirrors the live import graph (`about.astro → AboutText → AboutFacts/AboutFactsStrip`).
Document-page container rule.

### Retired (archived, never deleted — marked in Decisions)

Explorations: `WorkOverlayCard`, `WorkGalleryCard`, `WorkMiniCard`, `PostRowCalm`,
`PostListItem`, WorkCard exploration boards.
Code orphans (imported by nothing): `AboutValues`, `ValueCard`, `Skills`, `SkillsText`.
Dropped from Home: `AboutStrip`.
Code duplicates collapsing to canon names: `SelectedWriting` → `blog/BlogPreview`,
`WorksStrip` → `work/WorkPreview` (code today renders the Strip variants on Home; the
canon name survives, the twin is archived).

Total ≈ 42 masters across 6 domains.

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
  owns its container (`home/Hero → blog/BlogPreview → work/WorkPreview →
  home/ContactPreview`).
- **Document type** (all 7 others): `PageContent` itself carries the container recipe
  (pad-x 16, max-w 1280, centered) = code `main.container`. The current
  `PageContentContainer` extra wrapper level is removed — one frame fewer, 1:1 with
  `src/pages/blog.astro:25`. Sections inside are bare.

### Masters — content stacks

| Master | PageContent children |
| --- | --- |
| Home | 4 section instances (above) |
| Blog | PageIntro (H1 + PageDescription) → Series (H2 + `blog/SerieList`) → Archive (`blog/PostList` per year) |
| Work 🆕 | PageIntro → Selected: 4× `work/WorkCard variant=case` zigzag → `work/ArchiveTable` |
| About 🆕 | `about/AboutText` (facts strips inside, per live import graph) |
| Post detail | PostHeader (H1 + metadata) → `ui/Prose` → `ui/SocialShare` → `blog/PostNav` → `blog/RelatedWork` |
| Serie landing | SerieHeader → `blog/SerieContents` |
| Serie post | Post-detail stack + `blog/SerieContents` (position per current template) |
| Work detail | `work/WorkHeader` → `ui/Prose` → `work/RelatedWriting` |

Detail masters = promotion of the 4 existing templates into this shell with components
swapped to final masters — not redesigns.

### Canvas layout & rules

- One row per route, fixed order: `Desktop · Mobile · Desktop [Dark] · Mobile [Dark]`.
  8 rows × 4 = 32 frames. Dark = instances of the master with theme overrides.
- Masters contain **instances only** — no detached copies, no local overrides of
  container geometry.
- Pixel disagreements resolve master-side, then `pnpm geometry:web` re-proves against
  live routes.

---

## 5 · Container ownership (normative)

Successor of `TODO_ContainerPatternAnalysis.md`; that file dies once this ships.

- **One recipe:** pad-x 16 / max-w 1280 / centered — no 32px exceptions anywhere
  (Header, ContactPreview normalized).
- **Owns container (✅):** `app/Header`, `app/Footer`, `home/Hero`, `blog/BlogPreview`,
  `work/WorkPreview`, `home/ContactPreview` — the Home-type section masters — plus the
  `PageContent` frame of every document-type page master.
- **Must not own (❌):** anything nested in an owner — cards, lists, subs, detail
  components.
- **Not applicable (⬜):** atoms; their internal padding (buttons, badges) is
  component-internal, never container.

---

## 6 · Figma migration order

1. Decisions records: `container-16`, `naming-domain-component`, `dark-instances`,
   `docs-decisions-boundary`.
2. `2 Theme` audit (orphans/unbound only).
3. Mechanical renames → `domain/Name` (instances follow).
4. Merges: NavLink + NavLinkHome (`type` axis) · PostCard big/small (`size` axis) ·
   Link family → `ui/Link/*` vocabulary.
5. Container normalization: Header + Contact 32→16.
6. New masters: `work/WorkCard` catalogue/case (+ hover), `work/ArchiveTable`,
   `home/ContactPreview` mobile, `ui/Prose`, `ui/SocialShare`, detail components,
   `about/*`.
7. Page masters: Work + About built; 4 detail templates promoted; `PageContentContainer`
   wrapper removed; dark rows rebuilt.
8. Docs: 5 final docs; rationale prose moved to Decisions.
9. Cleanup: explorations archived, debris deleted.

Verification after migration: `pnpm figma:dump` → `pnpm figma:verify` →
`pnpm figma:verify-raw` → `pnpm geometry:web`; refresh pixel-manifest selectors.

---

## 7 · Code-debt list (code follows Figma — future plan, not this spec)

- `Link` CVA vocabulary: `cta→primary`, `icon→iconOnly`, `iconSmall→iconOnly
  size=small`, `default→inline`; `menuActive/menuInactive` express NavLink states.
- Collapse Home-section duplicates to canon names: `SelectedWriting`/`BlogPreview` →
  `BlogPreview`, `WorksStrip`/`WorksPreview` → `WorkPreview` (canon name keeps the
  currently-rendered markup).
- `LinkNavPost → PostNav` (moves ui→blog).
- Remove `AboutStrip` from Home page composition.
- Archive (not delete) retired components: `WorkOverlayCard`, `WorkGalleryCard`,
  `WorkMiniCard`, `PostRowCalm`, `PostListItem`, `AboutStrip`, `AboutValues`,
  `ValueCard`, `Skills`, `SkillsText`.
- WorkCard catalogue/case + `getFeaturedWorks(limit)` — already specced in the WorkCard
  final spec.

## Out of scope

Editorial content and selected-work ranking (editorial loop owns), cover-studio, code
implementation itself.
