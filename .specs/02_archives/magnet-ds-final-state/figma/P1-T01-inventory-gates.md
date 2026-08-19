---
task: P1-T01
title: Pass-0 inventory + gates A–D
phase: 1
status: DONE (2026-08-18)
---

# P1-T01 — Pass-0 inventory + gates A–D · ✅ DONE

**Do not re-run.** Executed 2026-08-18. Results live in `../inventory.md` and `../progress.md`.

What it established, and what later briefs rely on:

| Finding                 | Value                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Pages                   | 7 (incl. `XP - WorkCard`, `🗄️ Archive — Decisions`, `🗄️ Archive — Docs v1`)                                |
| Masters                 | 49 = 11 `_Docs/*` + 34 components + 4 page masters                                                         |
| Gate A — prune safety   | 44 exploration ramps prune-safe, 0 blocked                                                                 |
| Gate B — merge sources  | 9 present; 4 under names differing from the original plan (see P1-T05 map)                                 |
| Gate C — container debt | `Header` and `ContactPreviewSection` are 32/32 bound to `spacing/8` — wrong variable, real work for P1-T08 |
| Gate D — hygiene        | 5 overlapping pairs, 0 strays, 1 section overflow (`WorkPreviewSection` 90px past the Sections bottom)     |

**Correction carried forward:** the original overlap check compared section-relative `x`/`y` and produced ~79 false pairs. Every later hygiene check in this brief set uses `absoluteBoundingBox`.
