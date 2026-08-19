---
title: Magnet-DS final state — phase 1, foundations (implementation plan)
created: 2026-08-17
phase: 1 of 3
---

# Magnet-DS Foundations Implementation Plan (phase 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the existing Magnet-DS file to the spec's foundation state — a fresh 📐 Decisions page with 4 records, audited `1 Primitives` / `2 Theme` collections, every component master renamed to `domain/Component` and re-homed into 7 domain sections, the three name merges collapsed, and one container recipe (16 / 1280 / centered) everywhere.

**Architecture:** Nothing is created from scratch here except the Decisions page — phase 1 is a rename/merge/prune pass over the 34 live ❖ Components masters and the 3 variable collections. Every write is one batched `use_figma` call that resolves its target **by name** off the Task 1 inventory, then reads back what it wrote. Figma edits are not in git, so each task appends to `progress.md`, which is committed.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file `ihWIWmvtQPTWgUxlrVjC2c`); repo-side verification through `pnpm figma:dump` / `figma:verify` / `figma:verify-raw` (Node 22 ESM under `scripts/figma/`); pnpm.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

**Next phases:** `plan-2-components.md` (new masters + detail rebuilds), `plan-3-pages.md` (page masters, docs, cleanup). Do not start phase 2 before this plan's Task 9 (in `plan-1d-merges-containers-gate.md`) passes.

## Global Constraints

Every task's requirements implicitly include this section.

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c` (Magnet-DS). Live pages (IDs are hints only): 📖 Cover `0:1`, 📐 Decisions `2716:4244`, 📚 Docs `2736:4`, ❖ Components `461:759`, 📄 Pages `2558:18264`.
- **Collection IDs (hints):** `1 Primitives` = `VariableCollectionId:2013:2` (single mode `2013:0`), `2 Theme` = `VariableCollectionId:3:2` (Light `3:0`, Dark `3:1`), `3 Responsive` = `VariableCollectionId:2245:42` (Desktop `2245:0`, Tablet `2245:1`, Mobile `2245:2`).
- **Run `/figma-use` once per session before any `use_figma` call.** Mandatory — it carries the Plugin API and batching rules.
- **Node and variable IDs anywhere in this plan, in the spec, and in `.claude/skills/figma-verify/knowledge/figma-ds-file.md` are hints, not truth.** Resolve every target by NAME off the Task 1 inventory before writing. A missing name is a STOP, not an improvisation.
- **Do not use `get_metadata` for the page list** — it returns a stale page subset on this file. Enumerate `figma.root.children` with `await p.loadAsync()` inside a `use_figma` call.
- **One batched `use_figma` call per operation.** Multiple round-trips for one dump or one write is the documented cost mistake.
- **Write to masters only, never instances.** Instances follow their master; local overrides of container geometry are a defect, not a fix.
- **Read back cold.** After any write, re-read via a fresh `getNodeByIdAsync` in a _separate_ call — geometry read in the same tick returns stale values.
- **`3 Responsive` is settled** (18 vars, verified). Do not add, rename, or re-value anything in it in this phase.
- **`Design System` meta collection (`ds/version`, `ds/last-updated`) is exempt** — never audited, never pruned, components never bind to it.
- **Nothing is deleted that a human designed.** Retirement policy = archive. Only true debris (empty frames, orphan variables with zero references) is deleted, and only where a task says so explicitly.
- **`🗄️ Archive — Decisions` and `🗄️ Archive — Docs v1` are completed archiving tasks.** Never rename, reopen, repurpose, or move a node inside them.
- **Container recipe, one only:** pad-x 16 (bound to `3 Responsive/container/gutter`), max-w 1280 (bound to `container/max-width`), centered. Zero 32px exceptions.
- **Canvas hygiene is normative** (design §3): no cropped master, no overlapping masters, every master inside its domain section, one grid per section.
- Conventional commits. Prefix `docs(specs):` for spec/progress/inventory files, `chore(figma):`/`feat(figma):` for `scripts/figma/` or skill-knowledge changes.

### Shared helper (paste into any `use_figma` call that needs it)

```js
// Resolve a master by exact name across all pages. Returns null if absent.
async function findMaster(name) {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const hit = p.findOne(
      (x) =>
        (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
        x.name === name &&
        !(x.parent && x.parent.type === "COMPONENT_SET"),
    );
    if (hit) return { node: hit, page: p };
  }
  return null;
}
```

## File Structure

Repo-side files this plan creates or modifies:

| File                                                     | Responsibility                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.specs/01_active/magnet-ds-final-state/inventory.md`    | **Create.** Task 1 live Pass-0 inventory: page list, every master (name / id / page / section / type), both audited collections, and the four gate verdicts. Every later task in all three phases resolves targets by name from this file. |
| `.specs/01_active/magnet-ds-final-state/progress.md`     | **Create.** Append-only execution log, one entry per Figma task, across all three phases. The git trail for un-versioned Figma work.                                                                                                       |
| `.specs/01_active/magnet-ds-final-state/rename-map.md`   | **Create.** Task 5 output: live name → canon name for all 34 masters, with the applied/skipped verdict per row. Phase 2 and 3 read it.                                                                                                     |
| `scripts/figma/named-debt.json`                          | **Modify.** Task 4 removes allowlist entries whose nodes were rebound; Task 9 records any raw value the audit deliberately keeps.                                                                                                          |
| `.claude/skills/figma-verify/knowledge/figma-ds-file.md` | **Modify.** Task 9 rewrites the master roster with canon names, adds the 📐 Decisions page row, adds a change-log entry.                                                                                                                   |

## Task Files

This plan is split into fragments so each is readable in one bite. Execute them in order; every fragment assumes the §Global Constraints and §Shared helper above.

| File                                | Tasks | Deliverable                                                                     |
| ----------------------------------- | ----- | ------------------------------------------------------------------------------- |
| `plan-1a-inventory-decisions.md`    | 1–2   | Live Pass-0 `inventory.md` + four gate verdicts; 📐 Decisions page, 4 records.  |
| `plan-1b-variables.md`              | 3–4   | `1 Primitives` pruned and documented; `2 Theme` orphans, dupes, renames closed. |
| `plan-1c-renames-sections.md`       | 5–6   | All 34 masters on `domain/Component`; ❖ Components re-sectioned into 7 domains. |
| `plan-1d-merges-containers-gate.md` | 7–9   | NavLink / PostCard / Link merges, one container recipe, phase-1 gate.           |

Task 1 must run first — every other task resolves its targets by name from the inventory it writes.
