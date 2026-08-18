---
title: Magnet-DS final state — phase 3, page masters, docs, cleanup (implementation plan)
created: 2026-08-17
phase: 3 of 3
---

# Magnet-DS Pages, Docs & Cleanup Implementation Plan (phase 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assemble the 8 route masters (Home, Blog, Work, About, Post detail, Serie landing, Serie post, Work detail) as 32 frames on 📄 Pages, finish the 5 foundation docs, archive the explorations, and prove the whole file with the verification pipeline — the final state described by the spec.

**Architecture:** Page masters contain **instances and named layout frames only**. Two `PageContent` recipes decide who owns the container: Home-type (`/`) lets each section instance own it; document-type (the other 7 routes) puts one container on `PageContent` itself and keeps sections bare, exactly mirroring `main.container` in `src/pages/blog.astro:25`. Light masters are built once; Dark frames are instances of them with a pinned theme mode, so a Dark row can never drift in height from its Light master.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file `ihWIWmvtQPTWgUxlrVjC2c`); `pnpm figma:dump` / `figma:verify` / `figma:verify-raw` / `figma:verify-responsive` / `geometry:web` as the verification pipeline.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md` — §4 page masters, §5 container ownership, §6 steps 7–9.

**Prerequisite:** `plan-2-components.md` complete through its Task 11 gate. **Next:** none — this phase ships the DS. Code convergence (§7) gets its own spec.

## Global Constraints

Every task's requirements implicitly include this section.

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c`. Resolve every target **by name**; IDs are hints.
- **Run `/figma-use` once per session before any `use_figma` call.**
- **One batched `use_figma` call per master; read back cold in a separate call.**
- **Instances only.** A page master may contain INSTANCE nodes and named layout FRAMEs (`PageContent`, `PageIntro`, `PostHeader`, `SerieHeader`) — nothing else. No detached component copies, no local overrides of container geometry.
- **Container ownership (spec §5):** one recipe, pad-x 16 bound to `3 Responsive/container/gutter`, max-w 1280 bound to `container/max-width`, centered. Home-type `PageContent` is pad-x 0 full-bleed; document-type `PageContent` carries the recipe. Zero 32px exceptions.
- **`PageContentContainer` is removed** — one wrapper level fewer, 1:1 with `src/pages/blog.astro:25`.
- **Dark frames are instances**, never clones of the master's contents. A Dark frame that is a COMPONENT or a detached FRAME is a defect.
- **Mode pinning, not resizing.** Mobile frames are 390-wide instances with `3 Responsive` pinned to Mobile; a hand-resized duplicate build is a defect.
- **Canvas hygiene (spec §3/§4):** one row per route, fixed order `Desktop · Mobile · Desktop [Dark] · Mobile [Dark]`, rows on one grid, nothing cropped or overlapping.
- **Archives are final.** `🗄️ Archive — *` pages are immutable; retired explorations are moved there, never deleted.
- Conventional commits: `docs(specs):` for spec/progress files, `chore(figma):` for `scripts/figma/`.

### Shared helpers (paste into any build call)

```js
const PAGES = async (match) => {
  const p = figma.root.children.find((x) => x.name.includes(match));
  if (!p) throw new Error(`page ${match} not found`);
  await p.loadAsync();
  return p;
};
// Instance a master by name, optionally picking a variant by regex.
const inst = async (name, variantMatch) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    if (p.name.startsWith("🗄️")) continue;
    const hit = p.findOne((x) => x.name === name);
    if (!hit) continue;
    const base =
      hit.type === "COMPONENT_SET"
        ? (variantMatch ? hit.children.find((c) => variantMatch.test(c.name)) : null) ||
          hit.defaultVariant
        : hit;
    return base.createInstance();
  }
  throw new Error(`master ${name} not found`);
};
const F = (name, dir, opts = {}) =>
  figma.createAutoLayout(dir, Object.assign({ name }, opts));
const VARS = async () => {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const map = { _cols: {} };
  for (const c of cols) {
    map._cols[c.name] = c;
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      map[`${c.name}::${v.name}`] = v;
    }
  }
  return map;
};
// Apply the document-type container recipe to a frame.
const container = (frame, V) => {
  frame.setBoundVariable("paddingLeft", V["3 Responsive::container/gutter"]);
  frame.setBoundVariable("paddingRight", V["3 Responsive::container/gutter"]);
  frame.setBoundVariable("maxWidth", V["3 Responsive::container/max-width"]);
  frame.primaryAxisAlignItems = "MIN";
  frame.counterAxisAlignItems = "CENTER";
};
// Document-type page shell: Header + a container'd PageContent. Returns both so
// the caller fills PageContent and appends the Footer last.
const shell = async (name, breakpoint, V) => {
  const root = F(name, "VERTICAL", { itemSpacing: 0 });
  root.resize(breakpoint === "Mobile" ? 390 : 1280, 100);
  root.layoutSizingHorizontal = "FIXED";
  root.primaryAxisSizingMode = "AUTO";
  root.setBoundVariable("fills", V["2 Theme::color/background"]);
  const header = await inst("app/Header", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(header);
  header.layoutSizingHorizontal = "FILL";
  const pc = F("PageContent", "VERTICAL", {});
  root.appendChild(pc);
  pc.layoutSizingHorizontal = "FILL";
  container(pc, V);
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingTop", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingBottom", V["3 Responsive::section/rhythm-y"]);
  return { root, pc };
};
// Pin explicit modes on a frame. `modes` = {"2 Theme": "Dark", "3 Responsive": "Mobile"}
const pin = (node, V, modes) => {
  const out = {};
  for (const [colName, modeName] of Object.entries(modes)) {
    const col = V._cols[colName];
    const mode = col.modes.find((m) => m.name === modeName);
    try {
      node.setExplicitVariableModeForCollection(col, mode.modeId);
    } catch (e) {
      node.setExplicitVariableModeForCollection(col.id, mode.modeId);
    }
    out[colName] = mode.name;
  }
  return out;
};
```

## File Structure

| File                                                                        | Responsibility                                                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `.specs/01_active/magnet-ds-final-state/progress.md`                        | **Modify.** One append per task.                                                                                       |
| `.specs/01_active/magnet-ds-final-state/inventory.md`                       | **Modify.** Task 11 appends §Final with the shipped page/master roster.                                                |
| `.claude/skills/figma-verify/knowledge/figma-ds-file.md`                    | **Modify.** Task 11 rewrites pages, roster and change log to the final state.                                          |
| `scripts/pixel-manifest.mjs`                                                | **Modify.** Task 11 refreshes selectors for renamed/retired components before `geometry:web`.                          |
| `scripts/figma/named-debt.json`                                             | **Modify.** Task 11 prunes entries whose nodes no longer exist.                                                        |
| `.specs/01_active/TODO_ContainerPatternAnalysis.md`                         | **Delete.** Superseded by spec §5 → Docs "Spacing & Layout".                                                           |
| `.specs/01_active/TODO_MagnetDS_ComponentArchitecture.md`                   | **Delete.** Superseded by spec §3.                                                                                     |
| `.specs/01_active/TODO - WorkCard — final spec (post-exploration round).md` | **Move.** Into `.specs/01_active/work-card-redesign/` as `spec.md` (it owns live component anatomy, it is not a TODO). |

## Task Files

This plan is split into fragments so each is readable in one bite. Execute them in order; every fragment assumes the §Global Constraints and §Shared helpers above.

| File                           | Tasks | Deliverable                                                                      |
| ------------------------------ | ----- | -------------------------------------------------------------------------------- |
| `plan-3a-gate-home-blog.md`    | 1–3   | Phase-3 entry gate (page inventory + container audit); Home and Blog masters.    |
| `plan-3b-work-about-post.md`   | 4–6   | Work page (zigzag via the WorkCard side axis), About page, Post-detail master.   |
| `plan-3c-serie-detail-grid.md` | 7–9   | Serie-landing, Serie-post, Work-detail masters; dark rows and the 32-frame grid. |
| `plan-3d-docs-cleanup.md`      | 10–11 | 📚 Docs page (5 foundation docs), cleanup, final verification, archive the spec. |

Task 1 is a gate: do not touch a page master before the container audit passes.
