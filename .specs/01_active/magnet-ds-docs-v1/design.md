---
title: Magnet DS docs restructure (one Docs page)
created: 2026-08-10
---

# Magnet DS docs restructure — design

> Decision record from the 2026-08-10 file audit of `Magnet-DS-v1.0` (file key
> `ihWIWmvtQPTWgUxlrVjC2c`). Chosen structure: **Approach A — one 📚 Docs page**,
> decisions distributed in-context. Companion thesis: [thesis.md](thesis.md).

## Audit findings (2026-08-10)

| Page | State found |
| --- | --- |
| 📖 Cover (`0:1`) | One frame `9:2` (1200×675): v0.91 chip, date chip, "Magnet DS", tagline, author + CC, hand-drawn magnet. Healthy. |
| 📚 Introduction (`2545:671`) | Holds the entire documentation: `_Docs/*` private components (10), `CHAPTER / 00 Read me`, `01 Foundations`, `02 Components`, `03 Sections`, `04 Pages`, `Intro/01` (why), `Intro/02` (how), 3 stray frames. |
| 📐 Decisions (`2716:4244`) | Empty (0 children) since creation — evidence the centralized-decisions structure fights the workflow. |
| 🎨 Foundations (`5:14`) | Two stale specimen frames (`Foundations · Colors` `6:2`, `· Typography` `8:2`) fully superseded by `CHAPTER / 01 Foundations`. |
| ❖ Components (`461:759`) | Working library, 8 sections, three competing taxonomies across page/docs/thesis. |
| 📄 Pages (`2558:18264`) | 8 page components (Home/Blog × Desktop/Mobile × Light/Dark), slot-based. Healthy. |
| Page 6–11 | Template backups; Pages 8, 9, 11 empty. |

Stray junk: `Frame 1` (`2708:21292`, levels diagram), `Section` (`2709:21629`,
copied-template residue about `_states` variables), text label
`BLOG DESIGN SYSTEM v1.0` (`2670:6656`, stale name).

## Decisions

### D1 — Name: keep "Magnet DS"

No exact collision. Nearby: Magnet UI (open-source lib, GitHub + Netlify),
magnet.co agency, Magnetic UI (Framer), Magnet UI Kit (Spline). Personal,
unpublished system → acceptable. Re-check npm if tokens ever publish as a
package. Kill the stale `BLOG DESIGN SYSTEM v1.0` label.

### D2 — Cover: keep as is

Figma file cover = browser thumbnail, not a docs-site nav hub, so the
version + date chips do real identification work (the web-survey "no version
on cover" rule does not transfer). Cover already specimens all three identity
layers. Bump v0.91 → v1.0 when this restructure ships; no TOC on cover
(pages panel is the nav).

### D3 — Documentation: one page, `📚 Docs` (Approach A)

Chapter matrix, top-to-bottom reading order:

```text
📚 Docs
  ├─ 00 About        — identity (3 layers), 7 core rules, audience, page intents
  ├─ 01 Foundations  — Colour, Type, Spacing, Radius, Motion, Icons + A11y + Token Verification
  ├─ 02 Components   — rules + DecisionCards + DoDont, grouped per D5 taxonomy
  ├─ 03 Sections     — composed assemblies, token audit per cell
  └─ 04 Pages        — responsive/light-dark proof cells
```

- Decision cards stay **distributed** inside the chapter they govern
  (Uber Base precedent: principles distributed, no centralized manifesto).
  The thesis's "intent before implementation" is honored *within* the page:
  Chapter 00 leads with identity + the 7 core rules.
- Delete the empty 📐 Decisions page and (per D4) the 🎨 Foundations page.
- Rename `📚 Introduction` → `📚 Docs` ("Introduction" mislabels a full
  reference; "Getting started" implies onboarding steps that don't exist).
- `Intro/01` + `Intro/02` content (audience, problem, user flows, branding)
  compresses into Chapter 00 About: mission ≤3 lines, audience table,
  three-layer identity, page-intent list. Deep product strategy lives in
  `.specs/`, not Figma.
- `_Docs/*` private components: keep (underscore = unpublished). They are the
  doc-maintenance mechanism.

### D4 — Foundations page: delete after salvage check

Both frames are superseded by `CHAPTER / 01 Foundations`. Before deleting,
diff the old `Foundations · Typography` specimen list against
`SECTION / Type`; move anything unique. Deleting frames removes no local
styles/variables; `figma:verify` reads variables — safe.

### D5 — One component taxonomy, mirrored in ❖ Components sections and Docs chapter 02 groups

| Section | Components |
| --- | --- |
| Chrome | Header, Footer, NavLink, NavLinkHome, ThemeToggle, MotionToggle, Icon |
| Actions | Link/CTA, Link/Secondary, Link/SecondarySm, Link/TextCTA, Link/Icon |
| Typography | H1, H2, PreviewTitle, PageDescription |
| Metadata | PostMetadataTime, PostMetadataTopic, SerieMeta |
| Cards | PostRow, SerieCard, PostCardPreviewBig, PostCardPreviewSmall, WorkCardPreviewSmall |
| Sections | Hero, HeroText, HeroAnimation, BlogPreviewSection, ArchiveTable, SerieCardList, WorkPreviewSection, ContactContent, ContactPreviewSection |

- All `Link/*` centralized in Actions; NavLink stays Chrome (nav-bound).
- No doc text on the Components page canvas. One-sentence usage lives in each
  component's **description field** (Dev Mode + AI); full rules live in Docs
  chapter 02.
- Sections stay a section on the Components page (9 components don't justify
  a page split); the level distinction is carried by the section name.

### D6 — Pages: keep 8 separate page components

`Home — Desktop — Dark` matrix naming stays. No page-level variant sets
(heavy, slow, slot pattern already works).

## Cleanup checklist (implementation scope)

1. Delete: 📐 Decisions page; 🎨 Foundations page (after D4 salvage);
   `Frame 1` (`2708:21292`); `Section` (`2709:21629`);
   `BLOG DESIGN SYSTEM v1.0` label (`2670:6656`); empty backup Pages 8, 9, 11.
2. Rename: `📚 Introduction` → `📚 Docs`; `CHAPTER / 00 Read me` → `00 About`;
   remaining backups → `🗄 Backup — <source>`.
3. Retitle ❖ Components page sections per D5; align Docs chapter-02 group
   frames to the same six names.
4. Fold `Intro/01` + `Intro/02` into Chapter 00 About; delete the source frames.
5. Add one-sentence description-field text to each published component.
6. Bump cover v0.91 → v1.0 + refresh date chip; update `CLAUDE.md` reference
   to the docs page name (`📚 Design system` → `📚 Docs`).

## Out of scope

- Any visual redesign of components or tokens (settled by artistic-direction).
- Web-side documentation.
- Specimen rebuild Task 9 from artistic-direction (tracked separately).
