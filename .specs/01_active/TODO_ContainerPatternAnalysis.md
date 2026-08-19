# Container Pattern Analysis — All Master Components

**CSS reference:** `padding-inline: 1rem (16px)` · `max-width: var(--breakpoint-xl) → 1280px` · `margin-inline: auto`

> **Rule:** Only the outermost section-level component that maps to a `<section>`, `<header>`, or `<footer>` in code should own the container. Everything nested inside inherits the constraint from its parent.

---

## ✅ SHOULD Use Container — Section-Level Components

These sit directly inside the page frame and represent full-width HTML sections. Each one owns its container: `padding-inline` + `max-width`.

| Component             | Variant | Current pL/pR | Current maxWidth | Status  | Inner Frame                                           |
| --------------------- | ------- | ------------- | ---------------- | ------- | ----------------------------------------------------- |
| Header                | Desktop | 32 / 32       | 1280             | ✅ Done | HeaderContent (fill, maxW: 1280)                      |
| Header                | Mobile  | 32 / 32       | 1280             | ✅ Done | Direct children (Brand + MenuButton)                  |
| Hero                  | Desktop | 16 / 16       | 1280             | ✅ Done | HeroContent (fill) + StartReading (fill)              |
| Hero                  | Mobile  | 16 / 16       | 1280             | ✅ Done | HeroContent (fill) + StartReading (fill)              |
| BlogPreviewSection    | Desktop | 16 / 16       | 1280             | ✅ Done | PreviewTitle (fill) + BlogPreviewContent (fill)       |
| BlogPreviewSection    | Mobile  | 16 / 16       | 1280             | ✅ Done | PreviewTitle (fill) + BlogPreviewContent (fill)       |
| WorkPreviewSection    | Desktop | 16 / 16       | 1280             | ✅ Done | PreviewTitle (instance) + WorkPreviewSmallList (fill) |
| WorkPreviewSection    | Mobile  | 16 / 16       | 1280             | ✅ Done | PreviewTitle (instance) + WorkPreviewSmallList (fill) |
| ContactPreviewSection | —       | 32 / 32       | 1280             | ✅ Done | ContactPreviewContent (fill) → ContactContainer       |
| Footer                | Desktop | 16 / 16       | 1280             | ✅ Done | FooterContainer (fill)                                |
| Footer                | Mobile  | 16 / 16       | 1280             | ✅ Done | FooterContainer (fill)                                |

> **Note on padding differences:** Header (`32px`) and ContactPreviewSection (`32px`) use double padding compared to the CSS `padding-inline: 1rem` (`16px`). This is a deliberate design choice — the header and contact section have more breathing room than standard sections. All other sections match the code's `padding-inline: 1rem` exactly.

---

## ❌ Should NOT Use Container — Nested Components

These live inside a parent that already owns the container. Adding container properties here would create double padding or double max-width constraints.

| Component            | Variant(s)              | Current pL/pR | maxWidth | Why NOT                                                                                                                                     | Where It's Nested                                 |
| -------------------- | ----------------------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| SerieCardList        | Desktop (1280×357)      | 0 / 0         | —        | Nested inside BlogSeriesSection → PageContentContainer                                                                                      | Blog page's container (`pL/R: 16`, `maxW: 1280`)  |
| SerieCardList        | Mobile (358×1135)       | 0 / 0         | —        | Same                                                                                                                                        | Blog page's container                             |
| PostArchiveList      | Desktop (1246×264, HUG) | 0 / 0         | —        | Nested inside PostListSection → PageContentContainer                                                                                        | Blog page's container                             |
| PostArchiveList      | Mobile (358×1216)       | 0 / 0         | —        | Same                                                                                                                                        | Blog page's container                             |
| PreviewTitle         | — (1280×80)             | 0 / 0         | —        | Section header bar (H2 + Link/TextLink). Used as a child inside WorkPreviewSection and BlogPreviewSection, which already own the container. | Inside section components                         |
| PostCardPreviewBig   | default/hover (552×478) | 0 / 0         | —        | Card component. FILL width, sized by its parent grid. Inner CoverContainer + Content are card-level layout.                                 | Inside BlogPreviewContent                         |
| PostCardPreviewSmall | Desktop (600×154)       | 0 / 0         | —        | Card with breakpoint variants. Sized by parent list.                                                                                        | Inside BlogPreviewContent or WorkPreviewSmallList |
| PostCardPreviewSmall | Mobile (358×350)        | 0 / 0         | —        | Same                                                                                                                                        | Inside parent list                                |
| PostRow              | all (898×60, FILL)      | 0 / 0         | —        | List-item component. FILL width with `pT/B: 16`. Inner PostRowContent fills.                                                                | Inside BlogPostRows inside PostArchiveList        |
| SerieCard            | default/hover (380×357) | 0 / 0         | —        | Card with CoverContainer (fill) + Content (fill, `pL/R: 24` — card-internal padding).                                                       | Inside SerieCardList                              |
| WorkCardPreviewSmall | — (300×334)             | 0 / 0         | —        | Card with CoverContainer (fill) + Content (fill). Sized by parent grid.                                                                     | Inside WorkPreviewSmallList                       |

---

## ⬜ Not Applicable — UI Primitives & Sub-Components

Atomic elements with no relationship to page-level container layout. Sized intrinsically (HUG) or by their parent context.

| Component           | Size             | Type           | Group      | Notes                                               |
| ------------------- | ---------------- | -------------- | ---------- | --------------------------------------------------- |
| NavLink             | 41×36, HUG       | Inline link    | Chrome     | Nav item with state variants                        |
| NavLinkHome         | 116×36, HUG      | Brand link     | Chrome     | Nav brand with state variants                       |
| ThemeToggle         | 36×36, HUG       | Icon button    | Chrome     | `pL/R: 8` is button-internal padding, not container |
| MotionToggle        | 36×36, HUG       | Icon button    | Chrome     | Same — button-internal padding                      |
| Icon                | 24×24, FIXED     | Icon           | Chrome     | 24 variants, no layout                              |
| HeaderDrawer        | 390×32 / 390×372 | Mobile overlay | Chrome     | Drawer overlay, not a page section                  |
| Link/Primary        | 180×56, FILL     | Button         | Actions    | `pL/R: 20` is button-internal padding               |
| Link/Secondary      | 152×56, FILL     | Button         | Actions    | `pL/R: 24` is button-internal padding               |
| Link/TextLink       | 98×30, HUG       | Inline link    | Actions    | `pL/R: 4` is link-internal padding                  |
| Link/IconOnly       | 56×56 / 24×24    | Icon button    | Actions    | No padding                                          |
| Link/SecondarySmall | 159×29, HUG      | Small link     | Actions    | 6 variants (size × state)                           |
| H1                  | 361×60, HUG      | Heading        | Typography | Text primitive                                      |
| H2                  | 87×32, HUG       | Heading        | Typography | Text primitive                                      |
| PageDescription     | 576×78, FIXED    | Text block     | Typography | Sized by parent                                     |
| HeroText            | 576×124, FIXED   | Sub-component  | Sections   | Lives inside Hero's HeroTextContainer               |
| HeroAnimation       | 608×500, HUG     | Sub-component  | Sections   | Lives inside Hero's HeroContent                     |
| ContactContent      | 192×237, HUG     | Sub-component  | Sections   | Lives inside ContactPreviewSection                  |
| PostMetadataTime    | 152×16, FILL/HUG | Metadata       | Metadata   | Inline metadata                                     |
| PostMetadataTopic   | 76×20, HUG       | Tag/badge      | Metadata   | `pL/R: 4` is badge-internal padding                 |
| SerieMeta           | 71×16, HUG       | Metadata       | Metadata   | Inline metadata                                     |

---

## Summary Table

| Category                    | Count                      | Status                                              |
| --------------------------- | -------------------------- | --------------------------------------------------- |
| ✅ Should use Container     | 7 components (11 variants) | All applied — `padding-inline` + `max-width: 1280`  |
| ❌ Should NOT use Container | 7 components (11 variants) | Correct as-is — no container, nested inside parents |
| ⬜ Not applicable           | 20 components              | Correct as-is — atomic primitives                   |

All section-level master components now have the container pattern baked in.
