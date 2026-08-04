# Task 4 — Report (Steps 3-6: SERIE Dark/768/390 + gate)

Scope executed: **Step 3** (`SERIE — 1280 — Dark`), **Step 4** (`SERIE — 768 —
Light/Dark`), **Step 5** (`SERIE — 390 — Light/Dark`), **Step 6** (gate — all
6 frames verified, IDs below). Steps 1-2 (`SERIE — 1280 — Light`) were built
and approved in a prior session and are unchanged here except where noted.

## What was built

5 new frames, all siblings of the existing `SERIE — 1280 — Light` inside
section `PAGE/SERIE` (`257:3097`), each derived via `node.clone()` from the
appropriate parent (Dark cloned from 1280-Light; 768 cloned from 1280-Dark
material where relevant; 390 cloned from 768) and then corrected per
breakpoint. Real `web-performance` serie content (title, abstract, 5 part
titles/dates/read-times) carried through unchanged into every sibling.

### Step 3 — `SERIE — 1280 — Dark` (`263:3170`)

Dark mode applied the same way `Home — 1280 — Dark` applies it: an explicit
per-frame color-mode override — `frame.setExplicitVariableModeForCollection(
colorCollection, darkModeId)` — on the top-level frame only; all descendants
inherit via their existing bound Color-collection variables (no per-node
overrides needed). Screenshot-verified against `/blog/web-performance` at
1280 dark — matches, aside from an inherited nav-highlight quirk (see Named
debt).

### Step 4 — `SERIE — 768 — Light/Dark` (`265:3243` / `265:3341`)

Applied the shared responsive formula: outer `main` `itemSpacing=32`,
`paddingTop/Bottom=32` (`gap-8 py-8` below `lg`). Header block set to
full-width (`layoutSizingHorizontal=FILL`, no 2/3 constraint — matches
`w-full lg:w-2/3`). `SeriePostListItem` rows needed no change (already
full-width).

Two structural bugs found and fixed by cross-referencing the already-approved
`POST — 768 — Light` frame (precedent, not guessed):

- **Header/Footer clipped at 768**: the Header/Footer instance nodes were
  still `layoutSizingHorizontal=FIXED` at their 1280px source width, so they
  didn't shrink with the resized frame and got clipped. Fixed by setting
  `layoutSizingHorizontal='FILL'` on both instances (matches
  `Home — 768 — Light`).
- **Nav rendered centered instead of left-aligned/compact**: fixed by
  applying the same override already present on `POST — 768 — Light`'s
  Header→Container — `primaryAxisAlignItems='MIN'`, `itemSpacing=16` (master
  default is `MAX`/`40`).

### Step 5 — `SERIE — 390 — Light/Dark` (`270:3389` / `270:3545`)

Same header-full-width treatment, cloned from the (now-fixed) 768 frames.
Read-time hidden on all 5 `SeriePostListItem` instances, leaving only the
date — matches `<p class="hidden sm:block">` in the live component. There is
no separate date-only text node in the master; the combined
"`{readTime} · {date}`" text node was edited directly via the canonical
text-edit recipe (load font → mutate `characters` → return node IDs) down to
just the date, for all 5 rows in both Light and Dark.

### Cross-breakpoint fix (discovered while building Step 5, applied to both 768 and 390)

Two deltas were missed on the initial 768 clones and only surfaced once the
390 H1 visibly clipped ("WEB PERFOR..." cut off at the frame edge):

- **H1/abstract font size** — `H1.astro` is `text-4xl sm:text-5xl
  lg:text-6xl` (36/48/60px) and `P.astro` is `text-xl md:text-2xl
  xl:text-3xl` (20/24/30px). The 768/390 clones had carried over the 1280
  values unchanged (60px H1 / 30px abstract). The SERIE H1 sits in a `HUG`-
  sized icon+H1 row (unlike POST's H1, which is FILL-width and wraps instead
  of clipping), so at 390 the oversized 60px text ran off the frame edge
  instead of wrapping. Fixed by setting `H1.fontSize=48`/`P.fontSize=24` at
  768 and `H1.fontSize=36`/`P.fontSize=20` at 390, in both Light and Dark.
- **Inner `header` block gap** — `index.astro`'s header div is
  `flex flex-col gap-4 lg:gap-8` (16px below `lg`, 32px at `lg`/1280) —
  separate from the outer `main`'s `gap-8 lg:gap-12`. The clones had kept
  `itemSpacing=32` (the 1280 value) at 768/390. Fixed to `itemSpacing=16` at
  both breakpoints, both themes. 1280 frames are untouched (still 32,
  correct for `lg:gap-8`).

Frame heights auto-shrank accordingly after the fix (768: 979→926, 390:
1319→1131), consistent with tighter spacing/smaller text.

### Section membership fix

The 5 new frames (Dark/768/390) had been created as loose top-level children
of 📄 Pages rather than inside `PAGE/SERIE`, unlike the equivalent POST
frames (all 6 parented under `PAGE/POST`). Reparented all 5 into
`PAGE/SERIE` via `section.appendChild(frame)`; x/y coordinates were left
unchanged, matching the same (pre-existing, not worth "fixing") pattern
where `PAGE/POST`'s section bounding box doesn't tightly enclose its
children either.

## Screenshot verification

All 6 frames screenshotted and compared against Playwright captures of
`/blog/web-performance` at matching viewport/theme:

| Frame | ID | Result |
|---|---|---|
| SERIE — 1280 — Light | `257:3098` | Matches (approved prior session) |
| SERIE — 1280 — Dark | `263:3170` | Matches |
| SERIE — 768 — Light | `265:3243` | Matches after Header/Footer FILL fix, nav-align fix, header-gap fix, H1/P font-size fix |
| SERIE — 768 — Dark | `265:3341` | Matches (same fixes) |
| SERIE — 390 — Light | `270:3389` | Matches after header-gap + H1/P font-size fix (resolved H1 clipping) |
| SERIE — 390 — Dark | `270:3545` | Matches (same fixes) |

## Named debt (inherited, not introduced by this task, not fixed)

- **Nav shows "Home" as active/underlined** across all 6 frames instead of
  "Blog". Inherited unchanged from the already-approved
  `SERIE — 1280 — Light` (Step 1/2, out of scope to touch); consistent
  across every clone since it was just carried forward.
- **Footer text overlap at 768/390** — "Jérôme Abel - 2026 - License CC BY
  4.0Home" runs together without wrap/spacing. Caused by the shared Footer
  master's `layoutWrap='NO_WRAP'`, which doesn't reflow at narrower widths.
  Confirmed identical in the already-approved `POST — 768 — Light` Footer —
  this is a pre-existing Footer-master limitation accepted in Task 3, not a
  SERIE-specific regression. Fixing it would mean patching the shared Footer
  master, out of scope for Task 4.

## Node IDs created/mutated

- Section (pre-existing): `257:3097` (`PAGE/SERIE`)
- `SERIE — 1280 — Light` (pre-existing, unchanged): `257:3098`
- `SERIE — 1280 — Dark`: `263:3170`
- `SERIE — 768 — Light`: `265:3243` (header block `265:3246`, H1 `265:3253`, abstract `265:3254`)
- `SERIE — 768 — Dark`: `265:3341` (header block `265:3344`, H1 `265:3351`, abstract `265:3352`)
- `SERIE — 390 — Light`: `270:3389` (header block `270:3392`, H1 `270:3399`, abstract `270:3400`)
- `SERIE — 390 — Dark`: `270:3545` (header block `270:3548`, H1 `270:3555`, abstract `270:3556`)

## Self-review

- [x] All 5 new frames built (Dark 1280, Light/Dark 768, Light/Dark 390)
- [x] Instances only, zero hand-drawn stand-ins — all cloned from the
      approved Step 1/2 frame, which was itself instances-only
- [x] Tokens bound (Color collection vars) — Dark mode achieved via explicit
      per-frame mode override, not raw hex; no new unavoidable raw fills
      introduced
- [x] Real content (web-performance serie's actual title/abstract/5 parts)
      carried through every sibling
- [x] Correct responsive deltas applied: main spacing (32/32), header
      full-width, header-block inner gap (16 below lg), H1/P font-size
      stepping (48/36, 24/20), read-time hidden at 390
- [x] Every screenshot diff matches, or the mismatch is logged as named debt
      (nav-highlight, Footer overlap — both inherited/out-of-scope)

## Concerns

None blocking. Both named-debt items are inherited from already-approved
Task 3/Step-1-2 work and were independently confirmed present in the
approved POST template, so they're pre-existing accepted limitations rather
than regressions from this task.
