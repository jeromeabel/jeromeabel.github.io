---
title: "blog.astro: serie grid 2 -> 3 columns"
created: 2026-08-15
---

`blog.astro:55` is `grid gap-4 md:grid-cols-2 lg:gap-8`. Figma's `SerieCardList`
is 3 columns on Desktop and Tablet, 1 on Mobile (design §4 decision). Change
`md:grid-cols-2` to `md:grid-cols-3`.

At Tablet 768 with the 16px gutter and 16px gaps each card lands at ~234px for
a title plus a 3-line clamp — tight but viable, accepted in the design.

Source: `.specs/02_archives/figma-responsive-architecture/design.md` §6.2.
Size: XS
