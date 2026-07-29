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

## Plan 2 — before

Read-only baseline captured 2026-07-29 against `ihWIWmvtQPTWgUxlrVjC2c` ("Blog
Design System v1.0"), branch `redesign/v3`, ahead of the primitives-merge
mutations. Nothing in Figma was created/edited/deleted for this task.

### Step 1 — reference screenshots

`PAGE/HOME` (section `52:648`) exists on `📄 Pages` (`44:328`) exactly as the
brief names it. Under it:

- **Light — `52:649`** (`Home — 1280 — Light`, FRAME, 1280×2611).
  Screenshot shows: dark header bar (Home/Blog/Work/About nav + theme toggle,
  top-right), hero "Hi, I'm Jérôme." headline with intro paragraph on the
  left; **right-hand hero slot is an empty dashed placeholder box** labelled
  "HeroAnimation — decorative motion asset (CSS keyframes), not replicated in
  static Figma" (i.e. this frame never carries the live CSS hero animation).
  Below: pill-shaped "Start reading ↓" CTA; "SELECTED WRITING" heading with
  two series cards + three post rows (all placeholder-duplicated "Deep Dive
  Into Web Performance" / "Optimizing Images with Astro (part 2)" content);
  "SELECTED WORK" heading with three square black project tiles (Le Concept
  de la Preuve / Chimères Orchestra / La Malinette, each with an "X"
  ideogram mark); a bio strip ("Artist turned web developer…" + "More about
  me" pill); "LET'S TALK" section with email + social icons on the left and
  a dashed "ContactImage" placeholder box on the right; footer with
  copyright + nav links.
  **Notable file-state fact**: this frame has `explicitVariableModes: {}`
  (no per-frame override), and the whole `📄 Pages` page itself carries a
  page-level override forcing `VariableCollectionId:3:2` ("2 Theme") to mode
  `3:1` ("Dark"). So despite the "— Light" name, this frame currently
  **renders with the Dark mode value** of every bound theme-color variable
  (background fill resolves to `{0.1176, 0.1176, 0.1176}` either way, bound
  to `VariableID:3:3`). This is a pre-existing quirk of the file, not
  something this task changed — flagged so a later "did colors change"
  comparison isn't fooled by it.

- **Dark — `111:495`** (`Home — 1280 — Dark`, FRAME, 1280×2611). Same layout
  and copy as the Light frame, **identical background/text colors** (same
  root cause as above — this frame instead carries its own explicit
  override `explicitVariableModes: {"VariableCollectionId:3:2": "3:1"}`,
  i.e. Dark, matching the page default). The one visible content
  difference from the Light frame: the hero slot on this frame **shows the
  actual illustration assets** (a stylized dark accessory/jewelry
  illustration — a "2"-shaped charm, a rounded pendant, a bangle — instead
  of the dashed placeholder). Everything else (nav, cards, tiles, footer) is
  pixel-identical to the Light frame in this screenshot.

- **Component master with corner radius — `13:13`** (`Link`, COMPONENT_SET,
  760×297, page `🧩 Components (back)` = `52:2`). No `illustration/screen`
  master exists in this fork (only `illustration/performance`, `398:8921`,
  which has zero radius bindings) — `Link` is the closest equivalent: 35
  variants across the set each bind all four corner fields
  (`topLeftRadius`/`topRightRadius`/`bottomLeftRadius`/`bottomRightRadius`,
  140 bindings total, all resolving into the `Radius` collection). Screenshot
  shows the variant grid: underlined "Menu link" (active/inactive/disabled
  states), underlined italic "Inline link", bold "Bold link", a filled
  light-grey pill "Contact me →", an outlined pill "Start reading ↓", two
  outlined rounded-rect "Secondary" buttons (with/without arrow), a dashed
  outlined "External link →" pill, and two small circular icon-only arrow
  buttons — the full range of corner-radius values (fully round pill, rounded
  rect, circular) is visible in one shot.

Screenshots were downloaded locally for inspection (not committed —
scratch): `home-light.png`, `home-dark.png`, `link-component.png`.

### Step 2 — binding counts (before)

Per-page `byCol` dumps (script per Task 2 brief / future
`scripts/figma/dump-bindings.md`), run read-only, `rows` discarded:

| Page | id | 2 Theme (Color) | Scale | Radius | Typography | Container | Breakpoint | Color Tokens |
|---|---|---|---|---|---|---|---|---|
| 📖 Cover | `0:1` | 1 | – | – | – | – | – | – |
| 🎨 Foundations | `5:14` | 16 | – | – | – | – | – | – |
| 🧩 Components (back) | `52:2` | 578 | 566 | 24 | 4 | 2 | – | 6 |
| 🗄️ Legacy | `78:2` | *page does not exist in this fork* — skipped | | | | | | |
| 📄 Pages | `44:328` | 4297 | 3961 | 124 | 27 | 4 | 4 | 20 |
| Pages Experiment | `442:5352` | 174 | 216 | 16 | 5 | 3 | 3 | 3 |
| **Merged total** | | **5066** | **4743** | **164** | **36** | **9** | **7** | **29** |

(Collection is literally named `2 Theme` in this file, not `Color` — kept
both labels since the plan's earlier audit used `Color`.)

**Vs. plan's expected rough totals** (`Color` ~5225, `Scale` ~4834, `Radius`
~164, `Typography` ~33, `Container` ~9, `Breakpoint` ~9, `Color Tokens`
~29):

| Collection | Expected | Actual | Delta |
|---|---|---|---|
| Color / 2 Theme | ~5225 | 5066 | −159 (−3.0%) |
| Scale | ~4834 | 4743 | −91 (−1.9%) |
| Radius | ~164 | 164 | 0 |
| Typography | ~33 | 36 | +3 |
| Container | ~9 | 9 | 0 |
| Breakpoint | ~9 | 7 | −2 |
| Color Tokens | ~29 | 29 | 0 |

All within a few percent — no alarming discrepancy. The small shortfalls in
Color/Scale/Breakpoint are consistent with the already-documented fact that
`🗄️ Legacy` (`78:2`) no longer exists in the v1.0 fork (confirmed via
`getNodeByIdAsync("78:2")` → `null` this session) — the original audit that
produced the expected totals likely counted bindings on that page before it
was dropped. Radius/Container/Color Tokens match exactly, which is reassuring
since those are the collections Plan 2 actually touches.

### Renaming a Figma collection

- **Rename in place; never delete-and-recreate.** 26 frames on 📄 Pages carry
  `explicitVariableModes = {"VariableCollectionId:3:2": "3:1"}` to force dark
  mode. Those overrides key off the collection id — recreating the collection
  would have silently reverted every dark frame to light. Counted 26 before and
  26 after, then screenshotted a dark frame to confirm.
- **The dump is worth trimming.** v1.0 has 13 collections / 928+ variables; an
  unfiltered dump is unreadable and expensive. Restricted to
  `{"2 Theme", "Scale"}`, matching what `token-map.json` actually consumes.

## Plan 2 — Task 3

Created the `1 Primitives` variable collection in file `ihWIWmvtQPTWgUxlrVjC2c`
("Blog Design System v1.0") from `primitives.json` (443 variables, ground
truth per Task 1 — the plan's "~480" estimate was stale). Collection id
`VariableCollectionId:2013:2`, mode `2013:0`, `hiddenFromPublishing: true`.
Loaded in 4 batches of ~111 via `use_figma` (batch running totals: 111, 222,
333, 443 — final batch required one retry, see concern below).

**Final `byFolder` breakdown (443 total):**

| Folder | Count | | Folder | Count |
|---|---|---|---|---|
| color | 299 | | leading | 5 |
| spacing | 36 | | perspective | 5 |
| container | 13 | | breakpoint | 5 |
| text | 13 | | text-shadow | 5 |
| radius | 9 | | tracking | 6 |
| shadow | 9 | | ease | 3 |
| font-weight | 9 | | font | 3 |
| blur | 8 | | inset-shadow | 3 |
| drop-shadow | 7 | | aspect | 1 |
| animate | 4 | | | |

All folder names are Tailwind/Figma namespace segments (no raw CSS property
name like `bg`/`p` leaked through).

**Spot-checks (Step 5) — all pass:**

| Variable | Expected | Actual |
|---|---|---|
| `color/blue/500` | Tailwind blue-500, `#2b7fff` | r/g/b → `#2b7fff` exact |
| `spacing/4` | `16` (px) | `16` |
| `radius/2xl` | `16` (px) | `16` |
| `color/brand/lime-100` | pale lime, `#f5ffe1` | r/g/b → `#f5ffe1` exact |

Confirmed via `getVariableByIdAsync(...).valuesByMode`, not a UI screenshot —
exact hex/px match is stronger evidence than eyeballing a swatch.

**Concern — Figma rejects `.` in variable names.** `createVariable` throws
`"invalid variable name"` for any name containing a literal period, anywhere
in the string (confirmed both as a trailing segment `spacing/2.5` and
mid-token `spacing/2.5x`). This hit 4 of `primitives.json`'s 443 entries:
`spacing/0.5`, `spacing/1.5`, `spacing/2.5`, `spacing/3.5`. Worked around by
substituting `_` for `.` in the Figma variable name only (`spacing/0_5`,
`spacing/1_5`, `spacing/2_5`, `spacing/3_5`) — `primitives.json` itself was
not touched. **Task 6 (rebind consumers) needs to know about this
underscore exception** when mapping `primitives.json` names to the Figma
variables it just created.

A first attempt at batch 4 failed atomically on this error (no partial
writes — confirmed by `total` staying at 333). A follow-up diagnostic script
probed 17 candidate names individually and, in doing so, created 16 of them
with the wrong resolved type (all hardcoded `FLOAT`) and no values/scopes —
these were deleted (`variable.remove()`) before the real batch 4 ran, so the
final collection contains no leftover cruft. Confirmed via the total dropping
back to 333 post-cleanup, then to 443 after the corrected batch 4.
