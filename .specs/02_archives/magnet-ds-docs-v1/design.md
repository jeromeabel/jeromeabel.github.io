---
shipped: 2026-08-11
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

> **Correction (post-Task 8, 2026-08-11):** the "empty (0 children) since
> creation" claim above for 📐 Decisions, and the "Pages 8, 9, 11 empty"
> claim in the table row above, were stale/unverified and are false — a
> live Task 8 check found real, non-empty content on all four (📐 Decisions
> has a 1440×4913 `design-decisions` frame with 7 sub-frames; Page 8 has 12
> frames; Page 9 has 5; Page 11 has 33). See `notes.md`'s `## Task 8`
> section for the live check and `.specs/00_backlog/figma-undecided-pages.md`
> for the follow-up. D3's conclusion below to leave these pages as backups/
> undecided rather than delete them still holds; the empty-page premise it
> was partly reasoned from does not.

## Decisions

### D1 — Name: keep "Magnet DS"

No exact collision. Nearby: Magnet UI (open-source lib, GitHub + Netlify),
magnet.co agency, Magnetic UI (Framer), Magnet UI Kit (Spline). Personal,
unpublished system → acceptable. Re-check npm if tokens ever publish as a
package. Kill the stale `BLOG DESIGN SYSTEM v1.0` label.

### D2 — Cover: keep as is; no version bump from this restructure

Figma file cover = browser thumbnail, not a docs-site nav hub, so the
version + date chips do real identification work (the web-survey "no version
on cover" rule does not transfer). Cover already specimens all three identity
layers. **Version stays v0.91** — no intermediate bump; **v1.0 is reserved for
the milestone "all components and pages designed"**. Refresh the date chip
whenever the file materially changes. No TOC on cover (pages panel is the nav).

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
  doc-maintenance mechanism (extension policy: D7).

**Migration strategy — non-destructive.** Build the new `📚 Docs` page fresh
(instances of `_Docs/*` + moved chapter frames where they already comply);
demote the old `📚 Introduction` page to `🗄 Backup — Introduction (pre-Docs)`.
Delete backups only after the new page is validated against D8. Existing
template-backup pages with content (6, 7, 10) stay as backups; only truly
empty pages (8, 9, 11) are deleted — nothing to back up.

> **Correction (post-Task 8, 2026-08-11):** "only truly empty pages (8, 9,
> 11) are deleted" above rested on a false premise — Task 8's live check
> found all three (plus 📐 Decisions) hold real, unreviewed content, so
> deletion did not proceed for them; only 🎨 Foundations was deleted, on its
> independent D4 content-diff verdict. See the correction note in the
> audit-findings table above and `notes.md`'s `## Task 8` section for detail,
> and `.specs/00_backlog/figma-undecided-pages.md` for the follow-up. The
> shipped outcome (leave as backups/undecided, don't delete) matches what
> D3's own non-destructive principle would have required anyway, so the
> plan's actual behavior held even though its stated premise didn't.

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

### D7 — `_Docs/*` components: reuse the existing 10, extend only on proven need

Base set stays as-is: ChapterHeader, SpecimenCell, DecisionCard (set),
TokenRow, DoDont, Date (set), Status (set), Headline, Paragraph, Divider.
No rebuild — the restructure composes instances of these.

Additions allowed only when a chapter build hits a gap, capped at:

- `_Docs/GroupHeader` — level-2 heading for the six D5 groups (number-less,
  smaller than ChapterHeader), if plain Headline instances prove insufficient.
- `_Docs/PageTOC` — one page-top orientation card listing the five chapters
  with one-line purposes (spatial map, not links — Figma has no anchors).

Anything else needs a note in this spec first (thesis §10: decision before
component).

### D8 — Readability spec (cognitive load, scannability, IA)

The new Docs page must pass these checks (source: ds-documentation.md rules,
Sync-deck presentation moves):

- **Linear spatial IA.** Chapters stacked in one vertical column, reading
  order 00 → 04, constant width (1408) and constant chapter gap. Scrolling
  down = reading order; no side-quests on the canvas.
- **Layer-cake scanning.** Every chapter: ChapterHeader (number + name +
  one-line purpose) → GroupHeaders → cards. Any fact findable via
  page → chapter → group → card in ≤10 s.
- **Two-level disclosure cap.** Chapter → group. No third nesting level.
- **One idea per frame; density lives in cards,** not in frame count.
- **Heading hierarchy is visible.** 2–4 size steps between levels, top level
  ≤2× body. If the current Headline component can't express two levels,
  that's the D7 GroupHeader trigger.
- **Prose budget.** Paragraph measure 50–75 chars; canvas text near a
  specimen ≤1 sentence; rationale lives in a DecisionCard, not in captions.
- **Tables lead with the semantic name,** resolved value in the same row,
  light/dark inline — never per-theme duplicate tables.
- **Do/Don't only where the wrong choice looks plausible;** max 2 pairs per
  row, one-line captions.
- **Chapter 00 About is one viewport-ish read:** mission ≤3 lines, audience
  table, three-layer identity, 7 core rules, page-intent list. If it scrolls
  past ~2 frame-heights, cut.

## Cleanup checklist (implementation scope)

1. Create new `📚 Docs` page; compose chapters 00–04 there per D3/D7/D8
   (move compliant chapter frames, rebuild the rest from `_Docs/*` instances).
2. Demote old `📚 Introduction` → `🗄 Backup — Introduction (pre-Docs)`;
   rename other kept backups → `🗄 Backup — <source>` (Pages 6, 7, 10).
3. Delete: 📐 Decisions page; 🎨 Foundations page (after D4 salvage);
   empty backup Pages 8, 9, 11. Stray nodes `Frame 1` (`2708:21292`),
   `Section` (`2709:21629`), `BLOG DESIGN SYSTEM v1.0` label (`2670:6656`)
   stay in the demoted backup page — deleted with it after validation.
4. Retitle ❖ Components page sections per D5; Docs chapter-02 group frames
   use the same six names. Chapter 00 titled `00 About`.
5. Fold `Intro/01` + `Intro/02` essence into Chapter 00 About (D8 size cap).
6. Add one-sentence description-field text to each published component.
7. Refresh cover date chip (version stays v0.91 per D2); update `CLAUDE.md`
   docs-page reference (`📚 Design system` → `📚 Docs`).
8. Validation gate: D8 checklist pass on the new page → then delete
   `🗄 Backup — Introduction (pre-Docs)`.

## Out of scope

- Any visual redesign of components or tokens (settled by artistic-direction).
- Web-side documentation.
- Specimen rebuild Task 9 from artistic-direction (tracked separately).
