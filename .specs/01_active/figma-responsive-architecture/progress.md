# Figma responsive architecture — execution log

Figma edits are not versioned. One entry per task: what was written, what was
read back to prove it, and any deviation from the plan.

## Task 1 — inventory and gates (2026-08-15)

- Masters found: 49 (knowledge-file roster said 33 on 2026-08-06; a prior agent report claimed 56 — neither matches this live re-count)
- 3 Responsive: all 18 target variables already present and correct across Desktop/Tablet/Mobile, matching `scripts/figma/responsive-expected.json` exactly. Task 2's write already happened, though no prior progress log entry exists for it — logged retroactively here since this is the first repo-side record.
- Gate A: no illustration in Footer — false. Design §3 applies to `HeroAnimation` only; Task 12 drops the Footer half.
- Gate B: all four pairs N/A — no `<Base> — Mobile` master exists in the current roster (already deleted/merged by prior work: `PostCardPreviewSmall` and `WorkPreviewSection` carry a `breakpoint` variant axis; `BlogPreviewSection` and `ContactPreviewSection` never had a Mobile counterpart to begin with).
- Gate C: work list master is `WorkPreviewSection` (`2970:4368`) — no separate list master exists; it holds `WorkCardPreviewSmall` instances directly.
- Step 5 sanity check: all 12 named masters present; one acknowledged rename (`ArchiveTable` → `PostArchiveList`, per the plan's own Deviations section). No STOP.

Full detail: `inventory.md`.

## Task 14 — verification sweep (2026-08-15)

### Step 3 — token diff (`pnpm figma:verify`)

**Map-update, not real drift.** `Missing in Figma` and `Value mismatch` both empty —
`container-padding-inline` now matches `3 Responsive/Desktop/container/gutter` (16)
as expected post-Task 2. `Orphaned in Figma` surfaced exactly 3: the
`2 Theme/Dark/font/*` variables (`sans`, `title`, `mono`). Root cause:
`token-map.json`'s `map` only pairs `font-sans-primary`/`font-title-primary`/
`font-mono-primary` to their `2 Theme/Light/font/*` counterparts; there's no Dark
equivalent mapping, and `orphanIgnore` has no `2 Theme/Dark/font/` prefix entry
either. Not a Task 2–13 regression — the Dark font variables have existed
unmapped since before this task; out of Task 14's file-edit scope to fix here.
Flagged for Task 15: add `2 Theme/Dark/font/*` to `orphanIgnore`, or add proper
`dark/font-*` code-token mappings if Dark ever needs a distinct font stack.

### Step 4 — raw-value diff (`pnpm figma:verify-raw`)

**Real finding — Pass-2 has never run at full-file scope before; result diverges
sharply from the plan's expectation.** Dumped raw values across both ❖ Components
(492 hits) and 📄 Pages (382 hits) — 874 total, deduped to 874 (no overlap; the two
pages don't share node ids). `use_figma`'s 20KB per-call payload cap couldn't
return that in one shot; worked around it with deterministic index-range slicing
(same idempotent `page.query("*")` traversal, 9 calls of ~100 items each,
reassembled by concatenation afterward — file untouched throughout, purely a
tool-output workaround).

Plan expected the diff to show `named-debt.json`'s `accepted` array **shrinking
net** (the six type ramps + eight spacing fields bound in Tasks 4–5 moving from
raw to bound). Instead:

- **New raw values: 825**, not a shrinkage.
- **Stale entries: 28** — all deleted Task 11 masters (`PAGE/POST`, `PAGE/SERIE`,
  `PAGE/SERIE-POST` template variants, ids `118:86`…`302:3973`, plus two orphaned
  page-template nodes `32:5`/`185:140`). These match the plan's own prediction
  exactly ("deleted masters from Task 11 will produce several") — pruned from
  `named-debt.json` in this pass. `accepted` now 49 (was 77).
- **Accepted (already justified): 49** — mostly the Task 4 type-ramp text-styles
  already on record.

Root-caused the 825 "new" figure into two buckets, neither a Task 2–13
regression:

1. **232 entries (28%) are canvas-organization noise**, not shipped design-system
   content: node ids under `2944:*`/`2952:*`/`2956:*` are the
   `workcard-variations`, `workcard-type-explorations`, and `blogpostcard-variations`
   exploration boards living on the ❖ Components page (unrelated
   work-card-redesign scratch content, same session — see
   `.specs/01_active/work-card-redesign/`). `dump-raw-values.md`'s `page.query("*")`
   has no way to distinguish exploration scratch frames from real masters, so it
   swept them in. These aren't design debt; they're a scope hole in the dump
   script.
2. **593 entries (72%) are first-time coverage**, not new drift: 213 radius + 138
   stroke + 154 text-style + 45 fill + 43 spacing, spread across real ❖ Components
   masters (`NavLink`, `ThemeToggle`, `Link/CTA`, `Header`, `Footer`, etc.) that
   were never swept by Pass 2 before. Every prior `named-debt.json` entry (77
   before this pass) came from narrow, targeted spot-checks on the `PAGE/POST` /
   `PAGE/SERIE` detail templates on 📄 Pages — nobody had run Pass 2 across the
   full ❖ Components masters roster until this call. No Task 12 shadow-image or
   `Triangle`-halo hits appeared in the new set (plan flagged these as
   known-acceptable additions if seen — they weren't, so nothing to add there).

**Verdict: real finding, not fixed here.** 593 first-time hits need per-node
design judgment (bind vs. accept-with-reason) that a verification sweep can't
respond to responsibly by rubber-stamping — that's Task 15/backlog scope, not
something to fabricate reasons for in bulk. Did **not** add any of the 593 to
`named-debt.json` — only pruned the 28 confirmed-stale entries, which needed no
judgment call. Flagged for Task 15: (a) scope `dump-raw-values.md`/Pass 2 to
exclude exploration/scratch frames (name pattern `*-variations`/`*-explorations`,
or move them off the ❖ Components page entirely), (b) schedule a dedicated
triage pass over the remaining 593 ❖ Components raw values now that they're
enumerated for the first time.

### Step 5 — geometry diff (`pnpm geometry:web` + `diff-geometry.mjs`)

**Blocked — not run this session. Root cause found, execution deferred.**

The plan's own Step 5 text describes comparing Home (`/`) and Blog (`/blog`)
computed geometry against their Figma frames at 390/1280. The actual tooling
doesn't do that: `pnpm geometry:web` (`extract-web-geometry.mjs`) reads
`scripts/pixel-manifest.mjs` — a per-*component* astrobook-story manifest
(~50 entries: `about-aboutfacts--grid`, `app-header--default`,
`work-workoverlaycard--overlaycard`, etc.), not a per-*page* Home/Blog
extraction. So Step 5 as literally written and Step 5 as actually tooled are
two different checks.

Found how `geometry.figma.json` gets produced: `scripts/figma/dump-tokens.md`
§"Geometry read (Task 9)" (the README's `dump-bindings.md` cross-reference is
stale — that file covers variable-binding recovery, not geometry). The
procedure is manual: `use_figma` reads a fixed prop subset
(`width`/`borderRadius`/`backgroundColor`/`borderTopColor`/padding+gap for
auto-layout/`fontSize`+`fontFamily`+`fontWeight`+`color` for TEXT) per node,
keyed by `pixel-manifest.mjs`'s `id` values, written to
`{ "<manifestId>": { root: {...} } }`.

That's the blocker: building the target list means mapping each of the ~40
non-skipped manifest ids to a live Figma node id, and the current 34-master
❖ Components roster (`inventory.md` §Masters) doesn't cover most of them —
`about-*`, `contact-*`, `hero-herosocials`/`herotext`, `ui-*` (link, prose,
p, socialshare, customimage, linknavpost), `work-workmini card`/`overlaycard`
have no obvious 1:1 master in the current inventory. The manifest predates
this session's Task 8–11 master consolidation; a fresh remap (or a decision
to skip components with no master) hasn't happened.

Not attempting the remap in this sweep — it's a dedicated task's worth of
work (per-component ID lookup + judgment calls on what "no master" means),
not a verification-sweep step. Flagged for Task 15/backlog: either (a) build
the Home/Blog full-page geometry check the plan text actually describes, or
(b) remap `pixel-manifest.mjs` ids to current masters and run the
component-level check the tooling already supports.

### Step 6 — acceptance test (toggle `Home — Desktop` to Tablet mode)

**Real drift found — architecture hole, not fixed here.**

Toggled `Home — Desktop`'s `3 Responsive` mode Desktop→Tablet via
`setExplicitVariableModeForCollection` and read back the three H2 section titles
("Blog", "WORK", "LET'S TALK"). Expected all three to cascade 30→24
(`text/section-title`). Only "WORK" cascaded; "Blog" and "LET'S TALK" stayed at 30.

Root cause, confirmed via `getStyleByIdAsync`: the "Blog" and "LET'S TALK" H2 text
nodes both carry a legacy Text Style **"Heading/H2"** (`fontSize: 30`, hardcoded,
style id `S:995396d1f3432118adfc5b041d168bfe4fa7e109`) on top of the correct
`boundVariables.fontSize → text/section-title` binding. The "WORK" node has no
`textStyleId` (empty string) and follows the variable cleanly. All three nodes have
byte-identical `boundVariables` and identical `resolvedVariableModes` at every
ancestor level — the variable graph resolves 24 for all three; the legacy style is
what wins at render time for two of them. Ruled out before concluding this: stale
ancestor mode-override (identical pins across all three), read-timing/render-flush
artifact (10×50ms yield before re-read made no difference), and a broken
`boundVariables` reference (JSON-dumped identical for all three).

Fix requires clearing `textStyleId` on the "Blog" and "LET'S TALK" H2 instances —
a frame edit, which Step 6 says not to make during the acceptance test. Per plan:
recorded here, not fixed. Everything else in the checklist cascaded correctly
(page title 60→48, hero title 48→36, hero body 24→20/leading 30→28, nav links
stayed 20, header/footer/section spacing all matched, `Hero` stayed HORIZONTAL,
no wrap). Restored to Desktop afterward — `restoredMatchesBefore: true`, file left
unmodified.

**Action item**: clear `textStyleId` on both instances in a follow-up edit pass
(outside this verification sweep), then re-run Step 6 to confirm the cascade holds.

### Step 7 — overflow audit on Mobile masters

**Real drift found — not empty as expected.** Ran the plan's exact script over all
four `/Mobile/` frames (`Home — Mobile`, `Blog — Mobile`, and their `[Dark]`
instances). Computed actual pixel deltas for the top-most offenders (not their
descendants) on the two light masters:

- `BlogPreviewSection`'s `Content` frame (inside `Home — Mobile`) overflows the
  390px frame by **187px on the right**. Root cause: `BlogPreviewSection` has no
  Mobile breakpoint variant (confirmed in Task 1's Gate B — "never had a Mobile
  counterpart to begin with"). Gate B recorded that as N/A/expected at the
  component-inventory level; this is its concrete visual symptom — the section
  renders its Desktop-fixed internals unchanged inside the Mobile frame.
- `ContactPreviewSection`'s `ContactContainer` (same frame) overflows **445px on
  both sides**, symmetric — it's the full 1280px Desktop container centered
  unchanged inside the 390px frame. Same root cause as above (Gate B: no Mobile
  counterpart), same verdict.
- `PostArchiveList` row (`line`, inside `Blog — Mobile`) overflows **64px on the
  right** on both visible rows — same long post title
  ("Adding API Endpoints to an Astro Project") not wrapping/truncating in the row
  layout at 390px. Distinct from the two findings above: `PostArchiveList` _does_
  collapse to a single responsive master (Task 8+), so this is a narrower,
  unrelated real bug in that row's text handling, not a missing-variant gap.

Verdict: `BlogPreviewSection`/`ContactPreviewSection` mobile overflow is
**expected-gap** (root cause already on record from Task 1 Gate B, not new scope,
not fixed here — needs its own follow-up task to give both sections a Mobile
variant). `PostArchiveList` row overflow is **real drift** — a genuine unaddressed
bug, separate from the responsive-variable architecture this task is verifying.
Neither fixed in this sweep (no frame edits during verification).

### Step 8 — Pass-1 assembly audit

**Map-update, not real drift.** Ran the exact `figma-verify` §Pass 1 script over
all 8 frames on 📄 Pages. `detached: 0` on all 8 (good, matches expected) and bg
fills matched exactly — `#f5ffe1` on the 4 Light frames, `#1e1e1e` on the 4 Dark
ones. But `hasHeader`/`hasFooter` came back `false` everywhere, contradicting the
expected `true`.

Root cause: the script's `byComp.Header`/`byComp.Footer` check keys off
`mainComponent.name`, which for a variant instance returns the _variant's own_
name (e.g. `"breakpoint=Desktop"`), not its parent `COMPONENT_SET`'s name.
`Header` and `Footer` are now `COMPONENT_SET`s with a `breakpoint` axis (Task 1's
inventory already listed both as `COMPONENT_SET`) — so every Header/Footer
instance's `mainComponent.name` reads as `"breakpoint=Desktop"` or
`"breakpoint=Mobile"`, colliding with identically-named variants from unrelated
sets (`Hero`, `WorkPreviewSection`, etc.) instead of surfacing as `"Header"` /
`"Footer"`.

Verified directly: walked `mainComponent.parent.name` (the owning `COMPONENT_SET`)
instead of `mainComponent.name` for the same 8 frames — every frame has exactly
one Header instance and one Footer instance, correct breakpoint variant selected
per frame (Desktop frames → `breakpoint=Desktop`, Mobile frames → `breakpoint=Mobile`,
Dark instances inherit their Light counterpart's variant). Header/Footer assembly
is fully correct; this is a stale assumption in the Pass-1 script (predates
Header/Footer becoming variant sets), not an architecture problem. Flagging for
Task 15's doc-debt pass: `figma-verify/SKILL.md`'s Pass-1 script should resolve
`mc.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc.name` instead of
`mc.name` directly.

### Step 9 — summary and remaining scope

Steps 1–2 (offline `.fig` export + `figma:dump`/`figma:verify-responsive`) and
Steps 3–4 (token diff, raw-value diff) are now complete — see above. Step 5
(geometry diff) is still blocked, but now for a known reason rather than an
unexplored one: the `geometry.figma.json` procedure exists
(`dump-tokens.md` §"Geometry read"), but it targets `pixel-manifest.mjs`'s
~40 per-component ids, most of which have no matching master in the current
34-master ❖ Components roster — a remap or a plan-text-literal Home/Blog
page-level check is needed first (see Step 5 above). Steps 6–8 (live
`use_figma` checks) are complete.

Findings on record, by verdict:

- **real-drift, unfixed**: Step 6 stale `textStyleId` on two H2 instances; Step 7
  `PostArchiveList` row-wrap bug; Step 4's 593 first-time-swept raw values on ❖
  Components (needs a dedicated triage pass, not fixed here).
- **expected-gap**: Step 7 `BlogPreviewSection`/`ContactPreviewSection` mobile
  overflow (root cause already on record from Task 1 Gate B).
- **map-update / script-scope, not drift**: Step 3's 3 orphaned
  `2 Theme/Dark/font/*` variables (`token-map.json` gap); Step 4's 232
  exploration-scratch raw-value hits (Pass 2 scope hole) and 28 pruned stale
  `named-debt.json` entries (Task 11 deletions, now removed); Step 8's
  `hasHeader`/`hasFooter` false-negative (`mc.name` vs `mc.parent.name` bug);
  Step 5's manifest↔master mismatch (tooling-scope gap, not measured drift —
  no geometry numbers were actually compared).

Task 14 is not closed — Step 5 (geometry, needs a scoping decision before it
can even run) and the real-drift fixes above remain outstanding.

## Task 14 — real-drift fixes (2026-08-15)

Follow-up edit pass on the two small real-drift findings the verification sweep
recorded but deliberately did not fix. Both fixed at the **master**, not on the
page frames.

### Fix 1 — stale `Heading/H2` text style (Step 6 finding)

Root cause was narrower than the sweep recorded: the `H2` master itself is clean
(style detached, `fontSize` bound by Task 4). The stale style is an
**instance-level override on the nested `H2` instance inside two section
masters**:

| Master                  | Node                              | Was           |
| ----------------------- | --------------------------------- | ------------- |
| `BlogPreviewSection`    | `I2041:497;2041:457;2034:211`     | `Heading/H2`  |
| `ContactPreviewSection` | `I2114:7229;2047:429;2034:211`    | `Heading/H2`  |

`WorkPreviewSection`'s equivalent node carries no override, which is exactly why
only "WORK" cascaded during Step 6.

**Gotcha worth keeping:** `setTextStyleIdAsync("")` also **wipes the range
`fontSize` variable binding** on the node. A fresh read-back after the detach
showed `style: null` but `fontSizeVar: null` too, against `text/section-title` on
the healthy WORK node. Detach and re-bind are two steps, not one — re-ran
`setRangeBoundVariable(0, len, "fontSize", text/section-title)` on both nodes.

**Step 6 re-run: PASS.** All three section titles now cascade 30 → 24 on
Desktop→Tablet (`Blog` 30→24, `WORK` 30→24, `LET'S TALK` 30→24); nav-link "Blog"
correctly stays 20. `restoredMatchesBefore: true`.

### Fix 2 — `PostArchiveList` row overflow at 390 (Step 7 finding)

Code is truth: `PostListItem.astro:35` is `<h3 class="flex-1 …">` inside a
`flex-row … justify-between` anchor — the title fills remaining space and wraps;
only the meta block hugs. Figma had the inverse: the `line` frame was `HUG` and
its title TEXT `WIDTH_AND_HEIGHT`, so a long title grew the row past the frame.

Fixed on the `PostRow` master (`2124:7937`), all four variants — `line` frame →
`layoutSizingHorizontal: FILL`, title TEXT → `textAutoResize: HEIGHT` +
`layoutSizingHorizontal: FILL`:

| Variant                    | `line` id   | title id    |
| -------------------------- | ----------- | ----------- |
| `type=post, state=default` | `2123:7767` | `2123:7768` |
| `type=serie, state=default`| `2124:7940` | `2124:7941` |
| `type=post, state=hover`   | `2367:7171` | `2367:7172` |
| `type=serie, state=hover`  | `2367:7178` | `2367:7179` |

**Step 7 re-run:** `Blog — Mobile` and `Blog — Mobile [Dark]` now report
`overflowCount: 0` (was 64px right on two rows). `Home — Mobile` /
`Home — Mobile [Dark]` still show the two known expected-gap offenders
(`BlogPreviewSection` `Content` 187px right, `ContactPreviewSection`
`ContactContainer` 445px both sides) — unchanged, still awaiting Mobile variants.

**Desktop not regressed:** `Blog — Desktop` `overflowCount: 0`; rows read title
FILL at 833/920px, single line (28px tall), meta flush at the row's right edge —
which is what `flex-1` + `justify-between` produces in code.

### New observation — Desktop overflow audit (first time run)

Step 7 as written only audits `/Mobile/` frames. Ran the same script over the
Desktop frames for the first time: `Blog — Desktop`, `Home — Desktop [Dark]`,
`Blog — Desktop [Dark]` are clean; `Home — Desktop` has exactly one offender —
`layer1` (`I2586:1143;2114:7231`), a decorative GROUP inside
`ContactPreviewSection > ContactImage (relative flex-1)`, bleeding **40px past
the right edge**. Not touched by either fix above and not caused by them; it is a
pre-existing decorative bleed that no prior audit covered. Verdict: needs a
judgment call (intentional bleed vs. drift) — not fixed here.
