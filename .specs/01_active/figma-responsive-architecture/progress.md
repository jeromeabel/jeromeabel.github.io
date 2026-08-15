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

Steps 1–5 (the offline dump-based checks) stayed blocked this session — they need
a manual Figma desktop **File > Export** of Magnet-DS to `~/Downloads/Magnet-DS.fig`,
which wasn't produced. Steps 6–8 (live `use_figma` checks) are complete, with two
real findings recorded above (Step 6: stale `textStyleId` on two H2 instances;
Step 7: `BlogPreviewSection`/`ContactPreviewSection` mobile overflow + a
`PostArchiveList` row-wrap bug) and one script-limitation false-negative (Step 8).
Task 14 is not closed — Steps 1–5 and the Step 6/7 fixes remain outstanding.
