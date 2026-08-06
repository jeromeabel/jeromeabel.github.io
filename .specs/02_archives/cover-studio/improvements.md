---
created: 2026-07-28
---

# Cover Studio — code & UX/UI review findings

**Status:** first pass done 2026-07-28 · fixes 1–6 landed · 7–28 open backlog ·
second pass done 2026-07-28 (multi-agent, post fixes 1–6) · #29–#52 added below ·
dirty-tracking/undo tranche (#29, #30, #31, #44, #50) landed 2026-07-29

Full read-through of `~/code/projects/cover-studio` at `3943147` (~5,250 LOC excluding
vendored shadcn primitives). Baseline at review time: `pnpm test` 56 passed / 12 files,
`pnpm typecheck` clean.

Paths below are relative to the **cover-studio** repo, not this one.

---

## Fixed (this pass)

### 1. Test suite was bound to one machine's filesystem

`src/server/jobs.ts` — `countEntries()` called `scanContent(config.blogRoot)` unguarded. On a
machine without the blog repo at `studio.config.json`'s committed absolute path, the throw
escaped into `startJob`'s crash guard (a), the job returned `{running: false, error}`, and
`api.test.mjs`'s job-lock test failed on an assertion that had nothing to do with the
filesystem.

**Fixed:** `countEntries` is a progress _denominator_, not a precondition — wrapped in
try/catch, degrades to `total: 0` (indeterminate progress). `render.mjs` re-scans content
itself and reports the real failure on stderr, so nothing is actually hidden. Verified by
pointing `blogRoot` at `/nonexistent/blog`: `api.test.mjs` 3/3 pass.

Still open: the committed `blogRoot` is an absolute path (see #7).

### 2. Blob drag captured the pointer on a miss

`PreviewStage.vue` — the hit-target `<svg>` fills the whole preview cell, so a pointerdown
between blobs found no `<ellipse>`; `Number(undefined)` is `NaN`, and `NaN !== null`, so the
drag state engaged: pointer captured and an undo snapshot pushed for a drag that could never
write anything (`updateBlob`'s own guard stopped the corruption).

**Fixed:** index is now resolved inside `onBlobPointerDown` and gated on `Number.isInteger`.
Template handler is a plain `@pointerdown="onBlobPointerDown"`.

### 3. Decimal values could not be typed into numeric knobs

`KnobRow.vue` — inputs bound `:model-value="Number(k.value)"` and committed on every
keystroke. Typing `0.` parsed to `0`, the store wrote `0` back, and the binding rewrote the
field to `"0"` — swallowing the decimal point. Fractional knobs (`duotone.paperLift`,
`grain.attenuate`, sigmoidal strength) were slider-only in practice.

**Fixed:** new `src/app/components/NumberInput.vue` holds a local string draft while focused
and yields to the store value on blur (or when an external change — slider, revert, entry
switch — disagrees with the draft). All five numeric inputs in `KnobRow` (number, levelPair
×2, sigmoidal ×2) now go through it. Sigmoidal strength also gained `:step="0.1"`.

### 4. Clean-state label never rendered muted

`SaveBar.vue` — `class` sat on a `<template v-else>`, which Vue drops. Collapsed to one
`<span>` with a conditional class.

### 5. Boot failure produced a silent blank app

`App.vue` — `store.load()` was fired unhandled in `onMounted`. A failing `/api/data`
(unreadable `blogRoot`, hand-edited `illustration.json` that no longer validates) rejected
into nothing and left a fully-mounted, empty UI with no indication anything was wrong.

**Fixed:** three explicit boot states — loading, error (shows the message plus which two
files to check), and an empty state for "scanned fine, found no entries" that names the
once-at-start scan as the likely cause.

### 6. Ctrl+Z after a crop edit reverted the wrong thing

Crop edits were deliberately not snapshotted (matching the blog's `crop.mjs`), but the undo
stack was live for illustration edits. So Ctrl+Z after a crop drag popped a checkpoint from
_before_ some unrelated earlier knob edit and reverted that instead — the crop stayed. Silent
wrong-state, worst kind of undo bug.

**Fixed:** `studio.ts`'s `snapshot()`/`undo()` now cover `{illustration, crops}` as one stack,
so the top is always the edit the user just made. `CropTab.vue` calls `store.snapshot()` at
gesture start (stage pointerdown, zoom pointerdown, reset click) — same coalescing rule as
`KnobRow`. `undo()` returns a boolean; `TopBar` toasts "Nothing to undo" on an empty stack
instead of looking broken.

Still open: no redo (#16).

---

## Open — code

### 7. Absolute `blogRoot` committed

`studio.config.json` pins a machine-specific absolute path. `config.mjs:10` already resolves
relative paths against the repo root, so `"../jeromeabel.github.io"` works for the
sibling-checkout layout and makes the repo portable.

### 8. Dead config keys

`src/server/config.mjs:13-16` loads `dataDir`, `libraryDir` and `exportName`; nothing consumes
them (only `config.test.mjs` asserts they exist). The real paths are hardcoded —
`store.mjs:20` (`data/illustration.json`), `settings.mjs:103` (`data/crops.json`). Either wire
them through or drop them; config that lies is worse than no config.

### 9. Settings payload travels in the query string

`src/server/api.ts:134-160` — `/api/layer` and `/api/render` are GET with the whole effective
settings object JSON-encoded into the URL (~2–4 KB). The blog's version used POST for exactly
this reason. Works today, but it sits near URL/header limits and puts the full payload into
every request log. Move to POST + body, or hand out a settings handle and fetch by key.

### 10. No request body cap

`src/server/api.ts:52-65` — `readJson` accumulates chunks with no size limit. Loopback-only,
so low risk, but it's two lines to bound.

### 11. Content scanned once at boot

`src/server/api.ts:91`. Adding a post to the blog repo requires restarting `pnpm dev`. A
`?refresh` param on `/api/data`, or a watcher on `blogRoot/src/content`, would be cheap. Now
documented in the README's Known limits and surfaced in the new empty state (#5).

### 12. Per-entry `resolve()` in a template

`EntryRail.vue:58-63` — `isNeverRendered()` is called from the template, once per entry per
render pass, and each call runs `resolveSettings`, which `structuredClone`s the whole
`SETTINGS` object. During a slider drag that's N clones per tick. `RunDrawer.vue:72` already
does the right thing: one `computed` map keyed by slug. Copy that.

### 13. Duplicate blob generation

`PreviewStage.vue` runs `generateBlobs` twice per render — once for the mesh markup, once for
the drag hit targets. One computed, shared.

### 14. Oversized rail thumbnails

`EntryRail.vue:82` serves full-size covers into 48×48 slots. Lazy-loaded so it's mitigated,
but `/img` could serve a resized variant.

### 15. Unescaped accent reaches `v-html`

`util.mjs:29`'s `color()` falls through to the raw key, `mesh.mjs:32` interpolates it into
`fill="${accent}"` unescaped, and `PreviewStage.vue` renders that markup with `v-html`. An
`accent` string in `illustration.json` can therefore inject SVG attributes. Not reachable
through the UI (the accent Select has fixed options), and this is a loopback single-user tool
— but `data/illustration.json` is git-tracked and hand-editable, so escaping the value in
`meshSvg` is worth doing.

### 16. No redo

`studio.ts` has a one-way snapshot stack. Ctrl+Shift+Z / Ctrl+Y needs a second stack that
`snapshot()` clears on a fresh edit.

### 17. No save conflict detection

`studio.ts`'s `save()` writes unconditionally. Two dev servers, or a hand-edit while the
Studio is open, silently loses one side. A stored mtime/hash compared server-side before write
would turn it into a refusal.

### 18. Test-suite debt

- `vitest.config.ts:12` sets `fileParallelism: false` because `store.test.mjs` mutates the
  shared `data/illustration.json` fixture in place while `validate.test.mjs` reads it. Fix is
  a tmp-dir fixture, not more serialization.
- `api.test.mjs` leaves the module job singleton permanently `running: true`. Fine under file
  isolation; a trap for any future jobs test added to that file.
- No component-level coverage for the Vue layer at all.

### 19. No linter, no formatter

The blog repo has Prettier. Adding Prettier + `eslint-plugin-vue` here would have caught #4
(`class` on `<template>`) statically.

---

## Open — UX/UI

### 20. Preview is locked to `thumb`

`PreviewStage.vue`'s `PREVIEW_SIZE` is a hardcoded constant. The blog's `fx.mjs` had a size
selector. You tune at 575×300 with no way to see `cover` or `square` short of _Render exact_
or the Crop tab's preview boxes. Biggest functional regression from the port.

### 21. No way to cancel a batch render

`RunDrawer` deliberately leaves Run clickable so a second click surfaces the 409, but there's
no abort. A long job means killing the dev server. `jobs.ts` holds the `ChildProcess` already
— a `DELETE /api/job` that sends SIGTERM is most of the work.

### 22. Crop editing is crammed into the 340px sidebar

The focal-point image is the primary affordance of that tab and it's the narrowest thing on
screen; the 280px preview boxes stack single-file. Crop wants the centre stage — swap
`PreviewStage` out for the crop editor while that tab is active, or make it a full-width mode.

### 23. Dark mode is dead code

`style.css:99` defines `@custom-variant dark`, `:181` defines the `.dark` token block, and
components use `dark:` utilities throughout — but nothing ever puts `.dark` on `<html>` and
`index.html` has no theme script. Either wire a toggle (+ `prefers-color-scheme` default,
mirroring the blog's `theme.ts`) or delete the tokens.

### 24. Accent options hardcoded

`TopBar.vue:102-103` hardcodes `teal` and `coral` as `<SelectItem>`s. Source of truth is
`SETTINGS.palette.accents` — a third accent would be invisible in the UI. Derive the list.

### 25. Panel state is discarded on style change

`ControlsPanel.vue:41` keys each group on `` `${group}:${isActive(group)}` ``, so every group
whose active-ness flips gets remounted, throwing away the user's manual open/closed state and
any focus inside it. Drive the dimming with a class instead of a remount.

### 26. Accessibility gaps

- Knob labels are `<span>`s with no `for` / `aria-labelledby` (`KnobRow.vue:159`) — sliders
  and inputs are unlabelled to screen readers.
- The ⓘ tooltip trigger is `tabindex="-1"` (`KnobRow.vue:163`), so knob descriptions are
  keyboard-unreachable.
- CropTab's size tabs are plain buttons with no `role="tab"` / `aria-selected`
  (`CropTab.vue:236`).
- `EntryRail.vue:76` has no `aria-current` on the selected entry.
- Blob dragging is pointer-only — no keyboard path (the MeshPanel rows are the workaround, but
  nothing says so).

### 27. Silent rejection of malformed array edits

`KnobRow.vue`'s `setText()` drops an edit whose comma-split arity doesn't match the schema
default (correct — it stops a `colorPair` collapsing to one colour), but shows nothing. The
field just stops responding. Needs an invalid state on the input.

### 28. No responsive handling

`App.vue`'s `grid-cols-[240px_1fr_340px]` + `h-screen` is fine at ≥1280px and broken below.
Acceptable for a desktop-only local tool, but worth a documented min-width or a collapsing
rail.

---

## Suggested order (first pass)

1. #7 + #8 — portability and honesty, ~20 lines total.
2. #20 — preview size switcher; the one missing capability, not just a rough edge.
3. #12 — the only measurable perf problem, and the fix already exists in `RunDrawer`.
4. #21 — job cancel.
5. #23 — decide dark mode in or out; it's currently neither.
6. #26 — a11y sweep, one pass across four components.
7. #19 — Prettier + eslint-plugin-vue, then #18's tmp-dir fixture.

---

# Second pass — 2026-07-28 (post fixes 1–6)

Five parallel review agents (uncommitted-diff, server/pipeline, Vue app, UX/UI, tests+docs)
over the working tree with fixes 1–6 applied; top findings re-verified by hand. Verdict on the
uncommitted diff itself: **fixes 1–6 are sound** — NumberInput's draft/echo sync, the unified
undo stack semantics, the boot states, and the pointerdown gating all held up under adversarial
reading. Everything below is new, deduped against #7–#28.

## Critical

### [FIXED 2026-07-29] 29. Dirty tracking only sees the active entry

`studio.ts:157-215` — every branch of `diff` except the whole-`types` compare is scoped to
`activeSlug` (knob walk via `resolved`, RESERVED loop and `mesh.blobs` via
`images[activeSlug]`). Edit entry A, click entry B: `diff` is `[]`, `isDirty` false. So the
Save button **disables** with unsaved work, the `beforeunload` guard lets the tab close and
lose it, and `RunDrawer`'s pre-run dirty gate passes — a batch render runs against stale saved
state while the user believes their tuning is included. Verified by hand; two agents found it
independently. Fix: add a whole-`images` compare against `savedIllustration` (summary rows per
dirty slug), and ideally a dirty dot per rail entry.

## Major — code

### [FIXED 2026-07-29] 30. `save()` baselines in-flight edits without persisting them

`studio.ts:288-292` — the POST serializes call-time state, but after the `await`,
`savedIllustration.value = toPlain(illustration.value)` captures the _current_ working copy.
An edit made during the request (knobs stay enabled while saving) becomes "saved" without ever
reaching disk — permanently unsaveable, silently lost on reload. Fix: build the payload first,
await, assign the payload as the baseline.

### [FIXED 2026-07-29] 31. Whole class of mutations never snapshot — wrong-thing undo, again

The bug class fix #6 closed for crops recurs on ~9 write paths: `KnobRow` revert
(`KnobRow.vue:80-82`), style select + seed input + reroll + accent (`TopBar.vue:41-47, 84-107`),
preset apply/save (`PresetsMenu.vue:35-50`), MeshPanel seed/reroll, **Materialize**
(`MeshPanel.vue:108`) and **Back to seed** (`MeshPanel.vue:70-73`). None push a checkpoint, so
Ctrl+Z pops an older gesture and reverts that instead. Worst: "Back to seed" shows a confirm
dialog ("Discards N manual blobs"), then destroys the hand-tuned blob array _unrecoverably_ —
its state was never snapshotted. Related: keyboard-driven slider changes (arrow keys on reka-ui
thumbs) never hit `@pointerdown`, so they coalesce into the previous gesture
(`KnobRow.vue:195,269`, `CropTab.vue:303`, `MeshPanel.vue:159-201`). Structural fix: move
`snapshot()` _into_ the store's one-shot actions (`setStyle`, `setSeed`, `setAccent`,
`applyPreset`, `revertKnob`, `materializeBlobs`, `clearBlobs`); keep the UI-driven pattern only
for drag gestures.

### 32. Subject-layer preload race + no render feedback at all

`PreviewStage.vue:117-134` — the debounce serializes timer starts, not loads. Each preload's
`onload` unconditionally writes `subjectDisplaySrc`; a slow cache-miss render started earlier
can land _after_ a fast later one and replace the newer image — the preview then silently
disagrees with the store (also wrong-entry flashes across entry switches). No `onerror`: a
failed `/api/layer` leaves the stale image up forever, indistinguishable from "my knob does
nothing". Same feedback hole for **Render exact** (`:153-165`): no busy state; pending, slow,
and failed look identical. Fix: generation counter checked in `onload`/`onerror`, plus a
visible pending/error state (dim + spinner, inline error strip, button busy).

### 33. Crops schema rejects zoom-only records the UI legitimately writes

`validate.mjs:34-51` — `resolveCrop` supports partial records (focus defaults to `[0.5,0.5]`),
and CropTab's `writeTarget`/`onZoomChange` write exactly those: zoom slider only →
`{zoom:1.3}`; zoom-only on a size tab → `{sizes:{thumb:{zoom:1.2}}}`. Both fail **both** union
branches (each requires `focus`). Verified empirically: `validateCrops` rejects them. Result:
`POST /api/save` 400s with a raw zod union error, blocking _all_ pending edits until the user
also drags a focal point; the same record hand-written into `data/crops.json` refuses boot and
crashes `pnpm render`. Also `{focus, sizes:{thumb:{zoom}}}` only passes via `directCropRecord`'s
passthrough, leaving size overrides unvalidated. Fix: make `focus` optional in both branches
(and validate size-override shapes for real).

### 34. Empty Run-drawer selections invert to "render everything"

`RunDrawer.vue:147-151` + `jobs.ts:95-97` — unchecking all styles sends `styles: []`;
`if (body.styles?.length)` treats `[]` as _no filter_, so every style renders. Same for sizes.
Worst: "Never-rendered entries only (0)" sends `slugs: []` → **all** entries render. With no
job cancel (#21), the expected no-op is a full batch. Fix: disable Run with a "nothing
selected" hint when any selection set is empty, and show a "will render ~N entries × M styles"
preflight summary.

### 35. Materialization freezes one theme's geometry into both themes

Two converging findings. Pipeline: for the `mesh` style, `styles.mjs:327-352` renders
per-theme geometry (`${seed}:light` / `${seed}:dark`), but a materialized `mesh.blobs` array
short-circuits `blobsFor` for **both** themes — the next batch render silently rewrites the
non-previewed theme's output to the frozen layout. Client: `materializeBlobs`
(`studio.ts:349-358`) freezes `onMesh.theme`'s geometry while `PreviewStage.vue:77` previews
the `mesh` style as `"light"` — so with `onMesh.theme = dark` the freeze itself causes the
visual jump the function's comment promises not to. Needs a design decision: per-theme blob
arrays, or freeze-what-you-preview.

## Minor — code

### 36. Job runner: stale child mutates the next job's state

`jobs.ts:125-167` — child handlers close over the module-level `job` binding. Between a spawn
failure's `error` and `close` events (separate loop turns — verified), a retry POST replaces
`job`; the old child's pending `close` then sets `job.running = false` on the _new_ job,
releasing the single-job lock while its child still runs. Fix: capture `const state = job` at
spawn, guard handlers with `if (job !== state) return`.

### 37. Corrupt `.manifest.json` bricks all rendering

`render.mjs:30-35` — `openManifest` parses unguarded; a truncated manifest (kill mid-write —
`flushManifest` is a plain `writeFileSync`) makes every CLI render and studio job throw before
rendering anything. `api.ts:67-75` already try/catches the same file — the two readers should
agree. Same family: `store.mjs:13-18,36-38` writes `illustration.json`/`crops.json` without
tmp+rename, so a torn write destroys exactly the hand-tuned data the boot-refusal policy
protects (git-tracked, so recoverable — still worth the two-line atomic write).

### 38. One stray directory under blog content kills boot

`content.mjs:9-21` — `readFileSync(<dir>/index.md)` for every directory under `post/`/`work/`;
a drafts or assets folder without `index.md` throws ENOENT into the dev-server boot and
crashes `pnpm render`. Skip dirs without `index.md` (or guard per-entry).

### 39. Header-then-read crash path in `/api/layer` and `/img`

`api.ts:157-158, 200-209` — `writeHead(200)` before `readFileSync`; if the file vanishes in
between (the race the comment claims to handle), the catch's second `writeHead` throws
`ERR_HTTP_HEADERS_SENT` — in the async `/api` middleware that's an unhandled rejection (dev
server crash). Read before writing headers.

### 40. Prototype-chain lookups bypass the 404/400 guards

`render.mjs:86-87,116-117`, `api.ts:92,138-139` — `bySlug["constructor"]` /
`STYLES["constructor"]` resolve `Object.prototype` members and pass the truthiness guards:
renders mesh PNGs for a nonexistent slug (littering `.preview/` with `.bg_undefined.*`), 500s
instead of 400 for the style. Loopback-only, no security impact — use `Object.hasOwn` or
null-prototype maps.

### 41. `cropBox` breaks for zoom < 1; zoom unbounded outside the UI

`geometry.mjs:13-18` — zoom 0.5 yields negative offsets + oversize boxes (verified numbers),
zoom 0 yields `Infinity` dims → convert error. `validate.mjs:46` is bare `z.number()`; the UI
slider clamps 1–3 but hand-edited `crops.json` and direct `/api/layer` calls don't. Add
`.min(…)`/`.max(…)` to the schema and a guard in `cropBox`.

### 42. Sync ImageMagick in middleware blocks the whole dev server

`api.ts:134-160` — `/api/layer` and `/api/render` run 1–4 `execFileSync` convert/potrace
chains on the Vite main thread. Every preview refresh stalls HMR, `/api/job` polling (the Run
drawer's progress visibly freezes), and all other requests. The job runner already shows the
async pattern; the preview path needs it (spawn + await, plus a tiny queue).

### 43. Run-drawer poll can spin forever and misses fast/failed jobs

`RunDrawer.vue:104-125,142-159` — completion needs an observed `running → !running`
transition. Two paths never produce one: `startJob`'s sync-throw guard returns
`{running:false, error}` with HTTP 200 (response body ignored by `runJob`), and a job that
exits before the first poll. Result: interval polls `/api/job` every second for the rest of
the session, no toast, `refreshManifest()` never runs. Also `v-else-if="jobState.done"` hides
the status line entirely for a 0-entry run. Handle the POST response body, treat the first
poll's `!running` as terminal, and render `done === 0` states.

### [FIXED 2026-07-29] 44. Ctrl+Shift+Z performs a second destructive undo

`TopBar.vue:56-62` — no `e.shiftKey` guard (verified): the reflexive redo keystroke pops
_another_ checkpoint, compounding the loss (no redo stack, #16). Also no `e.repeat` guard —
holding Ctrl+Z past an empty stack stacks "Nothing to undo" toasts per key-repeat. Guard both;
fold into the #16 redo work.

### 45. Assorted store-consistency nits

- `savePreset` over the entry's own linked preset changes effective settings but doesn't bump
  `lastEditAt` — a previously-rendered exact overlay stays up, unflagged stale
  (`studio.ts:299-303`).
- Undo doesn't restore `activeSlug`: undoing while viewing another entry reverts off-screen
  state with zero feedback (`studio.ts:332-340`) — mostly masked once #29 lands rail dirty
  markers.
- `blobsMaterialized` reads the _effective_ tier but MeshPanel edits only the image tier: a
  type-tier blob array shows "materialized" with zero editable rows, and preview drags no-op
  while still pushing undo snapshots (`MeshPanel.vue:35-37`, `studio.ts:363-368`).
- CropTab's rAF throttle processes the _first_ event per frame and drops the rest — committed
  focus lands short of where the pointer stopped (`CropTab.vue:192-200`); store latest event,
  process in frame.
- `NumberInput` commits any finite typed value — `min`/`max` are advisory HTML attributes, so
  `999` in a 0–100 knob hits the store, the live render, and git-tracked `illustration.json`
  (slider pins at max, desynced). Clamp on commit (`NumberInput.vue:39-46`).

## Major — UX

### 46. Presets are a one-way door

`PresetsMenu.vue` — the Select has no "none"/unlink item and nothing else clears `entry.type`;
trying a preset "just to see" permanently links it (escape = hand-edit `illustration.json`,
or a Ctrl+Z that per #31 may revert something else). No delete/rename either, and saving from
an untuned entry happily creates an empty `{}` preset with a success toast. Preset lifecycle:
none-option, delete, rename, guard empty saves.

### 47. Seed controls disagree about materialization

`TopBar.vue:84-94` vs `MeshPanel.vue:80-96` — MeshPanel disables seed/reroll once blobs are
materialized ("manual blobs — seed inactive"); TopBar's identical seed field and dice button
stay live: rerolling visibly does nothing to the mesh yet dirties the doc with a phantom
`seed` diff row. Mirror the disable (or scope the TopBar control out).

## Minor — UX

### 48. Feedback and copy nits

- SaveBar's "Show changes" renders the `types` row as `types: [object Object] →
[object Object]` (`SaveBar.vue:20-22` + `studio.ts:206-212`) — summarize ("preset 'docs'
  edited") instead.
- Tier badges (`inherited`/`type`/`image`) and rail badges (`tuned`/`never rendered`) have no
  tooltip or legend anywhere — the three-tier model, the app's core concept, must be inferred
  (`KnobRow.vue:173`, `EntryRail.vue:96-103`).
- No Ctrl+S (browser save-page dialog fires instead); Ctrl+Z is the app's only shortcut and
  nothing reveals it exists (`TopBar.vue:56-62`, `SaveBar.vue:77`).
- Effects ↔ Crop tab switch unmounts CropTab: selected size tab resets to `base` every round
  trip (`App.vue:76-87`, distinct from #25).
- Rail filter with zero matches renders a blank list — no "no matches" state
  (`EntryRail.vue:42-44`).
- The exact-overlay staleness signal is an 8px dot with a hover-only title
  (`PreviewStage.vue:233-239`); the no-image copy in CropTab renders twice
  (`CropTab.vue:78, 277-281`).

### 49. The webfont never applies

`style.css:2` imports family `Geist`; `:107` sets `--font-sans: 'Geist Variable'` — the name
never matches (verified), so the app renders in fallback sans-serif and the font download is
dead weight. One-word fix.

## Doc drift + test gaps

### [FIXED 2026-07-29] 50. Docs contradict the uncommitted diff itself

- `README.md:109-110` and `CLAUDE.md` (undo bullet) both still say crop edits are **not**
  undoable — the very diff that ships them says otherwise. A future session following
  CLAUDE.md would "restore" the pre-#6 behavior. Highest-confidence finding of the pass.
- `studio.ts:8` header says snapshot at "gesture-end"; convention (and every call site) is
  gesture-start.
- CLAUDE.md/README claim a blog checkout is a hard prerequisite for `pnpm test` — no longer
  true after fix #1 (verified against `blogRoot=/nonexistent/blog`).

### 51. The new logic has no tests

All store-level, none blocked by the known "no component tests" debt (#18): unified undo
cross-domain semantics (knob → crop → undo reverts the crop), `undo()`'s boolean contract,
`countEntries` degrade-to-0 (needs the scan injectable or a bad-config fixture — currently
only exercised _incidentally_ on machines without the blog checkout), NumberInput's draft
state machine (the original `0.` bug class), App boot-state branches + `fetchData`'s
throws-on-non-2xx contract.

### 52. Housekeeping

First-pass status line said "7–26" while items ran to #28 (fixed in this edit).

## Suggested order (second pass)

1. **#29 + #30 + #50** — dirty-tracking honesty and save-race; these lose user work silently.
   Doc drift is a 10-minute fix in the same commit.
2. **#31** — snapshot-in-store refactor; kills the whole wrong-undo class at once (and makes
   "Back to seed" recoverable). Pair with #44's shiftKey/repeat guards; consider #16 redo here.
3. **#33 + #34** — the two "the tool actively does the wrong thing" traps (save 400s on legit
   crops; empty selection renders everything).
4. **#32 + #42** — preview render lifecycle: generation counter + pending/error UI, and move
   the sync magick calls off the event loop. Together these are the tuning-loop feel.
5. **#35** — decide materialization × theme semantics before more mesh work lands.
6. **#46 + #47 + #49** — preset lifecycle, seed-control consistency, font fix.
7. **#51** — tests for the new logic, then the rest of the minor pile opportunistically.
