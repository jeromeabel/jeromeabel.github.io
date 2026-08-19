---
title: Magnet-DS final state — runbook
created: 2026-08-18
---

# Runbook — every step, in order

`progress.md` is the **log** (what happened, with read-backs and deviations).
This file is the **cursor** (what to do next). Order below is normative; gates are hard stops.

- `P*` steps run **in Figma**. Body: `figma/<id>-*.md`, assembled with `pnpm figma:brief`.
- `R*` steps run **in the repo**. Body: `repo/phase-N.md` under that heading.

## How to run one step

**Figma step:**

```sh
pnpm figma:brief P1-T03 | xclip -sel c   # wl-copy on Wayland; --list for all ids
```

Paste into a session with the Figma MCP attached — a second Claude Code session, or this repo
session, which has it too. Never paste the raw `figma/P*.md`: it still holds unresolved
`<!-- include -->` markers. The agent runs the steps in order (one batched `use_figma` call per
step, cold read-back between writes) and returns a `Report back` block. Paste that back into the
repo session.

**Repo step:** run it here. Commands are in `repo/phase-N.md` under the matching `R*` heading.

## Standing rules

- **R1.1 / R2.1 continuous** — one `progress.md` entry per Figma task as its report lands — `TASK / STATUS / RESULT / DEVIATIONS / UNBOUND`. Commit in batches, not per task.
- A brief that reports `UNBOUND:` values needs a `named-debt.json` entry with a `reason`, or it goes back to the brief. Never allowlist silently.
- `CODE DEBT` findings are logged, never fixed here — they feed the R3.7 handoff.
- Nothing human-designed is deleted. `🗄️ Archive — *` pages are completed tasks, never reopened.
- A gate that does not pass stops the phase. Do not build on top of it.

## Phase 1 — foundations

| Done | Step     | What                                                                                          |
| ---- | -------- | --------------------------------------------------------------------------------------------- |
| [x]  | R1.1     | create `inventory.md` + `progress.md`                                                         |
| [x]  | P1-T01   | Pass-0 inventory + gates A–D                                                                  |
| [x]  | P1-T02   | 📐 Decisions page, 4 records                                                                  |
| [x]  | P1-T03   | `1 Primitives` audit — 25 renamed, 0 collisions, 407 clean                                    |
| [x]  | **R1.2** | `pnpm figma:primitives` + commit — 407/399 diff triaged                                       |
| [x]  | P1-T04   | `2 Theme` — 15 vars, 1 archived, 0 dupes                                                      |
| [x]  | R1.3     | token-map repointed; R1.2 deferrals closed, 407 = 407                                         |
| [x]  | P1-T05   | 29 renamed, 5 deferred to merges                                                              |
| [x]  | R1.4     | log the rename map, commit                                                                    |
| [x]  | P1-T06   | ❖ Components → 7 domain sections, 5 unhomed for T07                                           |
| [x]  | P1-T07   | NavLink + PostCard merged, 1 straggler left for P2-T04                                        |
| [x]  | P1-T08   | container recipe: 16 / 1280 / centred, 1 bandless variant; re-verified 12 variants 2026-08-19 |
| [x]  | R1.5     | no debt to prune — drift was never allowlisted; commit                                        |
| [x]  | P1-T09   | **GATE** — phase-1 exit, Figma half                                                           |
| [x]  | R1.6     | **GATE** — phase-1 exit, repo half                                                            |

## Phase 2 — components

Do not start before R1.6 passes.

| Done | Step    | What                                                                                                                                                                 |
| ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [x]  | P2-T01  | **GATE** — 31 existing masters present under canon names                                                                                                             |
| [x]  | P2-T02  | `ui/Link/external`                                                                                                                                                   |
| [x]  | P2-T03  | `ui/Prose`, `ui/SocialShare` — iconOnly/small 24→32 owed to P2-T11                                                                                                   |
| [x]  | P2-T04  | `work/WorkCard` — 8 variants; re-grid + Gate D verified 2026-08-19                                                                                                   |
| [x]  | P2-T04b | 8 `cover` fills — all raw `#D9D9D9`, bound to `color/gray/200`                                                                                                       |
| [x]  | R2.2    | **no-op** — nothing unbound to declare; verify-raw deferred to R2.4                                                                                                  |
| [x]  | P2-T05  | `work/ArchiveTable` — 3 breakpoints; re-grid + Gate D verified                                                                                                       |
| [x]  | P2-T06  | `contact/ContactPreview` gains `breakpoint` — Desktop untouched                                                                                                      |
| [x]  | P2-T07  | `blog/TableOfContents`, `blog/SerieContents` — fake `chevron-down`                                                                                                   |
| [x]  | P2-T08  | `work/WorkMiniCard`, `blog/RelatedWork`, `blog/PostNav` + record 5; paint-binding sweep, 21 call sites                                                               |
| [x]  | P2-T09  | `work/WorkHeader`, `blog/PostRowCalm`, `work/RelatedWriting`; hairline recipe → `HAIR()` per-side strokes                                                            |
| [x]  | P2-T10  | `about/AboutFacts`, `about/AboutText` — CV icon trailing, `iconSide` call owed to P2-T11                                                                             |
| [x]  | P2-T10b | rebuild the 4 rect-hairline masters on `HAIR()` — 50 rects; `ui/Prose` 1, `work/ArchiveTable` 27, `blog/TableOfContents` 14, `work/WorkCard` 8                       |
| [x]  | R2.3    | 5 `CODE DEBT` findings logged — 1 real (ArchiveTable hover), 2 verified-no-debt, 1 doc-only, 1 Figma-side                                                            |
| [x]  | P2-T11  | **GATE** — 46/11/4/**62** (the +1 is the `zz/` retired master; formula was stale), Gate D clean, 10 axis rows, 4 repairs done — 3 items open                         |
| [x]  | P2-T11b | **GATE** — `iconSide` renamed (override survived), 27-master hairline table all `inLayout`, **224** white fills cleared, raw list down to 19 (0 white), Gate D clean |
| [x]  | R2.4    | **GATE** — verify clean, 1086 raw rows / 55 fills / **0 white**, 57/57 tests; roster 46/11/4/1/**62**; `verify-raw` gained a stale-input guard                       |

## Phase 3 — pages, docs, ship

Do not start before R2.4 passes.

| Done | Step      | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [x]  | P3-T01    | **GATE** — 8 frames (4 masters + 4 Dark instances), 62-master roster holds; 3 deltas open: wrapper ×2, Home `paddingBottom` unbound                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [x]  | P3-T02    | `Home — *` — shell already full-bleed; `contact/ContactPreview` `maxWidth` bound on the master; 3 new findings for R3.1                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [x]  | P3-T03    | `Blog — *` — wrapper gone file-wide, 6 bindings on `PageContent`; `blog/PostRow` WRAP fix on the master (1 UNBOUND: `minWidth` 200)                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [x]  | P3-T04    | `Work — *` — case zigzag + archive table, 3 hairlines per frame; `inst()` prelude fix (masters only); live-grid divergence → code debt                                                                                                                                                                                                                                                                                                                                                                                                                |
| [x]  | P3-T05    | `About — *` — thinnest shell: one `about/AboutText` per frame, 832 left-aligned Desktop / FILL Mobile; no deviations, no UNBOUND                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [x]  | P3-T06    | `Post — *` — live order built, TOC in `Body` @224 Desktop / above `Body` FILL Mobile; breadcrumb fell back to `ui/Link/textLink`; 3 §4 deltas → R3.1; no UNBOUND                                                                                                                                                                                                                                                                                                                                                                                      |
| [x]  | P3-T07    | `Serie — *`, `Serie post — *` — 4 masters, serie-post cloned from `Post — *` (FRAME); breadcrumb again fell back to `ui/Link/textLink`; boxless-vs-boxed landing list → code debt; 2 UNBOUND (`itemSpacing` 48/32, `Part 4 of 5` 16)                                                                                                                                                                                                                                                                                                                  |
| [x]  | P3-T08    | `Work detail — *` — 2 masters; `WorkHeader` needed no overrides; Prose-outside-container simplified into one container recipe; 2 UNBOUND (`itemSpacing` 48/32, cover `cornerRadius` 8)                                                                                                                                                                                                                                                                                                                                                                |
| [x]  | R3.1      | 9 divergences logged — 3 CODE DEBT (Home composition, Work zigzag, boxless serie list), 2 §4 amendments applied (Blog order, Post order), `ui/Link/menuInactive` struck from the briefs; serie-post `RelatedWork` open                                                                                                                                                                                                                                                                                                                                |
| [x]  | P3-T09    | 32 frames — 16 masters (12 FRAME→COMPONENT, new ids) + 16 mode-pinned `[Dark]` instances; Gate D clean; **50 unbound white fills cleared** (P2-T11b regression); R3.1 rows 8+9 closed as pre-steps                                                                                                                                                                                                                                                                                                                                                    |
| [x]  | P3-T10    | 📚 Docs — all 6 docs already existed, so audit+complete; 5 new sections; 4 records moved to 📐 Decisions (9 total); `_Docs/DecisionCard` text-clipping defect fixed at the master, 69 stale overrides cleared; 4 new CODE DEBT                                                                                                                                                                                                                                                                                                                        |
| [x]  | P3-T11    | 1 page archived (`XP - WorkCard`); roster **46** live-counted, Pages **32**, `1 Primitives` **407** (docs said 451 — fixed); 6 stacked variant sets + 2 section overlaps repacked; 1 genuine unbound value file-wide. **2 open defects**: `Work — Mobile` (no `breakpoint` axis on `work/WorkCard`) and responsive overflow on 9/16 masters                                                                                                                                                                                                           |
| [x]  | R3.2      | 62 entries checked, 0 stale selectors (manifest was newer than `src/`); 37 live / 25 skipped, 0 null roots; `PostRowCalm` + `WorkMiniCard` un-retired against P3-T11 roster, `design.md` §3+§7 amended                                                                                                                                                                                                                                                                                                                                                |
| [x]  | R3.3      | **pass** on the 20:32 post-repair export — collections 407/54/2/30 unchanged, verify 0/0/0/0, responsive 0/0/0, 57/57, verify-raw 1050/36/**0 stale** with all 36 allowlisted ids re-resolved alive; roster 46 / Pages 32 / WorkCard 16 variants measured from the fresh graph; the repair's `spacing/3,2,5` bindings confirmed real. Strict sweep is **live-only** (a `.fig` has no instance internals) → spot-checked `Work — Mobile` + `Post — Mobile` on live renders, both correct. 1 new in-bounds defect: `blog/PostNav` mobile wraps mid-word |
| [x]  | R3.4      | `figma-ds-file.md` rewritten to final state — 101→372 lines; roster 46, 9 pages, 32-frame grid, 407 collections. The `⚠️ Open defects` section became **`Responsive — how the file answers mobile`** once R3.6-prep fixed both; grid coordinates and the WorkCard variant count updated there too                                                                                                                                                                                                                                                     |
| [x]  | R3.5      | all three TODO files were **untracked** — committed first (`e9c7150`) so the deletion stays recoverable, then 2 removed + WorkCard spec moved to `work-card-redesign/spec.md`                                                                                                                                                                                                                                                                                                                                                                         |
| [x]  | R3.6-prep | **open defects repaired** — `work/WorkCard` gained a `breakpoint` axis (8 → 16 variants, built to `work-card-redesign/spec.md`); strict out-of-root-bounds sweep **103 → 1** across the 16 light masters (survivor is deliberate art bleed), one root cause (`ProseImage` FIXED 720 → FILL) cleared most of it; `work/WorkPreview` had the same defect one level up. Gate D clean on both pages, roster still 46/32, grid coordinates re-spaced                                                                                                       |
| [ ]  | R3.6      | **ship** — commit + `./.specs/specs.sh archive magnet-ds-final-state`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| [ ]  | R3.7      | open the `magnet-ds-code-convergence` backlog stub                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
