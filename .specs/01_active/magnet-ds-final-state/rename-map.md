---
title: Magnet-DS — master rename map (P1-T05)
applied: 2026-08-18
---

# `domain/Component` rename map

Applied by **P1-T05** on ❖ Components, 2026-08-18. Renaming a master does not touch its
instances — they follow by id. Read-back after the run: `total: 34`, `canon: 29`,
`stragglers: 5`, `unexpected: []`.

**Naming notes.**

- `Preview` in `blog/BlogPreview` / `work/WorkPreview` / `contact/ContactPreview` is the one
  documented semantic-role exception to the no-suffix rule.
- `Section` was dropped from all three (`BlogPreviewSection` → `blog/BlogPreview`, etc.).
- `_Docs/*` masters are doc infrastructure, outside DS component scope — their names stay as is
  and they are not listed below.

| Live name (2026-08-15 roster) | Canon name               | Verdict             |
| ----------------------------- | ------------------------ | ------------------- |
| `Header`                      | `app/Header`             | renamed             |
| `Footer`                      | `app/Footer`             | renamed             |
| `HeaderDrawer`                | `app/HeaderDrawer`       | renamed             |
| `ThemeToggle`                 | `app/ThemeToggle`        | renamed             |
| `MotionToggle`                | `app/MotionToggle`       | renamed             |
| `Icon`                        | `ui/Icon`                | renamed             |
| `H1`                          | `ui/H1`                  | renamed             |
| `H2`                          | `ui/H2`                  | renamed             |
| `PageDescription`             | `ui/PageDescription`     | renamed             |
| `PreviewTitle`                | `ui/SectionTitle`        | renamed             |
| `Link/Primary`                | `ui/Link/primary`        | renamed             |
| `Link/Secondary`              | `ui/Link/secondary`      | renamed             |
| `Link/SecondarySmall`         | `ui/Link/inline`         | renamed             |
| `Link/TextLink`               | `ui/Link/textLink`       | renamed             |
| `Link/IconOnly`               | `ui/Link/iconOnly`       | renamed             |
| `Hero`                        | `hero/Hero`              | renamed             |
| `HeroText`                    | `hero/HeroText`          | renamed             |
| `HeroAnimation`               | `hero/HeroAnimation`     | renamed             |
| `BlogPreviewSection`          | `blog/BlogPreview`       | renamed             |
| `PostArchiveList`             | `blog/PostList`          | renamed             |
| `SerieCardList`               | `blog/SerieList`         | renamed             |
| `PostRow`                     | `blog/PostRow`           | renamed             |
| `SerieCard`                   | `blog/SerieCard`         | renamed             |
| `PostMetadataTime`            | `blog/PostMetadataTime`  | renamed             |
| `PostMetadataTopic`           | `blog/PostMetadataTopic` | renamed             |
| `SerieMeta`                   | `blog/SerieMeta`         | renamed             |
| `WorkPreviewSection`          | `work/WorkPreview`       | renamed             |
| `ContactPreviewSection`       | `contact/ContactPreview` | renamed             |
| `ContactContent`              | `contact/ContactContent` | renamed             |
| `NavLink`                     | `app/NavLink`            | deferred to P1-T07  |
| `NavLinkHome`                 | `app/NavLink`            | deferred to P1-T07  |
| `PostCardPreviewBig`          | `blog/PostCard`          | deferred to P1-T07  |
| `PostCardPreviewSmall`        | `blog/PostCard`          | deferred to P1-T07  |
| `WorkCardPreviewSmall`        | `work/WorkCard`          | deferred to phase 2 |

29 renamed, 5 deferred. The five deferred names are merge targets, not renames: P1-T07 merges
`NavLink`/`NavLinkHome` into `app/NavLink` and the two `PostCardPreview*` into `blog/PostCard`;
P2-T04 absorbs `WorkCardPreviewSmall` into `work/WorkCard`, which is then archived.

**Count deviation.** The P1-T05 brief said _"Expected: 30 renames"_, but the `MAP` literal it
shipped holds 29 keys. All 29 were found and renamed (`missing: []`), and the cold read-back
returned `unexpected: []` — so no master was left behind. The 30 was an arithmetic slip in the
brief's prose, not a gap in execution.

Downstream gate arithmetic is unaffected and still checks out against 29:

- **P1-T09 assertion 2** — 32 masters on ❖ Components = 29 renamed + `app/NavLink` +
  `blog/PostCard` (the two P1-T07 merge outputs) + `work/WorkCardPreviewSmall`, which survives
  until P2-T04.
- **P2-T01 `WANT`** — 31 names = the same 32 minus `work/WorkCardPreviewSmall`, which the gate
  reports under `legacy` rather than `missing`.

**Read-back note.** Step 2 returned `docs: 0`: the 11 `_Docs/*` masters are not on
❖ Components. P1-T09 assertion 3 counts them document-wide, so it is unaffected.
