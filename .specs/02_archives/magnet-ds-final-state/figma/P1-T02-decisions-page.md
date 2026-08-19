---
task: P1-T02
title: 📐 Decisions page — 4 records
phase: 1
status: DONE (2026-08-18)
---

# P1-T02 — 📐 Decisions page, 4 records · ✅ DONE

**Do not re-run.** Executed 2026-08-18. Four records live on 📐 Decisions: `container-16`, `naming-domain-component`, `dark-instances`, `docs-decisions-boundary`.

Live deviations from the original plan — **every later brief that touches a decision record must follow these**, not the plan text:

- `_Docs/DecisionCard` exposes **no text component properties**. It has one `layer` VARIANT axis (`Chrome` | `Content` | `Hand` | `All`) over TEXT layers named `layer` / `rule` / `body` / `finding`. To fill a card: instance it, set `layer=All`, then edit those four TEXT nodes directly.
- `_Docs/Status` has **no `Accepted` variant** — its axis is `Draft` | `Completed` | `OnGoing`. Use `Status=Completed` and override the visible label to `ACCEPTED`.
- Each record is a wrapper frame named `DECISION / <title>` holding a meta row above the card.
- Layer tag chips are set to hug.

A **fifth** record (`related-block-children`) is created later, by `P2-T08`.
