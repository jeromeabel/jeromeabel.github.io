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

## Phase 1 · Task 4 — `2 Theme` audit (2026-08-18)

**Step 1 — scan:** 15 variables, **1 orphan** (`color/accent-hover`, 0 node
references and 0 cross-collection aliases), **0 duplicates**, no alias chains.

**Step 2 — verdicts:** 14 × `keep`, 1 × `archive`. All seven semantic slots the
brief pins are present and kept: `color/background`, `color/foreground`,
`color/foreground-muted`, `color/foreground-strong`, `color/border`,
`color/surface`, `color/surface-hover`.

**Step 3 — apply:** `archived = [{ from: "color/accent-hover", to:
"zz/color/accent-hover" }]`, `renamed = []`, `missing = []`. Nothing deleted.

**Step 4 — read back cold:** `orphans: []`, `dupes: []`, `totalVars: 15`.

**Deviations:** none reported.

**Note on the read-back.** The brief expects the post-archive `orphans` list to
still hold the `zz/`-prefixed name (it is retired, not referenced). The report
returns `orphans: []`. Either the agent filtered `zz/*` out of the listing or it
re-scanned before the rename settled — count is unchanged at 15 and the archive
line is explicit, so the state is right either way. Confirm the `zz/` prefix is
live during the P1-T09 gate read.

**Repo side (checked here, feeds R1.3).** The archive verdict holds on the code
side too:

- `scripts/figma/token-map.json` maps it twice — `light/color-accent-hover` and
  `dark/color-accent-hover` → `2 Theme/{Light,Dark}/color/accent-hover`. Both
  entries now point at a name that no longer exists; R1.3 must repoint them at
  `zz/color/accent-hover` or drop the pair.
- `src/styles/global.css:59,82` declares `--color-accent-hover` per mode
  (`#005f5a` light / `#00d5be` dark). **Nothing in `src/` consumes it** — no
  `*-accent-hover` utility, no direct `var()` read. Dead in Figma and dead in
  code. Deleting the two declarations is `CODE DEBT` for the R3.7 handoff, not
  work for this phase.

## Phase 1 · R1.3 — `token-map.json` + the three R1.2 deferrals (2026-08-18)

R1.2 left three drift rows deliberately open, to close in one pass here. All
three are now closed, and the generator reproduces `1 Primitives` exactly.

**1. Decimal separator.** `build-primitives.mjs` now writes fractional spacing
steps with an underscore — `` `spacing/${key.replace(".", "_")}` `` — so the
four `spacing/0_5 1_5 2_5 3_5` rows match Figma. `SPACING_KEYS` stays numeric;
only the emitted name changes, values are untouched.

**2. Brand set completed.** `scripts/figma/brand-primitives.json` went 11 → 16.
The five missing hexes were read off the tracked `tokens.figma.json` dump, not
guessed: `lime-150 #eaf5d3`, `lime-250 #d3e3ae`, `gray-300 #b0b0b0`,
`gray-650 #3f3f3f`, `gray-750 #2b2b2b`. File is now ordered lime-then-gray by
ramp step.

**3. Undeclared Tailwind values.** A FLOAT twin of the existing COLOR extras
block adds `leading/7` (28), `radius/full` (9999), `radius/none` (0) — the three
Tailwind ships as utilities without a `theme.css` custom property.

**Result: `pnpm figma:primitives` emits 407, and the diff against live
`1 Primitives` is empty in both directions.** Checked by slashifying the dump's
451 names and removing the 44 ramps P1-T03 pruned: `fig only: []`,
`gen only: []`. The R1.2 gap is fully closed.

**`token-map.json`:** both `*/color-accent-hover` entries repointed at
`2 Theme/{Light,Dark}/zz/color/accent-hover` after the P1-T04 archive.

**`pnpm figma:verify` — read, not trusted (warn-only, always exits 0):**

```
Missing in Figma:  dark/color-accent-hover  → 2 Theme/Dark/zz/color/accent-hover
                   light/color-accent-hover → 2 Theme/Light/zz/color/accent-hover
Value mismatch:    none
Orphaned in Figma: 2 Theme/{Light,Dark}/color/accent-hover
Unmapped:          none
```

**Expected, and it is one fact reported twice.** `tokens.figma.json` is the
2026-08-15 export — it predates P1-T04, so it still carries the pre-archive
name. Code maps to `zz/`, the dump has the old name: missing on one side, orphan
on the other. R1.6 takes a fresh `File > Export` and both rows disappear. Every
other token is clean — no value mismatch, nothing unmapped.

**Pre-existing test failures, not caused here.** `pnpm test` is 55/57.
`extract-code-tokens.test.mjs` asserts a light surface of `#d1ddbb` (live
`global.css` says `#eaf5d3`) and a semantic-color count of 7 (live count is 12).
The extractor works; its fixtures are a stale vintage of `global.css`. Neither
test touches anything R1.3 changed. Logged as `CODE DEBT` for the R3.7 handoff
along with the dead `--color-accent-hover` declarations.

---

## P1-T05 — renames (2026-08-18)

- STATUS: DONE
- RESULT: step 1 `{ renamed: 29, missing: [] }` · step 2 cold read-back
  `{ total: 34, canon: 29, stragglers: 5, docs: 0, unexpected: [] }`. The 5 stragglers are the
  expected merge sources: `NavLink`, `NavLinkHome`, `PostCardPreviewBig`, `PostCardPreviewSmall`,
  `WorkCardPreviewSmall`. Full three-column table in `rename-map.md`.
- DEVIATIONS: the brief's prose said _"Expected: 30 renames"_ while its own `MAP` literal held 29
  keys. All 29 found and renamed, `unexpected: []` — nothing was left behind, so the 30 is a slip
  in the brief, not a gap in execution. Brief corrected in place. P1-T09 (32 on ❖ Components) and
  P2-T01 (`WANT` of 31) both stay arithmetically correct against 29; see `rename-map.md`.
- UNBOUND: none

`docs: 0` on ❖ Components: the 11 `_Docs/*` masters live elsewhere in the document. P1-T09
assertion 3 counts them document-wide, so it is unaffected.

---

## P1-T06 — domain sections (2026-08-18)

- STATUS: DONE
- RESULT: 29 masters placed into 7 domain sections — `app` 5 (ThemeToggle, MotionToggle,
  Footer, Header, HeaderDrawer) · `ui` 10 (Icon, Link/primary, Link/secondary, Link/textLink,
  Link/iconOnly, Link/inline, H2, SectionTitle, H1, PageDescription) · `blog` 8 (PostList,
  SerieList, BlogPreview, PostMetadataTime, PostMetadataTopic, SerieMeta, PostRow, SerieCard) ·
  `work` 1 (WorkPreview) · `hero` 3 (HeroText, HeroAnimation, Hero) · `contact` 2
  (ContactContent, ContactPreview) · `about` 0 (fills at P2-T10). The 5 P1-T07 merge sources stay
  unhomed: `NavLink`, `NavLinkHome`, `PostCardPreviewBig`, `PostCardPreviewSmall`,
  `WorkCardPreviewSmall`. Gate D hygiene on 34 masters: `overlaps: []`, `cropped: []`,
  `strays: []`. 7 screenshots reviewed, all clean.
- DEVIATIONS:
  1. **Section width formula extended.** The brief sized sections off `CELL = 520`; `hero/Hero`
     and `app/Header` are up to ~1400 wide and would have been cropped. Added a `maxRight` pass so
     each section fits its widest master (`app` 4038w, `blog` 4345w).
  2. **Old sections moved, not deleted.** Chrome / Actions / Sections / Typography / Metadata /
     Cards relocated below the domain sections to clear overlap with the stragglers — Chrome still
     holds 2, Cards 3, the other four are empty. The brief did not say what to do with them;
     "nothing human-designed is ever deleted" decided it.
- UNBOUND: none

No `_Docs/*` masters live on ❖ Components, so the unhomed list is exactly the 5 P1-T07 sources —
consistent with P1-T05's `docs: 0`.

---

## P1-T07 — merges (2026-08-18)

- STATUS: DONE
- RESULT: **`app/NavLink`** (`3093:553`) — `type: [page, brand] × state: [default, hover, active]`,
  6 variants; sources `NavLink` + `NavLinkHome` removed, `broken: []`. **`blog/PostCard`**
  (`3093:5376`) — `size: [big, small] × breakpoint: [Desktop, Mobile] × state: [default, hover]`,
  8 variants; sources `PostCardPreviewBig` + `PostCardPreviewSmall` removed, `broken: []`. Link
  vocabulary verified 5/5 found, 0 missing, 0 legacy. Both sets re-homed into their domain
  sections. Gate D: `strays: [WorkCardPreviewSmall]` — expected, it is the P2-T04 absorption
  target, so the five P1-T05 stragglers are down to one.
- DEVIATIONS: NavLink merged clone-then-combine instead of the brief's move-then-combine — moving
  children out of a COMPONENT_SET and recombining them in the same tick errors. Cloning keeps the
  originals alive until the explicit removal in step 2, so nothing is destroyed on a failed
  combine.
- UNBOUND: none

---

## P1-T08 — container recipe (2026-08-18)

- STATUS: PARTIAL — 10 of 11 rows pass all five conditions; 2 findings below.
- RESULT: step 1 rebound `app/Header` (Desktop + Mobile) and `contact/ContactPreview` pad-x from
  `spacing/8` (32) → `container/gutter` (16), read back 16/16. Step 2 across 6 owners × 11
  variants:
  - `app/Header` Desktop — bound `maxWidth = 1280` on `HeaderContent` (value was already 1280 but
    unbound)
  - `app/Footer` Desktop + Mobile — pad-x bound to gutter, `maxWidth` set + bound on
    `FooterContainer`
  - `hero/Hero` Desktop + Mobile — pad-x bound, `maxWidth` set + bound on `HeroContent`,
    counterAxis MIN → CENTER
  - `blog/BlogPreview`, `work/WorkPreview` Desktop + Mobile — pad-x bound, `maxWidth` set + bound
    on `ui/SectionTitle`, counterAxis MIN → CENTER
  - `contact/ContactPreview` — `maxWidth` set + bound on `ContactPreviewContent`, counterAxis MIN
    → CENTER
- DEVIATIONS / FINDINGS:
  1. **`app/Header` Mobile has no inner band.** `children[0]` is the TEXT node `Brand`; `maxWidth`
     is not settable on it. Outer pad-x and `counterAxisAlignItems = CENTER` applied, structure
     untouched. This is the brief's own "a master with no inner band is a real finding" case — no
     wrapper invented.
  2. **`blog/BlogPreview` / `work/WorkPreview` capped the wrong node.** Their `children[0]` is an
     INSTANCE of `ui/SectionTitle`, not a container band, and the brief's literal `children[0]`
     rule bound 1280 there. The real content frames — `BlogPreviewContent` and
     `WorkPreviewSmallList` — are `children[1]` and carry **no** `maxWidth`. So four rows read as
     passing while the content they exist to constrain is still uncapped. **Not accepted; a
     corrective pass is queued before P1-T09**, whose assertion uses the same `children[0]` reader
     and would inherit the false pass.
- UNBOUND: none. Finding 1 is a structural absence, not a raw value, so it earns no
  `named-debt.json` entry.

### P1-T08 step 4 — corrective (2026-08-18)

- STATUS: DONE — 6 owners × 11 variants, every layout child now capped and bound.
- RESULT: `blog/BlogPreview` and `work/WorkPreview` (Desktop + Mobile) each gained `maxWidth = 1280`
  bound + FILL on their real content frames (`BlogPreviewContent`, `WorkPreviewSmallList`) alongside
  the `ui/SectionTitle` instance the first run had capped. Full read-back:

| Master                 | Variant | pad-x  | align  | capped children                             |
| ---------------------- | ------- | ------ | ------ | ------------------------------------------- |
| app/Header             | Desktop | 16, 16 | CENTER | HeaderContent                               |
| app/Header             | Mobile  | 16, 16 | CENTER | — (exception: Brand TEXT, MenuButton FIXED) |
| app/Footer             | Desktop | 16, 16 | CENTER | FooterContainer                             |
| app/Footer             | Mobile  | 16, 16 | CENTER | FooterContainer                             |
| hero/Hero              | Desktop | 16, 16 | CENTER | HeroContent, StartReading                   |
| hero/Hero              | Mobile  | 16, 16 | CENTER | HeroContent, StartReading                   |
| blog/BlogPreview       | Desktop | 16, 16 | CENTER | ui/SectionTitle, BlogPreviewContent         |
| blog/BlogPreview       | Mobile  | 16, 16 | CENTER | ui/SectionTitle, BlogPreviewContent         |
| work/WorkPreview       | Desktop | 16, 16 | CENTER | ui/SectionTitle, WorkPreviewSmallList       |
| work/WorkPreview       | Mobile  | 16, 16 | CENTER | ui/SectionTitle, WorkPreviewSmallList       |
| contact/ContactPreview | —       | 16, 16 | CENTER | ContactPreviewContent                       |

Every capped child reads `maxWidth = 1280`, carries `maxWidth` in `boundVariables`, and sizes FILL.

- DEVIATIONS:
  1. **`hero/Hero` capped too**, though step 4's `OWNERS` named only blog and work. `StartReading`
     is `children[1]` of the same kind of vertical stack and was uncapped for the same reason —
     the principle decided it, not the list. Same fix, same result.
  2. **`app/Header` Mobile `MenuButton` left uncapped.** It is a FIXED icon-sized button, not a
     content band; capping it at 1280 would be meaningless. It joins the `Brand` TEXT node as the
     row's structural exception — this variant genuinely has no band, which P1-T09 records as a
     pass-with-note.
- UNBOUND: none

**`named-debt.json` prune (R1.5): no-op, and that is the correct outcome.** The file holds 49
`accepted` entries, all `text-style`, plus one `variableDebt` row (`leading/hero-body`). Nothing
allowlisted a 32px pad or an unbound `maxWidth`, so the P1-T01 Gate C finding was never
debt-covered — it was live drift, now closed. Nothing to remove.

**`pnpm figma:verify-raw` — read, not trusted.** 874 rows, all against
`raw-values.figma.json` dated **2026-08-15**, which predates P1-T05 through P1-T08. Its findings
still name `NavLink` / `NavLinkHome` as separate masters and use pre-rename names, so the table
describes a document that no longer exists. Nothing in it is actionable now; R1.6 takes a fresh
`File > Export` and re-runs both passes against it. Stale named-debt entries: _none_.

---

## P1-T09 — phase-1 gate, attempt 1: **blocked**

Run returned `STATUS: blocked`. Assertions 2–9 PASS; gutter bindings, container bands, the 4
decision records and both collections all PASS. Two failures:

1. **Assertion 1** — `WorkCardPreviewSmall` (`2045:378`) carries no domain prefix and still sits
   in the legacy section `Cards`.
2. **Gate D** — 3 overlaps: `app/Footer`↔`app/NavLink`, `blog/BlogPreview`↔`blog/PostCard`,
   `blog/PostRow`↔`blog/PostCard`. `cropped: []`, `strays` = `_Docs/*` only.

Step 4: 6/7 domain sections PASS, `blog` fails on the overlaps, `about` empty (expected — P2-T10
fills it). 📐 Decisions PASS.

### Diagnosis

**Overlaps are a stale layout, not naming drift.** P1-T07 merged `NavLink`/`NavLinkHome` into the
`app/NavLink` COMPONENT_SET and the two `PostCardPreview*` into `blog/PostCard`. Both sets are
taller than the singletons they replaced. P1-T06 Step 1 tells you to re-run the _sweep_ after
P1-T07 — but Step 2, the grid, was never re-run, so the merged sets grew into their neighbours at
the old coordinates. Re-running P1-T06 Step 2 is the whole fix.

**The straggler is a spec contradiction, now resolved.** `P1-T05-renames.md` deferred
`WorkCardPreviewSmall`'s rename to P2-T04 and listed it as a known straggler; `rename-map.md`
already counted the 32nd master as `work/WorkCardPreviewSmall`, prefix included; `P1-T09`
assertion 1 admits no exception.

### Decision — prefix now, absorb later

Rename to `work/WorkCardPreviewSmall` and home it in the `work` section. Assertion 1 stays
absolute; no straggler carve-out enters the gate, and the phase-2 arithmetic in `rename-map.md`
becomes literally true. The absorb path is untouched — only P2-T04's lookup key moved.

Repo-side edits made for it:

| File                    | Change                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `P1-T09-phase1-gate.md` | New **Step 0** corrective: rename, drop empty legacy sections, re-run P1-T06 S1+S2 |
| `P1-T09-phase1-gate.md` | Step 4 notes empty `about` is a PASS; acceptance names the 32nd master             |
| `P2-T01-entry-gate.md`  | `legacy` must now be **empty**; new `absorbSource` check replaces it               |
| `P2-T04-workcard.md`    | `findMaster` key + step 5 heading + acceptance → `work/WorkCardPreviewSmall`       |
| `P2-T11-phase2-gate.md` | Assertion 8 name list → `work/WorkCardPreviewSmall`                                |
| `rename-map.md`         | Row status + a P1-T09 correction note                                              |

`P1-T05-renames.md` left as-is — it is a DONE record of what was true at the time.

Attempt 2 runs the amended brief from Step 0. `inventory.md §Phase-1-after` still waits on the
Step 1 JSON, which attempt 1 did not return in full.

## P1-T09 — phase-1 gate, attempt 2 (2026-08-18)

- STATUS: **DONE**
- RESULT: Step 0 corrective landed; all 9 assertions PASS; Gate D clean; 8 screenshots PASS.
- DEVIATIONS: none reported.
- UNBOUND: none

**Step 0.** `WorkCardPreviewSmall` → `work/WorkCardPreviewSmall` (`2045:378`), homed in `work`.
Six legacy sections removed, all empty: `Chrome` `Actions` `Sections` `Typography` `Metadata`
`Cards`. Re-running P1-T06 Step 2 cleared the three overlaps exactly as diagnosed — the merged
COMPONENT_SETs just needed the grid recomputed around their new heights.

**Counts, recomputed here against the returned JSON rather than taken on trust:** ❖ Components
32 (`app` 6 · `ui` 10 · `blog` 9 · `work` 2 · `hero` 3 · `contact` 2 · `about` 0), `_Docs/*` 11
(4 live + 7 archived), 📄 Pages 4, total 47. All match.

**Two questions left open by earlier tasks, both closed by this read:**

1. `zz/color/accent-hover` is **live** in `2 Theme` (15 vars). P1-T04's read-back returned
   `orphans: []` and the note above asked the gate to confirm the prefix. Confirmed.
2. Assertion 9 passes with `color/brand/gray-650`-style names still carrying a dash, which is
   correct: R1.2 settled that a dash before letters is a separator, a dash before digits is a
   ramp step. Only separators were converted.

**One expectation worth fixing in the briefs, not in Figma.** Gate D returned `strays: []` where
P1-T06 Step 3 / P1-T09 Step 3 both say "`strays` = `_Docs/*` only". The walk is scoped to the
❖ Components page and no `_Docs/*` master is on it (P1-T05 step 2 already reported `docs: 0`), so
empty is the right answer for a page-scoped check. Attempt 1 listed them because that run widened
the walk. Left as-is for now — phase 2 gates read the same wording.

`inventory.md §Phase-1-after` written from the Step 1 JSON: full 32-master roster with ids and
both merge variant matrices, the 4 page masters, the 11 `_Docs/*`, and the post-audit collection
table.

### R1.6 — blocked on a fresh export

`pnpm figma:dump` / `verify` / `verify-raw` / `verify-responsive` all read
`tokens.figma.json` + `raw-values.figma.json` dated **2026-08-15**, which predate P1-T04→T09.
Running them now re-reports known-stale rows (the `color/accent-hover` missing/orphan pair, 874
raw rows naming pre-merge masters). Needs Figma **File > Export** to `~/Downloads/Magnet-DS.fig`
before the gate can close.

**`pnpm test` — 2 pre-existing failures, fixed.** `extract-code-tokens.test.mjs` asserted 7
semantic colors per mode and `light/color-surface-hover = #d1ddbb`. Live `global.css` has **12**
per mode and `#eaf5d3`; `#d1ddbb` is now `color-border`. Verified stale, not new: both fail on a
clean tree at `544e33d`, and they date to `a24bd9d` (per-mode teal accent scale), which grew the
palette without updating the test. `figma:verify` reports no value mismatch, so code and Figma
agree — only the hardcoded expectation was behind. Updated to 12, kept the `#d1ddbb` assertion by
repointing it at `color-border`, and added a light↔dark name-parity check so a mode-only color
fails loudly next time. **57/57 pass.**

### R1.6 — run against the 2026-08-18 export, gate closed

Export landed at `~/Téléchargements/Magnet DS.fig` (the machine is French-locale; `~/Downloads`
does not exist — `_back/Magnet DS.fig` is the stale 2026-08-15 copy, do not dump that one).

| pass                      | result                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| `figma:dump`              | 407 `1 Primitives` · 54 `2 Theme` · 2 `Design System` · 30 `3 Responsive` |
| `figma:verify`            | Missing / Value mismatch / Orphaned / Unmapped — all `_none_`             |
| `figma:verify-responsive` | all `_none_`                                                              |
| `pnpm test`               | 57/57                                                                     |
| `figma:verify-raw`        | 595 rows · 35 accepted · 14 stale · 560 new — see below                   |

The stale `color/accent-hover` missing/orphan pair predicted after P1-T04 is gone, so `2 Theme`
and the code tokens now agree row for row.

**Pass 2 needed a live read, and the procedure was wrong in two ways.** `raw-values.figma.json`
is not derivable from the `.fig` — it comes from a `use_figma` walk. `dump-raw-values.md` told
the runner to loop `pageIds` inside one call, which the `figma-use` skill forbids (one
`setCurrentPageAsync` per invocation), and a `use_figma` return truncates near 20 kB, so
❖ Components (284 rows) and 📄 Pages (378 rows) both had to be fanned out and chunked, with rows
encoded as `id|nameIdx|kind` against a name dictionary. Procedure updated with both constraints.

**560 "new" raw values is id churn, not new debt.** `named-debt.json` is keyed by node id, and
phase 1 minted new ids wholesale — P1-T07 merged four masters into two, P1-T06 reparented
everything into sections, P1-T08 rebuilt container bands. The 14 stale entries are the other half
of the same effect: they name masters (`2001:1303`, `2039:418`, …) that no longer exist under
those ids. The allowlist never covered the dump anyway — 49 hand-picked text-style exceptions
against an 874-row dump on 2026-08-15. A large "new" block is this report's normal state, which
is now written down in `dump-raw-values.md` so the next reader does not mistake it for a
regression.

**One real finding, fixed at the tool.** P1-T06's seven domain SECTIONs and P1-T07's two new
COMPONENT_SETs put 67 rows of Figma's own canvas furniture into the dump — the section tint and
the dashed set border, neither of them rendered. The dump now skips `SECTION` and
`COMPONENT_SET`; 662 rows → 595.

Row count fell 874 → 595 overall, which is the expected shape: the legacy sections P1-T09 Step 0
removed and the four masters collapsed into two took their raw values with them.

**Not done here:** re-baselining `named-debt.json` against current ids. That is a judgement pass
over ~560 rows — bind or accept, one at a time — and it belongs in its own task, not inside a
verification gate. `figma:verify-raw` is warn-only and exits 0, so it does not block phase 2.
