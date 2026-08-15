---
title: "Header: mobile hamburger and drawer"
created: 2026-08-15
---

`Header.astro` keeps the nav inline at every width and renders no brand element.
Figma leads here by explicit decision — `Header` has a `breakpoint=Mobile`
variant (brand wordmark left, hamburger right in a 44x44 target) plus a
`HeaderDrawer` master with `state=closed|open`.

Build the Astro side: toggle script, focus trap, `aria-expanded`, Escape to
close, `prefers-reduced-motion` respected on the drawer transition. The 44px
target is consistent with `.specs/00_backlog/figma-mobile-touch-targets.md`.

Source: `.specs/02_archives/figma-responsive-architecture/design.md` §6.1.
Size: M
