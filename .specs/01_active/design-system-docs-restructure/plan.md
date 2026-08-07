---
created: 2026-08-06
status: plan — split into task files
---

# Design System Docs Restructure Implementation Plan

This plan is now split into separate files so each task can be executed independently.

## How To Work

1. Start with `tasks/00-overview.md` for goals, architecture, constraints, and reference data.
2. Execute one task file at a time in order (`task-01.md` -> `task-08.md`).
3. Keep checkboxes and task notes inside each task file.
4. Use `tasks/99-self-review-notes.md` for wrap-up validation context.

## Task Files

- [x] `tasks/task-01.md` — Strip Cover to nav hub
- [x] `tasks/task-02.md` — Collapse `Foundations · Colors` to one Light+Dark inline table
- [x] `tasks/task-03.md` — Dissolve Elements chapter into grouped Components + Sections
- [x] `tasks/task-04.md` — Foundations: Icons section, Colour cross-reference, focus-ring formula
- [x] `tasks/task-05.md` — Spacing + Motion specs tables (replace FINDINGs)
- [x] `tasks/task-06.md` — Readability pass
- [x] `tasks/task-07.md` — Visual bug sweep (white fills + overflow)
- [ ] `tasks/task-08.md` — Regenerate Dark sheet, final verification, archive

## Shared Context Files

- `tasks/00-overview.md` — global constraints, reference IDs, mappings
- `tasks/99-self-review-notes.md` — closure checklist and assumptions
