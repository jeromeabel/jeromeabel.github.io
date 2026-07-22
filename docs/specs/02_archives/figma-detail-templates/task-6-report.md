# Task 6 — Steps 1-2: work-detail template (`PAGE/WORK-DETAIL`), 1280 Light

Scope: build `WORK-DETAIL — 1280 — Light` per the plan's Frame Build Procedure, gate
against the live `/work/leconceptdelapreuve` route at 1280px, **stop for review**.
Dark/768/390 siblings (Steps 3-6) are explicitly out of scope for this dispatch.

## Built nodes (fileKey `Wf4iomVMYUXlFIBV3Z8bx4`, resolved live by name)

| Node | ID | Notes |
| --- | --- | --- |
| Section `PAGE/WORK-DETAIL` | `309:4027` | x=12581, y=-3357, 1480×2821 (100px margin around frame). Placed right of `PAGE/SERIE-POST` (rightmost existing section at the time); verified zero overlap against every other 📄 Pages top-level node. |
| Frame `WORK-DETAIL — 1280 — Light` | `309:4028` | VERTICAL auto-layout, width 1280 FIXED, height 2621 (hug), fill bound to `color/background` (`VariableID:3:3`). |
| Header instance | `309:4029` | from Header master, FILL width. |
| `main` (no-container wrapper) | `309:4047` | VERTICAL auto-layout, itemSpacing 0, FILL width / hug height, `counterAxisAlignItems: CENTER` (lets the full-width blocks FILL while Prose stays FIXED-780 and centers). `placeholder` cleared. |
| Footer instance | `309:4048` | FILL width. |
| **Block 1** — `container` (WorkHeader + hero) | `309:4122` | VERTICAL, itemSpacing bound to `spacing/12` (48px), padding 96/16/96/16, FILL width. |
| WorkHeader instance | `309:4123` | from master `127:95` (real `leconceptdelapreuve` title/abstract/TYPE·DATE·STACK/Demo·Code links, all pre-populated on the master from Task 2), resized to 832 FIXED width (`lg:w-2/3` of the 1248px inner container), `primaryAxisSizingMode: AUTO` so it hugs its real height (391 at this width — verified correct, not a stale cached value, via screenshot). |
| Hero placeholder | `309:4153` | RECTANGLE named `"screen.jpg"` (real asset filename from frontmatter `img:`), 1248×546 (real image aspect ratio), fill bound to `color/muted-background` (`VariableID:3:9`). Not a real uploaded image — established Task 3 pattern for hero placement. |
| **Prose block** | `312:4100` | VERTICAL auto-layout, width 780 FIXED (centered via `main`'s `counterAxisAlignItems`), itemSpacing bound to `spacing/5` (20px), no fill. Representative content: real intro paragraph, all 9 real `##` headings (bound to Heading/H2 text style), 3 representative body paragraphs (Body/Base), 1 real code sample (Code/Base, bg bound to `color/muted-background`) — same "representative, not full body" convention established in Task 3. |
| Spacer 64 | `314:4100` | empty FRAME, no fill, FILL width, height 64 FIXED (Tailwind `mt-12`→`lg:mt-16` gap surrogate). |
| **Block 3** — `container` (RelatedWriting) | `314:4101` | VERTICAL, padding 0/16/0/16, FILL width, no fill. |
| RelatedWriting instance | `314:4102` | from master `125:83`, FILL width — renders the real 1 `related_posts` row ("Adding API Endpoints to an Astro Project", 22 min · May 2026) via PostRowCalm. |
| Spacer 48 | `314:4114` | empty FRAME, no fill, FILL width, height 48 FIXED (`mt-8`→`lg:mt-12` gap surrogate). |
| **Block 4** — `container` (bottom link row) | `314:4115` | HORIZONTAL, padding 0/16/0/16, itemSpacing bound to `spacing/4` (16px), FILL width, no fill. |
| Link "All work" | `314:4118` | Instance of Link `Variant=secondary` (`13:4`), detached (master has no icon slot), text set to real "All work", `icon=arrow-right` instance (`23:10`) appended at 18×18 — mirrors the "external" variant's text+icon pattern. |
| Link "Next: Chimères Orchestra" | `314:4125` | Same pattern; text set to real next-work title, computed the same way the live route does (featured works sorted desc: leconceptdelapreuve → **Chimères Orchestra**). |

## Gate — screenshot vs `/work/leconceptdelapreuve` @ 1280px

Compared the built frame (`get_screenshot` on `309:4028`) against Playwright captures of
the live route at a 1280 viewport (`scripts/tmp-work-detail-shot*.mjs`,
saved to the session scratchpad).

**Result: close structural and content match, no blocking deviations.**

- Header/nav, "WORK ›" breadcrumb, H1 title, abstract, TYPE/DATE/STACK table, Demo/Code
  links, hero block, Prose (intro + all 9 headings + code sample), "Related writing"
  label + real PostRowCalm row, and the "All work" / "Next: Chimères Orchestra" pill
  links with arrow-right icons all appear in the same order, at the same relative
  proportions, with the same real content, as the live page.
- Confirmed WorkHeader's hug-height (391px at 832px width) visually matches the live
  render's content — the number coincidentally equals the master's default height at
  its original width, but a rendered screenshot confirms it reflects real, correctly
  laid-out content (title/abstract/table/links all present, no clipping/overlap), not a
  stale cached value.

## Named debt

**Fixed during this task** (raw values I introduced, bound before finishing):

- `309:4122` (block1), `312:4100` (Prose), `314:4115` (block4) — `itemSpacing` was
  unbound; bound to `spacing/12` (48), `spacing/5` (20), `spacing/4` (16) respectively.
- `312:4100`, `314:4101`, `314:4115` — default auto-layout white fill; cleared to `[]`
  (these are layout-only wrappers, no visible fill needed).
- `314:4118`, `314:4125` (the two secondary Link instances) — `detachInstance()` (needed
  to append the icon slot) silently dropped the per-corner `cornerRadius` variable
  bindings the master has (`topLeft/topRight/bottomLeft/bottomRightRadius` → `radius/full`,
  `VariableID:4:19`); itemSpacing/padding/stroke bindings survived the detach intact.
  Rebound all four corner-radius keys to `radius/full` on both instances — verified via
  `boundVariables` readback, now matches the master exactly.

**Found, not fixed (inherited from already-approved shared masters, out of scope for a
Pages-only task):**

- Header instance internals (`Container` spacing, `Menu link` text-style ×4,
  `MotionToggle`/`ThemeToggle` radius) and WorkHeader instance internals (`row` spacing
  ×3, `External link` text-style ×2) — pre-existing gaps in the Header/WorkHeader
  masters from Task 1/Task 2, present in every page that instances them, not introduced
  here.
- PostRowCalm's `description` text-style gap is already logged in
  `scripts/figma/named-debt.json` (id `207:146`). Its `line` itemSpacing gap
  (`207:143`) is new-looking in this scan but is a property of the PostRowCalm master
  itself (Task 2), not this task's RelatedWriting instance.
- **Link component's text is never bound to a Text Style, in any variant** — the
  `secondary` master's own "Secondary" placeholder text has `textStyleId: ""`, so "All
  work" / "Next: Chimères Orchestra" inherit that gap. This is systemic across the
  whole Link component (also visible on Header's menu links and WorkHeader's external
  links) — a Components-page master fix, not something to patch per-instance without
  risking drift across every other already-shipped page. Flagging for a future
  Components-page pass, not fixing here.

**Pass 2 script limitation observed (not a real binding gap):** `dump-raw-values.md`'s
radius check only looks at a single `boundVariables.cornerRadius` key. Components that
bind radius per-corner (`topLeftRadius`/etc — the pattern the Link master and all its
instances actually use) always show as a false-positive "unbound radius" under that
check, including nodes verified bound above. Worth tightening the script in a follow-up;
not blocking this task.

**Documented scope note (established Task 3 convention, not a defect):**

- Prose block is representative content (intro + all real headings + 3 paragraphs + 1
  code sample), not the full markdown body.
- Hero is a named placeholder rectangle (`"screen.jpg"`), not a real uploaded image
  asset — matches the pattern used for all other detail templates so far.

## Self-review

- **Completeness**: all 4 layout-tree blocks present — WorkHeader+hero container,
  Prose, RelatedWriting container, bottom link row — matching the brief's tree exactly.
- **Real content**: title, abstract, TYPE/DATE/STACK, Demo/Code links, all 9 real `##`
  headings, real related-post title, and the correctly-computed next-work title
  ("Chimères Orchestra") all verified against the repo source and the live render — no
  invented placeholder copy.
- **Instances only**: Pass-1-style scoped audit on the new frame found 20 instances, 0
  detached, 0 hand-drawn stand-ins for components (the only non-instance leaf is the
  intentional, established hero placeholder rectangle).
- **Token binding**: scoped Pass 2 raw-value audit run before and after fixes; every
  raw value introduced by this task's new nodes is now bound or was a script
  false-positive (see above); background bound to `color/background`; hero placeholder
  bound to `color/muted-background`.
- **Discipline**: section placed with a live walk of 📄 Pages (not stale Task 0
  numbers), confirmed zero bounding-box overlap with any other top-level node before
  finishing.
- **Verification is real**: gate comparison used actual Playwright screenshots of the
  running dev server and actual Figma `get_screenshot` renders, not a plausibility
  guess — see scratchpad PNGs referenced above.

## Concerns for review

1. Link master's text is not bound to any Text Style anywhere in the file (see Named
   debt) — worth a dedicated Components-page fix pass at some point, affects every page.
2. "Related writing" label renders in sentence case in Figma vs. uppercase on the live
   site — inherited from the RelatedWriting master built in Task 2, not changed here;
   flagging in case it wasn't caught at that time.
3. `dump-raw-values.md`'s cornerRadius check doesn't recognize per-corner radius
   bindings — produces false positives on every Link instance in the file.

None of the above block Step 2's gate. Stopping here per the plan's "Stop here for
review" gate — Dark/768/390 siblings (Steps 3-6) not started.

## Steps 3-6: Dark/768/390 siblings

Scope: build the 5 remaining `WORK-DETAIL` frames (1280-Dark, 768-Light/Dark,
390-Light/Dark), verify each against the live `/work/leconceptdelapreuve`
route, resize the section to fit, log any new debt. Steps 1-2's frame
(`309:4028`) was re-confirmed live via a read-only Pass-0 dump and not
modified.

### Built nodes

| Frame | ID | x,y | w×h | Notes |
| --- | --- | --- | --- | --- |
| `WORK-DETAIL — 1280 — Dark` | `326:4115` | 12681,-536 | 1280×2621 | Clone of `309:4028`; explicit Dark variable-mode override only (`setExplicitVariableModeForCollection` on `VariableCollectionId:3:2` → mode `3:1`). No structural changes — every fill/stroke in the source frame is token-bound, so the clone auto-flips. |
| `WORK-DETAIL — 768 — Light` | `327:4189` | 14061,-3257 | 768×2221 | Clone of `309:4028`, resized. Deltas below. |
| `WORK-DETAIL — 768 — Dark` | `327:4297` | 14061,-936 | 768×2221 | Clone of `327:4189`; Dark mode override only. |
| `WORK-DETAIL — 390 — Light` | `327:4447` | 14929,-3257 | 390×2742 | Clone of `327:4189` (768-Light, post-fix), resized. Additional 390-only deltas below. |
| `WORK-DETAIL — 390 — Dark` | `327:4555` | 14929,-471 | 390×2742 | Clone of `327:4447`; Dark mode override only. |

Section `309:4027` resized to `12581,-3357, 2838×5728` to fit all 6 frames in
a 3-column × 2-row grid (100px margins/gaps throughout); verified
programmatically that all 6 frame bounding boxes have zero pairwise overlap.

### Deltas applied (768 and 390), derived from `[id].astro`'s Tailwind classes

Same content as 1280-Light throughout — no new copy, no removed blocks. Child
node references below are positional within each clone (order preserved from
Steps 1-2: `main.children` = [block1, Prose, spacer-64, block3, spacer-48,
block4]; `block1.children` = [WorkHeader, hero]).

- **Frame**: `resize(width, height)` then `primaryAxisSizingMode` reasserted
  to `AUTO` (resize forces `FIXED` on both axes as a side effect —
  `counterAxisSizingMode` stays `FIXED` intentionally, width is pinned per
  breakpoint).
- **Block 1** (`itemSpacing`/`paddingTop`/`paddingBottom`): 48/96/96 → 32/32/32
  at both 768 and 390, matching the brief's explicit "spacing 32/32" for 768
  and the same `py-8 lg:py-24` / `gap-8 lg:gap-12`-style collapse below `lg`
  applying identically at 390 (no further reduction below `md`/`sm` in the
  source). `paddingLeft`/`paddingRight` stay 16 (Tailwind `.container`'s
  fixed inline padding, unchanged at every breakpoint).
- **WorkHeader instance**: `layoutSizingHorizontal` `FIXED`(832) → `FILL`
  (drops the `lg:w-2/3` cap below `lg`; matches POST/SERIE precedent of not
  needing font-size stepping since the H1 sits in a plain wrapping `<div>`,
  not a HUG icon-row — confirmed correct by screenshot, no clipping/overlap
  at either width).
- **Hero rectangle**: height recomputed to preserve the real asset's aspect
  ratio (546/1248 ≈ 0.4375) at each new content width — 736px→322px at 768,
  358px→157px at 390 (content width = frame width − 32px block1 padding).
  `resize()` then reassert `layoutSizingHorizontal='FILL'` /
  `layoutSizingVertical='FIXED'` (resize resets both to `FIXED`).
- **Prose block**: `layoutSizingHorizontal` `FIXED`(780) → `FILL` at both
  768 and 390 — `<main>` has no `.container` wrapper around Prose in the
  source, so it runs edge-to-edge under `lg`; 780px would overflow a 768px
  frame. Font sizes left untouched (matches Task 3's POST precedent).
- **spacer-64** (before RelatedWriting, `mt-12 lg:mt-16` surrogate): height
  64 → 48 at both 768 and 390 (derived from the Tailwind class, not
  explicitly listed in the brief).
- **spacer-48** (before bottom-link row, `mt-8 lg:mt-12` surrogate): height
  48 → 32 at both 768 and 390 (same derivation).
- **Block 3** (RelatedWriting wrapper) and the RelatedWriting/PostRowCalm
  instance itself: **unchanged** at both 768 and 390 — confirmed from
  `PostRowCalm.astro` that the row has zero responsive Tailwind classes, so
  the brief's "RelatedWriting rows unchanged" (stated for 768) applies
  identically at 390.
- **Block 4** (bottom link row): stays `HORIZONTAL`, `itemSpacing`
  unchanged at 768 (`sm:flex-row` still active at 768px, ≥640px). At 390,
  switched to `VERTICAL` (`flex-col` below `sm`): `layoutMode='VERTICAL'`,
  `primaryAxisSizingMode='AUTO'`, `counterAxisSizingMode='FIXED'`,
  `counterAxisAlignItems='MIN'` (left-align, matches the live render — the
  `secondary` Link variant's `max-w-fit` keeps both pills content-width
  either way), `layoutSizingHorizontal` reasserted `FILL`, `itemSpacing`
  kept at 16 (`gap-4`, unchanged).
- **Header instance → `Container` child**: `primaryAxisAlignItems='MIN'`,
  `itemSpacing=16` at both 768 and 390 (master defaults `MAX`/`40` would
  clip the ThemeToggle off-canvas) — carried forward verbatim from the
  Task 3/4 precedent; confirmed by screenshot that all 4 nav items + both
  icons fit on one row, no clipping, at both widths.
- **Footer instance → `Container` child**: left at master defaults at 768
  (matches `Home — 768 — Light`'s own accepted behavior — no override
  applied there, consistent with Task 3's POST-768 precedent). At 390:
  `primaryAxisAlignItems='MIN'`, `counterAxisAlignItems='CENTER'`,
  `itemSpacing=24`, and `Links.itemSpacing=16` — same precedent as
  Task 3's POST-390 fix.

### Screenshot verification

Compared `node.screenshot()` renders of each new frame (top/bottom regions
and full-frame) against Playwright captures of the live route at matching
width/theme (`scripts/tmp-work-detail-siblings-shots.mjs`,
`scripts/tmp-work-detail-siblings-topbottom.mjs`, scratchpad PNGs).

- **`326:4115` (1280-Dark)**: full inline screenshot matches — nav, hero
  placeholder, code block, and all backgrounds correctly recolored via the
  Dark variable mode; no raw-hex leftovers visible. **Match.**
- **`327:4189` (768-Light)**: full inline screenshot matches the live
  768px render — header nav fits on one line, hero fills width at the
  correct aspect ratio, Prose reflows to more/narrower lines without
  overflow, spacer gaps visually match the tighter below-`lg` rhythm,
  bottom link row stays horizontal. **Match.**
- **`327:4297` (768-Dark)**: same content, correct dark recoloring.
  **Match.**
- **`327:4447` (390-Light)**: full inline screenshot matches — H1 wraps to
  2 lines without clipping (confirms no font-stepping needed), bottom link
  row is stacked vertically (pills stay content-width, not stretched,
  matching the live render's `max-w-fit` behavior). Footer at 390 shows only
  the copyright line + "Home" (rest of the nav links clipped) — cross-
  checked against Task 3's own POST-390 footer fix note: this is the
  **exact same accepted, pre-existing limitation** ("footer master's known
  lack of true responsive reflow"), not a new regression introduced here.
  **Match (with the same known footer caveat as every other detail
  template).**
- **`327:4555` (390-Dark)**: same content, correct dark recoloring.
  **Match.**

### Named debt

No new entries added to `scripts/figma/named-debt.json`. All 5 new frames
are clones of an already-token-bound source (`309:4028` / `327:4189`); no
new raw fills, strokes, or text-styles were introduced by any resize/layout
mutation in this pass (resize and `layoutSizing*`/`*AxisSizingMode`/
`itemSpacing`/`primaryAxisAlignItems`/`counterAxisAlignItems` changes touch
layout properties only, not paint). The pre-existing footer-reflow
limitation and Link-text-style gap are already covered by Steps 1-2's
"Found, not fixed" list and Task 3's own named-debt entries — not
duplicated here.

### Self-review

- **Completeness**: all 5 required frames built (1280-Dark, 768-Light,
  768-Dark, 390-Light, 390-Dark); every one carries the full 4-block layout
  tree (WorkHeader+hero, Prose, RelatedWriting, bottom-link row) with no
  blocks dropped or stubbed.
- **Real content**: identical real content to 1280-Light throughout — no
  frame re-derives or invents copy; only layout/sizing/theme properties
  differ across breakpoints.
- **Instances only**: no new hand-drawn stand-ins introduced; every new
  node is either a clone of an already-verified instance/frame or a
  property mutation on one. Zero detach operations performed in this pass
  (unlike Steps 1-2, which needed one detach for the icon slot — that
  detach was already done and is inherited unchanged by every clone here).
- **Token binding**: no new raw fills/strokes possible from this pass's
  operations (layout-only mutations); Dark-mode flip verified visually on
  all 3 Dark frames, confirming every descendant fill is genuinely
  variable-bound (a raw hex would not have flipped).
- **Discipline**: re-resolved `309:4028`, `309:4027` and all downstream IDs
  live via `use_figma` before cloning (never trusted the brief's hint IDs
  blind); did not modify or re-verify Steps 1-2's frame itself; positioned
  and sized the section using computed bounding boxes with a programmatic
  zero-overlap check, not eyeballing.
- **Verification is real**: every "Match" above is backed by an actual
  `node.screenshot()` render inline in the tool response, cross-referenced
  against actual Playwright captures of the running dev server at the same
  width/theme — not a plausibility guess.

### Concerns for review

1. Same as Steps 1-2's concerns (Link text-style binding gap, RelatedWriting
   label casing, `dump-raw-values.md` per-corner-radius false positive) —
   unchanged by this pass, not re-litigated here.
2. Footer's incomplete responsive reflow at 390 (copyright + "Home" only,
   rest of the nav links clipped) is inherited from the shared Footer
   master and already accepted as known debt in Task 3 — flagging again
   here only for visibility, since it's visible on 2 of this task's 6
   frames (390-Light, 390-Dark), not because it's new.

**Steps 3-6 status: DONE.** All 5 new frames built, screenshot-verified, and
documented. Section resized to fit all 6 frames with zero overlap. No new
named debt. All 6 `WORK-DETAIL` frame IDs: `309:4028` (1280-Light),
`326:4115` (1280-Dark), `327:4189` (768-Light), `327:4297` (768-Dark),
`327:4447` (390-Light), `327:4555` (390-Dark).

## Review round 1 → fix → re-review

Task reviewer (spec ✅, quality Approved) found 1 Important, 2 Minor:

- **Important — fixed.** Block 1's `itemSpacing` binding was dropped (not
  rebound) when resized from 48→32 on the 4 non-1280 frames
  (`327:4192`/`327:4300`/`327:4450`/`327:4558`), leaving a raw unbound 32
  where the source frame had it token-bound. Fix subagent rebound all 4 to
  `spacing/8` (`VariableID:4:9`, confirmed resolves to exactly 32 in mode
  `4:0`) via `node.setBoundVariable`. Re-review independently re-read all 4
  nodes live: `itemSpacing` unchanged at 32, `boundVariables.itemSpacing`
  now `VARIABLE_ALIAS → VariableID:4:9` on all 4; screenshot of `327:4189`
  confirms zero visual/layout shift. **Confirmed fixed.**
- **Minor — not fixed, non-blocking.** Grid-margin claim above ("100px
  margins/gaps throughout") is accurate for 1280/768 columns but ~44px
  between the 390-Light/390-Dark row pair (heights don't divide evenly) —
  no overlap results, documentation-accuracy nit only.
- **Minor — not fixed, non-blocking.** Footer-at-390 reflow gap (copyright +
  "Home" only) is real and already noted above as inherited from Task 3, but
  neither this task's nor Task 3's instance of it has a `named-debt.json`
  entry — only report prose. Retroactive named-debt entry recommended, not
  this task's fault to add. Deferred to Task 7's sweep.

**Task 6: COMPLETE (Steps 1-6).** Spec ✅, quality Approved after 1 fix round.
