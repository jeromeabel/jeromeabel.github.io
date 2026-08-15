---
title: "Figma: triage 593 first-time raw values on ❖ Components"
created: 2026-08-15
---

`pnpm figma:verify-raw` (Pass 2) had never run at full-file scope until
2026-08-15. Doing so turned up **825 raw values** where the plan expected
`named-debt.json` to shrink. Root-caused, and neither bucket is a regression:

- **593 (72%) are first-time coverage** — 213 radius, 138 stroke, 154 text-style,
  45 fill, 43 spacing, across real masters (`NavLink`, `ThemeToggle`, `Link/CTA`,
  `Header`, `Footer`, …). Every prior `named-debt.json` entry came from narrow
  spot-checks on the since-deleted `PAGE/POST` / `PAGE/SERIE` detail templates.
- **232 (28%) are canvas noise** — the `workcard-variations`,
  `workcard-type-explorations` and `blogpostcard-variations` exploration boards
  parked on ❖ Components. `dump-raw-values.md`'s `page.query("*")` cannot tell a
  scratch frame from a master.

Two pieces of work, in order:

1. **Scope the dump.** Either exclude `*-variations` / `*-explorations` frames in
   `dump-raw-values.md`, or move exploration boards off ❖ Components entirely.
   Cheap, and it has to land first or the triage re-reads 232 non-findings.
2. **Triage the 593.** Per node: bind to a `1 Primitives` variable, or accept
   with a written reason in `named-debt.json`. This needs design judgment one
   node at a time — bulk-accepting would be fabricating reasons, which is why the
   verification sweep deliberately added none of them.

28 stale entries (deleted Task 11 masters) were already pruned; `accepted` is now
49, down from 77.

Source: `.specs/02_archives/figma-responsive-architecture/progress.md` (Task 14 Step 4).
Size: L
