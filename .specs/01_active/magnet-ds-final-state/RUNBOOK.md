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

| Done | Step    | What                                                                                                                                                                        |
| ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [x]  | P2-T01  | **GATE** — 31 existing masters present under canon names                                                                                                                    |
| [x]  | P2-T02  | `ui/Link/external`                                                                                                                                                          |
| [x]  | P2-T03  | `ui/Prose`, `ui/SocialShare` — iconOnly/small 24→32 owed to P2-T11                                                                                                          |
| [x]  | P2-T04  | `work/WorkCard` — 8 variants; re-grid + Gate D verified 2026-08-19                                                                                                          |
| [x]  | P2-T04b | 8 `cover` fills — all raw `#D9D9D9`, bound to `color/gray/200`                                                                                                              |
| [x]  | R2.2    | **no-op** — nothing unbound to declare; verify-raw deferred to R2.4                                                                                                         |
| [x]  | P2-T05  | `work/ArchiveTable` — 3 breakpoints; re-grid + Gate D verified                                                                                                              |
| [x]  | P2-T06  | `contact/ContactPreview` gains `breakpoint` — Desktop untouched                                                                                                             |
| [x]  | P2-T07  | `blog/TableOfContents`, `blog/SerieContents` — fake `chevron-down`                                                                                                          |
| [x]  | P2-T08  | `work/WorkMiniCard`, `blog/RelatedWork`, `blog/PostNav` + record 5; paint-binding sweep, 21 call sites                                                                      |
| [x]  | P2-T09  | `work/WorkHeader`, `blog/PostRowCalm`, `work/RelatedWriting`; hairline recipe → `HAIR()` per-side strokes                                                                   |
| [x]  | P2-T10  | `about/AboutFacts`, `about/AboutText` — CV icon trailing, `iconSide` call owed to P2-T11                                                                                    |
| [x]  | P2-T10b | rebuild the 4 rect-hairline masters on `HAIR()` — 50 rects; `ui/Prose` 1, `work/ArchiveTable` 27, `blog/TableOfContents` 14, `work/WorkCard` 8                              |
| [x]  | R2.3    | 5 `CODE DEBT` findings logged — 1 real (ArchiveTable hover), 2 verified-no-debt, 1 doc-only, 1 Figma-side                                                                   |
| [x]  | P2-T11  | **GATE** — 46/11/4/**62** (the +1 is the `zz/` retired master; formula was stale), Gate D clean, 10 axis rows, 4 repairs done — 3 items open                                |
| [ ]  | P2-T11b | **GATE** — `iconside`→`iconSide`, prove the 50-hairline flip did not undo 3b's 32×32, clear **209** default-white frame fills (dark-mode defect) + fix `F()` in the prelude |
| [ ]  | R2.4    | **GATE** — dump + verify + verify-raw + test, knowledge file                                                                                                                |

## Phase 3 — pages, docs, ship

Do not start before R2.4 passes.

| Done | Step   | What                                                                  |
| ---- | ------ | --------------------------------------------------------------------- |
| [ ]  | P3-T01 | **GATE** — read-only page baseline + delta list                       |
| [ ]  | P3-T02 | `Home — *` (Home-type `PageContent`)                                  |
| [ ]  | P3-T03 | `Blog — *` (document-type, wrapper removed)                           |
| [ ]  | P3-T04 | `Work — *` — case zigzag + archive table                              |
| [ ]  | P3-T05 | `About — *`                                                           |
| [ ]  | P3-T06 | `Post — *` — the detail shell T07/T08 reuse                           |
| [ ]  | P3-T07 | `Serie — *`, `Serie post — *`                                         |
| [ ]  | P3-T08 | `Work detail — *`                                                     |
| [ ]  | R3.1   | log page divergences + apply the 2 `design.md` §4 amendments          |
| [ ]  | P3-T09 | 32 frames, dark rows as mode-pinned instances                         |
| [ ]  | P3-T10 | 📚 Docs — Getting Started + 5 foundations                             |
| [ ]  | P3-T11 | archive explorations, final roster, hygiene + bindings                |
| [ ]  | R3.2   | refresh the pixel manifest (`pnpm geometry:web`)                      |
| [ ]  | R3.3   | full verification — dump, verify, verify-raw, verify-responsive, test |
| [ ]  | R3.4   | rewrite `figma-ds-file.md` with the P3-T11 counts                     |
| [ ]  | R3.5   | retire the superseded TODO files                                      |
| [ ]  | R3.6   | **ship** — commit + `./.specs/specs.sh archive magnet-ds-final-state` |
| [ ]  | R3.7   | open the `magnet-ds-code-convergence` backlog stub                    |
