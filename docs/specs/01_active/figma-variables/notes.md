---
title: Figma variables — lessons from the design review
created: 2026-07-29
---

# Lessons — design tokens & Figma (from the 2026-07-29 design review)

Transferable principles extracted while reviewing `design.md`. The spec holds
the decisions; this holds the _why_ in reusable form.

## Token architecture

- **A token is semantic only if its value varies by mode (theme, width) or is a
  deliberate brand knob.** Everything else is consumed as a raw primitive
  utility. This one rule answered every "do I need a semantic tier for X?"
  question — color yes, fonts yes, section rhythm yes, spacing/radius/type no.
- **Measure usage before tokenizing.** Grep counts decided the verdicts:
  `rounded-lg` ×4 doesn't justify a radius knob; `py-24` ×8 across sections
  does justify a responsive rhythm token. Tokenizing without usage data is
  cargo-culting.
- **An alias chain needs somewhere to point.** Semantic tokens can only be
  aliases if every value they resolve to exists as a primitive. Custom brand
  hexes (`#f5ffe1`…) can't alias a pure Tailwind mirror — so either the brand
  ramp becomes a primitive folder (chosen), the semantics hold raw hex (weak),
  or the brand snaps to Tailwind values (destructive). Every real DS has brand
  primitives; "untouched vendor mirror" and "fully aliased semantics" are
  incompatible without them.
- **One scale, many properties — never fork numbers per property.** `spacing/4`
  = 16 is the primitive; there is no raw `number/16` beneath it (same fact
  twice — the deleted `Number Primitives` collection) and no `gap/4` /
  `padding/4` aliases above it (they could never vary independently — dead
  indirection, N× the count, drift risk). Bind the same `spacing/4` to gap,
  padding and size, exactly as Tailwind derives `gap-4`, `p-4`, `w-4` from one
  `--spacing` scale. Folders split only where Tailwind has a namespace
  (`radius/*`, `border-width/*`, `text/*`) — by vendor namespace, never by CSS
  property. The only number aliases are in `3 Responsive`, because gutter and
  rhythm genuinely vary by width mode — the semantic rule passing, not an
  exception.
- **Components can be the semantic layer.** `H1`/`H2`/`P`/`Prose` already
  encapsulate the type scale — a typography token tier underneath them would be
  pure indirection. Encapsulation and tokenization are alternative tools for
  the same job; don't stack them.
- **Utility-first on primitives is professional practice**, not a shortcut
  (shadcn/ui, Tailwind's own guidance). The discipline line is color only:
  themed properties go through semantic classes; raw palette classes are
  allowed solely for mode-invariant cases (`text-white` over an image).
  Anti-patterns are `text-neutral-500` or `dark:bg-[#101010]` on themed
  surfaces — not `p-4`.

## Figma mechanics (load-bearing, verified)

- **Variables cannot move between collections.** Any merge = recreate +
  rebind every consumer. This single constraint prices the whole migration.
- **Renaming a collection preserves its id and all bindings** — including
  frame-level `explicitVariableModes` overrides. Rename in place; never
  replace a collection that has mode overrides pointing at it.
- **Hide primitives from publishing, scope the semantics.** ~480 primitives
  next to 7 semantics in one picker is the classic rot pattern: designers bind
  raw primitives, the semantic layer dies. Collection-level "hide from
  publishing" + per-variable scopes (text fill / stroke / frame fill) is the
  fix, and it costs minutes.
- **Every variable must define a value per mode** — mode-invariant values in a
  themed collection are forced duplication. Accept it or pay a fourth
  collection; don't mistake it for modeling intent.
- **Mode count is plan-capped** (Professional: 4 per collection). Check before
  designing a mode axis.
- **Bound letter-spacing coerces to pixels** — `tracking/*` stays
  reference-only.
- **Variable binding is Figma's utility class.** `p-4` in code ≡ padding bound
  to `spacing/4` in Figma; same for gap, corner radius (`radius/lg`), stroke
  weight (`border-width/2`), font size, line height, min/max width. Components
  consume primitives by binding, exactly as code consumes them by class — the
  spacing/radius/border tier stays primitive in both worlds. Hide-from-publishing
  doesn't block this: bindings are authored inside the DS file where primitives
  remain visible, and published components carry their bindings. Number scopes
  (`spacing/*` → auto layout, `radius/*` → corner radius, `border-width/*` →
  stroke) filter the property pickers the same way color scopes do.

## Pipeline hygiene

- **Declare the units policy once, in the spec.** Figma numbers are raw
  floats; CSS is rem. `spacing/4` = 16 (px) in Figma, diff script converts
  rem × 16. Undeclared, the build and the checker eventually disagree.
- **"Bijective naming" needs its exceptions written down.** Pure transforms
  cover most namespaces, but Tailwind names weights and tracking with words
  (`font-medium` → `--font-weight-500`) — a small static map, not a smell,
  as long as it's declared.
- **Verify bindings before pricing a migration** (the S0→S4 open question).
  Bound vs unbound consumers is the difference between "dominant effort" and
  "free cleanup"; dump real node data, never assume.

## Process

- **Review a design doc against the live code, not against itself.** The alias
  contradiction (F1) was invisible inside the doc — it only surfaced by
  checking the actual hexes in `global.css` against the Tailwind ramp.
- **The portfolio signal is the pipeline, not the token count.** Bijective
  naming rule, drift check in CI, migration gated on verified bindings, and a
  documented decision rule for what is/isn't semantic — that reads senior.
  Over-tokenizing a 7-color blog reads as cargo-culting.

## Execution log — steps 1–2 (`plan-1-theme-rename.md`, 2026-07-29)

What actually happened, and what was learned that the plan didn't predict.

- **`WorkCardImage` was legacy.** The plan's one sanctioned visual change — the
  overlay label moving off `text-background-accent` to `text-white` — turned out
  to affect a component no live route renders. The "one intended visual change"
  is therefore zero observable change on the site. Worth checking a component is
  actually mounted before budgeting a design decision around it.
- **An unscoped `pnpm format:write` bleeds into the diff.** Running it repo-wide
  after the sweep pulled three unrelated files into the task's commit (Prettier
  and the Tailwind class-order plugin reordering classes). Cosmetic, zero
  behaviour change, but it inflates a review diff. Scope the formatter to the
  files the task touched.
- **`pnpm figma:verify` passed on the first run** after the Figma-side work —
  Missing / Value mismatch / Unmapped all `_none_`. The extractor change in
  Task 1 (`font-*-primary`) was what made the font families diffable at all.
- **Three expected orphans, not zero.** The plan predicted an empty
  `Orphaned in Figma` section; the real output lists
  `2 Theme/Dark/font/{sans,title,mono}`. `token-map.json` maps only the Light
  mode of each font, and the dump emits one row per mode. Harmless — the gate is
  Missing / Mismatch / Unmapped — but the plan text was wrong.
- **`tokens.code.json` / `tokens.figma.json` are gitignored** (`.gitignore:36-37`).
  The plan's `git add` step for them can't run. They are regenerated artifacts,
  not committed state — which is correct, but means "refresh the dump" is never a
  commit and leaves no trace in history. The evidence is the verify output.

### The Figma file switch (mid-plan)

The DS file moved to
[Blog Design System v1.0](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/Blog-Design-System-v1.0)
(`ihWIWmvtQPTWgUxlrVjC2c`) while Task 4 was pending; `Wf4iomVMYUXlFIBV3Z8bx4` is
now a **read-only backup** for the duration of the migration.

- **v1.0 is a fork, and a fork keeps every node id.** Verified before editing:
  `VariableCollectionId:3:2`, page `44:328`, frame `156:1348` all resolve
  identically in both files. So retargeting was a one-token change — the
  `fileKey` argument — and every hardcoded id in the plans stayed valid. Confirm
  this rather than assume it: a file *rebuilt* by hand would have invalidated
  every id in every plan, script and skill doc.
- **A fork still drifts.** v1.0 has no `🗄️ Legacy` page, renamed `🧩 Components`
  → `🧩 Components (back)`, and added `Components (new)`, `Pages Experiment`, and
  an empty collection literally named `Primitives`
  (`VariableCollectionId:453:2`) — which is *not* the `1 Primitives` that plan 2
  builds. Ids surviving does not mean the tree survived.
- **Retarget the live references, not the archives.** Updated: the three plans,
  `design.md`, `scripts/figma/dump-tokens.md`, and the `figma-verify` /
  `figma-replicate` skills. `docs/specs/02_archives/**` deliberately still names
  the old file — it is the record of what was true then.
- **A retargeted node map is not a verified node map.** The skills' knowledge
  file had its key and URLs swapped, but its component/node inventory has not
  been re-checked against v1.0. Flagged in a header block there; re-inventory
  (Pass 0) before trusting any id from it.

### Renaming a Figma collection

- **Rename in place; never delete-and-recreate.** 26 frames on 📄 Pages carry
  `explicitVariableModes = {"VariableCollectionId:3:2": "3:1"}` to force dark
  mode. Those overrides key off the collection id — recreating the collection
  would have silently reverted every dark frame to light. Counted 26 before and
  26 after, then screenshotted a dark frame to confirm.
- **The dump is worth trimming.** v1.0 has 13 collections / 928+ variables; an
  unfiltered dump is unreadable and expensive. Restricted to
  `{"2 Theme", "Scale"}`, matching what `token-map.json` actually consumes.
