# Magnet-DS final state — execution log

Figma edits are not versioned. One entry per task across all three phases:
what was written, what was read back to prove it, and any deviation from the
plan.

## Phase 1 · Task 1 — inventory and gates (2026-08-18)

Read-only. No Figma node or variable was modified.

- **Pages found: 7** — 📖 Cover, 📚 Docs, ❖ Components, XP - WorkCard, 📄 Pages,
  🗄️ Archive — Decisions (empty), 🗄️ Archive — Docs v1 (CHAPTERs).
  Deviations: no `📐 Decisions` page exists (the plan's hint id `2716:4244` is
  now the Decisions archive — Task 2's precondition holds); `XP - WorkCard` is a
  live exploration page the spec's page list omits.
- **Masters found: 49** — matches the knowledge-file roster exactly
  (11 `_Docs/*` + 34 components + 4 page masters).
- **Gate A: 44 prune-safe, 0 blocked.** All `mauve`/`mist`/`olive`/`taupe`
  variables are unreferenced by `2 Theme` and `3 Responsive`, so Task 3 needs no
  rebinding pass first.
- **Gate B: 5 of 9 present under the spec's name, 4 present under a different
  name, 0 genuinely missing.** `Link/CTA→Link/Primary`,
  `Link/SecondarySm→Link/SecondarySmall`, `Link/TextCTA→Link/TextLink`,
  `Link/Icon→Link/IconOnly`. Stale plan aliases, not a stale roster —
  `design.md` §ui already names the live masters. No merge dropped; the
  corrected rename-map keys are in `inventory.md` §Gate B.
- **Gate C: Header 32/32 bound to `spacing/8` · ContactPreviewSection 32/32 bound
  to `spacing/8`.** Bound, but to the wrong variable — Task 8 is real work, not a
  no-op verification. Target: rebind pad-x to `3 Responsive/container/gutter`.
- **Gate D: 5 overlapping pairs, 0 strays, 0 section overlaps, 1 section
  overflow** (`WorkPreviewSection`, 90px past the Sections section's bottom edge).
  Deviation: the plan's overlap script compares section-relative `x`/`y`, which
  produces ~79 false pairs; recomputed from `absoluteBoundingBox`.

**Sanity check:** all 34 expected masters accounted for (30 exact, 4 renamed);
all 6 phase-2 rebuild names confirmed absent. No STOP condition — the only
mismatch is a plan-side naming vintage with an unambiguous resolution.

## Phase 1 · Task 2 — 📐 Decisions page, 4 records (2026-08-18)

**Written:** new page `📐 Decisions` (`3067:4`), moved to index 1 so it sits
directly after `📖 Cover`. It holds one `Records` auto-layout column
(`3067:5`, 1200 wide, 48 gap, 80 padding) with four record wrappers:

| Record                               | wrapper id  | card instance |
| ------------------------------------ | ----------- | ------------- |
| `DECISION / container-16`            | `3067:6`    | `3067:12`     |
| `DECISION / naming-domain-component` | `3067:5276` | `3067:5282`   |
| `DECISION / dark-instances`          | `3067:5288` | `3067:5294`   |
| `DECISION / docs-decisions-boundary` | `3067:5300` | `3067:5306`   |

**Read back cold** (separate `use_figma` call + screenshot): 4 records, every
card's `rule` / `body` / `finding` non-empty, all four stamped `17 Aug 2026` ·
`ACCEPTED`, column 1200 × 2049. Archives byte-identical to Task 1 —
`🗄️ Archive — Decisions` still 1 child, `🗄️ Archive — Docs v1` still 12.

**Deviations from the plan:**

- `_Docs/DecisionCard` exposes no text component properties — only a `layer`
  VARIANT axis (`Chrome|Content|Hand|All`) over four TEXT layers named `layer`,
  `rule`, `body`, `finding`. Records use the `layer=All` variant with those four
  layers overridden directly: `layer` = record slug, `rule` = Decision,
  `body` = Why, `finding` = Consequences. This is the branch the plan's Step 3
  anticipated ("if `cardProps` is empty, the card's TEXT layers are edited
  directly").
- `_Docs/Status` has no `Accepted` variant (`Draft|Completed|OnGoing`). Used
  `Status=Completed` with the label text overridden to `ACCEPTED` on the
  instance. The master was **not** modified — adding a variant to doc
  infrastructure is outside this task's scope. Worth a deliberate decision in
  phase 3's Docs task.
- Each record is a `DECISION / <title>` wrapper holding a `meta` row
  (`_Docs/Date` + `_Docs/Status` instances) above the card, rather than a bare
  card instance appended straight to the column. Step 3's snippet appends cards
  directly, but Step 4 requires a date and status per record and the Interfaces
  block consumes both masters — the wrapper is what reconciles them.
- The card's `layer tag` chip ships at a fixed width, which wrapped the longer
  slugs three characters per line. Set the chip and its text to hug on all four
  instances (override only, master untouched).

## Phase 1 · Task 3 — `1 Primitives` audit (2026-08-18)

Steps 2 and 4 ran earlier (44 exploration ramps pruned; 16 `color/brand/*`
primitives described with their source reference). Steps 1, 3, 5 ran now.

**Step 1 — rebind the BLOCKED rows:** nothing to rebind.
`{ doomedCount: 0, nodeHits: [], aliasHits: [] }` — the rows the plan expected
to be blocked by live consumers had already been cleared by the Step 2 prune,
so no node binding and no alias pointed at a doomed variable.

**Step 3 — normalize dash separators to slash:** 25 renamed, 382 untouched,
**0 collisions**.

| Before           | After            |
| ---------------- | ---------------- |
| `drop-shadow/*`  | `drop/shadow/*`  |
| `ease/in-out`    | `ease/in/out`    |
| `font-weight/*`  | `font/weight/*`  |
| `inset-shadow/*` | `inset/shadow/*` |
| `text-shadow/*`  | `text/shadow/*`  |

**Step 5 — read back cold** (separate call): **407** variables total.
`withDash: []`, `ramps: []`, and all 16 `color/brand/*` carry a description
(`d: true`). Full 407-row alphabetical listing returned with the report.

**Deviations:** none. **Unbound:** none.

Gate for this task is clean: no dashes survive in `1 Primitives`, no
exploration ramp survives, every brand primitive is documented.

## Phase 1 · R1.2 — regenerate `primitives.json` (2026-08-18)

`pnpm figma:primitives` on Tailwind **4.3.3** first reproduced the tracked file
byte-for-byte — 443 primitives, zero diff. That clean diff was the finding, not
the pass: the generator still emitted the 69 rows P1-T03 had just changed in
Figma (44 pruned ramps + 25 dash-named rows), so Figma sat at 407 against a
443-row baseline.

**Premise correction.** `design.md` described `mauve/mist/olive/taupe` as
"non-Tailwind ramps — dash-named leftovers". They are not leftovers:
`node_modules/tailwindcss/theme.css:274` ships `--color-mauve-50` and the rest.
Tailwind 4.3 added them as stock palettes, so the generator would have re-emitted
them after every regenerate and re-opened the prune indefinitely.

**Resolved by dropping them at generation.** `build-primitives.mjs` gained
`DROPPED_HUES = ["mauve", "mist", "olive", "taupe"]`, applied in `figmaName()`
before the `HUES` lookup. Regenerated: **399** primitives, diff is 220 removed
lines and **0 added** — the 44 names and their value objects, nothing else.
Nothing in `src/` referenced any of them.

`design.md` amended in both places (the `1 Primitives` collection row and the
step-2 prune bullet) to read "Tailwind minus unused stock palettes" and to name
`DROPPED_HUES` as the mechanism.

**Also fixed:** R1.2's `git add` pointed at `scripts/figma/primitives.json`. The
script writes to the **repo root** (`build-primitives.mjs primitives.json`), so
that path would have staged nothing silently. `repo/phase-1.md` now stages
`primitives.json` and `scripts/figma/build-primitives.mjs`.

**Still open — the 25 dash names.** `drop-shadow/*`, `font-weight/*`,
`inset-shadow/*`, `text-shadow/*`, `ease/in-out` are slash-form in Figma after
P1-T03 step 3 but still dash-form here, because `NAMESPACES` in
`build-primitives.mjs` emits the Tailwind property name verbatim. `design.md`
decided dash→slash, so the generator should follow. Not done in R1.2 — it
changes 25 token-map keys and belongs with R1.3's `token-map.json` update.

**Row-level diff not run.** Acceptance asks that P1-T03's full 407-row list be
diffed against the generator; the report carried the summary, not the rows.

## Phase 1 · R1.2 (cont.) — dash→slash + the row-level diff (2026-08-18)

**Correction to the note above:** the dash→slash change does **not** move 25
`token-map.json` keys. `token-map.json` maps only `2 Theme` semantic tokens and
contains none of these names, so there was no reason to defer it to R1.3. Done
here instead.

`build-primitives.mjs` gained `slashify()`, applied at the end of `figmaName()`,
using the same rule P1-T03 step 3 used in Figma:

```js
const slashify = (name) => name.replace(/-(?=[a-z]+(?:[/-]|$))/g, "/");
```

A dash before letters is a separator; a dash before digits is a ramp step. So
`drop-shadow/md` → `drop/shadow/md` while `color/brand/gray-650` is untouched.
Two assertions in `build-primitives.test.mjs` moved to the new names. All 9
build-primitives tests pass.

**Row-level diff (the acceptance item).** Live `1 Primitives` read cold — 407
names — against the regenerated 399:

| Side           | Count | Rows                                                                          |
| -------------- | ----- | ----------------------------------------------------------------------------- |
| Figma only     | 12    | 5 `color/brand/*`, 4 `spacing/N_5`, `leading/7`, `radius/full`, `radius/none` |
| Generator only | 4     | `spacing/0.5` `1.5` `2.5` `3.5`                                               |

Three distinct causes, none of them a P1-T03 defect:

1. **Decimal separator (4 rows).** Figma writes `spacing/0_5`, the generator
   writes `spacing/0.5` from `SPACING_KEYS`. Same four values, two spellings.
   Cosmetic but it is 4 permanent rows of drift in `figma:verify`.
2. **Brand set incomplete in the repo (5 rows).** `design.md` specifies
   `color/brand/*` with "gray incl. 300/650/750, lime incl. 150/250". Figma has
   all 16. `scripts/figma/brand-primitives.json` holds only **11** — it is
   missing exactly those 5. Figma is right; the repo file is behind the spec.
3. **Undeclared Tailwind values (3 rows).** `radius/none`, `radius/full` and
   `leading/7` exist in Figma but Tailwind's `theme.css` never declares them as
   custom properties, so the generator cannot see them. It already has an
   `EXTRAS` list for exactly this case (`color/white`, `color/black`);
   these three belong there. `rounded-full` is used in 3 files under `src/`;
   `rounded-none` and `leading-7` are used nowhere.

None fixed here — each changes what `figma:verify` treats as baseline, and the
brand one needs the 5 hex values read off Figma. They belong to R1.3 with the
`token-map.json` update.

**Housekeeping.** `pnpm format:write` kept reformatting `.specs/INDEX.md`, which
`specs.sh` generates and stamps "do not edit by hand" — the reformat reverts on
every regenerate. Added `.prettierignore` naming that one file. `format:check`
is green with `INDEX.md` untouched.
