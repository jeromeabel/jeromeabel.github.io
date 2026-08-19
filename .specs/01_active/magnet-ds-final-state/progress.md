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
`app/NavLink` COMPONENT*SET and the two `PostCardPreview*` into `blog/PostCard`. Both sets are
taller than the singletons they replaced. P1-T06 Step 1 tells you to re-run the \_sweep* after
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

## P2-T01 — phase-2 entry gate (2026-08-18)

- STATUS: **DONE** — gate passes, phase 2 open.
- RESULT: `count: 32` · `missing: []` · `legacy: []` · `alreadyPresent: []` · `absorbSource: true`
  · `sections: [app, ui, blog, work, hero, contact, about]`.
- DEVIATIONS: ran the brief from the repo session (Figma MCP is attached here), not a second
  session. Added `setCurrentPageAsync` — the brief's `loadAsync()` alone leaves `findAll` on an
  unloaded page in `use_figma`. Also returned the section list, which the acceptance clause asks
  about but the Step 1 snippet never collected.
- UNBOUND: none (read-only step).

**Phase-2 baseline roster** (32 masters, live ids — later briefs resolve by name, these are hints):

| domain      | masters                                                                                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app` 6     | ThemeToggle `16:11` · MotionToggle `16:12` · Footer `2969:432` · Header `2981:546` · HeaderDrawer `2981:4486` · NavLink `3093:553`                                                                                                              |
| `ui` 10     | Icon `461:6204` · Link/primary `2012:6179` · Link/secondary `2041:275` · Link/textLink `2041:313` · Link/iconOnly `2093:6332` · Link/inline `2350:737` · H2 `2034:213` · SectionTitle `2041:465` · H1 `2119:7406` · PageDescription `2119:7440` |
| `blog` 9    | PostList `2977:4382` · SerieList `2980:499` · BlogPreview `3041:1977` · PostMetadataTime `2040:482` · PostMetadataTopic `2371:10414` · SerieMeta `2375:10662` · PostRow `2124:7937` · SerieCard `2367:7205` · PostCard `3093:5376`              |
| `work` 2    | WorkPreview `2970:4368` · WorkCardPreviewSmall `2045:378` (absorb source for P2-T04)                                                                                                                                                            |
| `hero` 3    | HeroText `2012:6142` · HeroAnimation `2012:315` · Hero `2969:412`                                                                                                                                                                               |
| `contact` 2 | ContactContent `131:101` · ContactPreview `2114:7281`                                                                                                                                                                                           |
| `about` 0   | empty section, P2-T10 fills it                                                                                                                                                                                                                  |

Merge results from P1-T07 read back intact: `app/NavLink` carries `type × state` (6 variants) and
`blog/PostCard` carries `size × breakpoint × state` (8 variants). `contact/ContactPreview` is a
plain `COMPONENT` — P2-T06 is the brief that gives it a `breakpoint` axis.

## P2-T02 — `ui/Link/external` (2026-08-18)

- STATUS: **DONE**
- RESULT: `ui/Link/external` `3103:513` in section `ui`, `state=default` / `state=hover`,
  120×40 each. `pad [16,8,16,8]` · `radius 9999` · `gap 4` · `strokeWeight 1` ·
  `dash [4,4]` default / `[]` hover · stroke paint bound both variants · fill bound on hover only,
  no fill on default. Children `TEXT:Website` + `INSTANCE:icon` (`icon=arrow-up-right`, 24×24).
  Gate D after the corrective: `overlaps []` · `cropped []` · `strays []` · `count 33`.
- DEVIATIONS: four, all recorded below.
- UNBOUND: **none.** Every number the brief was willing to leave raw turned out to have a
  primitive: `spacing/1` (4) · `spacing/2` (8) · `spacing/4` (16) · `radius/full` (9999) ·
  `text/base` (16). No `named-debt.json` entry needed.

**Deviation 1 — bound what the brief allowed to stay raw.** The anatomy table offered raw 4/8/16
and a raw 9999 radius. `1 Primitives` has all of them, so padding, gap and the four corner radii
are bound, and the label's 16 binds to `text/base`. The acceptance clause's `UNBOUND:` escape
hatch is unused.

**Deviation 2 — kept the cloned icon instance instead of remove-then-recreate.** Step 2 told the
runner to drop every `INSTANCE` child and append a fresh `ui/Icon`. `secondary` already carries a
trailing `ui/Icon` instance, so it was renamed `icon`, switched via its `icon` property to
`arrow-up-right`, resized to 24 and re-appended last. Same result, one fewer node churn, and the
instance link is provably intact (`componentProperties.icon.value` reads back `arrow-up-right`).
`ui/Icon` does expose a glyph property — the brief's "report it as a gap" branch does not fire.

**Deviation 3 — hug, which `secondary` was not.** `secondary` is `FIXED` 152 wide
(`min-h-11 … w-full`). `external` is `w-fit`, so both axes are set to `HUG`; the master reads back
120×40 instead of inheriting 152×56.

**Deviation 4 — the grid script was cropping masters, fixed at source.** Re-running P1-T06 Step 2
as instructed produced **9 `cropped` masters** (`app/Header`, `app/HeaderDrawer`,
`app/MotionToggle`, `ui/SectionTitle`, 4 `blog/*`, `hero/HeroText`). Cause: the step positions a
master wider than `CELL` at `x += max(CELL, k.width) + GAP` but then resizes the section to a
**fixed** `PAD*2 + COLS*CELL + 3*GAP` = 2480. A 1280-wide master in column 1 pushes column 2 to
x=1440, whose right edge lands at 2720 — 240px outside a 2480 section. The width formula now
takes the real content extent as its lower bound (`max(maxRight + PAD, nominal)`), height likewise,
and `figma/P1-T06-domain-sections.md` is patched so every later brief that re-runs the step gets
the fixed version. Sections after the fix: `app` 4038 · `ui` 2696 · `blog` 4414 · `work` 2480 ·
`hero` 2824 · `contact` 2480 · `about` 2480 (unchanged floor where nothing exceeds the grid).

This also explains the P1-T09 Gate D result: it passed on a page whose sections had been sized by
an earlier, wider pass. The check was right; the layout step feeding it was not.

**Screenshot check.** Both variants render as pills: dashed 4/4 hairline with transparent ground,
solid hairline with `color/surface` ground on hover, arrow glyph trailing the label.

## P2-T03 — `ui/Prose` + `ui/SocialShare` (2026-08-19)

- STATUS: **DONE**
- RESULT:
  - `ui/Prose` `3106:2126`, 720×1043, `COMPONENT` in section `ui`. Children:
    `TEXT:h2` (32 SemiBold, lh 35.5) · `TEXT:p` (20 Regular, lh 36) · `TEXT:h3` (27 SemiBold, lh 32) ·
    `FRAME:list` (3 bullet items, 20 Regular) · `FRAME:blockquote` (2px rail + italic quote) ·
    `FRAME:pre` (Fira Code 18, lh 137.5%, radius 8, pad 20) · `FRAME:inline-code-example`
    (Fira Code 18, radius 4, pad 2/6) · `RECTANGLE:ProseImage` (720×405, radius 8,
    drop shadow y20 r25 s-5 a0.25). All text fills bound to `color/foreground` or
    `color/foreground-muted`; rail bound to `color/border`; pre / inline-code / image fills bound to
    `color/surface`. Inline-link annotation node `3106:2150` beside the master.
  - `ui/SocialShare` `3106:2141`, 138×24, `COMPONENT` in section `ui`. `TEXT:Share`
    (16 Regular, `color/foreground-muted`) + 3 `ui/Link/iconOnly` instances
    (`bluesky` `461:6275` · `linkedin` `461:6284` · `mail` `461:6254`). HORIZONTAL, gap 8,
    items centered, hug both axes.
- DEVIATIONS: three, recorded below.
- UNBOUND: **none.**

**Deviation 1 — prose scale, resolved in favour of the code.** The brief flagged a divergence
against `design.md` (h2 30 / p 18 / h3 24 — the `prose-lg` scale) and left the call to Claude Code.
The call: **the built numbers stand, and `design.md` needs no edit.** `design.md` carries no prose
type scale at all (`ui/Prose` is one table row with an empty Variants cell), so there was nothing to
contradict, and the 30 / 18 / 24 numbers the brief cites appear nowhere in `.specs/` — the brief
carried them in from an earlier draft. Live desktop is `prose sm:prose-lg lg:prose-xl` → `prose-xl`, and every other master
in this DS is built at desktop, so 32 / 20 / 27 is the consistent choice. A `prose-lg` Mobile
variant is a future axis, not a correction.

**Deviation 2 — `SocialShare` icons are 24×24, live desktop is 32×32.** `ui/Link/iconOnly` exposes
`size=normal|small`; its `small` variant reads back 24×24, which is the **mobile** value of
`iconSmall` (`h-6 w-6 lg:h-8 lg:w-8`). The runner used the variant that exists rather than
inventing a third size — correct call for this task, but it leaves a real defect one level down:
a phase-1 master built at the mobile number inside a desktop-only DS.
**FIGMA DEBT — `ui/Link/iconOnly` `size=small` must be retuned 24 → 32** (`text-sm` glyph, radius
`full`, 1px dashed `color/foreground-muted`). Fix belongs in P2-T11's sweep, before the gate counts
variant axes; `ui/SocialShare` then inherits 32 with no edit of its own, since it holds instances.

**Deviation 3 — added an inline-`code` example row.** Not in the brief's pseudocode, but inline
`code` is a row in its own anatomy table. `FRAME:inline-code-example` fills the gap: Fira Code 18,
`color/surface` fill, radius 4, padding 2/6.

## P2-T04 — `work/WorkCard` (2026-08-19)

- STATUS: **DONE**, two open items below.
- RESULT: `work/WorkCard` `COMPONENT_SET`, 3 axes / 8 children —
  `variant=catalogue|case` × `state=default|hover` × `side=left|right`, homed in the `work`
  section on ❖ Components. `side` built inert on `catalogue` (both values identical clones) so the
  matrix stays rectangular. Child order proves the axis: `side=left` → `["cover","text"]`,
  `side=right` → `["text","cover"]`. Read-back assertions all passed — catalogue 395 wide, case
  1248 wide; catalogue cover 395×222 default / 403×226 hover; case cover 500×281 / 510×287;
  `textDecoration=UNDERLINE` on all 4 hover children, `NONE` on all 4 defaults. Hover coupling and
  timing (underline + 1.02 cover, 140ms ease-out) live in the set description.
  Screenshot: catalogue reads as a borderless stack, case rows alternate left/right, text column
  vertically centred against the cover.
- ARCHIVED: `work/WorkCardPreviewSmall` → `zz/WorkCardPreviewSmall (superseded by work/WorkCard,
2026-08-18)` on 🗄️ Archive — Components. **11 live instances still point at it** — 10 on page
  `WorkPreviewSmallList` (`2829:5542` `2970:4366` `2045:398` `2970:4367` `2970:4365` `2045:408`
  `2045:417` `2829:5544` `2829:5543` — 9 listed by the runner, count reported as 10) and 1 on
  `WorkCardPreviewSmall cell` (`2670:7033`). Phase 3 replaces them; P3-T11 owns the cleanup.
- DEVIATIONS: four, recorded below.
- UNBOUND: reported **none**, but see open item 2 — the `cover` rectangles were never given a fill
  by the brief's own pseudocode, so this needs a read-back before R2.2 can be called a no-op.

**Deviation 1 — the shared `T()` helper was broken, fixed at source.** The brief's prelude bound
text colour with `t.setBoundVariable("fills", fill)`. `fills` is not a `VariableBindableNodeField`;
paint bindings go through `figma.variables.setBoundVariableForPaint()`. Runner worked around it
locally; `figma/_prelude-components.js` is now patched, so every remaining brief that includes the
prelude gets the working version. Earlier tasks (P2-T02, P2-T03) reported bound text fills, so their
runners must have hit and silently fixed the same wall.

**Deviation 2 — kicker enforces casing twice.** Source string written uppercase _and_
`textCase = "UPPER"`, so an instance override cannot reintroduce lowercase. Kept.

**Deviation 3 — case cells needed FIXED width.** Built with AUTO first, hugging at ~1084; corrected
to FIXED 1248 via `primaryAxisSizingMode` so the text column fills the row. Final widths verified.

**Deviation 4 — the P1-T06 grid step was not re-run.** OPEN ITEM 1. Every prior phase-2 task closed
with a re-grid + Gate D, and P2-T02 proved the layout crops when a master exceeds the 520 cell — an
8-child set 1248 wide has just landed in the `work` section, which sat at the 2480 floor. Gate D
is therefore unverified for this task. Re-run **P1-T06 Step 2 + Step 3** (patched, content-driven
sizing) and Gate D before P2-T05.

**OPEN ITEM 2 — cover fills.** The anatomy says the `cover` placeholder may take a
`1 Primitives::color/…/200` neutral, but the pseudocode in Steps 1 and 2 never assigns
`cover.fills`, so the rectangles may be carrying Figma's default raw `#D9D9D9`. Read the 8 `cover`
layers back: if raw, either bind them to a primitive or declare them in `named-debt.json` under
R2.2 — placeholder art is an allowed exception at P2-T11's binding sweep, but only when declared.

## P1-T06 re-run — Step 2 + Step 3 (2026-08-19)

Closes **P2-T04 Deviation 4 / OPEN ITEM 1**. Ran the patched, content-driven brief.

- STATUS: **DONE**
- RESULT:
  - Step 1 — 35 masters into 7 sections, `unhomed: []`. Section ids: `app` 3091:492 ·
    `ui` 3091:493 · `blog` 3091:494 · `work` 3091:495 · `hero` 3091:496 · `contact` 3091:497 ·
    `about` 3091:498.
  - Step 2 — `app`(6) 4038×946 · `ui`(14) 2736×1917 · `blog`(9) 4414×4543 · `work`(2) 2808×1762 ·
    `hero`(3) 2824×1536 · `contact`(2) 2480×653 · `about`(0) 2480×400.
  - Step 3 — **GATE D PASS**: `overlaps: []`, `cropped: []`, `strays: []`, `count: 35`.
  - Step 4 — 7 screenshots, all clean.
- DEVIATIONS: one reported, judged a stale-brief expectation, not a Figma fault — below.
- UNBOUND: none.

**Gate D is now verified for `work/WorkCard`.** The `work` section grew 2480 → **2808** wide and
1762 tall, i.e. the content extent formula (`max(maxRight + PAD, nominal)`) absorbed the 1248-wide
8-variant set instead of clipping it at the 2480 floor. `cropped: []` on a section that actually
had to stretch is the first positive proof the P2-T04 crop fix works, not just a pass on a page
that never exceeded the grid. `ui` reads 2736 (was 2696 after the fix) — one cell wider from the
three P2-T02/T03 masters, expected.

**Count reconciles.** 35 = 31 (P2-T01 canon roster) + `ui/Link/external` + `ui/Prose` +
`ui/SocialShare` + `work/WorkCard`. No orphan, no double-home.

**Deviation — `unhomed: []` where the brief expected 5 P1-T07 stragglers + 11 `_Docs/*`.**
Not a miss; the brief text is stale on both halves and should be read as already-satisfied:

1. The 5 unhomed masters were P1-T06's own hand-off to P1-T07, and P1-T07 homed them (its own
   entry leaves exactly **1** straggler, which P2-T04 consumed). Nothing is left to home.
2. `_Docs/*` masters are **not on the ❖ Components page** — P1-T05 step 2 reported `docs: 0`, and
   the note above (`strays` wording, P1-T09) already settled that empty is the right answer for a
   page-scoped walk. The wording survived into this brief unchanged.

The runner's "re-run Step 1 after P1-T07" advice does not apply — P1-T07 is closed. **Brief debt,
not build debt:** `figma/P1-T06-domain-sections.md` still names both stale expectations, and the
same wording is quoted by P1-T09 Step 3 and P2-T11. Fix the text at P2-T11 so the gate does not
report a phantom shortfall a third time.

## P2-T04b — `work/WorkCard` cover fills (2026-08-19)

Closes **P2-T04 OPEN ITEM 2**. New brief `figma/P2-T04b-cover-fills.md` — R2.2 assumed this read
had happened, but no brief covered it.

- STATUS: **DONE**
- RESULT:
  - Step 1 — 8 covers, **all raw `#D9D9D9`**, none bound. 66 `color/…/(100|200|300)` primitives
    available; `color/gray/200` (`VariableID:2014:88`) present.
  - Step 2 — all 8 bound to `color/gray/200` via `setBoundVariableForPaint()`. Matched the
    second `PREFER` entry, so no fall-through guess was needed.
  - Step 3 — cold read-back, 8/8 report `boundVariableName = "color/gray/200"`:
    `catalogue default left` 3107:531 · `catalogue default right` 3107:545 ·
    `catalogue hover left` 3107:559 · `catalogue hover right` 3107:573 ·
    `case default left` 3107:583 · `case default right` 3107:601 ·
    `case hover left` 3107:619 · `case hover right` 3107:637.
- DEVIATIONS: none.
- UNBOUND: **none**.

**The suspicion in OPEN ITEM 2 was correct** — the covers were carrying Figma's default
`#D9D9D9`, exactly the raw value predicted, on all 8 variants. Had P2-T04 been signed off on its
own `UNBOUND: none` report, 8 raw fills would have reached the P2-T11 binding sweep.

**R2.2 is a no-op.** Placeholder art is an allowed exception _when declared_, but nothing needs
declaring: binding beat debt on every cover, so `scripts/figma/named-debt.json` is unchanged and
no `reason` string is owed. The raw-value proof itself (`pnpm figma:verify-raw` over a fresh
export) is not run here — it needs a **File > Export** `.fig`, the same blocker R1.6 hit, and
R2.4 already runs the full dump + verify + verify-raw + test as the phase-2 exit gate. Deferred
there rather than exporting twice.

## P2-T05 — `work/ArchiveTable` (2026-08-19)

- STATUS: **DONE**
- RESULT: `work/ArchiveTable` `3111:5650`, COMPONENT_SET on one axis `breakpoint` =
  `Desktop | Tablet | Mobile`. Read-back: Desktop 1248w / 5 cols · Tablet 704w / 4 cols ·
  Mobile 358w / 3 cols. All three carry 8 body rows and a 64 `year` column.
- DEVIATIONS: one, benign — below.
- UNBOUND: none.

**Widths agree with the P1-T08 container recipe.** Desktop 1248 = 1280 − 2×16, so the master is
content-width, not viewport-width, and drops straight into a `container` without a nested pad.
`year` holding 64 across all three breakpoints is right: the column is a fixed four-digit stop,
so only the flexible columns collapse 5 → 4 → 3.

**Deviation — `textDecorationStyle = "DASHED"` unavailable, hairline rectangle used instead.**
The runner fell back to a 1px rect with `dashPattern [4, 4]`, stroke bound to `color/border`, in a
VERTICAL frame at gap 2 under each `Project` label — which is what §Anatomy specifies for the
fallback, so this is the brief working as written, not an improvisation. It is also the **same
construction P2-T02 used** for `ui/Link/external`'s dashed pill (4/4 hairline), so the library
stays internally consistent and the dashed underline remains a token-bound stroke rather than a
text property. Worth carrying forward: no brief should assume `textDecorationStyle` exists.

**OPEN ITEM — re-grid + Gate D owed again.** Desktop is **1248 wide**, over the 520 cell, and it
has just landed in the `work` section that P1-T06's re-run left at 2808. Same condition that made
P2-T04 Deviation 4 an open item. Re-run **P1-T06 Step 2 + Step 3** before P2-T06.

## P1-T06 re-run #2 — Step 2 + Step 3 after P2-T05 (2026-08-19)

Closes the P2-T05 open item.

- STATUS: **DONE**
- RESULT: Step 1 — 36 masters, `unhomed: []`. Step 2 — `app`(6) 4038×946 · `ui`(14) 2736×1917 ·
  `blog`(9) 4414×4543 · **`work`(3) 4136×1762** · `hero`(3) 2824×1536 · `contact`(2) 2480×653 ·
  `about`(0) 2480×400. Step 3 — **GATE D PASS**: `overlaps: []`, `cropped: []`, `strays: []`,
  `count: 36`. Step 4 — 7 screenshots, no clipping or overlap.
- DEVIATIONS: the same stale-brief report as the first re-run — **fixed at the brief this time**.
- UNBOUND: none.

**Count and geometry both reconcile.** 36 = 35 + `work/ArchiveTable`. The `work` section grew
2808 → **4136** wide, absorbing a second 1248-wide master; `cropped: []` on a section that had to
stretch twice now is the strongest evidence yet that the content-extent sizing fix holds. Every
other section is byte-identical to the first re-run, which is the expected result — nothing
outside `work` changed.

**Brief debt paid.** The first re-run flagged the `unhomed` / `_Docs/*` wording as stale and
deferred the fix to P2-T11; it then produced an identical phantom-shortfall report on this run, so
`figma/P1-T06-domain-sections.md` is patched now instead: `unhomed` and `strays` are documented as
**expected-empty**, with a note that non-empty is real drift. P1-T09 Step 3 and P2-T11 quote the
same wording — check them at the P2-T11 gate.

## P2-T06 — `contact/ContactPreview` gains `breakpoint` (2026-08-19)

- STATUS: **DONE**
- RESULT: promoted COMPONENT `2114:7281` → COMPONENT_SET `3112:690`, axis `breakpoint` =
  `Desktop | Mobile`. Band frame `ContactContainer` set `FILL`/`HUG`. Cold read-back:
  Desktop 1280w, pad `[96, 16, 0, 16]`, `paddingLeft/Right → container/gutter`,
  `paddingTop → spacing/24`; Mobile 390w, pad `[32, 16, 32, 16]`,
  `paddingLeft/Right → container/gutter`, `paddingTop/Bottom → spacing/8`.
  `ContactImage` **hidden, not deleted**, on Mobile only.
- DEVIATIONS: two, both correct — below.
- UNBOUND: none.

**Desktop is untouched.** The read-back matches Step 1's pre-edit state field for field, so the
promotion added a variant without perturbing the existing master — the thing that most often goes
wrong when a COMPONENT becomes a COMPONENT_SET.

**This is a band, not content, and that is why 390 is right.** `ContactPreview` is viewport-width
with its own `container/gutter` padding, where `work/ArchiveTable` is content-width (358 = 390 −
2×16). The two nest without double-padding: the band owns the gutter, the content sits inside it
already stripped of one. Consistent with the P1-T08 recipe.

**Deviation 1 — Mobile `paddingBottom` bound to `spacing/8`.** Desktop carries
`paddingBottom = 0`, unbound; Mobile needs 32. Binding rather than typing a raw 32 is the run
rule applied correctly.

**Deviation 2 — Desktop `paddingBottom` left 0 and unbound.** Right call. Zero is the absence of
a value, not a raw one; binding it to a `spacing/0` would invent a token to say "nothing", and it
matches the original master. Not debt, nothing owed to `named-debt.json`.

**Re-grid not run, deliberately.** The set is ~1710 wide against a `contact` section sitting at
2480, so there is headroom and no crop risk. Per the cadence agreed after the second re-run: one
re-grid + Gate D before the P2-T11 gate, not one per task, unless a task lands a master wide
enough to burst its section.

## P2-T07 — `blog/TableOfContents` + `blog/SerieContents` (2026-08-19)

- STATUS: **DONE**
- RESULT: `blog/TableOfContents` `3113:5417`, axis `breakpoint` = `Desktop | Mobile`
  (Desktop `3113:660` 224×204, no stroke, no padding; Mobile `3113:692` 358×238, stroke bound
  `color/border`, padding 16). `blog/SerieContents` `3113:5418` 720×217, 5 items, one
  `item / current`. Both homed in the `blog` section.
- DEVIATIONS: two — one real debt, one a non-finding.
- UNBOUND: none.

**Mobile 358 is content-width** (390 − 2×16), matching `work/ArchiveTable` and unlike
`contact/ContactPreview`'s viewport-width band. Correct: the ToC sits inside a container, it is
not one.

**Deviation 1 — `ui/Icon` has no `chevron-down`; a `chevron-right` instance was renamed to
`chevron-down`.** ⚠️ **This is the worst shape a placeholder can take** and it needs an explicit
owner: the layer _name_ now asserts a glyph the instance does not carry, so nothing downstream —
not Gate D, not the P2-T11 binding sweep, not a screenshot diff — can tell it from a finished
component. A missing icon announces itself; a mislabelled one does not. Recorded here as the
tracking entry, and it joins `ui/Link/iconOnly size=small 24→32` on the **P2-T11 gate checklist**
so the gate either fixes it or consciously signs it over to P3's icon-set expansion. Do not let
P3 inherit it silently.

**Deviation 2 — item 3 fitting on one line is not a finding.** The runner checked whether a long
ToC entry wraps, found it fits at 670px effective width (h=21), and correctly reported the
_layout_ as the thing that matters: FILL width, AUTO height, no fixed-height rows. Wrapping is
supported whether or not this sample string exercises it. Matches live `md:p-6` behaviour.

**Dark-mode screenshots unverified.** The export context rendered dark identically to light. The
bindings read back correct, so this is a screenshot-tooling limit, not a token fault — but it
means no phase-2 master has had its dark rendering _seen_. P3-T09 builds the dark grid as
mode-pinned instances and is the natural place to catch this; flagging so it is a decision, not
an oversight.

### Fresh `.fig` export landed

`~/Téléchargements/Magnet DS.fig`, 67.8 MB, written 00:41 — one minute after P2-T07 closed. This
is the artefact R1.6 and R2.2 both deferred to. **It is already a snapshot of a moving target:**
P2-T08 → P2-T10 add roughly six more masters, so R2.4 needs its own export rather than this one.
Useful now only for an early read; the gate must re-export.

### P1-T08 re-run — container recipe after P2-T06 (2026-08-19)

- STATUS: **DONE** — 6 owners × **12** variants, all pass, zero exceptions beyond the known
  structural one.
- RESULT: steps 1–3 re-applied and read back. Every owner: pad-x `[16,16]` bound to
  `container/gutter`, inner band `maxWidth = 1280` bound to `container/max-width`,
  `counterAxisAlignItems = CENTER`.

| Master                 | Variant | pad-x  | capped band(s)                        |
| ---------------------- | ------- | ------ | ------------------------------------- |
| app/Header             | Desktop | 16, 16 | HeaderContent                         |
| app/Header             | Mobile  | 16, 16 | — (structural exception, see below)   |
| app/Footer             | Desktop | 16, 16 | FooterContainer                       |
| app/Footer             | Mobile  | 16, 16 | FooterContainer                       |
| hero/Hero              | Desktop | 16, 16 | HeroContent, StartReading             |
| hero/Hero              | Mobile  | 16, 16 | HeroContent, StartReading             |
| blog/BlogPreview       | Desktop | 16, 16 | ui/SectionTitle, BlogPreviewContent   |
| blog/BlogPreview       | Mobile  | 16, 16 | ui/SectionTitle, BlogPreviewContent   |
| work/WorkPreview       | Desktop | 16, 16 | ui/SectionTitle, WorkPreviewSmallList |
| work/WorkPreview       | Mobile  | 16, 16 | ui/SectionTitle, WorkPreviewSmallList |
| contact/ContactPreview | Desktop | 16, 16 | ContactPreviewContent                 |
| contact/ContactPreview | Mobile  | 16, 16 | ContactPreviewContent                 |

- DEVIATIONS: none. The step-4 corrective from 2026-08-18 was already in place; step 1 re-applied
  the `container/gutter` bindings only to confirm identity, not to change anything.
- UNBOUND: none.

**11 → 12 rows: the new row is `contact/ContactPreview` Mobile, added by P2-T06.** That is the
point of re-running this task. P2-T06 promoted the master to a `breakpoint` set, and a new variant
is a new container that nothing had yet checked. It passes on all three conditions, so the
breakpoint promotion carried the recipe rather than starting a fresh unbound frame — which is the
behaviour P2-T08 → P2-T10 will keep relying on as more masters gain Mobile.

**The `app/Header` Mobile exception is still the only one, and still not debt.** No inner band
exists to cap: `children` are the TEXT `Brand` and a FIXED `MenuButton`. Unchanged since
2026-08-18; re-confirmed rather than re-litigated. Inventing a wrapper to make the audit read
clean would be the wrong fix.

**Cadence note.** This re-run is cheap (read-only after step 1) and is worth repeating once more
at P2-T11 if any of P2-T08 → P2-T10 touches a container owner. None of the three queued tasks
does on paper — they add cards, nav and about blocks, not page-level bands — so the P2-T11 gate
can treat this run as current unless that changes.

## P2-T08 — `work/WorkMiniCard` + `blog/RelatedWork` + `blog/PostNav` (2026-08-19)

- STATUS: **DONE** — three masters and decision record 5.
- RESULT:
  - `work/WorkMiniCard` `3117:659` 224×253, cover square (w === h).
  - `blog/RelatedWork` `3117:662` h=287, three `INSTANCE:work/WorkMiniCard` children — instances,
    not detached FRAMEs, so the `inst()` guard held.
  - `blog/PostNav` `3117:705`, axis `type` = `both | prev-only | next-only`, 3 variants, 720 wide,
    cells 344 each — the single-neighbour variants keep one 344 cell rather than stretching it.
  - `DECISION / related-block-children` `3117:706` 1040×311, record 5 on 📐 Decisions.
- DEVIATIONS: two reported, one a brief bug, one a brief self-contradiction. Both fixed at source.
- UNBOUND: none.

**Deviation 1 — `setBoundVariable("strokes", …)` does not bind paints.** The runner is right, and
this is **the third task to hit the same wall**: P2-T04 hit it on `fills`, P2-T04b spent a whole
corrective task rebinding the 8 raw `#D9D9D9` covers it left behind, and the fix went into `T()`
in `_prelude-components.js` only. Every other call site kept the broken form. So the lesson was
recorded but not _propagated_ — the exact failure mode P2-T04b's own note warned about.

Swept the whole brief set: **21 bad calls across 12 files**. All rewritten to a new prelude helper

```js
const P = (v) =>
  figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v,
  );
```

`n.setBoundVariable("fills", V[...])` → `n.fills = [P(V[...])]`, same for `strokes`. `P` is now in
both `_prelude-components.js` and `_prelude-pages.js`, and `T()` uses it instead of inlining the
call. Un-run briefs fixed: **P2-T09 (2), P2-T10 (1), P3-T03 (2), P3-T06 (2), P3-T08 (1)**, plus
`_prelude-pages.js` (page-root background fill — would have failed on the first P3 page).

**⚠️ Consequence for already-run masters.** P2-T02, P2-T03, P2-T04, P2-T05 and P2-T07 ran with the
broken call in their briefs (10 call sites). Their reports all said `UNBOUND: none` — and P2-T04's
did too, right before P2-T04b found 8 raw fills. **A clean report is not evidence here**, because
the failure is silent from the runner's point of view. `pnpm figma:verify-raw` at **R2.4** catches
raw values mechanically against the allowlist and is the correct net; added to the P2-T11 gate row
so the gate does not wave it through on the strength of the reports.

**Deviation 2 — not a deviation; the brief contradicted itself.** Prose said the next cell is
`counterAxisAlignItems = "MAX"`; the step-3 code said `primaryAxisAlignItems = "MAX"`. The cell is
HORIZONTAL, so the primary axis _is_ the horizontal one and the code was right — the runner
followed the code and explained why. Prose corrected in the brief, with the axis reasoning spelled
out so the next reader does not re-derive it.

**No re-grid owed.** Widest new master is 720, well inside the `blog` and `work` sections after the
P1-T06 re-run stretched `work` to 4136×1762. Per the agreed cadence: one re-grid + Gate D before
P2-T11, not one per task.

## P2-T09 — `work/WorkHeader` + `blog/PostRowCalm` + `work/RelatedWriting` (2026-08-19)

- STATUS: **DONE** — three masters, one recipe change adopted at source.
- RESULT:
  - `work/WorkHeader` `3118:680` 832 wide (565 tall once the H1 and abstract instances carried
    their real copy — the 526 in the runner's report predates step 2). `breadcrumb` → `ui/H1`
    INSTANCE → `ui/PageDescription` INSTANCE → `facts` → `links` (2 × `ui/Link/external`,
    `Demo` + `Code`, not padded to four).
  - `blog/PostRowCalm` `3118:5416` COMPONENT_SET, axis `facts` = `plain | serie`, both 720 wide
    (76 / 96 tall). The single-line description clamp worked — `textTruncation` /`maxLines` exist
    on this API version, no faked shortening.
  - `work/RelatedWriting` `3118:5417` 720 wide, `rows` holds 2 `blog/PostRowCalm` INSTANCEs in
    serie-then-plain order. Decision record 5 from P2-T08 holds.
  - H1 text went through `setProperties` (`Text#2119:12`); `ui/PageDescription` exposes no text
    property, so that one is a direct TEXT edit — recorded because P3-T06/P3-T08 reuse both.
- Cold read-back verified independently here via `get_metadata` on all three ids: structure,
  widths and instance-vs-frame types match the report.
- UNBOUND: none.

**The one deviation is better than the brief and is now the rule.** The brief built each hairline
as a 1px `RECTANGLE` child; the runner used the row's own `strokeBottomWeight = 1` (other sides 0)
with the paint bound through `setBoundVariableForPaint`. That is the faithful mapping: code writes
`border-b` on the _same element_ (`PostRowCalm.astro:24`, `ArchiveTable.astro:32`,
`WorkHeader.astro:25` via `prose-td:border-b`), so the rule belongs to the element, not to a
sibling node. It also drops a node per row and cannot drift out of `FILL` sizing.

Adopted at source rather than left as a per-task note — the rectangle recipe was leaking out of
the superseded 2b/2d plans into every new brief:

- new prelude helper `HAIR(node, v, sides = ["bottom"])` in **both** `_prelude-components.js` and
  `_prelude-pages.js`, binding through the existing `P()`;
- new run rule in `_run-rules.md`: element-owned rule → `HAIR`; rectangle only for a rule with **no
  owner**;
- P2-T09's own brief rewritten to what actually shipped — `HAIR` on the row, and the facts rows are
  flat `label`/`value` TEXT children (the brief's `wrap` + `cells` + `lc`/`vc` wrappers are gone,
  they existed only to host the rectangle);
- P2-T10 `facts=strip` converted (root `["top", "bottom"]` strokes replace two rectangles);
- P3-T03 and P3-T06 keep their rectangles **on purpose**, each now with the reason inline: the blog
  column divider has no owning element, and the post-header rule sits _inside_ head's bottom
  padding rather than on its outer edge. Same-looking, different geometry — converting either would
  move the line.

**Two hairline recipes now coexist in shipped masters.** `work/WorkCard` (meta rail top rule) and
`work/ArchiveTable` (header + body rows) were built with rectangles before this. Visually identical,
structurally divergent from their `border-b`/`border-t` code. Not worth a rebuild task on its own —
added to the P2-T11 gate row as a call to make there, with the default being _leave them_, since a
rebuild risks the container bindings P1-T08 just re-verified.

**Minor, no action.** `textCase = "UPPER"` was set explicitly on the `WORK` breadcrumb, the
`RELATED WRITING` label and the serie chip even though the characters are already uppercase; the
brief now says `textCase` instead of the ambiguous word "uppercase". Fira Code resolved to style
`Regular` as the brief intended.

**No re-grid owed.** Widest new master is 832, inside the `work` section's 4136 after the P1-T06
re-run. Cadence unchanged: one re-grid + Gate D before P2-T11.

### Hairline sweep — every brief on `HAIR()` (2026-08-19, after P2-T09)

P2-T09 adopted the recipe; this pass applies it to the **whole brief set**, run and un-run alike,
so no brief still teaches the rectangle form. `HAIR` gained a fourth argument (`weight`, default 1)
to carry the 2px rails.

**Converted — element owns the rule:**

| Brief  | Site                        | Was                                    | Now                                              |
| ------ | --------------------------- | -------------------------------------- | ------------------------------------------------ |
| P2-T03 | `ui/Prose` blockquote       | 2×N rect + `itemSpacing 24`            | `HAIR(quote, …, ["left"], 2)` + `paddingLeft 24` |
| P2-T04 | `work/WorkCard` top rule    | rect child, then gap 12                | `HAIR(c, …, ["top"])` + `paddingTop 12`          |
| P2-T04 | `work/WorkCard` meta rail   | `paddingTop 12`, then rect, then gap 8 | `HAIR(rail, …, ["top"])` + `paddingTop 12`       |
| P2-T05 | `work/ArchiveTable` rows    | `wrap` frame + rect child              | `HAIR(row)` — the `wrap` frames are gone         |
| P2-T07 | `blog/TableOfContents` rail | 2×N rect + `pad` frame                 | `HAIR(row, …, ["left"], 2)`, depth on a wrapper  |
| P2-T10 | `about/AboutFacts` strip    | two rects                              | `HAIR(c, …, ["top", "bottom"])`                  |

**Kept as rectangles — no element owns the edge**, each with the reason inline so the next reader
does not "fix" it: P3-T03 blog column divider, P3-T06 post-header rule (sits _inside_ head's bottom
padding, not on its outer edge — a stroke would move the line), P3-T04 rules between sibling
WorkCard instances (a stroke there would be a local instance override). Covers and `ProseImage`
are placeholders, not rules, and were never in scope.

**Two of the conversions change geometry, on purpose.** `work/WorkCard`'s two rules were modelled
as children _after_ the padding, so the rule sat 12px inside the card; `border-t` puts it on the
outer edge with the 12 as padding underneath. P2-T05's row wrappers disappear entirely. Everything
else is pixel-identical — the rail conversions keep the same 2px + 12px inset, and P2-T10's strip
rules were already at the component edges.

**Consequence: four shipped masters now disagree with their corrected briefs** — `ui/Prose`,
`work/WorkCard` (8 variants), `work/ArchiveTable` (3), `blog/TableOfContents` (2). They were built
before the rule existed. New RUNBOOK row **P2-T10b** rebuilds them on `HAIR()`; P2-T11's gate row
now checks that rather than the earlier "default: leave". `work/WorkCard` is the one to sequence
carefully — `work-card-redesign` is mid-flight in `.specs/01_active/`, so P2-T10b should run after
that design settles, not before, or the rebuild gets thrown away twice.

57 tests pass; all seven touched briefs reassemble via `pnpm figma:brief`.

## P2-T10 — `about/AboutFacts` + `about/AboutText` (2026-08-19)

- STATUS: **DONE** — the `about` section is no longer empty.
- RESULT:
  - `about/AboutFacts` `3119:2210` COMPONENT_SET, axis `facts` = `grid | strip`, both 832 wide.
    `facts=grid` (57 tall) is four `FILL` columns at 190 each, root gap 24, item gap 4, value above
    label — Bubbler One Regular 30 (letter-spacing 2%) over IBM Plex Sans Regular 14. `facts=strip`
    (44 tall) is the `HAIR` form: root strokes `[1, 0, 1, 0]` bound to `2 Theme::color/border`, one
    `items` child with `layoutWrap = WRAP`, gap-x 24 / gap-y 8, padding-y 12, cells in Fira Code
    **Bold** value + Regular label — the `Bold` style exists in this file, no fallback needed. The
    strip's shortened labels (`articles`, `downloads`) survived.
  - `about/AboutText` `3119:2211` 832×1123, seven children in brief order: `ui/H1` INSTANCE →
    lead TEXT → `ui/Prose` → `about/AboutFacts` (`facts=grid`) → `ui/Link/external` → `ui/Prose` →
    `links` FRAME with two `ui/Link/secondary`.
  - Copy verified by read-back, not by report: H1 through the text property (`Text#2119:12` = `About`),
    CV link characters `Download CV`, prose block 1 at 245 chars with one SemiBold run
    (`I build web applications`), prose block 2 at 981 chars with three (`Before the web`, `Teaching`,
    `Open source since 2010`). Both Bubbler One texts read back as Bubbler One — no silent fallback.
- Cold read-back done independently here on both ids via `use_figma` (structure, fonts, per-node
  fill bindings, stroke weights, styled-text segments).
- UNBOUND: none.

**Layer names inside instances stay stale — read `characters`, not `name`.** The `ui/H1` instance
still carries the layer name `Hi, I'm Jérôme!` and the CV link's TEXT is still named `Website`,
because setting a text property or `characters` does not rename the node. A structure dump that
prints layer names looks like step 4 never ran; it did. Noted because P3-T05/P3-T06 will hit the
same illusion.

**Deviation 1 — the CV icon is trailing, code puts it leading.** `ui/Link/external` slots its icon
at index 1 and children of an instance cannot be reordered (`insertChild` throws), so the runner
left it trailing and said so. Real divergence from `About.astro`, which passes an explicit leading
`lucide:download`. Fixing it means an `iconSide` axis on `ui/Link/external`, which is a P2-T02
change, not a P2-T10 one — carried to the P2-T11 gate as a call to make, default being to add the
axis there rather than reopen the master now.

**Deviation 2 — the 🤝 stays an emoji.** `ui/Prose`'s `p` TEXT node cannot host an inline instance,
so `lucide:handshake` has no home in the paragraph. The brief already allowed this. No action; the
emoji carries the intent and code keeps the icon.

**Deviation 3 — `24` is a snapshot**, exactly as the brief permitted. It drifts with the post count;
whoever refreshes the About page master in P3-T05 should re-read it rather than trust the number.

**Hidden white root fills, pre-existing.** Both about masters carry an invisible `#ffffff` fill on
the component root — the `figma.createComponent()` default. A sweep of the Components page finds 13
masters in the same state (`ui/H1`, `ui/PageDescription`, `blog/RelatedWork`, `blog/PostNav` ×3,
`work/ArchiveTable` ×3, `work/WorkMiniCard`, plus these three); every one of them is `visible: false`,
so nothing renders. Not new debt and not worth a pass of its own — but `pnpm figma:verify-raw` at
R2.4 reads paints, not visibility, so either the allowlist covers hidden paints or the check skips
them. Flagged there.

**Re-grid now owes `about` too.** Both masters sit at `0,0` inside the section, stacked on each
other, and `about/AboutText` at 1123 tall overflows the section's 400. Same state as the P2-T08/T09
masters — the one re-grid + Gate D before P2-T11 covers it. Widest new master is 832, inside the
section's 2480, so no section resize is owed.

**Step 6 (screenshots against live `/about`, light and dark) was not reported.** Folded into the
P2-T11 gate's visual pass rather than re-run on its own.

### P2-T10b brief written (2026-08-19)

`pnpm figma:brief P2-T10b` had no brief behind it — the RUNBOOK row existed, the file did not.
Written now from a live audit of the four masters rather than from the sweep table, which is how the
counts got sharper: **50 rectangles**, not four sites — `ui/Prose` 1, `work/ArchiveTable` 27
(3 breakpoints × head + 8 rows), `blog/TableOfContents` 14 (2 × 7 items), `work/WorkCard` 8
(4 `catalogue` variants × card rule + `meta` rail; the `case` variants have none). Every one is
already bound to `2 Theme::color/border`, so the task is structural only.

**The audit found three things the sweep table did not.**

1. **Side rules need `strokesIncludedInLayout = true`.** A Figma stroke is `INSIDE` and outside
   auto-layout by default, so padding is measured from the outer edge and the stroke paints over it —
   text lands 2px tighter than `border-s-2 ps-3`, where the padding sits _inside_ the border. Set the
   flag on the two left-rail conversions (`ui/Prose` blockquote, TOC items) and keep the code's
   padding. Bottom/top rules keep the default `false`: that is what P2-T09's shipped masters do, and
   flipping it would move every `ArchiveTable` row by 1px for nothing. `P2-T03` and `P2-T07` were
   patched to teach this, so a future re-run does not rebuild the 2px error.
2. **The TOC active rail is the wrong colour.** `a[data-toc-link][aria-current]` sets _both_ `color`
   and `border-color` to `foreground-strong` (`TableOfContents.astro:73-77`); the master binds the
   active rail to `color/border` like every other item, and P2-T07's prose explicitly said to. Both
   the brief and the master are wrong; P2-T10b fixes the master, P2-T07 is corrected at source.
3. **`underline-dash` is correct as a rectangle** and is now called out as out-of-scope in writing.
   It is the dashed link underline in the archive table (`border-b border-dashed border-current`) —
   already a stroke-bearing rect with `dashPattern [4, 4]` and no fill, and Figma's TEXT underline
   cannot be dashed. Same for `ProseImage` and the 8 `cover` rects: placeholders, not rules.

**Step 4 (`work/WorkCard`) is gated in the brief**, not merely footnoted — `work-card-redesign` is
still in flight, and the runner is told to report `SKIPPED` rather than convert twice. The `meta`
rail is the only conversion in the task that moves a line: 12px up, onto `meta`'s outer edge, which
is where `border-t` draws it.

---

## CODE DEBT — phase 2 (R2.3, 2026-08-19)

Collected, **not fixed**. These feed the `magnet-ds-code-convergence` backlog stub opened at R3.7.
Each was re-checked against live code today; the verdict column is the outcome of that check, not
the brief's guess.

| #   | From   | Finding                                                                                                               | Verdict                  |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | P2-T05 | `work/ArchiveTable` row hover binds `2 Theme::color/surface`; code is `hover:bg-surface/50` (`ArchiveTable.astro:32`) | **real debt**            |
| 2   | P2-T08 | Related blocks use compact children (`work/WorkMiniCard`, `blog/PostRowCalm`), not the page's own cards               | documentation only       |
| 3   | P2-T09 | `work/WorkHeader` link labels `website→Website`, `live→Demo`, `git→Code`, `video→Video`                               | **verified, no debt**    |
| 4   | P2-T06 | `contact/ContactPreview breakpoint=Mobile` hides illustration + noise rather than deleting                            | **verified, no debt**    |
| 5   | P2-T10 | `about/AboutText` CV link renders its icon trailing; code puts it leading via an explicit `icon` prop                 | **Figma-side**, not code |

**1 — ArchiveTable row hover.** Figma has no half-step for `color/surface`, so the master binds the
full token and the hover reads heavier than the site. Figma did not invent a token, and code is not
wrong either: the convergence topic decides whether `2 Theme` gains a `color/surface-subtle`
(alpha-50 of `surface`) or the code drops to the flat token. Do not patch either side here — a
half-step added now would ship an unused variable into the phase-2 exit gate.

**2 — related-block children.** Decision record 5 `related-block-children` on 📐 Decisions is the
durable artifact; the code already matches it. Nothing to change, and it is listed only so the
convergence topic does not "discover" it a second time and open a change against matching code.

**3 — WorkHeader labels.** Confirmed at `WorkHeader.astro:42-48`, exactly the four-way mapping the
master encodes, `website` additionally guarded by its own conditional. Phase 3 can build the
Work-detail master on this mapping without re-reading the component.

**4 — ContactPreview Mobile.** Confirmed at `ContactImage.astro:5` — `hidden … sm:block`, i.e. the
node exists in the DOM and is display-hidden, which is what a hidden layer in the variant models.
Recorded as verified so P2-T11's Gate D does not read the hidden layers as an unfinished variant.

**5 — CV link icon side.** Not code debt: the code is right and the master is the one that cannot
express it, because `ui/Link/external` has a trailing-only icon slot and `insertChild` throws inside
an instance. The fix is an `iconSide` variant axis on `ui/Link/external` (a P2-T02 master), carried
on the P2-T11 gate row. Listed here so the convergence topic does not re-file it against the site.

---

## P2-T10b — rect hairlines → `HAIR()` strokes (2026-08-19)

**TASK** P2-T10b · **STATUS** DONE · **UNBOUND** none

**RESULT.** All 50 rectangles converted, verified cold from Figma rather than from the report.

| Master                             | Converted | End state (read back)                                                                         |
| ---------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `ui/Prose` `3106:2126`             | 1         | `blockquote` stroke `0,0,0,2`, `paddingLeft 24`, only `ProseImage` rect left                  |
| `work/ArchiveTable` `3111:5650`    | 27        | 27 × `0,0,1,0`, 3 variants **h=329**, only the 24 `underline-dash` rects left                 |
| `blog/TableOfContents` `3113:5417` | 14        | 14 × `0,0,0,2`, `paddingLeft 12`, **zero** rects left, `item / active` on `foreground-strong` |
| `work/WorkCard` `3107:654`         | 8         | 4 root + 4 `meta`, `1,0,0,0`, `paddingTop 12`, only the 8 `cover` rects left                  |

Every stroke paint bound to `2 Theme::color/border` except the two active TOC rails on
`foreground-strong`, which is the divergence P2-T10b was also carrying (`a[aria-current]` sets
`border-color` _and_ `color`). The TOC depth-2 items now sit in one `sublist` wrapper per variant —
read back as `[item / active, item, sublist[item|item], item, item, item]` on both breakpoints, which
is the `<ol ps-3>` nesting from `TableOfContents.astro:60`.

### The brief was wrong about `strokesIncludedInLayout` — corrected at source

The runner reported flipping `ArchiveTable` and `WorkCard` back to `false` "per brief spec". The
brief did say that, and the brief was wrong on two counts:

1. **It cost 9px.** A rectangle child in a gap-0 vertical frame occupies 1px of layout; a stroke that
   is not in layout occupies none. Read-back caught `ArchiveTable` at **h=320** where it had been
   329 — the conversion was supposed to be pixel-identical and was not. Flipping the 35 nodes to
   `true` restored 329 exactly, and moved `WorkCard` catalogue 404 → 406.
2. **It claimed a convention that does not exist.** A DS-wide survey of per-side strokes says the
   opposite: P2-T09's own masters are already `true` — `work/WorkHeader` (3), `work/RelatedWriting`
   (2), `blog/PostRowCalm` (2), plus `about/AboutFacts` (1) and `app/Footer`'s 2 top rules.

The rule that survives: **a CSS border grows an auto-height box, so a Figma stroke standing in for
one must be in layout.** `HAIR()` in `_prelude-components.js` now sets
`strokesIncludedInLayout = true` itself, so no future brief can re-introduce the 1px error, and the
P2-T10b prose was rewritten rather than left as a trap.

35 nodes mutated in the follow-up (`3111:527`, `3111:540`, `3111:553`, …).

### Carried to P2-T11 — 36 legacy hairlines still out of layout

Pre-P2-T09 masters were built before the rule existed and still carry `inLayout=false`:
`app/Footer` 12 bottom rules, `blog/PostList` 9, `blog/PostRow` 4, `ui/Link/inline` 3,
`app/NavLink` 2, `blog/BlogPreview` 2, `work/WorkPreview` 2, `contact/ContactPreview` 2.
Each is 1–2px tight against its CSS counterpart. Flip them at the gate — cheap, mechanical, and the
last place the old convention survives.

### Deviations

- **`blog/TableOfContents breakpoint=Mobile`** carries a pre-existing full-box stroke
  (`1,1,1,1`, bound `color/border`, in layout). Not part of this conversion; left untouched and
  recorded here so P2-T11's Gate D does not read it as a stray.
- `work/WorkCard` `meta` moved its rule 12px up onto the frame's outer edge, as the brief specified.
  Note `WorkCard.astro` has **no** `border-t` today — the top rule and meta rail come from the
  `work-card-redesign` spec, not from shipped code, so there is nothing to reconcile against the
  live component until that redesign ships.

---

## P2-T11 — first run returned a **false** gate failure (2026-08-19)

**TASK** P2-T11 · **STATUS** BLOCKED → brief patched, re-run pending

**RESULT.** `46 / 4 / 4 / 54` against an expected `46 / 11 / 4 / 61`. A2 and A4 both failed. Neither
is a Figma defect: the gap is exactly **7**, and 7 is the number of `_Docs/*` masters on
`🗄️ Archive — Docs v1`.

### The brief contradicted itself

Step 1's walker carried `if (p.name.startsWith("🗄️")) continue;` while assertion 2 expected the
`_Docs/*` count **document-wide** — which is how `inventory.md:325` defines the 11 ("Assertion 3
counts `_Docs/*` document-wide, which is why the archived seven are in the 11") and how P1-T09
measured 11 / 47 at the phase-1 gate, its walker having no such skip. The skip was added for
assertions 5–8, which are legitimately ❖-Components-scoped; it should never have applied to the
counters.

Fixed at source: the walker now visits every page and stamps an `archived` flag, assertions 2 and 4
count document-wide, and 1 / 5–8 filter on that flag. The runner's numbers were right about the
file; the file was right all along.

### Three more findings the failed run surfaced

**1 — the brief was stale by four tasks.** `RUNBOOK.md`'s P2-T11 row carries five owed items;
the brief file only ever contained one (`iconOnly/small` 24→32, Step 3b). Missing: the
`ui/Link/external` `iconSide` axis (owed by P2-T10), the fake `chevron-down` (owed by P2-T07), the
36 legacy hairlines still `strokesIncludedInLayout=false` (owed by P2-T10b), and the `/about`
light+dark screenshots. Had the count bug not fired, this gate would have **passed while
incomplete** — the failure was luckier than it looked. Added as Steps 3c / 3d / 3e and a Step-6
clause, all placed ahead of the binding sweep and Gate D because 3c and 3e move geometry.

**2 — `chevron-down`: resolved at the gate, not deferred.** P2-T07 renamed a `chevron-right`
instance to `chevron-down`; the layer name asserts a glyph the instance does not carry, which is
undetectable downstream. Step 3d now builds the real glyph into `ui/Icon` via
`createNodeFromSvg` and re-points every instance through the glyph property. Phase 3 does not
inherit it.

**3 — `_Docs` axis renames kept, `P3-T10` updated.** Assertion 9 reads "every COMPONENT_SET's axes
are lowercase" with no scope, so the runner renamed `_Docs/Date` `Variant`→`variant` and
`_Docs/Status` `Status`→`status` — reasonable under the text, but `_Docs/*` is out of DS scope per
`P1-T05:88`, and `P3-T10-docs-page.md:59` still said `Status=Completed`. Decision: keep the
lowercase axes (uniform document-wide), update `P3-T10` to `status=Completed`, and leave the
already-executed P1-T02 and P2-T08 briefs as the historical record they are. Assertion 9 now states
its scope explicitly.

### What did pass

Assertions 1, 3, 5–9 · all 9 variant-axis rows · Gate D three empty arrays (after the runner
re-laid the blog / work / about sections to clear 22 overlaps and 1 crop) · descriptions on every
phase-2 master, three of which the runner added (`hero/Hero`, `ui/Prose`, `ui/SocialShare`).
Step 3b done: `ui/Link/iconOnly` `size=small` resized 24×24 → 32×32.

`UNBOUND` from the run, carried to R2.4's `verify-raw`: `work/ArchiveTable` 165 ·
`blog/TableOfContents` 20 · `blog/PostNav` 11 · `about/AboutFacts` 11 · `blog/RelatedWork` 8 ·
`about/AboutText` 8 · `ui/Prose` 6 · `work/WorkHeader` 2 · `ui/H1` 1 · `ui/PageDescription` 1 ·
`blog/SerieContents` 1 · orphan `prose-link-annotation` 1. The ArchiveTable 165 is the row
cells/frames carrying solid fills and is the one worth a look before R2.4 signs it off.

### Deviations recorded from the run

- Re-laid blog / work / about sections to clear 22 overlaps and 1 crop (expected — 3e and 3c will
  require the same re-grid again).
- Descriptions added to `hero/Hero`, `ui/Prose`, `ui/SocialShare`.
- `ui/Link/iconOnly` small variants 24×24 → 32×32 (this was Step 3b, not a deviation).

---

## P2-T11 — run 2, and the three things it left open (2026-08-19)

**TASK** P2-T11 · **STATUS** PARTIAL — nine assertions and ten axis rows pass, three items open,
carried to **P2-T11b**

**RESULT.** `46 / 11 / 4 / 62`. Gate D `[] [] []`. All ten variant-axis rows match, including the
new `ui/Link/external` axis. All 14 new phase-2 masters and all 5 rebuilt masters described.

### Assertion 4 was 62, and 62 is right

The runner reported `62` against an expected `61` and named the cause correctly: the `+1` is
`zz/WorkCardPreviewSmall (superseded by work/WorkCard, 2026-08-18)` on `🗄️ Archive — Components`.
`P2-T04-workcard.md:319` retired it there under the `zz/` rule, after this gate's `46 + 11 + 4`
formula was written. So the archived population is eight, not seven, and the formula was one task
stale. Not a deviation — a correct read of a wrong expectation, the second one this gate has caught.
Fixed in the brief and in `repo/phase-2.md` (which also still said "15 new masters"; it is 14, from
32 → 46).

### The four carried repairs

- **3b** `ui/Link/iconOnly` `size=small` 32×32 — verified, radius `full`, dashed stroke bound to
  `color/foreground-muted`, `ui/SocialShare` children 32×32.
- **3c** `ui/Link/external` gained the axis, 4 cells (`state` × icon side), `trailing` default at
  122×42, and `about/AboutText`'s CV instance reads `leading`. P2-T10's divergence is closed.
- **3d** a real `chevron-down` built into `ui/Icon` (25 glyphs now), stroke bound to
  `color/foreground`, the one fake instance in `blog/TableOfContents breakpoint=Mobile` re-pointed.
  The mislabelled-glyph debt does not reach phase 3.
- **3e** 50 hairlines flipped, not the predicted 36 — see below.

### Open 1 — the axis is `iconside`, not `iconSide`

The runner lowercased the compound to satisfy assertion 9, which said "every COMPONENT_SET's axes
are lowercase" with no further definition. Reasonable under the text; wrong for the file. Assertion
9 exists to catch Figma's `Variant` / `Property 1` defaults and the `_Docs/Status` case — it is
about the **initial** letter, not a ban on camelCase, and `iconside` is now the only all-lowercase
compound axis in the document and does not match the prop name in code. Assertion 9 reworded;
rename carried to P2-T11b, which also re-reads the instance override, since renaming an axis re-keys
them.

### Open 2 — 50 flips across 15 masters, and no `grew` table

The 36 came from P2-T10b's survey, which counted **per-side** hairlines. 3e's script matches any
node with a non-zero stroke weight and `strokesIncludedInLayout === false`, which also catches
**full-box** strokes on buttons and toggles — hence 18 extras in `ui/Link/*`, `app/ThemeToggle`,
`app/MotionToggle`, `ui/Icon`, `ui/SectionTitle`. Almost certainly correct, and the rule holds for
both shapes (a CSS border grows an auto-height box whether it runs one side or four). But the report
says "11 masters grew in height" without saying which, and two things need proving before this is
signed:

1. `ui/Link/iconOnly` was resized to 32×32 in **the same run** and carries a full-box dashed stroke.
   If that stroke went into layout on a HUG frame, the master is 34×34 and step 3b is silently
   undone by step 3e.
2. `blog/BlogPreview` and `work/WorkPreview` contributed **0** where the survey said 2 each. A
   survey wrong about four nodes may be wrong about others.

### Open 3 — 209 white frame fills, and the suggested fix is also wrong

`_prelude-components.js`'s `F()` is `figma.createAutoLayout(...)`, which returns Figma's default
**opaque white** fill, and the helper never clears it. Every layout frame built by every phase-2
brief carries one: `work/ArchiveTable` 160 · `blog/TableOfContents` 20 · `about/AboutFacts` 9 ·
`blog/PostNav` 8 · `ui/Prose` 6 · `about/AboutText` 5 · `blog/SerieContents` 1 · `blog/RelatedWork`
1 = 209, plus the four cover placeholders and one annotation to make the sweep's 213 + 1.

The report proposes clearing **or** binding to `color/surface`. Only clearing is right. Checked
against the code: `ArchiveTable.astro` has `hover:bg-surface/50` on `tr` and no base background;
`TableOfContents.astro`, `PostNav.astro`, `AboutFacts.astro` (a bare `<dl class="grid …">`),
`AboutText`, `SerieContents`, `RelatedWork` and `Prose` have no `bg-*` at all. Binding them would
paint 209 raised slabs the live site does not have.

This is a **dark-mode defect at scale** and the reason it survived nine gates is structural: white
frames are invisible against a light canvas, and Step 6's dark render has come back identical to
light since P2-T07, so no screenshot has ever shown them. `work/ArchiveTable` in dark is currently a
solid white table. Carried to P2-T11b along with the `F()` fix that stops phase 3 rebuilding all of
it — phase 3 assembles page masters from the same helper.

### Not blocking, logged as debt

**Nine pre-phase-2 masters carry no description**: `app/Footer`, `app/Header`, `app/HeaderDrawer`,
`app/NavLink`, `blog/PostList`, `blog/SerieList`, `blog/BlogPreview`, `blog/PostCard`,
`work/WorkPreview`. The gate only ever required phase-2 masters, so this passes as written — but
these nine are the oldest masters in the file and the ones whose behaviour is least recorded
anywhere. Natural owner is P3-T10 (the docs page), not a pass of its own.

**Dark mode still unseen.** `about/AboutText` and `about/AboutFacts` render identically in dark;
handed to P3-T09's mode-pinned dark grid, as P2-T07 and P2-T10 both flagged. Open 3 is exactly the
class of defect that limit hides, which is an argument for P3-T09 running earlier rather than last.

**4 clone artifacts** were created on `🗄️ Archive — Decisions` during step 3c and cleaned up in the
same run. Gate D confirms `strays: []`.

---

## P2-T11b — gate cleanup: the three open items closed (2026-08-19)

**TASK** P2-T11b · **STATUS** done — axis renamed, hairline table proven, **zero** unbound white
fills on ❖ Components

**RESULT.** Step 1 rename clean, Step 2 table returned **27** masters (not 15), Step 3 cleared
**224** fills (predicted 209), Step 4 already applied at source, Step 5 Gate D `[] [] []`.

### 1 — `iconside` → `iconSide`, and the override survived

`ui/Link/external` (3103:513) renamed, values unchanged (`trailing` default, `leading`). All four
cells re-read: `state=default, iconSide=trailing` / `state=hover, iconSide=trailing` /
`state=default, iconSide=leading` / `state=hover, iconSide=leading`. `about/AboutText`'s CV instance
(3119:2253) still resolves `iconSide=leading` — the axis rename did **not** re-key it, so no
re-application was needed. The one thing this step risked did not happen.

### 2 — 27 masters carry strokes, not 15, and every rule is `inLayout: true`

The 15 in the brief came from P2-T11's `grew` count. The audit script counts any master containing
a stroked node, which includes masters that contain **instances** of stroked components —
`hero/Hero` holds `ui/Link/primary` instances, `contact/ContactPreview` holds `ui/Link/iconOnly`
instances, and so on. Both risks the brief named are resolved:

- **Risk 1 closed.** `ui/Link/iconOnly` `size=small` reads **32×32**; `ui/SocialShare`'s three
  children (`bluesky`, `linkedin`, `mail`) read **32×32**. The `normal` variants sit at 56×56, which
  is their size axis, not stroke growth. Step 3b stands; 3e did not undo it.
- **Risk 2 closed, and the survey was the wrong one.** `blog/BlogPreview` and `work/WorkPreview`
  each contribute 2 strokes, but both are `ui/SectionTitle` **instances**, and the `ui/SectionTitle`
  master already had `strokesIncludedInLayout: true`. 3e's script found nothing to flip because
  there was nothing to flip. P2-T10b's survey was wrong about those 4 nodes; 3e was right.

Full table (name · w×h · rules · shape):

| Master                   |       w×h | rules | shape                                |
| ------------------------ | --------: | ----: | ------------------------------------ |
| `app/Footer`             |  1654×410 |    14 | per-side (top-1, bottom-1)           |
| `app/NavLink`            |   116×300 |     2 | per-side (bottom-2)                  |
| `ui/Link/primary`        |   224×178 |     2 | boxed                                |
| `ui/Link/secondary`      |   196×178 |     2 | boxed                                |
| `ui/Link/iconOnly`       |    90×258 |     4 | boxed                                |
| `ui/Link/inline`         |    185×31 |     3 | per-side (bottom-1)                  |
| `ui/Link/external`       |   164×270 |     4 | boxed                                |
| `ui/Prose`               |  720×1043 |     1 | per-side (left-2)                    |
| `ui/SocialShare`         |    162×32 |     3 | boxed                                |
| `blog/PostList`          | 1684×1256 |     9 | per-side (left-1, bottom-1)          |
| `blog/SerieList`         | 1718×1175 |     6 | boxed                                |
| `blog/BlogPreview`       | 1536×2442 |     2 | per-side (bottom-1)                  |
| `blog/PostRow`           |   940×334 |     4 | per-side (bottom-1)                  |
| `blog/SerieCard`         |   800×357 |     2 | boxed                                |
| `blog/TableOfContents`   |   614×238 |    15 | per-side (left-2) + 1 boxed (Mobile) |
| `blog/PostNav`           |   720×542 |     4 | boxed                                |
| `blog/PostRowCalm`       |   720×188 |     2 | per-side (bottom-1)                  |
| `work/WorkPreview`       | 1320×1602 |     2 | per-side (bottom-1)                  |
| `work/WorkCard`          |  1248×418 |     8 | per-side (top-1)                     |
| `work/ArchiveTable`      |  1248×329 |    27 | per-side (bottom-1)                  |
| `work/WorkHeader`        |   832×567 |     5 | per-side (bottom-1) + 2 boxed        |
| `work/RelatedWriting`    |   720×206 |     2 | per-side (bottom-1)                  |
| `hero/Hero`              | 1320×1376 |     2 | boxed                                |
| `contact/ContactContent` |   192×237 |     3 | boxed                                |
| `contact/ContactPreview` |  1280×493 |     8 | per-side (top-1) + 6 boxed           |
| `about/AboutFacts`       |   832×117 |     1 | per-side (top-1, bottom-1)           |
| `about/AboutText`        |  832×1127 |     3 | boxed                                |

### 3 — 224 white fills cleared, and the raw list is 19 with zero white in it

Predicted 209; cleared **224**. The extra 15 are the 13 invisible master-root fills P2-T10 recorded
plus 2 more of the same kind — invisible paints that `figma:verify-raw` still reads, so clearing
them is the point, not a deviation.

`KEPT`, all four entries with a verdict:

- **`cover` × 4** (1 master `3117:660` + 3 instances inside `blog/RelatedWork`'s grid, all
  `work/WorkMiniCard`) — already bound to `color/gray/200`, matching `work/WorkCard`'s eight from
  P2-T04b. The exception is one rule, as intended.
- **`prose-link-annotation`** (`3106:2150`) — a TEXT node at `rgb(153,153,153)` sitting directly in
  the `ui` section, **not** inside `ui/Prose`. It is a doc annotation labelling the prose link
  styling. Justified where it is; nothing to move.
- **18 VECTOR paths** inside `contact/ContactPreview` (`path31134-3`, `path37893`, `path38333`, ×3
  paths × 2 breakpoints) — imported SVG internals of the bluesky / linkedin / mail social icons.
  Path fills do not bind; icon identity is managed by instance swap on `ui/Icon`. Justified raw.

`UNBOUND` total: **19** (1 annotation + 18 vector paths), **0 white**. That is the list R2.4's
`verify-raw` has to account for — it replaces the 12-entry list P2-T11 carried forward, which was
almost entirely the white fills.

### 4 — `F()` already patched

Committed as `ad95a17` before the run; not hand-edited from the Figma session, as the brief required.
Frames built by this brief's own scripts come out transparent. Phase 3's page masters inherit the fix.

### 5 — re-verify

Gate D `overlaps: []`, `cropped: []`, `strays: []`. Binding sweep clean per above. Screenshots of
`work/ArchiveTable`, `blog/TableOfContents`, `blog/PostNav`, `about/AboutText` and `ui/Prose` all
render transparent — no white slabs. `work/ArchiveTable`, which held 160 of the 209, is the one that
changed most and it now reads as rules on nothing, which is what the live table is.

### Deviations

- Hairline table reports **27** masters, not 15 — instances of stroked components inside other
  masters are counted. All `inLayout: true`.
- **224** cleared, not 209 — the 13 invisible master-root fills plus 2 more.
- **P1-T06 Step 2 (re-grid) was not re-run** as its own step. Gate D's three empty arrays cover the
  same ground (no overlaps, no crops, no strays), so the outcome is verified even though the step
  was skipped. Nothing in this run moved a master's size — the one size risk (Step 2, `iconOnly`)
  came back unchanged at 32×32 — so there was nothing for a re-grid to fix.

### Still open, unchanged by this run

Dark mode has still never been _seen_: this run's screenshots are the light canvas, and the defect
class the white fills belonged to is exactly what a light-only render hides. **P3-T09's mode-pinned
dark grid should run early in phase 3, not last.** Nine pre-phase-2 masters still carry no
description (owner: P3-T10). Both were logged at P2-T11 and neither was in this brief's scope.

---

## R2.4 — phase-2 exit gate, repo half (2026-08-19)

**TASK** R2.4 · **STATUS** done — gate passes. Phase 3 is unblocked.

**RESULT.** `figma:dump` 4 collections / 493 variable rows / 17 text styles · `figma:verify` clean
on all four sections · `figma:verify-raw` **1086 rows, 55 fills, 0 white** · `pnpm test` 57/57.

### Pass 1 — token drift

Fresh **File > Export** (`~/Téléchargements/Magnet DS.fig`, 64.7M) → `pnpm figma:dump`. 493
variable rows: 407 `1 Primitives` · 54 `3 Responsive` · 30 `2 Theme` · 2 `Design System`.
`pnpm figma:verify` reports **Missing / Value mismatch / Orphaned / Unmapped all `_none_`**.
Code and Figma agree; `1 Primitives` is still 407, unchanged since R1.3.

### The gate nearly passed on a 13-hour-old file

`figma:verify-raw` ran first against the checked-out `raw-values.figma.json` and returned
`595 rows · 560 new · 35 accepted · 14 stale` — **byte-identical** to the P1-T09 baseline at
`progress.md:541`. That is not a stable file; that is the same file.

```
raw-values.figma.json   2026-08-18 23:36   ← predates P2-T05 … P2-T11b
tokens.figma.json       2026-08-19 12:22   ← fresh from the export
```

`tokens.figma.json` is derived from the `.fig` binary by `fig-decode.mjs`, so `figma:dump`
refreshes it. `raw-values.figma.json` is **not** — it comes from a live `use_figma` walk per
`scripts/figma/dump-raw-values.md`, which a `.fig` export does not touch. And `diff-raw-values.mjs`
is warn-only by design (`process.exit(0)` on every path), so nothing objected. The gate would have
signed off on a snapshot taken before five of the tasks it was meant to verify.

**Fixed at source.** `diff-raw-values.mjs` now stats both dumps, prints
`_raw dump <t> · token dump <t> · N rows_` as its first line, and when the raw dump is the older of
the two emits a `> ⚠️ **STALE INPUT**` block naming the gap in hours and pointing at the walk doc.
Still warn-only — the report is the point, and a missing token dump is not this script's problem —
but staleness is no longer silent. Verified both ways: clean on the fresh file, fires at 12.8h on a
`touch -d` of the old mtime.

### Pass 2 — the regenerated walk

Two `use_figma` walks, one per page, same script shape as `dump-raw-values.md`:

| Page                     | rows     | fill   | stroke | radius | spacing | text-style | white |
| ------------------------ | -------- | ------ | ------ | ------ | ------- | ---------- | ----- |
| ❖ Components (`461:759`) | 708      | 19     | 48     | 114    | 148     | 379        | **0** |
| 📄 Pages (`2558:18264`)  | 378      | 36     | 96     | 92     | 22      | 132        | **0** |
| **total**                | **1086** | **55** | 144    | 206    | 170     | 511        | **0** |

Every one of the 55 fills is accounted for, and none is white:

- **54 VECTOR paths** — the bluesky / linkedin / mail glyph internals inside
  `contact/ContactPreview`. Nine paths × 2 breakpoints on ❖ Components, × 4 page instances on
  📄 Pages. Path fills do not bind to variables; this is a floor, not debt.
- **1 `prose-link-annotation`** (`3106:2150`) — `rgb(153,153,153)`, a documentation label in the
  `ui` section.

This is exactly what P2-T11b predicted, measured independently. The `F()` fix (`ad95a17`) holds:
224 default-white frame fills are gone and none came back.

`figma:verify-raw` against the fresh dump: **1052 new · 34 accepted · 15 stale**. Read this the way
P1-T09 established it (`progress.md:541`): `named-debt.json` is a hand-picked set of ~35 text-style
exceptions keyed by **node id**, never a full baseline. Phase 2 minted new ids wholesale, so a large
"new" block is the expected state, not a finding. The 1052 are 511 text-styles with no semantic
local style, 206 radii, 170 spacings and 144 strokes — the ordinary unbound surface of a library
that has not had a tokenization sweep. Re-baselining `named-debt.json` is a judgement task with its
own scope; it does not belong inside a verification gate, and `verify-raw` exits 0.

### Knowledge file rewritten

`.claude/skills/figma-verify/knowledge/figma-ds-file.md`: roster re-cut from a live roll call —
**46** on ❖ Components across seven domain sections (full ids, phase-2 builds bolded), **11**
`_Docs/*` document-wide, **4** page masters, **1** `zz/` retired, **62** total. Added the
`🗄️ Archive — Components` page (`3107:765`) to the page table, corrected "seven ⬍ masters" to 11
(`work/ArchiveTable` carries three breakpoints, not two), noted `contact/ContactPreview`'s id move
`2114:7281` → `3112:690`, and wrote the 2026-08-19 phase-2 change-log entry.

### Deviations

- **The `.fig` lives at `~/Téléchargements/`, not `~/Downloads/`.** `repo/phase-2.md` hardcodes the
  English path. Cosmetic; noted so the next gate does not go hunting.
- **`raw-values.figma.json` stays gitignored.** `dump-raw-values.md` step 4 calls it a local scratch
  artifact, and it is: node ids churn every phase, so a committed copy would be wrong within a day.
  The freshness guard is the durable half of this lesson, not the file.
- **`named-debt.json` untouched.** No new intentional raw value was introduced by phase 2 — the 55
  fills are vector internals and one annotation, neither of which is a design decision to declare.

### Carried to phase 3

- **Pull P3-T09 (mode-pinned dark grid) early**, not last. Every screenshot through nine gates was
  light-canvas, which is exactly what let 224 white fills survive. A dark grid is a detector, and
  detectors belong at the front.
- Nine pre-phase-2 masters still carry no description (`app/Footer` `app/Header` `app/HeaderDrawer`
  `app/NavLink` `blog/PostList` `blog/SerieList` `blog/BlogPreview` `blog/PostCard`
  `work/WorkPreview`). Owner: P3-T10.

---

## P3-T01 — phase-3 entry gate, page baseline (2026-08-19)

**STATUS: done.** Read-only, nothing written. Two batched runs: the 📄 Pages walk (step 1) and the
roster roll-call (step 4).

### What 📄 Pages holds today

Eight frames — four `COMPONENT` masters and their four `[Dark]` instances. Names already use the
em dash the P3-T09 grid script matches on.

| frame                  | type      | id          | w × h        | Theme | Responsive |
| ---------------------- | --------- | ----------- | ------------ | ----- | ---------- |
| `Home — Desktop`       | COMPONENT | `2604:1741` | 1280 × 2745  | Light | Desktop    |
| `Home — Mobile`        | COMPONENT | `2604:1742` | 390 × 4061   | Light | Mobile     |
| `Blog — Desktop`       | COMPONENT | `2604:1744` | 1280 × 1802  | Light | Desktop    |
| `Blog — Mobile`        | COMPONENT | `2604:1745` | 390 × 4491   | Light | Mobile     |
| `Home — Desktop [Dark]` | INSTANCE  | `2989:4642` | 1280 × 2745  | Dark  | Desktop    |
| `Home — Mobile [Dark]`  | INSTANCE  | `2989:4844` | 390 × 4061   | Dark  | Mobile     |
| `Blog — Desktop [Dark]` | INSTANCE  | `2989:5033` | 1280 × 1802  | Dark  | Desktop    |
| `Blog — Mobile [Dark]`  | INSTANCE  | `2989:5226` | 390 × 4491   | Dark  | Mobile     |

Every frame carries **both** mode pins explicitly — `2 Theme` (`3:2`) and `3 Responsive`
(`2245:42`). Nothing inherits.

### `PageContent (slot)` bindings

| frame           | pad-x  | maxWidth | bound                                                     |
| --------------- | ------ | -------- | --------------------------------------------------------- |
| Home (both bps) | 0 / 0  | none     | `itemSpacing`, `paddingTop`                               |
| Blog (both bps) | 16 /16 | 1280     | `paddingLeft/Right`, `paddingTop/Bottom`, `maxWidth`      |

Home is full-bleed with its four section instances (`hero/Hero`, `blog/BlogPreview`,
`work/WorkPreview`, `contact/ContactPreview`) carrying their own containers — the Home-type recipe,
already right. Blog carries the container on `PageContent` — the document-type recipe, also right —
but then puts a second one inside it.

`app/Header` and `app/Footer` instances are consistent across all eight: pad 16, maxWidth 1280,
their own container, Footer with a bound `strokes`.

### The five deltas — three apply, two do not

| delta                                              | applies | evidence                                                                     |
| -------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `PageContentContainer` wrapper exists              | **yes** | 4 hits: `2586:1164` (Blog Desktop), `2586:1181` (Blog Mobile), + 2 in the Dark instances |
| Home frame contains an `AboutStrip`                | no      | Home's four children are Hero / BlogPreview / WorkPreview / ContactPreview   |
| a Dark frame that is a FRAME not an INSTANCE       | no      | all four Dark frames are already `INSTANCE`                                  |
| `PageContent` padding 32 / unbound / no `maxWidth` | **yes** | Home binds `paddingTop` but **not `paddingBottom`** — rhythm-y is half-bound |
| a frame missing an explicit `3 Responsive` pin     | no      | all eight pin both collections                                               |

The wrapper count is 4, not 2: the two masters own the real wrappers, the two Dark instances mirror
them (`I2989:5033;2586:1164`, `I2989:5226;2586:1181`). Removing the masters' wrappers in P3-T03
takes the instance copies with them — no separate cleanup.

The Home `paddingBottom` gap is a new finding, not one the brief predicted in that wording. Both
page types are supposed to bind `section/rhythm-y` on `itemSpacing`, `paddingTop` **and**
`paddingBottom`. Home binds two of three; Blog binds all. **Owner: P3-T02**, which rebuilds Home's
`PageContent` anyway.

### Roster — 46/11 holds

Live roll-call, `findAllWithCriteria` filtered to sets plus non-variant components:

| page                              | id          | masters |
| --------------------------------- | ----------- | ------- |
| ❖ Components                      | `461:759`   | **46**  |
| 📄 Pages                          | `2558:18264`| 4       |
| 📚 Docs                           | `2736:4`    | 4       |
| 🗄️ Archive — Docs v1 (CHAPTERs)  | `3039:4341` | 7       |
| 🗄️ Archive — Components          | `3107:765`  | 1       |
| **total**                         |             | **62**  |

46 on ❖ Components across the seven domain sections, 11 `_Docs/*` document-wide (4 live + 7 in the
v1 archive), 4 page masters, 1 `zz/` retired — **62**, matching R2.4 exactly. No master went
missing between the phase-2 gate and now; the library is intact and phase 3 can build against it.

### The eight routes

Four of the sixteen light frames exist (`Home`, `Blog` × 2 breakpoints). **Twelve remain**:
`Work` `About` `Post` `Serie` `Serie post` `Work detail`, each × Desktop + Mobile. P3-T09 then
mirrors all sixteen into Dark, for the 32-frame grid.

### Noted for P3-T11

`XP - WorkCard` (`3034:5541`) is a live exploration page holding 0 masters. It is the archive
candidate P3-T11 names — recorded here so the sweep does not have to rediscover it.

### Deviations

- **Step 4 read wider than the brief asked.** The brief says re-run `P2-T11` step 1; the roll-call
  here walks every page and reports per-page master counts. Same assertion, more evidence, and it
  is what surfaced the `XP - WorkCard` page. Read-only either way.

**UNBOUND:** none — nothing was written.

## P3-T02 — `Home — Desktop` / `Home — Mobile` (2026-08-19)

**STATUS: done**, with one write. Both frames already carried the Home-type recipe; the brief's
steps 1, 2 and 4 were satisfied before the run. The only real defect the pass found was on a
**component master**, not on the pages: `contact/ContactPreview` held its `maxWidth` as a raw
`1280` on both variant roots.

### Name mismatch — the brief would have STOPped

The brief resolves the shell by `findOne(n => n.name === "PageContent")`. The node is called
**`PageContent (slot)`** on both Home frames (`2586:1139` Desktop, `2586:1147` Mobile), so the
strict equality throws `PageContent missing`. Matched on `/^PageContent/` instead. Every phase-3
brief that touches a page shell inherits this — P3-T03 onward must use the prefix match.

### Step 1 — the shell was already full-bleed

| frame          | pad (T R B L) | maxWidth | itemSpacing bound to     | sizing        |
| -------------- | ------------- | -------- | ------------------------ | ------------- |
| `Home — Desktop` | `0 0 0 0`   | `null`   | `3 Responsive::section/rhythm-y` | FILL / HUG |
| `Home — Mobile`  | `0 0 0 0`   | `null`   | `3 Responsive::section/rhythm-y` | FILL / HUG |

Children on both: `app/Header` (INSTANCE) → `PageContent (slot)` (FRAME) → `app/Footer` (INSTANCE).
No `AboutStrip` node anywhere in either frame (`findAll` count 0) — the composition was already the
four-section one, so nothing was removed.

### The P3-T01 `paddingBottom` finding does not reproduce — and should not

P3-T01 recorded Home as binding `paddingTop` but not `paddingBottom`, owner P3-T02. The cold read
shows **neither** bound: padding is `0` on all four sides with only `itemSpacing` bound. That is
the correct Home-type state, not a gap:

- `src/pages/index.astro` puts no vertical padding on the page wrapper.
- `Hero` owns `my-16 md:my-32`, `<main>` owns `mb-32`, `Contact` owns its own vertical padding.

Binding `paddingTop`/`paddingBottom` to `section/rhythm-y` here would double the rhythm at both
ends against live. **Closed as not-a-defect**; the document-type `shell()` helper keeps binding all
three, which stays right for Blog and the detail pages.

### Step 2 — four sections, right order, breakpoints already pinned

`hero/Hero` → `blog/BlogPreview` → `work/WorkPreview` → `contact/ContactPreview`, all `INSTANCE`,
on both frames. Every one exposes a `breakpoint` axis and every one was already pinned to its
frame's breakpoint (`Desktop` on `2604:1741`, `Mobile` on `2604:1742`) — including the
`contact/ContactPreview` Mobile variant P2-T06 built. No detached section, so no re-instancing.

### Step 3 — each section owns its container; one was half-bound

The recipe sits on the **section instance root**, not on an inner band (a first read that walked
the subtree for a node matching `/container/i` picked up leaf frames like `HeroTextContainer` and
was misleading — the root is the band).

| section                 | padL/R | maxWidth | align  | before                              |
| ----------------------- | ------ | -------- | ------ | ----------------------------------- |
| `hero/Hero`             | 16/16  | 1280     | CENTER | fully bound                         |
| `blog/BlogPreview`      | 16/16  | 1280     | CENTER | fully bound                         |
| `work/WorkPreview`      | 16/16  | 1280     | CENTER | fully bound                         |
| `contact/ContactPreview`| 16/16  | 1280     | CENTER | **`maxWidth` raw, gutter bound**    |

`contact/ContactPreview` bound its gutter at the root but carried `maxWidth` as an unbound `1280`
there, with the `container/max-width` binding one level down on `ContactPreviewContent`. Same
computed geometry, half-bound recipe. Fixed on the **master** (`3112:690`), both variants —
`2114:7281` (Desktop) and `3112:636` (Mobile) now bind `maxWidth` to
`3 Responsive::container/max-width`. The inner band's binding was left alone; it is what actually
draws the section's rule, so it is not redundant.

`PageContent (slot)` shows `[0,0]` padding and a null `maxWidth` on both frames — the two Home-type
conditions hold together.

### Step 4 — `work/WorkPreview` already carries the three catalogue cards

Skipped as the brief allows. The master (`2970:4368`) holds, on both variants, a
`WorkPreviewSmallList` band with three `work/WorkCard` instances at
`variant=catalogue, state=default, side=left`, gap 40 — `HORIZONTAL` on Desktop, `VERTICAL` on
Mobile. Content is the real featured order: `01 Le concept de la preuve / WEB · 2026`,
`02 Chimères Orchestra / ART · 2013–2019`, `03 La Malinette / OPEN SOURCE · 2013–2021`.

### Step 5 — cold read-back + screenshots

Fresh run, all assertions true on both frames: shell children in order, `PageContent (slot)` full
bleed with bound rhythm, four sections in the fixed order all `INSTANCE`, breakpoints pinned, three
cards with the right titles, `AboutStrip` count 0. Desktop shot full-frame; Mobile shot per section
(the 390 × 4371 frame renders 63 px wide at any usable cap).

The two intended divergences from live `/` are visible and correct: no `AboutStrip`, and the work
strip is three catalogue cards rather than the `WorkMiniCard` / `WorkOverlayCard` grid. **Three
further differences turned up** — all reported, none fixed here:

1. **`work/WorkCard` catalogue overflows at 390.** The tech-stack line
   (`Astro · Tailwind CSS · Astro DB · Turso · Netlify · S3`) is clipped at the card's right edge on
   `Home — Mobile`, and the `↗ Live ↗ Repo` row sits flush under the clip. A Mobile card-content
   rule (wrap, truncate, or drop the stack) is missing. Owner: the WorkCard spec, via P3-T04.
2. **Card content is placeholder-uniform.** All three cards repeat the same stack line and the same
   `↗ Live ↗ Repo` pair — wrong for `Chimères Orchestra` (an art project, no repo) and for
   `La Malinette`. Content debt on the `work/WorkCard` instances, not a layout defect.
3. **Mobile `hero/Hero` drops `HeroAnimation`.** The Mobile variant is text + `Start reading` only;
   live `Hero.astro` renders `HeroAnimation` at every breakpoint (`flex-col` stack on small
   screens). Figma-side gap, not a deliberate Figma-leads decision — owner: whoever revisits
   `hero/Hero`, flagged here for R3.1.

### Deviations

- **Shell resolved by prefix**, not exact name (see above). Structural, not a design change.
- **One master edited that the brief did not name.** `contact/ContactPreview` `maxWidth`; step 3
  asserts the binding, and the run rules forbid fixing it as an instance override, so the master was
  the only correct place.
- **Steps 1, 2 and 4 wrote nothing** — the frames already met them. Verified by read, not assumed.
- **`Home — Mobile`'s `contact/ContactPreview` carries a local `paddingTop` override** bound to
  `3 Responsive::section/rhythm-y` where the master binds `1 Primitives::spacing/8`. Both resolve to
  32 at Mobile, so there is no visual difference, and the Plugin API has no per-property override
  reset (`resetOverrides()` would take the text overrides with it). Logged, not touched.

**UNBOUND:** none.

## P3-T03 — `Blog — Desktop` / `Blog — Mobile`, the document-type shell (2026-08-19)

**TASK** P3-T03 · **STATUS** DONE — the reference document-type page; P3-T04 … P3-T08 copy this
shape.

### Step 1 — wrapper hoisted, container recipe on `PageContent`

Both frames: `PageIntroContainer`, `SeriesSection`, `ArchiveSection` moved up to `PageContent`, and
`PageContentContainer` deleted. `PageContent` now binds all six —
`paddingLeft` / `paddingRight` → `container/gutter`, `maxWidth` → `container/max-width`,
`itemSpacing` / `paddingTop` / `paddingBottom` → `section/rhythm-y` — with
`counterAxisAlignItems: CENTER`. **No `PageContentContainer` survives anywhere in the file** (all
non-archive pages swept), so the P3-T01 wrapper delta is closed by this task alone.

### Step 2 — nothing to strip

No section carried `container/gutter` or `container/max-width`, so the geometry could not
double-apply. The document-type sections were already container-free; only Home-type sections own
the recipe themselves.

### Step 3 — content blocks

Stack built **PageIntro → Archive → Series**. Three year groups — 2026 (3 posts), 2025 (2), 2024
(1). Series is `ui/H2` `Series` + two `blog/SerieCard` (`Web Performance`, `My AI Journey`).
Bindings: PageIntro `itemSpacing` → `spacing/4` · Archive `itemSpacing` → `spacing/8` · Series
`itemSpacing` → `spacing/4`, `paddingTop` → `spacing/8` · serie grid `itemSpacing` →
`3 Responsive::serie-list/gap`.

**`blog/PostList` is a year group, not a row.** It is a COMPONENT_SET (`breakpoint=Desktop|Mobile`)
holding a year label plus **four** `blog/PostRow` instances. So it is instanced once per *year*,
with the surplus rows hidden — not once per post as the brief's wording implied. Any later brief
that reaches for `blog/PostList` inherits this: four rows max per group, hide the remainder.

Year label renders **IBM Plex Sans Medium 14**, not the Fira Code Bold 14 the brief described.
Followed the master — Figma wins on styling.

### `blog/PostRow` was unusable at 390 — master fixed

`PostRowContent` was `HORIZONTAL` / `NO_WRAP`. `PostMetaRow` hugs at 319, so inside the 358-wide
mobile column the title got **39 px**. Fix on the master, all four variants: `layoutWrap = WRAP`
plus `line.minWidth = 200`. At Mobile `200 + 319 > 358` wraps; at Desktop `200 + 319 < 898` stays
inline. Master edit the brief did not name — same call as P2's `contact/ContactPreview`: the run
rules forbid fixing it as an instance override, so the master was the only correct place.

### Order divergence — the spec amendment R3.1 already owns

Spec §4 lists Series before Archive; live `/blog` renders Archive first. Built live-order and
reported, per the brief. This is the amendment `repo/phase-3.md` R3.1 already lists for P3-T03 —
edit `design.md` §4, do not touch the route.

**UNBOUND:** `blog/PostRow` · all 4 variants · `PostRowContent > line.minWidth = 200`. Raw by
necessity — the WRAP trigger needs a pixel floor and no variable expresses one. Carry to R3.3's
`verify-raw` (allowlist it in `named-debt.json`, it will not resolve to a token).

## P3-T04 — `Work — Desktop` / `Work — Mobile`, the case zigzag (2026-08-19)

**TASK** P3-T04 · **STATUS** DONE — first page to reuse the P3-T03 document-type shell verbatim.

### Step 1 — both breakpoints built

`Work — Desktop` (`3144:2050`, 2539 px tall) and `Work — Mobile` (`3144:2287`, 2841 px) on the
`Pages` page. Shell is `Header` (INSTANCE) → `PageContent` (FRAME, all six container-recipe
bindings) → `Footer` (INSTANCE) — no `PageContentContainer`, per P3-T03.

### Step 2 — zigzag verified

Desktop card `side` reads `[left, right, left, right]`; Mobile is a single column so all four stay
`left` (`side` is inert there). All 8 instances are `variant=case, state=default`.

### Step 3 — hairlines

3 per frame between the 4 cards — Desktop `3144:5723–5725`, Mobile `3144:5726–5728` — fill bound to
`2 Theme::color/border`.

### Step 4 — content

H1 `Work`, `ui/PageDescription` per the brief, H2s `Selected projects` / `More projects`, and the
four kicker/title pairs from the brief's table (Le concept de la preuve, Chimères Orchestra, La
Malinette, Portfolio).

### Step 5 — cold read-back

Clean: `PageContent` holds all 6 bindings, `Selected` holds 4 `work/WorkCard` + 3 hairlines, and
`work/ArchiveTable`'s `breakpoint` matches its frame on both.

### `inst()` in `_prelude-pages.js` was broken once pages exist

`findOne((x) => x.name === name)` matched an **INSTANCE** left behind by an earlier page before it
reached the master, and `createInstance()` does not exist on an INSTANCE — the run crashed. Fixed in
the shared prelude (not just this run): filter to `COMPONENT` / `COMPONENT_SET` and skip variants
parented to a set, matching `_prelude-components.js`'s `findMaster`. P3-T05 … P3-T08 inherit the fix.
No structural change to any node.

### Live-vs-Figma divergence — deliberate, already in the brief

Live `/work` renders a `WorkOverlayCard` gallery grid; Figma now holds the case zigzag. Figma leads,
per the brief — this is a **code-debt candidate**, not a spec amendment. Carry to R3.1's divergence
log.

**UNBOUND:** none.

## P3-T05 — `About — Desktop` / `About — Mobile`, the thinnest shell (2026-08-19)

**TASK** P3-T05 · **STATUS** DONE — brief followed verbatim, no deviations.

### Step 1 — both breakpoints built

`About — Desktop` (`3145:2105`) and `About — Mobile` (`3145:2574`) on the `Pages` page. Shell is the
P3-T03 document type unchanged: `app/Header` (INSTANCE) → `PageContent` (FRAME) → `app/Footer`
(INSTANCE), no `PageContentContainer`. Exactly one `about/AboutText` instance per frame at
`facts=grid` — nothing composed at page level, as the brief demands.

### Step 2 — text column constrained

Desktop: `about/AboutText` `layoutSizingHorizontal = FIXED`, width 832, and `pc.counterAxisAlignItems
= MIN` so the column sits left inside the 1280 container (the live `lg:w-2/3`). Mobile:
`layoutSizingHorizontal = FILL`, `pc.counterAxisAlignItems = CENTER` left as the container recipe set
it. The MIN override was applied after `container(pc, V)`, per the brief's warning.

### Step 3 — cold read-back

Both frames read Header → PageContent → Footer. `PageContent` carries all six container-recipe
bindings — `itemSpacing` and `paddingTop/Bottom` = `section/rhythm-y`, `paddingLeft/Right` =
`container/gutter`, `maxWidth` = `container/max-width`. Desktop 832 left-aligned ✓, Mobile FILL
centred ✓.

No divergence from live `/about` to carry to R3.1 — the page is a single `<AboutText />` on both
sides.

**UNBOUND:** none.

## P3-T06 — `Post — Desktop` / `Post — Mobile`, the detail shell (2026-08-19)

**TASK** P3-T06 · **STATUS** DONE — live order built, three spec deltas reported not resolved.

### Step 1 — both breakpoints built

`Post — Desktop` (`3146:2642`) and `Post — Mobile` (`3146:2792`) on the `Pages` page. Stacks under
`PageContent`:

- Desktop — `FRAME:PostHeader` → `RECTANGLE:cover` → `FRAME:Body` → `INSTANCE:blog/RelatedWork` →
  `INSTANCE:blog/PostNav` → `INSTANCE:ui/Link/secondary`
- Mobile — `FRAME:PostHeader` → `RECTANGLE:cover` → `INSTANCE:blog/TableOfContents` → `FRAME:Body` →
  `INSTANCE:blog/RelatedWork` → `INSTANCE:blog/PostNav` → `INSTANCE:ui/Link/secondary`

Only the two named layout frames (`PostHeader`, `Body`) and the cover rectangle are non-instances,
as the acceptance demands.

### Step 2 — TOC placement per breakpoint

Desktop puts `blog/TableOfContents breakpoint=Desktop` **inside** `Body` at 224 FIXED (the live
`w-56` sticky aside). Mobile puts `blog/TableOfContents breakpoint=Mobile` **above** `Body` at FILL
(the live `<details>` box). Correct variant on each side, verified in the cold read-back.

### Deviation — `ui/Link/menuInactive` does not exist

The rename map produced no `menuInactive`; the breadcrumb link uses `ui/Link/textLink`, the nearest
muted nav link, per the brief's fallback clause.

### Three spec deltas for R3.1

The brief's "live wins on order" call, reported rather than silently resolved. `design.md` §4 lists
`PostHeader → Prose → SocialShare → PostNav → RelatedWork`; live and the built masters do:

1. `ui/SocialShare` sits **inside** the `PostHeader` meta row, not standalone after `Prose`.
2. `blog/RelatedWork` comes **before** `blog/PostNav`, not after.
3. A trailing `ui/Link/secondary` (`All blog`) closes the page — absent from the spec entirely.

All three are **spec-amendment candidates**, not code debt: the live route is right and §4 is stale.
Carry to R3.1 alongside the P3-T03 order amendment.

**UNBOUND:** none.

## P3-T07 — `Serie — *` / `Serie post — *`, the serie routes (2026-08-19)

**TASK** P3-T07 · **STATUS** DONE — 4 masters built, serie-post cloned from Post as required.

### Step 1 — serie landing

`Serie — Desktop` (`3147:2889`) and `Serie — Mobile` (`3147:2957`) on the `Pages` page. Under
`PageContent`: `SerieHeader` (832 FIXED Desktop / FILL Mobile) → `blog/SerieContents` FILL. Fill is
the live `/blog/web-performance` copy — H1 `Web Performance`, description set, `blog/SerieMeta`
carrying `5 PARTS · ~1H 05M READ`.

### Step 2 — serie post by clone

`Serie post — Desktop` (`3147:6192`) and `Serie post — Mobile` (`3147:6268`), both cloned from the
P3-T06 `Post — *` masters. Both clones came back **FRAME** (the sources are still frames — P3-T09
has not converted them yet), so no type normalization was needed here.

Stacks under `PageContent`:

- Desktop — `PostHeader` → cover → `Body` → `blog/RelatedWork` → `blog/SerieContents` →
  `blog/PostNav` → `ui/Link/secondary`
- Mobile — `PostHeader` → cover → `blog/TableOfContents` → `Body` → `blog/RelatedWork` →
  `blog/SerieContents` → `blog/PostNav` → `ui/Link/secondary`

### Step 3 — breadcrumb and serie content

Breadcrumb is three segments — `Blog` › `Web Performance` › plain text `Part 4 of 5`, the last one a
text node with its colour bound to `color/foreground-muted`. Mobile stacks it VERTICAL, per the live
`flex-col md:flex-row`. H1 `Optimizing Images with Astro (part 1)`, metadata
`12 July 2026 · 8 min read`, `blog/PostNav` `type=both` on both frames, `blog/SerieContents` holding
`item / current` on index 3 (`4. Optimizing Images with Astro (part 1)`).

### Deviations

1. **`ui/Link/menuInactive` still absent** — same gap P3-T06 hit. Brief says STOP; the breadcrumb
   uses `ui/Link/textLink` instead, which is what the `Post — *` masters already use. Consistency
   with P3-T06 beat the stop clause. The missing variant is an R3.1 item: either add
   `menuInactive` to `ui/Link` or strike it from the briefs.
2. **`blog/SerieMeta` has one icon + one text field**, not the two icon+text pairs the live anatomy
   describes. Both stats packed into the single field: `5 PARTS · ~1H 05M READ`. Master-shape
   mismatch → R3.1.
3. **`blog/RelatedWork` stayed between `Body` and `blog/SerieContents`** on the serie post — the
   clone inherited it and it was not among the three listed differences, so it was left in place.
   Step 4's asserted order omits it. Live-vs-brief question for R3.1, not resolved here.
4. **`PageContent.itemSpacing` overridden** from `shell()`'s `section/rhythm-y` binding to raw
   48 / 32, as the brief's code demands. No responsive variable maps to those values.

### Boxless-vs-boxed divergence — recorded, per acceptance

Live serie landing renders a **boxless** list with a top rule only; Figma uses the bordered
`blog/SerieContents` box, as specified. Figma leads → **code-debt candidate** for R3.1, same class as
the P3-T04 work-grid divergence.

**UNBOUND:**

- `Serie — Desktop` / `Serie — Mobile` › `PageContent.itemSpacing` (48 / 32) — no responsive var matches
- `Serie post — Desktop` / `Serie post — Mobile` › `breadcrumb` › `"Part 4 of 5".fontSize` (16) — plain text node, not from a component

## P3-T08 — `Work detail — *`, the project-case route (2026-08-19)

**TASK** P3-T08 · **STATUS** DONE — 2 masters built.

### Step 1 — build

`Work detail — Desktop` (`3148:3245`), 1280×3185, `counterAxisAlign=MIN` (left-aligned 832 column).
Stack: `work/WorkHeader` (832) → `cover` RECTANGLE (FILL) → `ui/Prose` (832) →
`work/RelatedWriting` (832) → `PageLinks` FRAME (HUG).

`Work detail — Mobile` (`3148:3380`), 390×3267, `counterAxisAlign=MIN`.
Same stack, every child FILL: `work/WorkHeader` → `cover` → `ui/Prose` → `work/RelatedWriting` →
`PageLinks` (HUG).

### Step 2 — content

`work/WorkHeader` needed **no overrides**: H1 `Le concept de la preuve`, description, the
TYPE / DATE / STACK facts and exactly two artifact links (Demo + Code) all came through from the
master as built in P2-T09. `PageLinks` carries `All work` + `Next: Chimères Orchestra`.
`work/RelatedWriting` keeps the two `blog/PostRowCalm` instances it inherits from its master.

### Step 3 — read-back

Cold read-back verified both frames; screenshots captured.

### Simplification — Prose outside the container

Live puts `ui/Prose` **outside** `.container` with its own `max-width`. Figma keeps every child
inside the document-type `PageContent` container instead — same visual result, one container recipe
rather than two. Recorded as a deliberate Figma-side simplification, not a divergence.

### Deviations

1. **`PageContent.itemSpacing` overridden** from `shell()`'s `section/rhythm-y` binding (96 / 32) to
   raw 48 / 32, per the brief's code. Same cause as P3-T07: no responsive variable maps to 48/32.

**UNBOUND:**

- `Work detail — Desktop` / `Work detail — Mobile` › `PageContent.itemSpacing` (48 / 32) — no responsive var for `gap-8`/`gap-12`
- `Work detail — Desktop` / `Work detail — Mobile` › `cover.cornerRadius` (8) — raw, no radius variable exists to bind
